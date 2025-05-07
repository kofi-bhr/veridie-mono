interface AwardType {
  id: string
  title: string
  issuer: string
  year: string
  description?: string
}

interface MentorAwardsProps {
  awards: AwardType[]
}

export function MentorAwards({ awards = [] }: MentorAwardsProps) {
  if (!awards || awards.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No awards available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {awards.map((award) => (
        <div key={award.id} className="bg-[#1C2127] rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-white">{award.title}</h3>
            <span className="text-sm text-white">{award.year}</span>
          </div>
          <p className="text-sm text-white mb-2">Awarded by {award.issuer}</p>
          {award.description && <p className="text-sm text-white">{award.description}</p>}
        </div>
      ))}
    </div>
  )
}
