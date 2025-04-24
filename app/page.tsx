import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"

export default function HomePage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <div className="py-16">
        <HowItWorks />
      </div>
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Consultants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Featured consultants will be displayed here */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg shadow-md p-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-muted mb-4"></div>
                <h3 className="font-semibold text-lg mb-1">Consultant Name</h3>
                <p className="text-muted-foreground mb-2">Harvard University</p>
                <p className="text-sm mb-4">College Admissions Expert</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/mentors/1">View Profile</Link>
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/mentors">View All Consultants</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="py-16">
        <Testimonials />
      </div>
      <div className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with experienced college consultants who can help you achieve your academic dreams.
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
    </main>
  )
}
