"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Filter } from "lucide-react"

export function MentorsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([50, 200])
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])

  const universities = [
    "Harvard University",
    "Stanford University",
    "MIT",
    "Yale University",
    "Princeton University",
    "Columbia University",
    "UC Berkeley",
    "University of Chicago",
  ]

  const specialties = [
    "Essay Editing",
    "Interview Preparation",
    "Application Strategy",
    "Scholarship Applications",
    "STEM Applications",
    "Arts Portfolio Review",
    "Athletic Recruitment",
    "International Students",
  ]

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
    setSelectedUniversities([])
    setSelectedSpecialties([])
    router.push("/mentors")
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
              onValueChange={setPriceRange}
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
              <div className="space-y-2">
                {universities.map((university) => (
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
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="specialties">
            <AccordionTrigger>Specialties</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {specialties.map((specialty) => (
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
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="pt-4 space-y-2">
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
          <Button onClick={resetFilters} variant="outline" className="w-full">
            Reset
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
