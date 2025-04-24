import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <div className="bg-gradient-to-b from-primary/10 to-primary/5 py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Veridie</h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Connect with experienced college consultants who have successfully navigated the admissions process at top
          universities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/mentors">Find a Consultant</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/signup">Become a Consultant</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
