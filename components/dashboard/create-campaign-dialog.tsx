"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar, Mail, Users, Target, Send } from "lucide-react"

interface CreateCampaignDialogProps {
  children: React.ReactNode
  onCreateCampaign?: (campaign: {
    name: string
    subject: string
    fromName: string
    fromEmail: string
    content: string
    audienceFilter: string
    scheduledFor?: Date
  }) => void
}

const audienceOptions = [
  { value: "all", label: "All Subscribers" },
  { value: "active", label: "Active Users" },
  { value: "new", label: "New Subscribers (last 30 days)" },
  { value: "engaged", label: "Highly Engaged Users" },
  { value: "inactive", label: "Inactive Users" },
]

export function CreateCampaignDialog({ children, onCreateCampaign }: CreateCampaignDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [fromName, setFromName] = useState("")
  const [fromEmail, setFromEmail] = useState("")
  const [content, setContent] = useState("")
  const [audienceFilter, setAudienceFilter] = useState("")
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now")

  const handleCreate = () => {
    if (!name || !subject || !fromName || !fromEmail || !content || !audienceFilter) return

    const campaign = {
      name,
      subject,
      fromName,
      fromEmail,
      content,
      audienceFilter,
      ...(scheduleType === "later" && { scheduledFor: new Date(Date.now() + 86400000) }), // Tomorrow
    }

    onCreateCampaign?.(campaign)

    // Reset form
    setName("")
    setSubject("")
    setFromName("")
    setFromEmail("")
    setContent("")
    setAudienceFilter("")
    setScheduleType("now")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Create Email Campaign
          </DialogTitle>
          <DialogDescription>
            Create a new email campaign to send to your subscribers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[500px] overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              placeholder="Enter campaign name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              placeholder="Enter email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="from-name">From Name</Label>
              <Input
                id="from-name"
                placeholder="Your Name"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="from-email">From Email</Label>
              <Input
                id="from-email"
                type="email"
                placeholder="your@email.com"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Select value={audienceFilter} onValueChange={setAudienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                {audienceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Email Content</Label>
            <Textarea
              id="content"
              placeholder="Write your email content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>

          <div className="grid gap-2">
            <Label>Schedule</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="send-now"
                  name="schedule"
                  value="now"
                  checked={scheduleType === "now"}
                  onChange={(e) => setScheduleType(e.target.value as "now" | "later")}
                  className="text-primary"
                />
                <Label htmlFor="send-now" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Now
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="send-later"
                  name="schedule"
                  value="later"
                  checked={scheduleType === "later"}
                  onChange={(e) => setScheduleType(e.target.value as "now" | "later")}
                  className="text-primary"
                />
                <Label htmlFor="send-later" className="flex items-center gap-2">
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
          <Button onClick={handleCreate} disabled={!name || !subject || !fromName || !fromEmail || !content || !audienceFilter}>
            Create Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
