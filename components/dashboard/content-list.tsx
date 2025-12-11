"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, Send } from "lucide-react"
import type { ContentItem } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ContentListProps {
  items: ContentItem[]
  onView?: (item: ContentItem) => void
  onEdit?: (item: ContentItem) => void
  onDelete?: (item: ContentItem) => void
  onPublish?: (item: ContentItem) => void
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-600 border-green-500/20",
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  published: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-red-500/10 text-red-600 border-red-500/20",
}

const typeIcons: Record<string, string> = {
  blog: "Blog",
  social: "Social",
  email: "Email",
  ad: "Ad",
  landing_page: "Landing",
}

export function ContentList({ items, onView, onEdit, onDelete, onPublish }: ContentListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>SEO Score</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>
              <Badge variant="secondary">{typeIcons[item.type]}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn("capitalize", statusColors[item.status])}>
                {item.status.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>
              {item.metadata.seoScore !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-2 rounded-full",
                        item.metadata.seoScore >= 80
                          ? "bg-green-500"
                          : item.metadata.seoScore >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500",
                      )}
                      style={{ width: `${item.metadata.seoScore}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{item.metadata.seoScore}</span>
                </div>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">{new Date(item.updatedAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(item)}>
                    <Eye className="mr-2 h-4 w-4" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(item)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPublish?.(item)}>
                    <Send className="mr-2 h-4 w-4" /> Publish
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete?.(item)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
