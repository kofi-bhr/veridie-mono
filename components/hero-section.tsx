import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative bg-slate-50 pt-16 pb-36 md:pt-48 md:pb-64">
      <div className="container px-6 md:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-8">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold tracking-tighter mb-6 md:mb-4 sm:text-5xl xl:text-6xl/none">Veridie</h1>
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
  )
}
