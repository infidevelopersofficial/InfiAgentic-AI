"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar, Share2, Twitter, Linkedin, Facebook, Instagram, Youtube, Image as ImageIcon, Link2 } from "lucide-react"

interface CreateSocialPostDialogProps {
  children: React.ReactNode
  onCreatePost?: (post: {
    platform: string
    accountId: string
    accountName: string
    content: string
    mediaUrls?: string[]
    scheduledFor?: Date
  }) => void
}

const platforms = [
  { value: "twitter", label: "Twitter/X", icon: Twitter, color: "text-blue-500" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600" },
  { value: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-600" },
  { value: "youtube", label: "YouTube", icon: Youtube, color: "text-red-500" },
]

const accounts = {
  twitter: [
    { id: "twitter-1", name: "@company_main" },
    { id: "twitter-2", name: "@company_support" },
  ],
  linkedin: [
    { id: "linkedin-1", name: "Company Page" },
    { id: "linkedin-2", name: "Careers Page" },
  ],
  facebook: [
    { id: "facebook-1", name: "Main Business Page" },
    { id: "facebook-2", name: "Community Page" },
    { id: "facebook-3", name: "Events Page" },
  ],
  instagram: [
    { id: "instagram-1", name: "@company_official" },
    { id: "instagram-2", name: "@company_lifestyle" },
    { id: "instagram-3", name: "@company_behind" },
  ],
  youtube: [
    { id: "youtube-1", name: "Main Channel" },
    { id: "youtube-2", name: "Gaming Channel" },
    { id: "youtube-3", name: "Tutorial Channel" },
  ],
}

export function CreateSocialPostDialog({ children, onCreatePost }: CreateSocialPostDialogProps) {
  const [open, setOpen] = useState(false)
  const [platform, setPlatform] = useState("")
  const [accountId, setAccountId] = useState("")
  const [content, setContent] = useState("")
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [newMediaUrl, setNewMediaUrl] = useState("")
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now")

  const selectedPlatform = platforms.find(p => p.value === platform)
  const selectedAccount = platform ? accounts[platform as keyof typeof accounts]?.find(a => a.id === accountId) : null
  const Icon = selectedPlatform?.icon || Share2

  const handleAddMedia = () => {
    if (newMediaUrl.trim()) {
      setMediaUrls([...mediaUrls, newMediaUrl.trim()])
      setNewMediaUrl("")
    }
  }

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index))
  }

  const handleCreate = () => {
    if (!platform || !accountId || !content) return

    const selectedAccount = accounts[platform as keyof typeof accounts]?.find(a => a.id === accountId)
    
    const post = {
      platform,
      accountId,
      accountName: selectedAccount?.name || "",
      content,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      ...(scheduleType === "later" && { scheduledFor: new Date(Date.now() + 3600000) }), // 1 hour from now
    }

    onCreatePost?.(post)

    // Reset form
    setPlatform("")
    setAccountId("")
    setContent("")
    setMediaUrls([])
    setNewMediaUrl("")
    setScheduleType("now")
    setOpen(false)
  }

  const getCharacterLimit = (platform: string) => {
    switch (platform) {
      case "twitter": return 280
      case "linkedin": return 3000
      case "facebook": return 63206
      case "instagram": return 2200
      case "youtube": return 5000 // YouTube video description limit
      default: return Infinity
    }
  }

  const characterLimit = getCharacterLimit(platform)
  const characterCount = content.length
  const isOverLimit = characterCount > characterLimit

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${selectedPlatform?.color}`} />
            Create Social Post
          </DialogTitle>
          <DialogDescription>
            Create a new social media post for your selected platform.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[500px] overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={(value) => {
              setPlatform(value)
              setAccountId("") // Reset account when platform changes
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => {
                  const PlatformIcon = p.icon
                  return (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <PlatformIcon className={`h-4 w-4 ${p.color}`} />
                        {p.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          {platform && (
            <div className="grid gap-2">
              <Label htmlFor="account">Account</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts[platform as keyof typeof accounts]?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              {platform && (
                <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {characterCount}/{characterLimit}
                </span>
              )}
            </div>
            <Textarea
              id="content"
              placeholder={`Write your social media post here...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className={isOverLimit ? 'border-red-500' : ''}
            />
            {isOverLimit && (
              <p className="text-sm text-red-500">Content exceeds character limit for this platform</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Media URLs</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add media URL..."
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddMedia} className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Add
              </Button>
            </div>
            {mediaUrls.length > 0 && (
              <div className="space-y-2">
                {mediaUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate flex-1">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMedia(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Schedule</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="post-now"
                  name="schedule"
                  value="now"
                  checked={scheduleType === "now"}
                  onChange={(e) => setScheduleType(e.target.value as "now" | "later")}
                  className="text-primary"
                />
                <Label htmlFor="post-now" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Post Now
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="post-later"
                  name="schedule"
                  value="later"
                  checked={scheduleType === "later"}
                  onChange={(e) => setScheduleType(e.target.value as "now" | "later")}
                  className="text-primary"
                />
                <Label htmlFor="post-later" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Later
                </Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!platform || !content || isOverLimit}>
            Create Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
