"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  MessageSquare,
  Phone,
  Users,
  Brain,
  AlertTriangle,
  CreditCard,
  ShoppingBag,
  Film,
  Microscope,
  X,
  Sun,
  Moon,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Code,
  User,
  Settings,
  LogOut,
  UserCog,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth/auth-provider"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
  { icon: Film, label: "Reels", href: "/reels" },
  { icon: Brain, label: "AI Assistant", href: "/ai-assistant" },
  { icon: Microscope, label: "Research", href: "/research" },
  { icon: Phone, label: "Calls", href: "/calls" },
  { icon: Users, label: "Social", href: "/social" },
  { icon: ShoppingBag, label: "Shopping", href: "/shopping" },
  { icon: AlertTriangle, label: "Emergency", href: "/emergency" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
]

const profileMenuItems = [
  { icon: User, label: "Profile", href: "/profile" },
  { icon: UserCog, label: "Account Settings", href: "/settings" },
]

function SidebarLogo({ isCollapsed }: { isCollapsed?: boolean }) {
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

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  isCollapsed?: boolean
  onClick?: () => void
  isActive?: boolean
}

function NavItem({ href, icon: Icon, label, isCollapsed, onClick, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
        isCollapsed && "w-10 px-2 mx-auto justify-center"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  )
}

interface UserMenuProps {
  isCollapsed?: boolean
  user?: any
  onClose?: () => void
}

function UserMenu({ isCollapsed, user, onClose }: UserMenuProps) {
  const router = useRouter()
  const { logout } = useAuth()
  const { setTheme, theme } = useTheme()

  const handleMenuItemClick = (href: string) => {
    router.push(href)
    onClose?.()
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
    onClose?.()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("w-full", isCollapsed ? "justify-center" : "justify-start gap-3")}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={`/placeholder.svg?text=${user?.name?.[0] || "U"}`} alt={user?.name || "User"} />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 text-left">
              <p className="text-sm font-medium truncate">{user?.name || "Guest"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || "Not logged in"}</p>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isCollapsed ? "center" : "end"} className="w-[200px]">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profileMenuItems.map((item) => (
          <DropdownMenuItem key={item.href} onClick={() => handleMenuItemClick(item.href)}>
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
          <span>Change Theme</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ThemeToggle({ isCollapsed }: { isCollapsed?: boolean }) {
  const { setTheme, theme } = useTheme()
  return (
    <Button
      variant="ghost"
      className={cn("w-full", isCollapsed ? "px-2 justify-center" : "justify-start gap-3")}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? (
        <>
          <Moon className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Light Mode</span>}
        </>
      )}
    </Button>
  )
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const pathname = usePathname()
  const { user } = useAuth()

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  function MobileNav() {
    return (
      <>
        {/* Mobile Top Bar */}
        <div className="md:hidden fixed top-14 left-0 right-0 h-12 border-b bg-background/80 backdrop-blur-md z-30 flex items-center justify-between px-4">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="w-[280px] p-0 flex flex-col bg-background h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <SidebarLogo />
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-auto py-2">
                  {navItems.map((item) => (
                    <NavItem
                      key={item.href}
                      {...item}
                      isActive={pathname === item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                  ))}
                </div>
                <div className="border-t p-4">
                  <UserMenu user={user} onClose={() => setIsMobileMenuOpen(false)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <UserMenu user={user} />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-background/80 backdrop-blur-md z-30">
          <div className="flex items-center justify-around h-full px-2">
            {navItems.slice(0, 4).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-medium mt-1">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </>
    )
  }

  if (isMobile) {
    return <MobileNav />
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
            onClick={toggleSidebar}
            className={isCollapsed ? "hover:bg-accent" : ""}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} isCollapsed={isCollapsed} isActive={pathname === item.href} />
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 border-t">
        <UserMenu isCollapsed={isCollapsed} user={user} />
      </div>
    </aside>
  )
}
