"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Sparkles, FileText, Mail, Share2, Megaphone } from "lucide-react"

interface CreateContentDialogProps {
  children: React.ReactNode
  onCreateContent?: (content: {
    title: string
    type: string
    content: string
    aiGenerated?: boolean
  }) => void
}

const contentTypes = [
  { value: "blog", label: "Blog Post", icon: FileText },
  { value: "email", label: "Email", icon: Mail },
  { value: "social", label: "Social Media", icon: Share2 },
  { value: "ad", label: "Advertisement", icon: Megaphone },
]

export function CreateContentDialog({ children, onCreateContent }: CreateContentDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [contentType, setContentType] = useState("")
  const [content, setContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleCreate = () => {
    if (!title || !contentType || !content) return

    onCreateContent?.({
      title,
      type: contentType,
      content,
      aiGenerated: false,
    })

    // Reset form
    setTitle("")
    setContentType("")
    setContent("")
    setOpen(false)
  }

  const handleAIGenerate = async () => {
    if (!title || !contentType) return

    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      const generatedContent = `This is AI-generated content for "${title}" of type ${contentType}. The content would be generated based on the title and content type using an AI service.`
      setContent(generatedContent)
      setIsGenerating(false)
    }, 2000)
  }

  const selectedType = contentTypes.find(t => t.value === contentType)
  const Icon = selectedType?.icon || FileText

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Create New Content
          </DialogTitle>
          <DialogDescription>
            Create a new piece of content. You can write it yourself or use AI to generate it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter content title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => {
                  const TypeIcon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAIGenerate}
                disabled={!title || !contentType || isGenerating}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? "Generating..." : "AI Generate"}
              </Button>
            </div>
            <Textarea
              id="content"
              placeholder="Write your content here or use AI to generate it..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title || !contentType || !content}>
            Create Content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
