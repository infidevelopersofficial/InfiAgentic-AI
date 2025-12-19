"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { CreateCampaignDialog } from "@/components/dashboard/create-campaign-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Plus, Mail, Users, MousePointer, MoreHorizontal, Send, Eye, Edit, Trash2, Search, Filter, Calendar, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const initialCampaigns = [
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
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const handleCreateCampaign = (campaignData: any) => {
    const newCampaign = {
      id: Date.now().toString(),
      ...campaignData,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      status: campaignData.scheduledFor ? "scheduled" : "draft",
    }
    setCampaigns(prev => [newCampaign, ...prev])
    setCreateDialogOpen(false)
    
    toast({
      title: "Campaign Created",
      description: `${campaignData.name} has been created successfully.`,
    })
  }

  const handleSendCampaign = (campaignId: string) => {
    setCampaigns(prev =>
      prev.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, status: "active" as const }
          : campaign
      )
    )
    
    toast({
      title: "Campaign Sent",
      description: "Campaign has been sent successfully.",
    })
  }

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId))
    
    toast({
      title: "Campaign Deleted",
      description: "Campaign has been removed.",
      variant: "destructive",
    })
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = selectedStatus === "all" || campaign.status === selectedStatus
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const calculateMetrics = () => {
    const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0)
    const totalDelivered = campaigns.reduce((sum, c) => sum + c.delivered, 0)
    const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0)
    const totalClicked = campaigns.reduce((sum, c) => sum + c.clicked, 0)
    
    return {
      totalSent,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
    }
  }

  const metrics = calculateMetrics()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-muted-foreground">Create and manage email marketing campaigns</p>
        </div>
        <CreateCampaignDialog onCreateCampaign={handleCreateCampaign}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </CreateCampaignDialog>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.totalSent.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Sent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.deliveryRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Delivery Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.openRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Open Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <MousePointer className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics.clickRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Click Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
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
                  {filteredCampaigns.map((campaign) => {
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
                          {openRate !== "-" ? (
                            <div className="flex items-center gap-2">
                              <span>{openRate}%</span>
                              <Progress value={parseFloat(openRate)} className="w-12 h-2" />
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {clickRate !== "-" ? (
                            <div className="flex items-center gap-2">
                              <span>{clickRate}%</span>
                              <Progress value={parseFloat(clickRate)} className="w-12 h-2" />
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {campaign.status === "draft" && (
                                <DropdownMenuItem onClick={() => handleSendCampaign(campaign.id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Campaign
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCampaign(campaign.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
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
