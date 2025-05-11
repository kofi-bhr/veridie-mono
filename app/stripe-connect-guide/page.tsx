"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function StripeConnectGuidePage() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const toggleStep = (step: number) => {
    if (completedSteps.includes(step)) {
      setCompletedSteps(completedSteps.filter((s) => s !== step))
    } else {
      setCompletedSteps([...completedSteps, step])
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Stripe Connect Setup Guide</h1>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Setup Database Functions</CardTitle>
            <CardDescription>Create necessary database functions for migrations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              First, we need to create SQL functions that will help us run migrations and check the database schema.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => toggleStep(1)}
              className={completedSteps.includes(1) ? "bg-green-50" : ""}
            >
              {completedSteps.includes(1) && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
              Mark as Complete
            </Button>
            <Link href="/setup-exec-sql">
              <Button>
                Setup SQL Function <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 2: Setup Column Check Function</CardTitle>
            <CardDescription>Create a function to check database columns</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This function will allow us to check if the required columns exist in your database tables.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => toggleStep(2)}
              className={completedSteps.includes(2) ? "bg-green-50" : ""}
            >
              {completedSteps.includes(2) && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
              Mark as Complete
            </Button>
            <Link href="/setup-column-check">
              <Button>
                Setup Column Check <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 3: Ensure Stripe Connect Fields</CardTitle>
            <CardDescription>Add required Stripe Connect fields to your database</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This step will ensure all required fields for Stripe Connect are present in your database.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => toggleStep(3)}
              className={completedSteps.includes(3) ? "bg-green-50" : ""}
            >
              {completedSteps.includes(3) && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
              Mark as Complete
            </Button>
            <Link href="/setup-stripe-connect-fields">
              <Button>
                Setup Fields <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 4: Run Diagnostics</CardTitle>
            <CardDescription>Check if your Stripe integration is working correctly</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This step will run diagnostics to check if your Stripe integration is configured correctly.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => toggleStep(4)}
              className={completedSteps.includes(4) ? "bg-green-50" : ""}
            >
              {completedSteps.includes(4) && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
              Mark as Complete
            </Button>
            <Link href="/stripe-diagnostics">
              <Button>
                Run Diagnostics <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 5: Connect Stripe Account</CardTitle>
            <CardDescription>Connect your Stripe account to start receiving payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Now that everything is set up, you can connect your Stripe account.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => toggleStep(5)}
              className={completedSteps.includes(5) ? "bg-green-50" : ""}
            >
              {completedSteps.includes(5) && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
              Mark as Complete
            </Button>
            <Link href="/dashboard">
              <Button>
                Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {completedSteps.length === 5 && (
        <Card className="bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">All Steps Completed!</CardTitle>
            <CardDescription className="text-green-600">Your Stripe Connect integration is now set up</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              Congratulations! You have successfully set up Stripe Connect for your consultants. They can now connect
              their Stripe accounts and start receiving payments.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
