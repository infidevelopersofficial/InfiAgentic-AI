"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Share2,
  Mail,
  Users,
  GitBranch,
  BarChart3,
  Settings,
  Bot,
  CheckSquare,
  Calendar,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Content Studio", href: "/dashboard/content", icon: FileText },
  { name: "Social Media", href: "/dashboard/social", icon: Share2 },
  { name: "Email Campaigns", href: "/dashboard/email", icon: Mail },
  { name: "CRM", href: "/dashboard/crm", icon: Users },
  { name: "Lead Flows", href: "/dashboard/leads", icon: GitBranch },
  { name: "Workflows", href: "/dashboard/workflows", icon: Zap },
  { name: "AI Agents", href: "/dashboard/agents", icon: Bot },
  { name: "Approvals", href: "/dashboard/approvals", icon: CheckSquare },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">Agentic AI</span>
            </Link>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-sidebar-foreground",
              collapsed && "absolute -right-3 top-6 z-10 rounded-full border bg-sidebar",
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              const NavLink = (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )

              if (collapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return NavLink
            })}
          </nav>
        </ScrollArea>

        <div className="border-t border-sidebar-border p-4">
          {!collapsed && (
            <div className="rounded-lg bg-sidebar-accent p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-sidebar-foreground">5 Agents Running</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">All systems operational</p>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
