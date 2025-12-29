"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { LeadPipeline } from "@/components/dashboard/lead-pipeline"
import { CreateLeadDialog } from "@/components/dashboard/create-lead-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Users, DollarSign, TrendingUp, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorBoundary, ErrorState } from "@/components/ui/error-boundary"
import { LoadingState } from "@/components/ui/loading-state"
import { useDebouncedValue, useOptimizedSearch, usePerformanceMonitor } from "@/lib/performance"
import { apiClient } from "@/lib/api-client"
import type { Lead } from "@/lib/types"

// Status color mapping
const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  qualified: "bg-green-500/10 text-green-600 border-green-500/20",
  converted: "bg-purple-500/10 text-purple-600 border-purple-500/20",
}

// Helper function to map backend lead to frontend Lead type
function mapBackendLeadToFrontend(backendLead: any): Lead {
  return {
    id: backendLead.id,
    name: `${backendLead.first_name || ''} ${backendLead.last_name || ''}`.trim() || backendLead.email,
    email: backendLead.email,
    company: backendLead.company || undefined,
    phone: backendLead.phone || undefined,
    status: backendLead.status as Lead['status'],
    score: backendLead.score || 0,
    source: backendLead.source || 'Unknown',
    assignedTo: backendLead.assigned_to || undefined,
    tags: backendLead.tags || [],
    notes: [], // Backend doesn't have notes in response, would need separate endpoint
    createdAt: new Date(backendLead.created_at),
    updatedAt: new Date(backendLead.updated_at || backendLead.created_at),
  }
}

export default function CRMPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch leads on mount
  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await apiClient.getLeads({ page: 1, limit: 100 })
        const mappedLeads = response.items.map(mapBackendLeadToFrontend)
        setLeads(mappedLeads)
      } catch (err: any) {
        const errorMessage = err.detail || 'Failed to load leads'
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [toast])

  // Performance monitoring
  usePerformanceMonitor('CRMPage')

  // Optimized search with debouncing
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)
  const filteredLeads = useOptimizedSearch(leads, ['name', 'company'], debouncedSearchQuery)

  // Memoized metrics calculation
  const metrics = useMemo(() => ({
    totalLeads: leads.length,
    newLeads: leads.filter(lead => lead.status === 'new').length,
    contactedLeads: leads.filter(lead => lead.status === 'contacted').length,
    avgScore: leads.length > 0 
      ? Math.round(leads.reduce((acc, lead) => acc + lead.score, 0) / leads.length)
      : 0
  }), [leads])

  const handleCreateLead = useCallback(async (newLead: any) => {
    setIsCreating(true)
    setError(null)
    
    try {
      // Validate required fields
      if (!newLead.email) {
        throw new Error("Email is required")
      }

      // Split name into first_name and last_name if provided
      const nameParts = (newLead.name || '').trim().split(' ')
      const first_name = nameParts[0] || ''
      const last_name = nameParts.slice(1).join(' ') || ''

      // Create lead via API
      const backendLead = await apiClient.createLead({
        email: newLead.email.trim(),
        phone: newLead.phone?.trim(),
        first_name,
        last_name,
        company: newLead.company?.trim(),
        job_title: newLead.jobTitle?.trim(),
        source: newLead.source || 'Manual',
        tags: newLead.tags || [],
      })

      // Map and add to local state
      const lead = mapBackendLeadToFrontend(backendLead)
      setLeads([lead, ...leads])
      
      toast({
        title: "Lead Created",
        description: `${lead.name} has been added to your pipeline.`,
      })
    } catch (err: any) {
      const errorMessage = err.detail || (err instanceof Error ? err.message : "Failed to create lead")
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }, [leads, toast])

  const handleRetry = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  // Memoized lead card component to prevent unnecessary re-renders
  const LeadCard = useCallback(({ lead }: { lead: Lead }) => (
    <Card key={lead.id}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>
              {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={statusColors[lead.status] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'}>
                {lead.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Score: {lead.score}
              </Badge>
            </div>
            <h3 className="font-semibold">{lead.name}</h3>
            <p className="text-sm text-muted-foreground">{lead.email}</p>
            {lead.company && (
              <p className="text-sm text-muted-foreground">{lead.company}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  ), [])

  if (error && leads.length === 0) {
    return (
      <ErrorState 
        message={error} 
        onRetry={handleRetry}
      />
    )
  }

  if (isLoading && leads.length === 0) {
    return <LoadingState message="Loading leads..." />
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
          <p className="text-muted-foreground">Manage your leads and customer relationships</p>
        </div>
        <CreateLeadDialog onCreateLead={handleCreateLead}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </CreateLeadDialog>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold">{metrics.totalLeads.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Leads</p>
              <p className="text-2xl font-bold">{metrics.newLeads}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contacted</p>
              <p className="text-2xl font-bold">{metrics.contactedLeads}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Clock className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>
              <p className="text-2xl font-bold">{metrics.avgScore}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline and Table Views */}
      <Tabs defaultValue="pipeline">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <TabsContent value="pipeline" className="mt-6">
          <LeadPipeline leads={filteredLeads} />
        </TabsContent>
        <TabsContent value="table" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {lead.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{lead.company}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-12 rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${lead.score}%` }} />
                          </div>
                          <span className="text-sm">{lead.score}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{lead.source}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {lead.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </ErrorBoundary>
  )
}
