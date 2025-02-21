"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavItem } from "@/components/sidebar/NavItem"
import { UserMenu } from "@/components/sidebar/UserMenu"
import { SidebarLogo } from "./SidebarLogo"
import { navItems, NavItem as NavItemType } from "@/constants/navItems"
import { useSettings } from "@/hooks/use-settings"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { settings } = useSettings()
  
  // Get items for quick access (shown at top)
  const quickAccessItems = settings.navigation.quickAccessItems
    .map((href: string) => navItems.find(item => item.href === href))
    .filter((item): item is NavItemType => Boolean(item))

  // Get remaining sidebar items (shown below divider)
  const remainingSidebarItems = settings.navigation.sidebarItems
    .filter((href: string) => !settings.navigation.quickAccessItems.includes(href))
    .map((href: string) => navItems.find(item => item.href === href))
    .filter((item): item is NavItemType => Boolean(item))

  if (isMobile) {
    return null
  }

  return (
    <aside
      className={cn(
        "hidden md:flex border-r flex-col transition-all duration-300 ease-in-out h-screen sticky top-0",
        isCollapsed ? "w-[70px]" : "w-[280px]"
      )}
    >
      <div className="h-14 border-b flex items-center px-4">
        <div className="flex-1">
          <SidebarLogo isCollapsed={isCollapsed} />
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={isCollapsed ? "hover:bg-accent" : ""}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Primary Navigation */}
        <div className="space-y-1 mb-4">
          {quickAccessItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              Icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
              isActive={pathname === item.href}
            />
          ))}
        </div>

        {!isCollapsed && <div className="h-px bg-border my-4" />}

        {/* Secondary Navigation */}
        <div className="space-y-1">
          {remainingSidebarItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              Icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 border-t">
        <UserMenu isCollapsed={isCollapsed} />
      </div>
    </aside>
  )
}
