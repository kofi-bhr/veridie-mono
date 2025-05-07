import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Award {
  title: string
  issuer: string
  year: string
  description: string
}

interface MentorAwardsProps {
  awards?: Award[] // Make awards optional
}

export function MentorAwards({ awards = [] }: MentorAwardsProps) {
  // Provide default empty array
  return (
    <div className="space-y-6">
      <h3 className="font-medium text-lg mb-4">Honors & Awards</h3>

      {awards.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">No awards available for this consultant.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {awards.map((award, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between mb-1">
                  <h4 className="font-medium">{award.title}</h4>
                  <Badge>{award.year}</Badge>
                </div>
                <p className="text-sm text-primary font-medium mb-2">Awarded by {award.issuer}</p>
                <p className="text-sm">{award.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
