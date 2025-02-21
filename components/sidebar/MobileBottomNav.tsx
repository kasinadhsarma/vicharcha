"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSettings } from "@/hooks/use-settings"
import { navItems, NavItem } from "@/constants/navItems"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { settings } = useSettings()
  // Get the full nav item objects for the user's preferred bottom nav items
  const bottomNavItems = settings.navigation.bottomNavItems
    .map(href => navItems.find(item => item.href === href))
    .filter((item): item is NavItem => Boolean(item))

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-background/80 backdrop-blur-md z-30">
      <div className="flex items-center justify-around h-full px-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex flex-col items-center justify-center"
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
