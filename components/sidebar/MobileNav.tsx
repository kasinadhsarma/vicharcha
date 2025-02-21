"use client"

import { usePathname } from "next/navigation"
import { Menu, X, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavItem } from "@/components/sidebar/NavItem"
import { UserMenu } from "@/components/sidebar/UserMenu"
import { SidebarLogo } from "./SidebarLogo"
import { navItems, profileItems } from "@/constants/navItems"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet"

interface MobileNavProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNav({ isOpen, onOpenChange }: MobileNavProps) {
  const pathname = usePathname()
  const drawerItems = navItems.filter(item => item.locations.includes('mobile-drawer'))

  return (
    <div className="fixed top-0 left-0 right-0 z-40 md:hidden">
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 py-2">
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-background">
            <div className="flex items-center justify-between p-4 border-b">
              <SidebarLogo />
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto py-2">
              {drawerItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  Icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                  onClick={() => onOpenChange(false)}
                />
              ))}
            </div>
            <div className="border-t p-4">
              <UserMenu onClose={() => onOpenChange(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            {/* Add notification badge here if needed */}
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">2</span>
          </Button>
          <UserMenu />
        </div>
      </div>
    </div>
  )
}
