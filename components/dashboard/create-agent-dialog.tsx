"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Bot, Zap, FileText, Mail, Share2, TrendingUp, Settings } from "lucide-react"

interface CreateAgentDialogProps {
  children: React.ReactNode
  onCreateAgent?: (agent: {
    name: string
    type: string
    description: string
    config: Record<string, any>
  }) => void
}

const agentTypes = [
  { 
    value: "content", 
    label: "Content Writer", 
    icon: FileText,
    description: "Generates blog posts, articles, and written content",
    defaultConfig: { tone: "professional", length: "medium", creativity: 0.7 }
  },
  { 
    value: "email", 
    label: "Email Composer", 
    icon: Mail,
    description: "Creates personalized email campaigns and newsletters",
    defaultConfig: { personalizationLevel: "high", includeCTA: true, template: "modern" }
  },
  { 
    value: "social", 
    label: "Social Media Manager", 
    icon: Share2,
    description: "Schedules and creates social media content",
    defaultConfig: { platforms: ["twitter", "linkedin"], frequency: "daily", tone: "engaging" }
  },
  { 
    value: "seo", 
    label: "SEO Optimizer", 
    icon: TrendingUp,
    description: "Analyzes and improves content for search engines",
    defaultConfig: { targetKeywords: [], optimizeFor: "google", includeMetaTags: true }
  },
]

export function CreateAgentDialog({ children, onCreateAgent }: CreateAgentDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [agentType, setAgentType] = useState("")
  const [description, setDescription] = useState("")
  const [config, setConfig] = useState<Record<string, any>>({})

  const selectedType = agentTypes.find(t => t.value === agentType)
  const Icon = selectedType?.icon || Bot

  const handleTypeChange = (type: string) => {
    setAgentType(type)
    const selected = agentTypes.find(t => t.value === type)
    if (selected) {
      setConfig(selected.defaultConfig)
      setDescription(selected.description)
    }
  }

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleCreate = () => {
    if (!name || !agentType || !description) return

    onCreateAgent?.({
      name,
      type: agentType,
      description,
      config,
    })

    // Reset form
    setName("")
    setAgentType("")
    setDescription("")
    setConfig({})
    setOpen(false)
  }

  const renderConfigFields = () => {
    if (!selectedType) return null

    switch (agentType) {
      case "content":
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={config.tone || "professional"} onValueChange={(value) => handleConfigChange("tone", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="length">Content Length</Label>
              <Select value={config.length || "medium"} onValueChange={(value) => handleConfigChange("length", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (200-500 words)</SelectItem>
                  <SelectItem value="medium">Medium (500-1000 words)</SelectItem>
                  <SelectItem value="long">Long (1000+ words)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="creativity">Creativity Level: {config.creativity || 0.7}</Label>
              <input
                type="range"
                id="creativity"
                min="0"
                max="1"
                step="0.1"
                value={config.creativity || 0.7}
                onChange={(e) => handleConfigChange("creativity", parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </>
        )
      case "email":
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="personalization">Personalization Level</Label>
              <Select value={config.personalizationLevel || "high"} onValueChange={(value) => handleConfigChange("personalizationLevel", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-cta"
                  checked={config.includeCTA || false}
                  onChange={(e) => handleConfigChange("includeCTA", e.target.checked)}
                  className="text-primary"
                />
                <Label htmlFor="include-cta">Include Call-to-Action</Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template">Email Template</Label>
              <Select value={config.template || "modern"} onValueChange={(value) => handleConfigChange("template", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )
      case "social":
        return (
          <>
            <div className="grid gap-2">
              <Label>Platforms</Label>
              <div className="space-y-2">
                {["twitter", "linkedin", "facebook", "instagram"].map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={platform}
                      checked={config.platforms?.includes(platform) || false}
                      onChange={(e) => {
                        const platforms = config.platforms || []
                        if (e.target.checked) {
                          handleConfigChange("platforms", [...platforms, platform])
                        } else {
                          handleConfigChange("platforms", platforms.filter((p: string) => p !== platform))
                        }
                      }}
                      className="text-primary"
                    />
                    <Label htmlFor={platform} className="capitalize">{platform}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Posting Frequency</Label>
              <Select value={config.frequency || "daily"} onValueChange={(value) => handleConfigChange("frequency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="social-tone">Tone</Label>
              <Select value={config.tone || "engaging"} onValueChange={(value) => handleConfigChange("tone", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="engaging">Engaging</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )
      case "seo":
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="optimize-for">Optimize For</Label>
              <Select value={config.optimizeFor || "google"} onValueChange={(value) => handleConfigChange("optimizeFor", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="bing">Bing</SelectItem>
                  <SelectItem value="all">All Search Engines</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-meta"
                  checked={config.includeMetaTags || false}
                  onChange={(e) => handleConfigChange("includeMetaTags", e.target.checked)}
                  className="text-primary"
                />
                <Label htmlFor="include-meta">Include Meta Tags</Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="keywords">Target Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                placeholder="AI, marketing, automation..."
                value={(config.targetKeywords || []).join(", ")}
                onChange={(e) => handleConfigChange("targetKeywords", e.target.value.split(",").map(k => k.trim()).filter(k => k))}
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Create AI Agent
          </DialogTitle>
          <DialogDescription>
            Create a new AI agent to automate your marketing tasks.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[500px] overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="agent-name">Agent Name</Label>
            <Input
              id="agent-name"
              placeholder="Enter agent name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="agent-type">Agent Type</Label>
            <Select value={agentType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent type" />
              </SelectTrigger>
              <SelectContent>
                {agentTypes.map((type) => {
                  const TypeIcon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        <div>
                          <div>{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this agent does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {selectedType && (
            <div className="grid gap-4 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <Label className="font-medium">Configuration</Label>
              </div>
              {renderConfigFields()}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name || !agentType || !description}>
            Create Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
