interface MentorActivity {
  id: string
  title: string
  organization: string
  years: string
  description?: string
}

interface MentorActivitiesProps {
  activities: MentorActivity[]
}

export function MentorActivities({ activities = [] }: MentorActivitiesProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No activities available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="bg-[#1C2127] rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-white">{activity.title}</h3>
            <span className="text-sm text-white">{activity.years}</span>
          </div>
          <p className="text-sm text-white mb-2">{activity.organization}</p>
          {activity.description && <p className="text-sm text-white">{activity.description}</p>}
        </div>
      ))}
    </div>
  )
}
