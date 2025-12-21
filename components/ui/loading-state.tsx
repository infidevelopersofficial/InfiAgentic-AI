"use client"

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({ 
  message = 'Loading...', 
  className,
  size = 'md'
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn('flex items-center justify-center gap-2 py-8', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      <span className="text-muted-foreground">{message}</span>
    </div>
  )
}

// Skeleton loading components
export function SkeletonCard() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full animate-pulse" />
        <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded">
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
          </div>
          <div className="h-6 bg-muted rounded w-16 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
