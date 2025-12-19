"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, TrendingUp, Users, Eye, MousePointer, Calendar, Filter, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const trafficData = [
  { date: "Jan", value: 4000 },
  { date: "Feb", value: 3500 },
  { date: "Mar", value: 5200 },
  { date: "Apr", value: 4800 },
  { date: "May", value: 6100 },
  { date: "Jun", value: 5800 },
  { date: "Jul", value: 7200 },
]

const conversionData = [
  { date: "Jan", value: 2.1 },
  { date: "Feb", value: 2.4 },
  { date: "Mar", value: 2.8 },
  { date: "Apr", value: 3.1 },
  { date: "May", value: 3.4 },
  { date: "Jun", value: 3.2 },
  { date: "Jul", value: 3.8 },
]

const engagementData = [
  { date: "Jan", value: 45 },
  { date: "Feb", value: 52 },
  { date: "Mar", value: 48 },
  { date: "Apr", value: 58 },
  { date: "May", value: 62 },
  { date: "Jun", value: 55 },
  { date: "Jul", value: 68 },
]

const channelData = [
  { date: "Organic", value: 4500 },
  { date: "Social", value: 2800 },
  { date: "Email", value: 3200 },
  { date: "Paid", value: 1900 },
  { date: "Referral", value: 1200 },
]

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: `Exporting analytics data for the last ${selectedPeriod}...`,
    })
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Analytics data has been exported successfully.",
      })
    }, 2000)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLastUpdated(new Date())
    setIsRefreshing(false)
    
    toast({
      title: "Data Refreshed",
      description: "Analytics data has been updated.",
    })
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    toast({
      title: "Period Changed",
      description: `Showing data for the last ${period}`,
    })
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "7d": return "Last 7 days"
      case "30d": return "Last 30 days"
      case "90d": return "Last 90 days"
      case "1y": return "Last year"
      default: return "Last 30 days"
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">Track performance across all marketing channels</p>
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {getPeriodLabel(selectedPeriod)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            className="gap-2 bg-transparent"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Impressions</p>
              <p className="text-2xl font-bold">2.4M</p>
              <p className="text-xs text-green-500">+12.5% vs last period</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unique Visitors</p>
              <p className="text-2xl font-bold">184K</p>
              <p className="text-xs text-green-500">+8.2% vs last period</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <MousePointer className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Click-through Rate</p>
              <p className="text-2xl font-bold">4.8%</p>
              <p className="text-xs text-green-500">+0.6% vs last period</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">3.2%</p>
              <p className="text-xs text-green-500">+0.4% vs last period</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsChart title="Website Traffic" data={trafficData} type="area" />
            <AnalyticsChart title="Conversion Rate (%)" data={conversionData} type="line" />
            <AnalyticsChart title="Engagement Score" data={engagementData} type="area" />
            <AnalyticsChart title="Traffic by Channel" data={channelData} type="bar" />
          </div>
        </TabsContent>
        <TabsContent value="traffic" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsChart title="Website Traffic" data={trafficData} type="area" />
            <AnalyticsChart title="Traffic by Channel" data={channelData} type="bar" />
          </div>
        </TabsContent>
        <TabsContent value="engagement" className="mt-6">
          <AnalyticsChart title="Engagement Score Over Time" data={engagementData} type="area" />
        </TabsContent>
        <TabsContent value="conversions" className="mt-6">
          <AnalyticsChart title="Conversion Rate (%)" data={conversionData} type="line" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
