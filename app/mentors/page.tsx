import { MentorsSearch } from "@/components/mentors-search"
import { MentorsList } from "@/components/mentors-list"
import { MentorsFilters } from "@/components/mentors-filters"

export default function MentorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect College Consultant</h1>
          <p className="text-muted-foreground">
            Browse our network of experienced college consultants and find the perfect match for your needs.
          </p>
        </div>

        <MentorsSearch />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <MentorsFilters />
          </div>
          <div className="lg:col-span-3">
            <MentorsList />
          </div>
        </div>
      </div>
    </div>
  )
}
