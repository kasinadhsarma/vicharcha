"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth/auth-provider"
import { useTheme } from "next-themes"
import { LogOut, Sun, Moon, User, UserCog } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserMenuProps {
  isCollapsed?: boolean
  onClose?: () => void
}

export function UserMenu({ isCollapsed, onClose }: UserMenuProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
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
        <Button
          variant="ghost"
          className={cn("w-full", isCollapsed ? "justify-center" : "justify-start gap-3")}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={`/placeholder.svg?text=${user?.name?.[0] || "U"}`} alt={user?.name} />
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
        <DropdownMenuItem onClick={() => handleMenuItemClick("/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuItemClick("/settings")}>
          <UserCog className="mr-2 h-4 w-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>
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
