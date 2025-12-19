"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { CreateSocialPostDialog } from "@/components/dashboard/create-social-post-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Calendar,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Eye,
  Search,
  Filter,
  Edit,
  Trash2,
  Send,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const platforms = [
  { 
    id: "twitter", 
    name: "Twitter", 
    icon: Twitter, 
    followers: "24.5K", 
    color: "text-sky-500",
    accounts: [
      { id: "twitter-1", name: "@company_main", followers: "18.2K", connected: true },
      { id: "twitter-2", name: "@company_support", followers: "6.3K", connected: true },
    ]
  },
  { 
    id: "linkedin", 
    name: "LinkedIn", 
    icon: Linkedin, 
    followers: "18.2K", 
    color: "text-blue-600",
    accounts: [
      { id: "linkedin-1", name: "Company Page", followers: "15.8K", connected: true },
      { id: "linkedin-2", name: "Careers Page", followers: "2.4K", connected: true },
    ]
  },
  { 
    id: "facebook", 
    name: "Facebook", 
    icon: Facebook, 
    followers: "32.1K", 
    color: "text-blue-500",
    accounts: [
      { id: "facebook-1", name: "Main Business Page", followers: "22.5K", connected: true },
      { id: "facebook-2", name: "Community Page", followers: "8.1K", connected: true },
      { id: "facebook-3", name: "Events Page", followers: "1.5K", connected: false },
    ]
  },
  { 
    id: "instagram", 
    name: "Instagram", 
    icon: Instagram, 
    followers: "45.8K", 
    color: "text-pink-500",
    accounts: [
      { id: "instagram-1", name: "@company_official", followers: "32.4K", connected: true },
      { id: "instagram-2", name: "@company_lifestyle", followers: "10.2K", connected: true },
      { id: "instagram-3", name: "@company_behind", followers: "3.2K", connected: true },
    ]
  },
  { 
    id: "youtube", 
    name: "YouTube", 
    icon: Youtube, 
    followers: "125.3K", 
    color: "text-red-500",
    accounts: [
      { id: "youtube-1", name: "Main Channel", followers: "98.7K", connected: true },
      { id: "youtube-2", name: "Gaming Channel", followers: "18.2K", connected: true },
      { id: "youtube-3", name: "Tutorial Channel", followers: "8.4K", connected: false },
    ]
  },
]

const initialScheduledPosts = [
  {
    id: "1",
    platform: "twitter",
    accountId: "twitter-1",
    accountName: "@company_main",
    content:
      "Excited to announce our new AI-powered content generator! Create blog posts, social media content, and more in seconds.",
    scheduledFor: new Date(Date.now() + 3600000),
    status: "scheduled",
  },
  {
    id: "2",
    platform: "linkedin",
    accountId: "linkedin-1",
    accountName: "Company Page",
    content:
      "We're hiring! Join our team of innovative marketers and help shape the future of AI-driven marketing automation.",
    scheduledFor: new Date(Date.now() + 7200000),
    status: "scheduled",
  },
  {
    id: "3",
    platform: "instagram",
    accountId: "instagram-1",
    accountName: "@company_official",
    content: "Behind the scenes at our product launch event! Swipe to see the team in action.",
    scheduledFor: new Date(Date.now() + 86400000),
    status: "scheduled",
  },
  {
    id: "4",
    platform: "youtube",
    accountId: "youtube-1",
    accountName: "Main Channel",
    content: "New tutorial: How to automate your social media marketing with AI - Complete guide for beginners!",
    scheduledFor: new Date(Date.now() + 14400000),
    status: "scheduled",
  },
  {
    id: "5",
    platform: "facebook",
    accountId: "facebook-2",
    accountName: "Community Page",
    content: "Join our community discussion: What's your biggest marketing challenge this year? Share your thoughts below!",
    scheduledFor: new Date(Date.now() + 10800000),
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
    case "youtube":
      return Youtube
    default:
      return Twitter
  }
}

export default function SocialPage() {
  const { toast } = useToast()
  const [scheduledPosts, setScheduledPosts] = useState(initialScheduledPosts)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const handleCreatePost = (postData: any) => {
    const newPost = {
      id: Date.now().toString(),
      ...postData,
      scheduledFor: new Date(postData.scheduledFor),
      status: "scheduled" as const,
    }
    
    setScheduledPosts((prev: any[]) => [newPost, ...prev])
    setCreateDialogOpen(false)
    
    toast({
      title: "Post Scheduled",
      description: `Post has been scheduled for ${new Date(postData.scheduledFor).toLocaleDateString()}`,
    })
  }

  const handlePublishNow = (postId: string) => {
    setScheduledPosts((prev: any[]) =>
      prev.map((post: any) =>
        post.id === postId
          ? { ...post, status: "published" as const, scheduledFor: new Date() }
          : post
      )
    )
    
    toast({
      title: "Post Published",
      description: "Post has been published successfully.",
    })
  }

  const handleDeletePost = (postId: string) => {
    setScheduledPosts((prev: any[]) => prev.filter((post: any) => post.id !== postId))
    
    toast({
      title: "Post Deleted",
      description: "Post has been removed.",
      variant: "destructive",
    })
  }

  const filteredPosts = scheduledPosts.filter((post: any) => {
    const matchesPlatform = selectedPlatform === "all" || post.platform === selectedPlatform
    const matchesAccount = selectedAccount === "all" || post.accountId === selectedAccount
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesPlatform && matchesAccount && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "text-green-600 bg-green-50"
      case "scheduled": return "text-orange-600 bg-orange-50"
      case "draft": return "text-gray-600 bg-gray-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform?.icon || Twitter
  }

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
          <CreateSocialPostDialog onCreatePost={handleCreatePost}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </CreateSocialPostDialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedPlatform} onValueChange={(value) => {
          setSelectedPlatform(value)
          setSelectedAccount("all") // Reset account filter when platform changes
        }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
          </SelectContent>
        </Select>
        {selectedPlatform !== "all" && (
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {platforms.find(p => p.id === selectedPlatform)?.accounts.map((account: any) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({account.followers})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Platform Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {platforms.map((platform) => (
          <Card key={platform.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${platform.color}`}>
                  <platform.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{platform.name}</p>
                  <p className="text-lg font-bold">{platform.followers}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Accounts:</p>
                <div className="space-y-1">
                  {platform.accounts.slice(0, 2).map((account: any) => (
                    <div key={account.id} className="flex items-center justify-between text-xs">
                      <span className="truncate">{account.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{account.followers}</span>
                        <div className={`h-2 w-2 rounded-full ${account.connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </div>
                    </div>
                  ))}
                  {platform.accounts.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{platform.accounts.length - 2} more
                    </div>
                  )}
                </div>
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
              {filteredPosts.map((post: any) => {
                const PlatformIcon = getPlatformIcon(post.platform)
                return (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <PlatformIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(post.status)}>
                              {post.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {post.accountName}
                            </Badge>
                          </div>
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
                                {post.status === "scheduled" && (
                                  <DropdownMenuItem onClick={() => handlePublishNow(post.id)}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Publish Now
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
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
                              <Share2 className="h-4 w-4" /> {post.metrics.shares}
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
