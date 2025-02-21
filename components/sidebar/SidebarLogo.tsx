"use client"

import { cn } from "@/lib/utils"

interface SidebarLogoProps {
  isCollapsed?: boolean
}

export function SidebarLogo({ isCollapsed }: SidebarLogoProps) {
  return (
    <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-2")}>
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-violet-600 rounded-lg transform rotate-45" />
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">V</div>
      </div>
      {!isCollapsed && (
        <span className="font-bold bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent">
          Vicharcha
        </span>
      )}
    </div>
  )
}
