import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function HeroSection() {
  return (
    <div className="relative py-40 md:py-64">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/campus-quad.webp" alt="College campus quad" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">Veridie</h1>
        <p className="text-xl md:text-2xl mb-16 max-w-3xl mx-auto text-white/90">
          Connect with top college consultants who can help you navigate the admissions process and achieve your
          academic goals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
            <Link href="/mentors">Find a Consultant</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="bg-white/90 text-black hover:bg-white">
            <Link href="/auth/signup">Create an Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
