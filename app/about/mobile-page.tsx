import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Heart, Lightbulb, Users } from "lucide-react"

export default function MobileAboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-50 py-12">
        <div className="container px-4">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tighter">Our Mission to Transform College Consulting</h1>
              <p className="text-slate-500">
                Connecting ambitious students with successful college mentors for personalized, affordable guidance.
              </p>
            </div>

            <div className="relative mx-auto">
              <Image
                src="/campus-quad.webp"
                alt="University campus quad with students"
                width={400}
                height={300}
                className="rounded-lg object-cover shadow-xl"
                priority
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild size="lg">
                <Link href="/mentors">Find a Mentor</Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/auth/signup">Join Our Community</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 bg-white">
        <div className="container px-4">
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <h2 className="text-2xl font-bold tracking-tighter">Our Story</h2>
            <div className="w-16 h-1 bg-primary rounded-full"></div>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">The Inspiration</h3>
                <p className="text-slate-500 text-sm">
                  Founded in 2022 by college students who saw how traditional consulting failed to meet the needs of
                  most applicants.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">The Mission</h3>
                <p className="text-slate-500 text-sm">
                  We believe every student deserves access to quality guidance from peers who've recently succeeded.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">The Community</h3>
                <p className="text-slate-500 text-sm">
                  Today, we've grown into a thriving community of students helping students achieve their academic
                  dreams.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 bg-slate-50">
        <div className="container px-4">
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <h2 className="text-2xl font-bold tracking-tighter">Our Team</h2>
            <div className="w-16 h-1 bg-primary rounded-full"></div>
          </div>

          <div className="grid gap-8">
            {/* Team Member 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src="/diverse-founder-headshot.png"
                  alt="Sarah Chen"
                  width={128}
                  height={128}
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold">Sarah Chen</h3>
              <p className="text-primary font-medium">Co-Founder & CEO</p>
              <p className="text-slate-500 text-sm mt-2">
                Harvard '22, passionate about making education more equitable.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src="/young-diverse-founder-male-headshot.png"
                  alt="Marcus Johnson"
                  width={128}
                  height={128}
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold">Marcus Johnson</h3>
              <p className="text-primary font-medium">Co-Founder & CTO</p>
              <p className="text-slate-500 text-sm mt-2">
                MIT '21, building technology that connects students worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-white">
        <div className="container px-4">
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <h2 className="text-2xl font-bold tracking-tighter">FAQ</h2>
            <div className="w-16 h-1 bg-primary rounded-full"></div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does Veridie work?</AccordionTrigger>
              <AccordionContent>
                Veridie connects you with current college students who can provide personalized guidance on
                applications, essays, and more. Browse profiles, book sessions, and get the insights you need.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How much does it cost?</AccordionTrigger>
              <AccordionContent>
                Our mentors set their own rates, typically ranging from $30-100 per hour, significantly more affordable
                than traditional consultants who charge $200-500 per hour.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>How are mentors vetted?</AccordionTrigger>
              <AccordionContent>
                We verify all mentors' college enrollment and academic credentials. We also collect reviews from
                students to ensure quality guidance.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>How do I become a mentor?</AccordionTrigger>
              <AccordionContent>
                Sign up, create a profile highlighting your academic achievements and expertise, set your rates and
                availability, and start connecting with students.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary text-white">
        <div className="container px-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <h2 className="text-2xl font-bold tracking-tighter">Join the Veridie Community</h2>
            <p className="text-primary-foreground/90">
              Whether you're seeking guidance or want to share your college success story, we'd love to have you.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <Button asChild size="lg" variant="secondary">
                <Link href="/mentors">Find a Mentor</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white hover:text-primary"
              >
                <Link href="/auth/signup">Become a Mentor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
