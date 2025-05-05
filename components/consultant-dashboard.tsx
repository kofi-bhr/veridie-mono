"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StripeConnectSection } from "./stripe-connect-section"
import { supabase } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"

export function ConsultantDashboard({ user, mentorData }: { user: any; mentorData: any }) {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const [services, setServices] = useState<any[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from("services")
            .select("*")
            .eq("mentor_id", user.id)
            .order("created_at", { ascending: false })

          if (error) {
            console.error("Error fetching services:", error)
          } else {
            setServices(data || [])
          }
        } catch (err) {
          console.error("Error in fetchServices:", err)
        } finally {
          setIsLoadingServices(false)
        }
      }
    }

    fetchServices()
  }, [user])

  if (!user) {
    return <div>Loading...</div>
  }

  const handleProfileClick = () => {
    router.push("/dashboard/profile")
  }

  const handleViewPublicProfile = () => {
    // Create URL-friendly version of the name
    const nameSlug = encodeURIComponent(user.name.toLowerCase().replace(/\s+/g, "-"))
    router.push(`/mentors/${nameSlug}`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.00</div>
                <p className="text-xs text-muted-foreground">No bookings yet</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No bookings yet</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{services.length}</div>
                <p className="text-xs text-muted-foreground">
                  {services.length === 0
                    ? "No services yet"
                    : services.length === 1
                      ? "1 service offered"
                      : `${services.length} services offered`}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>You have no bookings yet.</CardDescription>
              </CardHeader>
              <CardContent>No bookings to display.</CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>You have no reviews yet.</CardDescription>
              </CardHeader>
              <CardContent>No reviews to display.</CardContent>
            </Card>
          </div>
          <Card className="col-span-7">
            <CardHeader>
              <CardTitle>Your Services</CardTitle>
              <CardDescription>
                {services.length === 0
                  ? "You haven't created any services yet."
                  : `You are offering ${services.length} service${services.length === 1 ? "" : "s"}.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingServices ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading services...</span>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Create services to offer your expertise to clients.</p>
                  <Button onClick={() => router.push("/dashboard/services")}>Add Services</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${service.price}</p>
                          {service.calendly_event_type_uri && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Calendly Connected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <Button variant="outline" onClick={() => router.push("/dashboard/services")}>
                      Manage Services
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleViewPublicProfile}>
              View Public Profile
            </Button>
            <Button onClick={handleProfileClick}>Edit Profile</Button>
          </div>
        </TabsContent>
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>View and manage your bookings.</CardDescription>
            </CardHeader>
            <CardContent>No bookings to display.</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments" className="space-y-4">
          <StripeConnectSection />
        </TabsContent>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your profile information.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Name:</span> {user.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {user.email}
                  </div>
                </div>
                <Button onClick={handleProfileClick}>Edit Full Profile</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
