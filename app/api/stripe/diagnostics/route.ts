import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ""
let stripe: Stripe | null = null

if (stripeSecretKey) {
  try {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })
  } catch (error) {
    console.error("Failed to initialize Stripe:", error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body

    // Results object
    const results: any = {
      success: true,
      environment: {},
      database: {},
      stripe: {},
      recommendations: [],
    }

    // Check environment variables
    results.environment = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL,
    }

    // Check if any environment variables are missing
    for (const [key, value] of Object.entries(results.environment)) {
      if (!value) {
        results.success = false
        results.recommendations.push(`Set the ${key} environment variable`)
      }
    }

    // Check database schema
    try {
      // Check if mentors table exists and has the required columns
      const { data: mentorsColumns, error: mentorsError } = await supabaseAdmin.rpc("get_column_names", {
        table_name: "mentors",
      })

      if (mentorsError) {
        results.database["mentors_table"] = false
        results.success = false
        results.recommendations.push("Create the mentors table or check database permissions")
      } else {
        results.database["mentors_table"] = true

        // Check for required columns
        const requiredColumns = [
          "stripe_connect_accounts",
          "stripe_account_details_submitted",
          "stripe_account_charges_enabled",
          "stripe_account_payouts_enabled",
        ]

        const columnsSet = new Set(mentorsColumns.map((col: any) => col.column_name))

        for (const column of requiredColumns) {
          const hasColumn = columnsSet.has(column)
          results.database[`mentors_${column}`] = hasColumn

          if (!hasColumn) {
            results.success = false
            results.recommendations.push(`Add the ${column} column to the mentors table`)
          }
        }
      }
    } catch (error) {
      console.error("Error checking database schema:", error)
      results.database["schema_check"] = false
      results.success = false
      results.recommendations.push("Check database permissions and run the schema check SQL function")
    }

    // Check Stripe API
    if (stripe) {
      try {
        // Test basic Stripe API functionality
        const testAccount = await stripe.accounts.create({
          type: "express",
          country: "US",
          email: "test@example.com",
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        })

        results.stripe["api_connection"] = {
          success: true,
          message: "Successfully connected to Stripe API",
        }

        // Clean up test account
        await stripe.accounts.del(testAccount.id)
      } catch (error: any) {
        console.error("Stripe API test error:", error)
        results.stripe["api_connection"] = {
          success: false,
          message: error.message || "Failed to connect to Stripe API",
        }
        results.success = false
        results.recommendations.push("Check your Stripe API key and permissions")
      }

      // Check Stripe API version
      try {
        const apiVersion = stripe.getApiField("version")
        results.stripe["api_version"] = {
          success: true,
          message: `Using API version: ${apiVersion}`,
        }
      } catch (error) {
        results.stripe["api_version"] = {
          success: false,
          message: "Failed to get API version",
        }
      }
    } else {
      results.stripe["api_connection"] = {
        success: false,
        message: "Stripe is not initialized",
      }
      results.success = false
      results.recommendations.push("Set the STRIPE_SECRET_KEY environment variable")
    }

    // User-specific checks if userId is provided
    if (userId) {
      results.user = {}

      // Check if user exists
      const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

      if (userError || !user.user) {
        results.user["exists"] = {
          success: false,
          message: "User not found",
        }
        results.success = false
        results.recommendations.push("Check the user ID")
      } else {
        results.user["exists"] = {
          success: true,
          message: "User found",
        }
        results.user["email"] = user.user.email

        // Check if mentor record exists
        const { data: mentor, error: mentorError } = await supabaseAdmin
          .from("mentors")
          .select("*")
          .eq("id", userId)
          .single()

        if (mentorError) {
          results.user["mentor_record"] = {
            success: false,
            message: "Mentor record not found",
          }
          results.success = false
          results.recommendations.push("Create a mentor record for this user")
        } else {
          results.user["mentor_record"] = {
            success: true,
            message: "Mentor record found",
          }

          // Check if Stripe Connect account exists
          if (mentor.stripe_connect_accounts) {
            results.user["stripe_account_id"] = mentor.stripe_connect_accounts

            // Check if the account exists in Stripe
            if (stripe) {
              try {
                const account = await stripe.accounts.retrieve(mentor.stripe_connect_accounts)
                results.user["stripe_account_exists"] = {
                  success: true,
                  message: "Stripe account found",
                }
                results.user["account_details_submitted"] = {
                  success: account.details_submitted,
                  message: account.details_submitted ? "Account details submitted" : "Account details not submitted",
                }
                results.user["charges_enabled"] = {
                  success: account.charges_enabled,
                  message: account.charges_enabled ? "Charges enabled" : "Charges not enabled",
                }
                results.user["payouts_enabled"] = {
                  success: account.payouts_enabled,
                  message: account.payouts_enabled ? "Payouts enabled" : "Payouts not enabled",
                }

                // Check if database status matches Stripe status
                if (account.details_submitted !== mentor.stripe_account_details_submitted) {
                  results.user["db_details_match"] = {
                    success: false,
                    message: "Database details_submitted status doesn't match Stripe",
                  }
                  results.success = false
                  results.recommendations.push("Update the database to match Stripe account status")
                }

                if (account.charges_enabled !== mentor.stripe_account_charges_enabled) {
                  results.user["db_charges_match"] = {
                    success: false,
                    message: "Database charges_enabled status doesn't match Stripe",
                  }
                  results.success = false
                }

                if (account.payouts_enabled !== mentor.stripe_account_payouts_enabled) {
                  results.user["db_payouts_match"] = {
                    success: false,
                    message: "Database payouts_enabled status doesn't match Stripe",
                  }
                  results.success = false
                }
              } catch (error: any) {
                results.user["stripe_account_exists"] = {
                  success: false,
                  message: error.message || "Failed to retrieve Stripe account",
                }
                results.success = false
                results.recommendations.push("The Stripe account ID in the database doesn't exist in Stripe")
              }
            }
          } else {
            results.user["stripe_account_id"] = {
              success: false,
              message: "No Stripe Connect account ID found",
            }
            results.success = false
            results.recommendations.push("Connect a Stripe account for this user")
          }
        }
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error running diagnostics:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        recommendations: ["Check server logs for more details"],
      },
      { status: 500 },
    )
  }
}
