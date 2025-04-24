"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Essay {
  title: string
  prompt: string
  text: string
  university: string
}

interface MentorEssaysProps {
  essays?: Essay[] // Make essays optional
}

export function MentorEssays({ essays = [] }: MentorEssaysProps) {
  // Provide default empty array
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null)

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-lg mb-4">College Application Essays</h3>

      {essays.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">No essays available for this consultant.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {essays.map((essay, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between mb-1">
                  <h4 className="font-medium">{essay.title}</h4>
                  <span className="text-sm text-muted-foreground">{essay.university}</span>
                </div>
                <p className="text-sm text-primary font-medium mb-2">Prompt: {essay.prompt}</p>
                <p className="text-sm line-clamp-3">{essay.text}</p>
                <Button variant="link" className="p-0 mt-2" onClick={() => setSelectedEssay(essay)}>
                  Read full essay
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedEssay} onOpenChange={(open) => !open && setSelectedEssay(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEssay?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Prompt:</h4>
              <p>{selectedEssay?.prompt}</p>
            </div>
            <div>
              <h4 className="font-medium">University:</h4>
              <p>{selectedEssay?.university}</p>
            </div>
            <div>
              <h4 className="font-medium">Essay:</h4>
              <div className="whitespace-pre-line">{selectedEssay?.text}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
