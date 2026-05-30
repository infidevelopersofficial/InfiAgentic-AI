import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: "increase" | "decrease" | "neutral"
  icon?: LucideIcon
  description?: string
}

export function MetricCard({ title, value, change, changeType = "neutral", icon: Icon, description }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {changeType === "increase" && <TrendingUp className="h-4 w-4 text-green-500" />}
              {changeType === "decrease" && <TrendingDown className="h-4 w-4 text-red-500" />}
              {changeType === "neutral" && <Minus className="h-4 w-4 text-muted-foreground" />}
              <span
                className={cn(
                  "text-sm font-medium",
                  changeType === "increase" && "text-green-500",
                  changeType === "decrease" && "text-red-500",
                  changeType === "neutral" && "text-muted-foreground",
                )}
              >
                {change > 0 ? "+" : ""}
                {change}%
              </span>
              {description && <span className="text-sm text-muted-foreground">{description}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
