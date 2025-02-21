// components/ui/sidebar/sidebar-provider.tsx
"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface SidebarContextType {
  isCollapsed: boolean
  isMobileMenuOpen: boolean
  toggleSidebar: () => void
  setMobileMenuOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  React.useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false)
    }
  }, [isMobile])

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  const setMobileMenuOpen = useCallback((open: boolean) => {
    setIsMobileMenuOpen(open)
  }, [])

  return (
    <SidebarContext.Provider 
      value={{
        isCollapsed,
        isMobileMenuOpen,
        toggleSidebar,
        setMobileMenuOpen
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
