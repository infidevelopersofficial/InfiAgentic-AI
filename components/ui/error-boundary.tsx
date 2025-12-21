"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Hook for async error handling
export function useErrorHandler() {
  return React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context}:`, error)
    // You could also send this to an error reporting service
  }, [])
}

// Component for displaying error states
export function ErrorState({ 
  message, 
  onRetry 
}: { 
  message: string
  onRetry?: () => void 
}) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">
          Something went wrong
        </h3>
        <p className="text-red-600 text-center mb-4">
          {message}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
