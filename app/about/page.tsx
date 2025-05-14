import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, GraduationCap, Heart, Lightbulb, Users } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-50 py-32 md:py-48">
        <div className="container px-6 md:px-10 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Our Mission to Transform College Consulting
                </h1>
                <p className="max-w-[600px] text-slate-500 md:text-xl">
                  Connecting ambitious students with successful college mentors for personalized, affordable guidance.
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row">
                <Button asChild size="lg" className="text-lg py-6">
                  <Link href="/mentors">Find a Mentor</Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg py-6">
                  <Link href="/auth/signup">Join Our Community</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto lg:mr-0 relative">
              <Image
                src="/campus-quad.webp"
                alt="University campus quad with students"
                width={650}
                height={500}
                className="rounded-lg object-cover shadow-xl"
                priority
              />
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-lg shadow-lg hidden md:block">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <span className="font-bold text-lg">500+ Successful Admissions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="container px-6 md:px-10 lg:px-16">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Our Story</h2>
            <div className="w-20 h-1 bg-primary rounded-full"></div>
            <p className="max-w-[700px] text-slate-500 md:text-lg">
              How Veridie was born from a simple idea: students helping students.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">The Inspiration</h3>
                <p className="text-slate-500">
                  Founded in 2022 by college students who saw how traditional consulting failed to meet the needs of
                  most applicants.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">The Mission</h3>
                <p className="text-slate-500">
                  We believe every student deserves access to quality guidance from peers who've recently succeeded.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">The Community</h3>
                <p className="text-slate-500">
                  Today, we've grown into a thriving community of students helping students achieve their academic
                  dreams.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-slate-50">
        <div className="container px-6 md:px-10 lg:px-16">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Our Values</h2>
            <div className="w-20 h-1 bg-primary rounded-full"></div>
            <p className="max-w-[700px] text-slate-500 md:text-lg">
              The principles that guide everything we do at Veridie.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Authenticity</h3>
                <p className="text-slate-500">
                  We believe in genuine connections and honest advice from students who've been there.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Accessibility</h3>
                <p className="text-slate-500">
                  Quality college consulting should be available to students of all backgrounds.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Empowerment</h3>
                <p className="text-slate-500">
                  We empower students to take control of their academic journey with confidence.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Community</h3>
                <p className="text-slate-500">
                  We're building a supportive network where knowledge and experience are shared freely.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Innovation</h3>
                <p className="text-slate-500">
                  We're constantly improving our platform to better serve students' evolving needs.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Integrity</h3>
                <p className="text-slate-500">
                  We uphold the highest ethical standards in all our interactions and advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container px-6 md:px-10 lg:px-16">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Our Team</h2>
            <div className="w-20 h-1 bg-primary rounded-full"></div>
            <p className="max-w-[700px] text-slate-500 md:text-lg">Meet the passionate individuals behind Veridie.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Team Member 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-40 h-40 mb-4 overflow-hidden rounded-full">
                <Image
                  src="/sebastian-tan.png"
                  alt="Sebastian Tan"
                  width={180}
                  height={180}
                  className="absolute object-cover"
                  style={{
                    objectPosition: "center 30%",
                    transform: "scale(1.2)",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
              <h3 className="text-xl font-bold">Sebastian Tan</h3>
              <p className="text-primary font-medium">Co-Founder & CEO</p>
              <p className="text-slate-500 mt-2">Stanford '30 and Palantir, passionate about transforming education.</p>
            </div>

            {/* Team Member 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-40 h-40 mb-4">
                <Image
                  src="/young-diverse-founder-male-headshot.png"
                  alt="Marcus Johnson"
                  width={160}
                  height={160}
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">Marcus Johnson</h3>
              <p className="text-primary font-medium">Co-Founder & CTO</p>
              <p className="text-slate-500 mt-2">MIT '21, building technology that connects students worldwide.</p>
            </div>

            {/* Team Member 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-40 h-40 mb-4">
                <Image
                  src="/diverse-woman-headshot.png"
                  alt="Aisha Patel"
                  width={160}
                  height={160}
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">Aisha Patel</h3>
              <p className="text-primary font-medium">Head of Mentor Relations</p>
              <p className="text-slate-500 mt-2">
                Stanford '23, dedicated to curating our exceptional mentor community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-slate-50">
        <div className="container px-6 md:px-10 lg:px-16">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Our Impact</h2>
            <div className="w-20 h-1 bg-primary rounded-full"></div>
            <p className="max-w-[700px] text-slate-500 md:text-lg">The difference we're making in students' lives.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                <h3 className="text-4xl font-bold text-primary">500+</h3>
                <p className="text-slate-700 font-medium">Students Admitted</p>
                <p className="text-slate-500 text-sm">To their dream schools with help from our mentors</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                <h3 className="text-4xl font-bold text-primary">200+</h3>
                <p className="text-slate-700 font-medium">Active Mentors</p>
                <p className="text-slate-500 text-sm">From top universities across the country</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                <h3 className="text-4xl font-bold text-primary">50+</h3>
                <p className="text-slate-700 font-medium">Universities</p>
                <p className="text-slate-500 text-sm">Represented in our diverse mentor community</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                <h3 className="text-4xl font-bold text-primary">4.8/5</h3>
                <p className="text-slate-700 font-medium">Average Rating</p>
                <p className="text-slate-500 text-sm">From students who've worked with our mentors</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container px-6 md:px-10 lg:px-16">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Frequently Asked Questions</h2>
            <div className="w-20 h-1 bg-primary rounded-full"></div>
            <p className="max-w-[700px] text-slate-500 md:text-lg">Answers to common questions about Veridie.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Tabs defaultValue="students" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="students">For Students</TabsTrigger>
                <TabsTrigger value="mentors">For Mentors</TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">How does Veridie work?</h3>
                  <p className="text-slate-500">
                    Veridie connects you with current college students who can provide personalized guidance on
                    applications, essays, and more. Browse profiles, book sessions, and get the insights you need.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold">How much does it cost?</h3>
                  <p className="text-slate-500">
                    Our mentors set their own rates, typically ranging from $30-100 per hour, significantly more
                    affordable than traditional consultants who charge $200-500 per hour.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold">How are mentors vetted?</h3>
                  <p className="text-slate-500">
                    We verify all mentors' college enrollment and academic credentials. We also collect reviews from
                    students to ensure quality guidance.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold">What if I'm not satisfied?</h3>
                  <p className="text-slate-500">
                    We offer a satisfaction guarantee. If you're not happy with your session, contact us and we'll make
                    it right.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="mentors" className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">How do I become a mentor?</h3>
                  <p className="text-slate-500">
                    Sign up, create a profile highlighting your academic achievements and expertise, set your rates and
                    availability, and start connecting with students.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold">How much can I earn?</h3>
                  <p className="text-slate-500">
                    Mentors set their own rates and keep 80% of what they charge. Active mentors typically earn
                    $500-2000 per month during application season.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold">What's the time commitment?</h3>
                  <p className="text-slate-500">
                    It's completely flexible. You set your own hours and can accept or decline session requests based on
                    your schedule.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold">What support does Veridie provide?</h3>
                  <p className="text-slate-500">
                    We handle all payments, scheduling, and marketing. We also provide resources and training to help
                    you be an effective mentor.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container px-6 md:px-10 lg:px-16">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Join the Veridie Community?</h2>
              <p className="text-primary-foreground/90 md:text-lg">
                Whether you're seeking guidance or want to share your college success story, we'd love to have you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
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
