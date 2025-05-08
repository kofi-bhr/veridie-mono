import { Skeleton } from "@/components/ui/skeleton"

export default function AboutLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Loading */}
      <section className="relative bg-slate-50 py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-full max-w-[600px]" />
                <Skeleton className="h-6 w-2/3 max-w-[400px]" />
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
            <div className="mx-auto lg:mr-0">
              <Skeleton className="h-[400px] w-[550px] rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section Loading */}
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-1 w-20" />
            <Skeleton className="h-6 w-full max-w-[700px]" />
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section Loading */}
      <section className="py-16 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-1 w-20" />
            <Skeleton className="h-6 w-full max-w-[700px]" />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                <div className="w-full">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section Loading */}
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-1 w-20" />
            <Skeleton className="h-6 w-full max-w-[700px]" />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <Skeleton className="h-40 w-40 rounded-full mb-4" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-40 mt-1" />
                <Skeleton className="h-4 w-56 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
