"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, X, GitBranch, Mail, Clock, Zap, ArrowRight, Trash2 } from "lucide-react"

interface CreateFlowDialogProps {
  children: React.ReactNode
  onCreateFlow?: (flow: {
    name: string
    description: string
    trigger: string
    steps: Array<{
      type: "email" | "delay"
      label: string
      delay?: string
    }>
  }) => void
}

const triggerOptions = [
  { value: "form_submission", label: "Form Submission" },
  { value: "demo_request", label: "Demo Request" },
  { value: "email_signup", label: "Email Signup" },
  { value: "inactive_30_days", label: "Inactive 30 Days" },
  { value: "campaign_response", label: "Campaign Response" },
  { value: "manual_add", label: "Manual Add" },
]

const emailTemplates = [
  { value: "welcome", label: "Welcome Email" },
  { value: "product_guide", label: "Product Guide" },
  { value: "case_study", label: "Case Study" },
  { value: "special_offer", label: "Special Offer" },
  { value: "follow_up", label: "Follow Up" },
  { value: "confirmation", label: "Confirmation" },
  { value: "prep_materials", label: "Prep Materials" },
  { value: "we_miss_you", label: "We Miss You" },
]

const delayOptions = [
  { value: "1_hour", label: "Wait 1 hour" },
  { value: "2_hours", label: "Wait 2 hours" },
  { value: "6_hours", label: "Wait 6 hours" },
  { value: "12_hours", label: "Wait 12 hours" },
  { value: "1_day", label: "Wait 1 day" },
  { value: "2_days", label: "Wait 2 days" },
  { value: "3_days", label: "Wait 3 days" },
  { value: "5_days", label: "Wait 5 days" },
  { value: "7_days", label: "Wait 7 days" },
  { value: "14_days", label: "Wait 14 days" },
]

export function CreateFlowDialog({ children, onCreateFlow }: CreateFlowDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger: "form_submission",
    steps: [] as Array<{
      type: "email" | "delay"
      label: string
      delay?: string
    }>,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || formData.steps.length === 0) {
      return
    }

    onCreateFlow?.(formData)
    
    setFormData({
      name: "",
      description: "",
      trigger: "form_submission",
      steps: [],
    })
    setOpen(false)
  }

  const addStep = (type: "email" | "delay") => {
    const newStep = {
      type,
      label: type === "email" ? "New Email" : "Wait 1 day",
      delay: type === "delay" ? "1_day" : undefined,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Create Lead Flow
          </DialogTitle>
          <DialogDescription>
            Design an automated lead nurturing sequence with emails and delays.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Flow Information</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Flow Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Welcome Series"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this flow does and when it should be used..."
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

            {/* Flow Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Flow Steps *</h4>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addStep("email")}
                    className="gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    Add Email
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addStep("delay")}
                    className="gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    Add Delay
                  </Button>
                </div>
              </div>

              {formData.steps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No steps added yet</p>
                  <p className="text-sm">Add emails and delays to create your flow</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        {step.type === "email" ? (
                          <Mail className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-500" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        {step.type === "email" ? (
                          <Select
                            value={step.label}
                            onValueChange={(value) => updateStep(index, "label", value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select email template" />
                            </SelectTrigger>
                            <SelectContent>
                              {emailTemplates.map((template) => (
                                <SelectItem key={template.value} value={template.label}>
                                  {template.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Select
                            value={step.delay}
                            onValueChange={(value) => {
                              updateStep(index, "delay", value)
                              const delayOption = delayOptions.find(opt => opt.value === value)
                              if (delayOption) {
                                updateStep(index, "label", delayOption.label)
                              }
                            }}
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
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
              Create Flow
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
