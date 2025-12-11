"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

const events = [
  { id: "1", title: "Blog Post: AI Trends", type: "content", date: new Date(2025, 0, 15), time: "10:00 AM" },
  { id: "2", title: "Email Campaign Launch", type: "email", date: new Date(2025, 0, 16), time: "9:00 AM" },
  { id: "3", title: "Social Media: Product Update", type: "social", date: new Date(2025, 0, 17), time: "2:00 PM" },
  { id: "4", title: "Webinar Promotion", type: "campaign", date: new Date(2025, 0, 18), time: "11:00 AM" },
  { id: "5", title: "Newsletter Send", type: "email", date: new Date(2025, 0, 20), time: "8:00 AM" },
]

const typeColors: Record<string, string> = {
  content: "bg-blue-500",
  email: "bg-green-500",
  social: "bg-purple-500",
  campaign: "bg-orange-500",
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const eventsForSelectedDate = events.filter((event) => event.date.toDateString() === selectedDate.toDateString())

  const upcomingEvents = events
    .filter((event) => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage all your marketing activities</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate)
                if (newDate) setSelectedDate(newDate)
              }}
              className="rounded-md border w-full"
            />
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events scheduled</p>
              ) : (
                <div className="space-y-3">
                  {eventsForSelectedDate.map((event) => (
                    <div key={event.id} className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${typeColors[event.type]}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className={`mt-1.5 h-2 w-2 rounded-full ${typeColors[event.type]}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at {event.time}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
