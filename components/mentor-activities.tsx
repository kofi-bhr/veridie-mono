import { Card, CardContent } from "@/components/ui/card"

interface Activity {
  title: string
  organization: string
  years: string
  description: string
}

interface MentorActivitiesProps {
  activities?: Activity[] // Make activities optional
}

export function MentorActivities({ activities = [] }: MentorActivitiesProps) {
  // Provide default empty array
  return (
    <div className="space-y-6">
      <h3 className="font-medium text-lg mb-4">Extracurricular Activities</h3>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-muted-foreground">No activities available for this consultant.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {activities.map((activity, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between mb-1">
                  <h4 className="font-medium">{activity.title}</h4>
                  <span className="text-sm text-muted-foreground">{activity.years}</span>
                </div>
                <p className="text-sm text-primary font-medium mb-2">{activity.organization}</p>
                <p className="text-sm">{activity.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
