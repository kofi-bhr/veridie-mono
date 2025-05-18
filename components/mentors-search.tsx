"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function MentorsSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce search input to avoid too many URL updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Update URL when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== searchParams.get("q")) {
      const params = new URLSearchParams(searchParams.toString())

      if (debouncedQuery) {
        params.set("q", debouncedQuery)
      } else {
        params.delete("q")
      }

      router.push(`/mentors?${params.toString()}`)
    }
  }, [debouncedQuery, router, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    if (query) {
      params.set("q", query)
    } else {
      params.delete("q")
    }

    router.push(`/mentors?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <Input
        type="search"
        placeholder="Search by name, university, specialty..."
        className="pl-10 py-6 text-base"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search mentors"
      />
      <Button type="submit" size="icon" variant="ghost" className="absolute left-0 top-0 h-full px-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  )
}
