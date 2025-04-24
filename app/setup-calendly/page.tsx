import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SetupCalendlyPage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Set Up Calendly Integration</CardTitle>
          <CardDescription>Run this migration to add Calendly fields to your database.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This will add the necessary fields to your database to support Calendly integration:</p>
          <ul className="list-disc pl-5 mb-6 space-y-1">
            <li>
              Add <code>calendly_username</code> to the mentors table
            </li>
            <li>
              Add <code>calendly_event_id</code> to the bookings table
            </li>
            <li>Create indexes for better performance</li>
          </ul>
          <form action="/api/setup-calendly" method="POST">
            <Button type="submit" className="w-full">
              Run Migration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
