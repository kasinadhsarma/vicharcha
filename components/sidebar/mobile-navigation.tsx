"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Menu, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavItem } from "@/components/sidebar/NavItem"
import { UserMenu } from "@/components/sidebar/UserMenu"
import { SidebarLogo } from "./SidebarLogo"
import { navItems, NavItem as NavItemType } from "@/constants/navItems"
import { useSettings } from "@/hooks/use-settings"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function MobileNavigation() {
  const pathname = usePathname()
  const { settings } = useSettings()
  const [isOpen, setIsOpen] = React.useState(false)

  // Get drawer menu items
  const drawerItems = settings.navigation.sidebarItems
    .filter((href: string) => !settings.navigation.bottomNavItems.includes(href))
    .map(href => navItems.find(item => item.href === href))
    .filter((item): item is NavItemType => Boolean(item))

  // Get bottom navigation items
  const bottomNavItems = settings.navigation.bottomNavItems
    .map(href => navItems.find(item => item.href === href))
    .filter((item): item is NavItemType => Boolean(item))

  return (
    <div className="md:hidden">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-background">
              <div className="flex items-center justify-between p-4 border-b">
                <SidebarLogo />
              </div>
              <div className="flex-1 overflow-auto py-2">
                {drawerItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    Icon={item.icon}
                    label={item.label}
                    isActive={pathname === item.href}
                    onClick={() => setIsOpen(false)}
                  />
                ))}
              </div>
              <div className="border-t p-4">
                <UserMenu onClose={() => setIsOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex justify-center">
            <SidebarLogo />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                2
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background/80 backdrop-blur-md z-30">
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

      {/* Add padding for bottom navigation */}
      <div className="pb-16" />
    </div>
  )
}
