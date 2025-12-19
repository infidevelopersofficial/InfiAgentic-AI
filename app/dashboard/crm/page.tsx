"use client"

import { useState } from "react"
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
import type { Lead } from "@/lib/types"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [leads, setLeads] = useState(initialLeads)

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateLead = (newLead: any) => {
    const lead: Lead = {
      id: (leads.length + 1).toString(),
      name: newLead.name,
      email: newLead.email,
      company: newLead.company,
      phone: newLead.phone,
      status: newLead.status as any,
      score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      source: newLead.source,
      tags: newLead.tags,
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setLeads([lead, ...leads])
  }

  return (
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
              <p className="text-2xl font-bold">1,429</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
              <p className="text-2xl font-bold">$2.4M</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">24.8%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Clock className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Close Time</p>
              <p className="text-2xl font-bold">18 days</p>
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
  )
}
