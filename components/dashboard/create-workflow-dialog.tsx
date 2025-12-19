"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X, GitBranch, Zap, ArrowRight, Clock, Mail, Bot, FileText, Users, Calendar, Bell } from "lucide-react"

interface CreateWorkflowDialogProps {
  children: React.ReactNode
  onCreateWorkflow?: (workflow: {
    name: string
    description: string
    trigger: string
    steps: Array<{
      type: "email" | "delay" | "ai_task" | "content_review" | "notification" | "data_sync"
      label: string
      delay?: string
      config?: Record<string, any>
    }>
  }) => void
}

const triggerOptions = [
  { value: "new_lead", label: "New Lead Created" },
  { value: "content_ready", label: "Content Marked Ready" },
  { value: "lead_inactive", label: "Lead Inactive 30 Days" },
  { value: "weekly_schedule", label: "Weekly Schedule" },
  { value: "daily_schedule", label: "Daily Schedule" },
  { value: "campaign_response", label: "Campaign Response" },
  { value: "manual_trigger", label: "Manual Trigger" },
  { value: "data_change", label: "Data Change" },
]

const stepTypes = [
  { value: "email", label: "Send Email", icon: Mail },
  { value: "delay", label: "Wait/Delay", icon: Clock },
  { value: "ai_task", label: "AI Task", icon: Bot },
  { value: "content_review", label: "Content Review", icon: FileText },
  { value: "notification", label: "Send Notification", icon: Bell },
  { value: "data_sync", label: "Sync Data", icon: ArrowRight },
]

const delayOptions = [
  { value: "5_minutes", label: "Wait 5 minutes" },
  { value: "15_minutes", label: "Wait 15 minutes" },
  { value: "1_hour", label: "Wait 1 hour" },
  { value: "2_hours", label: "Wait 2 hours" },
  { value: "6_hours", label: "Wait 6 hours" },
  { value: "12_hours", label: "Wait 12 hours" },
  { value: "1_day", label: "Wait 1 day" },
  { value: "3_days", label: "Wait 3 days" },
  { value: "1_week", label: "Wait 1 week" },
]

const aiTaskOptions = [
  { value: "generate_content", label: "Generate Content" },
  { value: "analyze_lead", label: "Analyze Lead Score" },
  { value: "optimize_email", label: "Optimize Email" },
  { value: "categorize_data", label: "Categorize Data" },
  { value: "personalize_message", label: "Personalize Message" },
]

export function CreateWorkflowDialog({ children, onCreateWorkflow }: CreateWorkflowDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger: "new_lead",
    steps: [] as Array<{
      type: "email" | "delay" | "ai_task" | "content_review" | "notification" | "data_sync"
      label: string
      delay?: string
      config?: Record<string, any>
    }>,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || formData.steps.length === 0) {
      return
    }

    onCreateWorkflow?.(formData)
    
    setFormData({
      name: "",
      description: "",
      trigger: "new_lead",
      steps: [],
    })
    setOpen(false)
  }

  const addStep = (type: string) => {
    const stepType = type as any
    const stepTypeConfig = stepTypes.find(t => t.value === type)
    const newStep = {
      type: stepType,
      label: stepTypeConfig?.label || "New Step",
      delay: type === "delay" ? "1_hour" : undefined,
      config: type === "ai_task" ? { task: "generate_content" } : undefined,
    }
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
  }

  const updateStep = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }))
  }

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }))
  }

  const moveStep = (index: number, direction: "up" | "down") => {
    const steps = [...formData.steps]
    if (direction === "up" && index > 0) {
      [steps[index], steps[index - 1]] = [steps[index - 1], steps[index]]
    } else if (direction === "down" && index < steps.length - 1) {
      [steps[index], steps[index + 1]] = [steps[index + 1], steps[index]]
    }
    setFormData(prev => ({ ...prev, steps }))
  }

  const getStepIcon = (type: string) => {
    const stepType = stepTypes.find(t => t.value === type)
    return stepType?.icon || Zap
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Create Workflow
          </DialogTitle>
          <DialogDescription>
            Design an automated workflow with multiple steps and triggers.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Workflow Information</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workflow Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Lead Nurture Sequence"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this workflow does and when it should be used..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trigger">Trigger Event</Label>
                  <Select value={formData.trigger} onValueChange={(value) => setFormData(prev => ({ ...prev, trigger: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Workflow Steps *</h4>
                <div className="flex flex-wrap gap-2">
                  {stepTypes.map((stepType) => {
                    const Icon = stepType.icon
                    return (
                      <Button
                        key={stepType.value}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addStep(stepType.value)}
                        className="gap-1"
                      >
                        <Icon className="h-3 w-3" />
                        {stepType.label}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {formData.steps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No steps added yet</p>
                  <p className="text-sm">Add steps to create your workflow</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.steps.map((step, index) => {
                    const StepIcon = getStepIcon(step.type)
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <StepIcon className="h-4 w-4 text-primary" />
                        </div>

                        <div className="flex-1 space-y-2">
                          <Input
                            value={step.label}
                            onChange={(e) => updateStep(index, "label", e.target.value)}
                            placeholder="Step label"
                            className="font-medium"
                          />
                          
                          {step.type === "delay" && (
                            <Select
                              value={step.delay}
                              onValueChange={(value) => updateStep(index, "delay", value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select delay" />
                              </SelectTrigger>
                              <SelectContent>
                                {delayOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {step.type === "ai_task" && (
                            <Select
                              value={step.config?.task || "generate_content"}
                              onValueChange={(value) => updateStep(index, "config", { task: value })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select AI task" />
                              </SelectTrigger>
                              <SelectContent>
                                {aiTaskOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {step.type === "email" && (
                            <Input
                              placeholder="Email template or recipient"
                              value={step.config?.template || ""}
                              onChange={(e) => updateStep(index, "config", { template: e.target.value })}
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveStep(index, "up")}
                            disabled={index === 0}
                          >
                            <ArrowRight className="h-3 w-3 rotate-90" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveStep(index, "down")}
                            disabled={index === formData.steps.length - 1}
                          >
                            <ArrowRight className="h-3 w-3 -rotate-90" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeStep(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || formData.steps.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
