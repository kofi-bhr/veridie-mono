import { Search, Calendar, GraduationCap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function HowItWorks() {
  return (
    <section className="container mx-auto px-4 py-16 rounded-xl">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          Three simple steps to transform your college application journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="bg-primary h-2 w-full"></div>
          <CardContent className="pt-8 pb-8 px-8">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <div className="bg-primary/10 text-primary font-bold text-sm rounded-full px-3 py-1 inline-block mb-4">
              STEP 1
            </div>
            <h3 className="text-2xl font-bold mb-4">Browse Consultants</h3>
            <p className="text-muted-foreground">
              Find top consultants matched to your needs. Filter by expertise, university experience, and pricing to
              find your perfect match.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="bg-primary h-2 w-full"></div>
          <CardContent className="pt-8 pb-8 px-8">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <div className="bg-primary/10 text-primary font-bold text-sm rounded-full px-3 py-1 inline-block mb-4">
              STEP 2
            </div>
            <h3 className="text-2xl font-bold mb-4">Book a Session</h3>
            <p className="text-muted-foreground">
              Schedule your free initial consultation. Discuss your goals and create a personalized plan for your
              college applications.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="bg-primary h-2 w-full"></div>
          <CardContent className="pt-8 pb-8 px-8">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div className="bg-primary/10 text-primary font-bold text-sm rounded-full px-3 py-1 inline-block mb-4">
              STEP 3
            </div>
            <h3 className="text-2xl font-bold mb-4">Get Accepted</h3>
            <p className="text-muted-foreground">
              Work with your consultant to craft standout applications. Receive expert guidance through every step of
              the admissions process.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
