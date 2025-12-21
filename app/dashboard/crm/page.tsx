"use client"

import { useState, useMemo, useCallback } from "react"
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
import type { Lead } from "@/lib/types"

// Status color mapping
const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  qualified: "bg-green-500/10 text-green-600 border-green-500/20",
  converted: "bg-purple-500/10 text-purple-600 border-purple-500/20",
}

const initialLeads: Lead[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@acme.com",
    company: "Acme Corp",
    phone: "+1 555-0101",
    status: "new",
    score: 85,
    source: "Website",
    tags: ["enterprise"],
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@tech.io",
    company: "Tech.io",
    phone: "+1 555-0102",
    status: "contacted",
    score: 72,
    source: "LinkedIn",
    tags: ["startup"],
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike@startup.co",
    company: "Startup Co",
    phone: "+1 555-0103",
    status: "qualified",
    score: 91,
    source: "Referral",
    tags: ["hot lead"],
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Emily Brown",
    email: "emily@corp.com",
    company: "Global Corp",
    phone: "+1 555-0104",
    status: "proposal",
    score: 88,
    source: "Trade Show",
    tags: ["enterprise"],
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "David Lee",
    email: "david@agency.com",
    company: "Creative Agency",
    phone: "+1 555-0105",
    status: "negotiation",
    score: 94,
    source: "Website",
    tags: ["agency"],
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    name: "Lisa Chen",
    email: "lisa@media.co",
    company: "Media Co",
    phone: "+1 555-0106",
    status: "won",
    score: 96,
    source: "Webinar",
    tags: ["enterprise"],
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    name: "Tom Davis",
    email: "tom@retail.com",
    company: "Retail Plus",
    phone: "+1 555-0107",
    status: "new",
    score: 65,
    source: "Website",
    tags: ["smb"],
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    name: "Anna White",
    email: "anna@finance.io",
    company: "Finance.io",
    phone: "+1 555-0108",
    status: "contacted",
    score: 78,
    source: "Email",
    tags: ["fintech"],
    notes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function CRMPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [leads, setLeads] = useState(initialLeads)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    avgScore: Math.round(leads.reduce((acc, lead) => acc + lead.score, 0) / leads.length)
  }), [leads])

  const handleCreateLead = useCallback(async (newLead: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Validate required fields
      if (!newLead.name || !newLead.email) {
        throw new Error("Name and email are required fields")
      }

      // Check for duplicate email
      const duplicateEmail = leads.some(lead => lead.email === newLead.email)
      if (duplicateEmail) {
        throw new Error("A lead with this email already exists")
      }

      const lead: Lead = {
        id: (leads.length + 1).toString(),
        name: newLead.name.trim(),
        email: newLead.email.trim(),
        company: newLead.company?.trim() || "",
        phone: newLead.phone?.trim() || "",
        status: newLead.status as any,
        score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        source: newLead.source,
        tags: newLead.tags || [],
        notes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      setLeads([lead, ...leads])
      
      toast({
        title: "Lead Created",
        description: `${lead.name} has been added to your pipeline.`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create lead"
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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

  if (error) {
    return (
      <ErrorState 
        message={error} 
        onRetry={handleRetry}
      />
    )
  }

  if (isLoading) {
    return <LoadingState message="Creating lead..." />
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
