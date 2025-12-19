"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Upload, Copy, RefreshCw, Check, AlertCircle, Key, Webhook, Users, Settings, Bell, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IntegrationConfigDialog } from "@/components/dashboard/integration-config-dialog"

export default function SettingsPage() {
  const { toast } = useToast()
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john@company.com",
    role: "admin",
    timezone: "utc-8",
    avatar: "/placeholder-user.jpg"
  })
  
  // Team state
  const [teamMembers, setTeamMembers] = useState([
    { id: "1", name: "John Doe", email: "john@company.com", role: "admin" },
    { id: "2", name: "Jane Smith", email: "jane@company.com", role: "editor" },
    { id: "3", name: "Mike Wilson", email: "mike@company.com", role: "viewer" },
  ])
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  
  // Integrations state
  const [integrations, setIntegrations] = useState([
    { id: "1", name: "OpenAI", description: "GPT-4 for content generation", connected: true },
    { id: "2", name: "Twitter/X", description: "Social media posting", connected: true },
    { id: "3", name: "LinkedIn", description: "Professional network posting", connected: true },
    { id: "4", name: "Mailchimp", description: "Email marketing", connected: false },
    { id: "5", name: "HubSpot", description: "CRM integration", connected: false },
    { id: "6", name: "Salesforce", description: "Enterprise CRM", connected: false },
  ])
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false)
  
  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: "1", title: "Content Approvals", description: "When content requires your approval", enabled: true },
    { id: "2", title: "Campaign Updates", description: "Status changes for your campaigns", enabled: true },
    { id: "3", title: "Lead Alerts", description: "High-priority lead notifications", enabled: true },
    { id: "4", title: "Agent Errors", description: "When an AI agent encounters an error", enabled: true },
    { id: "5", title: "Weekly Reports", description: "Weekly performance summary", enabled: false },
  ])
  
  // API state
  const [apiKey, setApiKey] = useState("sk-••••••••••••••••••••••••")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)

  // Profile handlers
  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved successfully.",
    })
  }

  const handleAvatarChange = () => {
    toast({
      title: "Avatar Upload",
      description: "Avatar upload functionality would be implemented here.",
    })
  }

  // Team handlers
  const handleInviteMember = () => {
    if (!newMemberEmail) return
    
    const newMember = {
      id: (teamMembers.length + 1).toString(),
      name: newMemberEmail.split("@")[0],
      email: newMemberEmail,
      role: "viewer"
    }
    
    setTeamMembers([...teamMembers, newMember])
    setNewMemberEmail("")
    setInviteDialogOpen(false)
    
    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${newMemberEmail}`,
    })
  }

  const handleUpdateRole = (memberId: string, newRole: string) => {
    setTeamMembers(members =>
      members.map(member =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    )
    
    toast({
      title: "Role Updated",
      description: "Team member role has been updated.",
    })
  }

  // Integration handlers
  const handleToggleIntegration = (integration: any) => {
    if (integration.connected) {
      // Disconnect
      setIntegrations(integrations =>
        integrations.map(i =>
          i.id === integration.id ? { ...i, connected: false } : i
        )
      )
      
      toast({
        title: "Integration Disconnected",
        description: `${integration.name} has been disconnected.`,
        variant: "destructive",
      })
    } else {
      // Open configuration dialog
      setSelectedIntegration(integration)
      setIntegrationDialogOpen(true)
    }
  }

  const handleSaveIntegration = (config: any) => {
    if (!selectedIntegration) return
    
    setIntegrations(integrations =>
      integrations.map(i =>
        i.id === selectedIntegration.id ? { ...i, connected: true } : i
      )
    )
    
    toast({
      title: "Integration Connected",
      description: `${selectedIntegration.name} has been connected successfully.`,
    })
  }

  const handleDisconnectIntegration = () => {
    if (!selectedIntegration) return
    
    setIntegrations(integrations =>
      integrations.map(i =>
        i.id === selectedIntegration.id ? { ...i, connected: false } : i
      )
    )
    
    setIntegrationDialogOpen(false)
    setSelectedIntegration(null)
    
    toast({
      title: "Integration Disconnected",
      description: `${selectedIntegration.name} has been disconnected.`,
      variant: "destructive",
    })
  }

  // Notification handlers
  const handleToggleNotification = (notificationId: string) => {
    setNotifications(notifications =>
      notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    )
  }

  // API handlers
  const handleRegenerateApiKey = () => {
    const newKey = "sk-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setApiKey(newKey)
    setShowApiKey(true)
    
    toast({
      title: "API Key Regenerated",
      description: "Your new API key has been generated. Make sure to save it securely.",
    })
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast({
      title: "API Key Copied",
      description: "API key has been copied to clipboard.",
    })
  }

  const handleSaveApiSettings = () => {
    toast({
      title: "API Settings Saved",
      description: "Your API settings have been updated.",
    })
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and platform preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback>{profileData.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <Button variant="outline" onClick={handleAvatarChange}>
                  <Upload className="h-4 w-4 mr-2" />
                  Change Avatar
                </Button>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={profileData.role} onValueChange={(value) => setProfileData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={profileData.timezone} onValueChange={(value) => setProfileData(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="utc+1">Central European (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {member.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Select 
                      value={member.role} 
                      onValueChange={(value) => handleUpdateRole(member.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Team Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Enter the email address of the person you want to invite to your team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="colleague@company.com"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInviteMember} disabled={!newMemberEmail}>
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect your favorite tools and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        integration.connected ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Shield className={`h-5 w-5 ${
                          integration.connected ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{integration.name}</p>
                          {integration.connected && (
                            <Badge variant="secondary" className="text-xs">Connected</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <Button 
                      variant={integration.connected ? "outline" : "default"}
                      onClick={() => handleToggleIntegration(integration)}
                    >
                      {integration.connected ? "Configure" : "Connect"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className={`h-4 w-4 ${
                      notification.enabled ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notification.enabled}
                    onCheckedChange={() => handleToggleNotification(notification.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>Manage your API keys and webhooks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Key
                </Label>
                <div className="flex gap-2">
                  <Input 
                    type={showApiKey ? "text" : "password"} 
                    value={apiKey} 
                    readOnly 
                    className="font-mono"
                  />
                  <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? "Hide" : "Show"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyApiKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRegenerateApiKey}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Use this key to authenticate API requests</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Webhook className="h-4 w-4" />
                  Webhook URL
                </Label>
                <Input 
                  placeholder="https://your-server.com/webhook" 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Receive real-time notifications about platform events</p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveApiSettings}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Configuration Dialog */}
      {selectedIntegration && (
        <IntegrationConfigDialog
          integration={selectedIntegration}
          open={integrationDialogOpen}
          onOpenChange={setIntegrationDialogOpen}
          onSave={handleSaveIntegration}
          onDisconnect={handleDisconnectIntegration}
        />
      )}
    </div>
  )
}
