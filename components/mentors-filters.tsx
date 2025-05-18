"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Filter, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

export function MentorsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get initial values from URL
  const initialMinPrice = Number(searchParams.get("minPrice") || 50)
  const initialMaxPrice = Number(searchParams.get("maxPrice") || 200)
  const initialUniversities = searchParams.get("universities")?.split(",") || []
  const initialSpecialties = searchParams.get("specialties")?.split(",") || []

  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([initialMinPrice, initialMaxPrice])
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(initialUniversities)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(initialSpecialties)
  const [priceRangeChanged, setPriceRangeChanged] = useState(false)

  const [universities, setUniversities] = useState<string[]>([
    "Harvard University",
    "Stanford University",
    "MIT",
    "Yale University",
    "Princeton University",
    "Columbia University",
    "UC Berkeley",
    "University of Chicago",
  ])

  const [specialties, setSpecialties] = useState<string[]>([
    "Essay Editing",
    "Interview Preparation",
    "Application Strategy",
    "Scholarship Applications",
    "STEM Applications",
    "Arts Portfolio Review",
    "Athletic Recruitment",
    "International Students",
  ])

  const [loading, setLoading] = useState(false)

  // Fetch actual universities and specialties from database
  useEffect(() => {
    async function fetchFilterOptions() {
      setLoading(true)
      try {
        // Fetch unique universities
        const { data: universityData, error: universityError } = await supabase
          .from("mentors")
          .select("university")
          .not("university", "is", null)
          .not("university", "eq", "")

        if (!universityError && universityData) {
          const uniqueUniversities = Array.from(
            new Set(universityData.map((item) => item.university).filter(Boolean)),
          ).sort()
          if (uniqueUniversities.length > 0) {
            setUniversities(uniqueUniversities)
          }
        }

        // Fetch unique specialties
        const { data: specialtyData, error: specialtyError } = await supabase
          .from("specialties")
          .select("name")
          .not("name", "is", null)
          .not("name", "eq", "")

        if (!specialtyError && specialtyData) {
          const uniqueSpecialties = Array.from(new Set(specialtyData.map((item) => item.name).filter(Boolean))).sort()
          if (uniqueSpecialties.length > 0) {
            setSpecialties(uniqueSpecialties)
          }
        }
      } catch (error) {
        console.error("Error fetching filter options:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterOptions()
  }, [])

  // Apply filters automatically when selections change
  useEffect(() => {
    // Don't apply on initial load
    const isInitialLoad =
      selectedUniversities === initialUniversities && selectedSpecialties === initialSpecialties && !priceRangeChanged

    if (isInitialLoad) return

    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUniversities, selectedSpecialties])

  // Apply price range filter when slider is released
  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value)
    setPriceRangeChanged(true)
  }

  const handlePriceRangeCommit = () => {
    if (priceRangeChanged) {
      applyFilters()
    }
  }

  const toggleUniversity = (university: string) => {
    setSelectedUniversities((prev) =>
      prev.includes(university) ? prev.filter((u) => u !== university) : [...prev, university],
    )
  }

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty],
    )
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Price range
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())

    // Universities
    if (selectedUniversities.length > 0) {
      params.set("universities", selectedUniversities.join(","))
    } else {
      params.delete("universities")
    }

    // Specialties
    if (selectedSpecialties.length > 0) {
      params.set("specialties", selectedSpecialties.join(","))
    } else {
      params.delete("specialties")
    }

    router.push(`/mentors?${params.toString()}`)
  }

  const resetFilters = () => {
    setPriceRange([50, 200])
    setPriceRangeChanged(true)
    setSelectedUniversities([])
    setSelectedSpecialties([])

    // Keep search query if it exists
    const query = searchParams.get("q")
    if (query) {
      router.push(`/mentors?q=${query}`)
    } else {
      router.push("/mentors")
    }
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-between"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </div>
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
        <div>
          <h3 className="font-medium mb-3">Price Range ($/hour)</h3>
          <div className="px-2">
            <Slider
              defaultValue={priceRange}
              min={0}
              max={500}
              step={10}
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              onValueCommit={handlePriceRangeCommit}
            />
            <div className="flex items-center justify-between mt-2 text-sm">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>

        <Accordion type="multiple" defaultValue={["universities", "specialties"]}>
          <AccordionItem value="universities">
            <AccordionTrigger>Universities</AccordionTrigger>
            <AccordionContent>
              {loading ? (
                <div className="py-2 text-sm text-muted-foreground flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading universities...
                </div>
              ) : (
                <div className="space-y-2">
                  {universities.length === 0 ? (
                    <div className="py-2 text-sm text-muted-foreground">No universities found in the database.</div>
                  ) : (
                    universities.map((university) => (
                      <div key={university} className="flex items-center space-x-2">
                        <Checkbox
                          id={`university-${university}`}
                          checked={selectedUniversities.includes(university)}
                          onCheckedChange={() => toggleUniversity(university)}
                        />
                        <Label htmlFor={`university-${university}`} className="text-sm font-normal cursor-pointer">
                          {university}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="specialties">
            <AccordionTrigger>Specialties</AccordionTrigger>
            <AccordionContent>
              {loading ? (
                <div className="py-2 text-sm text-muted-foreground flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading specialties...
                </div>
              ) : (
                <div className="space-y-2">
                  {specialties.length === 0 ? (
                    <div className="py-2 text-sm text-muted-foreground">No specialties found in the database.</div>
                  ) : (
                    specialties.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox
                          id={`specialty-${specialty}`}
                          checked={selectedSpecialties.includes(specialty)}
                          onCheckedChange={() => toggleSpecialty(specialty)}
                        />
                        <Label htmlFor={`specialty-${specialty}`} className="text-sm font-normal cursor-pointer">
                          {specialty}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="pt-4">
          <Button onClick={resetFilters} variant="outline" className="w-full">
            Reset All Filters
          </Button>
        </div>

        {(selectedUniversities.length > 0 || selectedSpecialties.length > 0) && (
          <div className="pt-4">
            <h3 className="font-medium mb-2">Active Filters:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedUniversities.map((university) => (
                <Badge key={university} variant="secondary" className="flex items-center gap-1">
                  {university}
                  <button onClick={() => toggleUniversity(university)} className="ml-1 rounded-full hover:bg-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    <span className="sr-only">Remove {university} filter</span>
                  </button>
                </Badge>
              ))}

              {selectedSpecialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                  {specialty}
                  <button onClick={() => toggleSpecialty(specialty)} className="ml-1 rounded-full hover:bg-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    <span className="sr-only">Remove {specialty} filter</span>
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
