"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import {
  Plus,
  Calendar,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share,
  Eye,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const platforms = [
  { id: "twitter", name: "Twitter", icon: Twitter, followers: "24.5K", color: "text-sky-500" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, followers: "18.2K", color: "text-blue-600" },
  { id: "facebook", name: "Facebook", icon: Facebook, followers: "32.1K", color: "text-blue-500" },
  { id: "instagram", name: "Instagram", icon: Instagram, followers: "45.8K", color: "text-pink-500" },
]

const scheduledPosts = [
  {
    id: "1",
    platform: "twitter",
    content:
      "Excited to announce our new AI-powered content generator! Create blog posts, social media content, and more in seconds.",
    scheduledFor: new Date(Date.now() + 3600000),
    status: "scheduled",
  },
  {
    id: "2",
    platform: "linkedin",
    content:
      "We're hiring! Join our team of innovative marketers and help shape the future of AI-driven marketing automation.",
    scheduledFor: new Date(Date.now() + 7200000),
    status: "scheduled",
  },
  {
    id: "3",
    platform: "instagram",
    content: "Behind the scenes at our product launch event! Swipe to see the team in action.",
    scheduledFor: new Date(Date.now() + 86400000),
    status: "scheduled",
  },
]

const recentPosts = [
  {
    id: "1",
    platform: "twitter",
    content: "Just shipped a major update to our analytics dashboard! Now with real-time insights.",
    publishedAt: new Date(Date.now() - 86400000),
    metrics: { likes: 245, comments: 32, shares: 18, impressions: 12400 },
  },
  {
    id: "2",
    platform: "linkedin",
    content: "Our latest case study shows how Company X increased their lead conversion by 340% using our platform.",
    publishedAt: new Date(Date.now() - 172800000),
    metrics: { likes: 189, comments: 24, shares: 45, impressions: 8900 },
  },
]

const engagementData = [
  { date: "Mon", value: 1200 },
  { date: "Tue", value: 1800 },
  { date: "Wed", value: 1400 },
  { date: "Thu", value: 2200 },
  { date: "Fri", value: 1900 },
  { date: "Sat", value: 800 },
  { date: "Sun", value: 600 },
]

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "twitter":
      return Twitter
    case "linkedin":
      return Linkedin
    case "facebook":
      return Facebook
    case "instagram":
      return Instagram
    default:
      return Twitter
  }
}

export default function SocialPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media</h1>
          <p className="text-muted-foreground">Schedule, publish, and analyze your social media content</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            Calendar View
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {platforms.map((platform) => (
          <Card key={platform.id}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${platform.color}`}>
                <platform.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{platform.name}</p>
                <p className="text-2xl font-bold">{platform.followers}</p>
                <p className="text-xs text-muted-foreground">followers</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="scheduled">
            <TabsList>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
            </TabsList>
            <TabsContent value="scheduled" className="mt-4 space-y-4">
              {scheduledPosts.map((post) => {
                const PlatformIcon = getPlatformIcon(post.platform)
                return (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <PlatformIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{post.content}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {post.scheduledFor.toLocaleDateString()} at{" "}
                                {post.scheduledFor.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
            <TabsContent value="published" className="mt-4 space-y-4">
              {recentPosts.map((post) => {
                const PlatformIcon = getPlatformIcon(post.platform)
                return (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <PlatformIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{post.content}</p>
                          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" /> {post.metrics.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" /> {post.metrics.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share className="h-4 w-4" /> {post.metrics.shares}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" /> {post.metrics.impressions.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
            <TabsContent value="drafts" className="mt-4">
              <Card>
                <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
                  No drafts yet
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <AnalyticsChart title="Weekly Engagement" data={engagementData} type="bar" />
        </div>
      </div>
    </div>
  )
}
