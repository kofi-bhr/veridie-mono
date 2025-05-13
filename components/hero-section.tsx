import Image from "next/image"

export function HeroSection() {
  return (
    <div className="relative py-48 md:py-96">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/campus-quad.webp"
          alt="College campus quad"
          fill
          className="object-cover scale-110 origin-center"
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 text-center pt-0 md:pt-0 -mt-32">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white -mt-24">Veridie</h1>
        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-white/90">
          Connect with top college consultants who can help you navigate the admissions process and achieve your
          academic goals.
        </p>
      </div>
    </div>
  )
}
