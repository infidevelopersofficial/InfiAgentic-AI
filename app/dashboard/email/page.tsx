"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Mail, Users, MousePointer, MoreHorizontal, Send, Eye, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const campaigns = [
  {
    id: "1",
    name: "Product Launch Newsletter",
    status: "active",
    sent: 15420,
    delivered: 15100,
    opened: 8234,
    clicked: 2156,
    scheduledFor: null,
  },
  {
    id: "2",
    name: "Weekly Digest - Week 4",
    status: "completed",
    sent: 12000,
    delivered: 11800,
    opened: 6200,
    clicked: 1800,
    scheduledFor: null,
  },
  {
    id: "3",
    name: "Feature Announcement",
    status: "scheduled",
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    scheduledFor: new Date(Date.now() + 172800000),
  },
  {
    id: "4",
    name: "Re-engagement Campaign",
    status: "draft",
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    scheduledFor: null,
  },
]

const performanceData = [
  { date: "Week 1", value: 45 },
  { date: "Week 2", value: 52 },
  { date: "Week 3", value: 48 },
  { date: "Week 4", value: 58 },
  { date: "Week 5", value: 55 },
  { date: "Week 6", value: 62 },
]

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 border-green-500/20",
  completed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  scheduled: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  draft: "bg-muted text-muted-foreground",
}

export default function EmailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-muted-foreground">Create and manage email marketing campaigns</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
              <p className="text-2xl font-bold">127.4K</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
              <p className="text-2xl font-bold">54.2%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <MousePointer className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
              <p className="text-2xl font-bold">14.3%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Send className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
              <p className="text-2xl font-bold">4</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Campaigns */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Open Rate</TableHead>
                    <TableHead>Click Rate</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const openRate = campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : "-"
                    const clickRate = campaign.sent > 0 ? ((campaign.clicked / campaign.sent) * 100).toFixed(1) : "-"
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("capitalize", statusColors[campaign.status])}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.sent > 0 ? campaign.sent.toLocaleString() : "-"}</TableCell>
                        <TableCell>
                          {openRate !== "-" && (
                            <div className="flex items-center gap-2">
                              <Progress value={Number.parseFloat(openRate)} className="w-16 h-2" />
                              <span className="text-sm">{openRate}%</span>
                            </div>
                          )}
                          {openRate === "-" && <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {clickRate !== "-" && (
                            <div className="flex items-center gap-2">
                              <Progress value={Number.parseFloat(clickRate)} className="w-16 h-2" />
                              <span className="text-sm">{clickRate}%</span>
                            </div>
                          )}
                          {clickRate === "-" && <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <AnalyticsChart title="Open Rate Trend" data={performanceData} type="line" dataKey="value" />
      </div>
    </div>
  )
}
