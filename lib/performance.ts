import { useMemo, useCallback, useRef, useEffect, useState } from 'react'

// Performance monitoring utilities
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay]) as T
}

// Debounce for string values
export function useDebouncedValue(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const timeoutRef = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(timeoutRef)
  }, [value, delay])
  
  return debouncedValue
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())
  
  return useCallback((...args: Parameters<T>) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args)
      lastRun.current = Date.now()
    }
  }, [callback, delay]) as T
}

// Virtual scrolling utilities
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const visibleItems = []
    
    for (let i = 0; i < items.length; i++) {
      const top = i * itemHeight
      const bottom = top + itemHeight
      
      if (bottom < -overscan * itemHeight) continue
      if (top > containerHeight + overscan * itemHeight) break
      
      visibleItems.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute' as const,
          top: top,
          height: itemHeight,
          width: '100%'
        }
      })
    }
    
    return {
      visibleItems,
      totalHeight: items.length * itemHeight
    }
  }, [items, itemHeight, containerHeight, overscan])
}

// Memoized filtering utilities
export function useMemoizedFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  dependencies: any[] = []
) {
  return useMemo(() => {
    return items.filter(filterFn)
  }, [items, ...dependencies])
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const lastRenderTime = useRef(Date.now())
  
  useEffect(() => {
    renderCount.current++
    const now = Date.now()
    const timeSinceLastRender = now - lastRenderTime.current
    
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${componentName} rendered ${renderCount.current} times. ` +
        `Time since last render: ${timeSinceLastRender}ms`
      )
    }
    
    lastRenderTime.current = now
  })
  
  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current
  }
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)
    
    observer.observe(element)
    
    return () => {
      observer.unobserve(element)
    }
  }, [ref, options])
  
  return isIntersecting
}

// Image lazy loading utility
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [isLoading, setIsLoading] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)
  
  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const loadImage = () => {
            const tempImg = new Image()
            tempImg.onload = () => {
              setImageSrc(src)
              setIsLoading(false)
            }
            tempImg.onerror = () => {
              setImageSrc(placeholder || '')
              setIsLoading(false)
            }
            tempImg.src = src
          }
          
          loadImage()
          observer.unobserve(img)
        }
      },
      { threshold: 0.1 }
    )
    
    observer.observe(img)
    
    return () => {
      observer.unobserve(img)
    }
  }, [src, placeholder])
  
  return { imageSrc, isLoading, imgRef }
}

// Optimized search utilities
export function useOptimizedSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  searchQuery: string
) {
  return useMemo(() => {
    if (!searchQuery.trim()) return items
    
    const query = searchQuery.toLowerCase()
    
    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field]
        return value && typeof value === 'string' && 
               value.toLowerCase().includes(query)
      })
    )
  }, [items, searchFields, searchQuery])
}

// Batch state updates utilities
export function useBatchedUpdates<T>(initialState: T) {
  const [state, setState] = useState(initialState)
  const pendingUpdates = useRef<Partial<T>>({})
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const batchedSetState = useCallback((updates: Partial<T>) => {
    Object.assign(pendingUpdates.current, updates)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, ...pendingUpdates.current }))
      pendingUpdates.current = {}
    }, 16) // ~60fps
  }, [])
  
  return [state, batchedSetState] as const
}
