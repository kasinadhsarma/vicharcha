import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge class names with tailwind classes and resolve conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format a time for display
 */
export function formatTime(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Format a relative time for display (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 1) {
    return 'just now'
  } else if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else if (days < 7) {
    return `${days}d ago`
  } else {
    return formatDate(date)
  }
}

/**
 * Generate random string (useful for IDs)
 */
export function generateRandomString(length: number) {
  return Math.random().toString(36).substring(2, 2 + length)
}

/**
 * Truncate text to a certain length
 */
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Format a phone number for display
 */
export function formatPhoneNumber(phoneNumber: string) {
  const cleaned = phoneNumber.replace(/\D/g, '')
  if (cleaned.length < 10) return phoneNumber
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return `+${cleaned.slice(0, -10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`
}

/**
 * Parse URL parameters
 */
export function parseQueryString(queryString: string) {
  const params = new URLSearchParams(queryString)
  const result: Record<string, string> = {}
  for (const [key, value] of params.entries()) {
    result[key] = value
  }
  return result
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Deep merge objects
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  if (target === null || typeof target !== 'object') return source as T
  if (source === null || typeof source !== 'object') return source as T
  
  const result = { ...target }
  Object.keys(source).forEach(key => {
    const targetValue = (result as any)[key]
    const sourceValue = (source as any)[key]
    
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      (result as any)[key] = sourceValue
    } else if (typeof targetValue === 'object' && typeof sourceValue === 'object') {
      (result as any)[key] = deepMerge(targetValue, sourceValue)
    } else {
      (result as any)[key] = sourceValue
    }
  })
  
  return result
}
