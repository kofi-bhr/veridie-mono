import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Simple Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Veridie connects students with current university students for affordable college consulting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* For Students */}
        <Card className="border-2">
          <CardHeader>
            <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full w-fit mb-2">
              Get Expert Guidance
            </div>
            <CardTitle className="text-2xl">For Students</CardTitle>
            <CardDescription>Looking for college application guidance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">$0</div>
            <p className="text-muted-foreground">Free to browse and connect</p>

            <div className="pt-4 space-y-4">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Free Account Creation</h3>
                  <p className="text-sm text-muted-foreground">Create your profile and browse mentors at no cost</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Pay Only For Services You Use</h3>
                  <p className="text-sm text-muted-foreground">Service prices are set by individual consultants</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    Pay securely through our platform with money-back guarantee
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Direct Communication</h3>
                  <p className="text-sm text-muted-foreground">Message consultants directly through our platform</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/mentors">Find a Consultant</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* For Consultants */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full w-fit mb-2">
              Earn While Helping Others
            </div>
            <CardTitle className="text-2xl">For Consultants</CardTitle>
            <CardDescription>Current university students offering guidance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">20%</span>
              <span className="text-muted-foreground ml-2">platform fee</span>
            </div>
            <p className="text-muted-foreground">You keep 80% of what you earn</p>

            <div className="pt-4 space-y-4">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Free Profile Creation</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and customize your consultant profile at no cost
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Set Your Own Prices</h3>
                  <p className="text-sm text-muted-foreground">Full control over your service pricing</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Comprehensive Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Manage your profile, services, and client sessions</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    Get paid directly to your account with our secure payment system
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/auth/signup">Become a Consultant</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">How does the 20% platform fee work?</h3>
            <p className="text-muted-foreground">
              When a student books one of your services, we handle the payment processing and take a 20% fee to cover
              platform costs, marketing, and customer support. The remaining 80% is paid directly to you.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">When do consultants get paid?</h3>
            <p className="text-muted-foreground">
              Payments are processed after the service is completed and the student confirms satisfaction. Funds are
              typically transferred to your account within 3-5 business days.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Are there any hidden fees for students?</h3>
            <p className="text-muted-foreground">
              No, students only pay the listed price for the services they book. There are no membership fees or hidden
              charges.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Can consultants offer discounts or packages?</h3>
            <p className="text-muted-foreground">
              Yes, consultants have full control over their pricing and can create custom packages or offer discounts to
              students as they see fit.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center bg-muted/30 py-12 px-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join Veridie today and connect with students or consultants to make the college application process easier.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/mentors">Find a Consultant</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/signup">Create an Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
