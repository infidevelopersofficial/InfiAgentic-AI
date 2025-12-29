"use client"

import { useState, useEffect, useCallback } from "react"
import { ContentList } from "@/components/dashboard/content-list"
import { CreateContentDialog } from "@/components/dashboard/create-content-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import type { ContentItem } from "@/lib/types"

// Helper function to map backend content to frontend ContentItem type
function mapBackendContentToFrontend(backendContent: any): ContentItem {
  return {
    id: backendContent.id,
    title: backendContent.title || '',
    type: backendContent.content_type as ContentItem['type'],
    status: backendContent.status as ContentItem['status'],
    content: backendContent.content || '',
    metadata: backendContent.metadata || {
      keywords: [],
      seoScore: 0,
    },
    createdBy: backendContent.created_by || '',
    createdAt: new Date(backendContent.created_at),
    updatedAt: new Date(backendContent.updated_at || backendContent.created_at),
    scheduledFor: backendContent.scheduled_for ? new Date(backendContent.scheduled_for) : undefined,
    publishedAt: backendContent.published_at ? new Date(backendContent.published_at) : undefined,
  }
}

const mockContent: ContentItem[] = [
  {
    id: "1",
    title: "The Future of AI in Marketing",
    type: "blog",
    status: "published",
    content: "...",
    metadata: { keywords: ["AI", "marketing"], seoScore: 92 },
    createdBy: "user1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    publishedAt: new Date("2024-01-20"),
  },
  {
    id: "2",
    title: "Product Launch Announcement",
    type: "email",
    status: "pending_review",
    content: "...",
    metadata: { keywords: ["product", "launch"], seoScore: 78 },
    createdBy: "user1",
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-19"),
  },
  {
    id: "3",
    title: "Weekly Tips Thread",
    type: "social",
    status: "scheduled",
    content: "...",
    metadata: { keywords: ["tips"], seoScore: 85 },
    createdBy: "user2",
    createdAt: new Date("2024-01-19"),
    updatedAt: new Date("2024-01-19"),
    scheduledFor: new Date("2024-01-25"),
  },
  {
    id: "4",
    title: "Customer Success Story",
    type: "blog",
    status: "draft",
    content: "...",
    metadata: { keywords: ["customer", "success"], seoScore: 65 },
    createdBy: "user1",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "5",
    title: "Q1 Newsletter",
    type: "email",
    status: "approved",
    content: "...",
    metadata: { keywords: ["newsletter", "Q1"], seoScore: 88 },
    createdBy: "user3",
    createdAt: new Date("2024-01-21"),
    updatedAt: new Date("2024-01-22"),
  },
]

export default function ContentPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [content, setContent] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  // Fetch content on mount
  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true)
      try {
        const params: any = { page: 1, limit: 100 }
        if (typeFilter !== "all") {
          params.content_type = typeFilter
        }
        const response = await apiClient.getContent(params)
        const mappedContent = response.items.map(mapBackendContentToFrontend)
        setContent(mappedContent)
      } catch (err: any) {
        const errorMessage = err.detail || 'Failed to load content'
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [typeFilter, toast])

  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || item.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleCreateContent = useCallback(async (newContent: any) => {
    setIsCreating(true)
    try {
      const backendContent = await apiClient.createContent({
        title: newContent.title,
        content_type: newContent.type,
        content: newContent.content || '',
        status: 'draft',
        metadata: newContent.metadata || {},
      })

      const contentItem = mapBackendContentToFrontend(backendContent)
      setContent([contentItem, ...content])
      
      toast({
        title: "Content Created",
        description: `${contentItem.title} has been created successfully.`,
      })
    } catch (err: any) {
      const errorMessage = err.detail || 'Failed to create content'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }, [content, toast])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Studio</h1>
          <p className="text-muted-foreground">Create, manage, and optimize your marketing content</p>
        </div>
        <div className="flex gap-3">
          <CreateContentDialog onCreateContent={handleCreateContent}>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Sparkles className="h-4 w-4" />
              AI Generate
            </Button>
          </CreateContentDialog>
          <CreateContentDialog onCreateContent={handleCreateContent}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Content
            </Button>
          </CreateContentDialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="ad">Ad</SelectItem>
            <SelectItem value="landing_page">Landing Page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <ContentList items={filteredContent} />
          </TabsContent>
          <TabsContent value="draft" className="mt-6">
            <ContentList items={filteredContent.filter((i) => i.status === "draft")} />
          </TabsContent>
          <TabsContent value="pending" className="mt-6">
            <ContentList items={filteredContent.filter((i) => i.status === "pending_review")} />
          </TabsContent>
          <TabsContent value="published" className="mt-6">
            <ContentList items={filteredContent.filter((i) => i.status === "published")} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
