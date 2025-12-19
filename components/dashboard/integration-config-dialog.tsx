"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Check, X, Key, Globe, Mail, MessageSquare, Database, Zap, Settings, ExternalLink, Linkedin } from "lucide-react"

interface IntegrationConfigDialogProps {
  integration: {
    id: string
    name: string
    description: string
    connected: boolean
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (config: any) => void
  onDisconnect: () => void
}

const integrationConfigs = {
  openai: {
    icon: Zap,
    fields: [
      { key: "apiKey", label: "API Key", type: "password", required: true },
      { key: "model", label: "Default Model", type: "select", options: ["gpt-4", "gpt-3.5-turbo"], required: true },
      { key: "temperature", label: "Temperature", type: "number", default: 0.7, required: false },
    ],
    docsUrl: "https://platform.openai.com/docs/api-reference",
  },
  twitter: {
    icon: MessageSquare,
    fields: [
      { key: "apiKey", label: "API Key", type: "password", required: true },
      { key: "apiSecret", label: "API Secret", type: "password", required: true },
      { key: "accessToken", label: "Access Token", type: "password", required: true },
      { key: "accessTokenSecret", label: "Access Token Secret", type: "password", required: true },
    ],
    docsUrl: "https://developer.twitter.com/en/docs",
  },
  linkedin: {
    icon: Linkedin,
    fields: [
      { key: "clientId", label: "Client ID", type: "text", required: true },
      { key: "clientSecret", label: "Client Secret", type: "password", required: true },
      { key: "redirectUri", label: "Redirect URI", type: "url", required: true },
    ],
    docsUrl: "https://docs.microsoft.com/en-us/linkedin/",
  },
  mailchimp: {
    icon: Mail,
    fields: [
      { key: "apiKey", label: "API Key", type: "password", required: true },
      { key: "serverPrefix", label: "Server Prefix", type: "text", required: true },
      { key: "defaultList", label: "Default List ID", type: "text", required: false },
    ],
    docsUrl: "https://mailchimp.com/developer/",
  },
  hubspot: {
    icon: Database,
    fields: [
      { key: "apiKey", label: "Private App API Key", type: "password", required: true },
      { key: "portalId", label: "Portal ID", type: "text", required: true },
    ],
    docsUrl: "https://developers.hubspot.com/docs/api",
  },
  salesforce: {
    icon: Database,
    fields: [
      { key: "consumerKey", label: "Consumer Key", type: "text", required: true },
      { key: "consumerSecret", label: "Consumer Secret", type: "password", required: true },
      { key: "loginUrl", label: "Login URL", type: "url", default: "https://login.salesforce.com", required: true },
    ],
    docsUrl: "https://developer.salesforce.com/docs/",
  },
}

export function IntegrationConfigDialog({ 
  integration, 
  open, 
  onOpenChange, 
  onSave, 
  onDisconnect 
}: IntegrationConfigDialogProps) {
  const [config, setConfig] = useState<Record<string, any>>({})
  const [testConnection, setTestConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")

  const integrationKey = integration.name.toLowerCase().replace(/\s+/g, "")
  const integrationConfig = integrationConfigs[integrationKey as keyof typeof integrationConfigs]
  const IntegrationIcon = integrationConfig?.icon || Settings

  const handleSave = () => {
    if (!integrationConfig) return
    
    const requiredFields = integrationConfig.fields.filter(f => f.required)
    const missingFields = requiredFields.filter(f => !config[f.key])
    
    if (missingFields.length > 0) {
      return // Show validation error
    }
    
    onSave(config)
    onOpenChange(false)
  }

  const handleTestConnection = async () => {
    setTestConnection(true)
    setConnectionStatus("testing")
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setConnectionStatus(Math.random() > 0.3 ? "success" : "error")
    setTestConnection(false)
  }

  const renderField = (field: any) => {
    const value = config[field.key] || field.default || ""
    
    switch (field.type) {
      case "password":
        return (
          <Input
            type="password"
            value={value}
            onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )
      case "select":
        return (
          <Select value={value} onValueChange={(value) => setConfig(prev => ({ ...prev, [field.key]: value }))}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: parseFloat(e.target.value) }))}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            step="0.1"
          />
        )
      case "url":
        return (
          <Input
            type="url"
            value={value}
            onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
            placeholder={`https://example.com`}
          />
        )
      default:
        return (
          <Input
            value={value}
            onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )
    }
  }

  if (!integrationConfig) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IntegrationIcon className="h-5 w-5" />
            Configure {integration.name}
          </DialogTitle>
          <DialogDescription>
            Connect your {integration.name} account to enable integration features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Connection Status */}
          {integration.connected && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Connected</span>
              <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={testConnection}>
                {testConnection ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          )}

          {/* Configuration Fields */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Configuration</h4>
            {integrationConfig.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <Separator />

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Advanced Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Webhooks</Label>
                  <p className="text-xs text-muted-foreground">Receive real-time updates</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-sync Data</Label>
                  <p className="text-xs text-muted-foreground">Automatically sync data every hour</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* Documentation Link */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <ExternalLink className="h-4 w-4" />
            <a 
              href={integrationConfig.docsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View {integration.name} Documentation
            </a>
          </div>

          {/* Connection Test Result */}
          {connectionStatus !== "idle" && (
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${
              connectionStatus === "success" 
                ? "bg-green-50 border-green-200" 
                : "bg-red-50 border-red-200"
            }`}>
              {connectionStatus === "success" ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Connection successful!</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">Connection failed. Please check your credentials.</span>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {integration.connected && (
            <Button variant="destructive" onClick={onDisconnect}>
              Disconnect
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {integration.connected ? "Update" : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
