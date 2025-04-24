export function HowItWorks() {
  return (
    <section className="container mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">How It Works</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our platform makes it easy to find and connect with the perfect college consultant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary">1</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Browse Consultants</h3>
          <p className="text-muted-foreground">
            Search through our extensive database of verified college consultants. Filter by specialties, universities,
            pricing, and more.
          </p>
        </div>

        <div className="text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary">2</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Book a Consultation</h3>
          <p className="text-muted-foreground">
            Schedule a free initial consultation to discuss your goals and see if the consultant is the right fit for
            you.
          </p>
        </div>

        <div className="text-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary">3</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Get Personalized Guidance</h3>
          <p className="text-muted-foreground">
            Work with your consultant to create a customized plan for your college applications and achieve your
            academic goals.
          </p>
        </div>
      </div>
    </section>
  )
}
