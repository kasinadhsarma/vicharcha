import { cn } from "@/lib/utils"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface NavItemProps {
  href: string
  Icon: LucideIcon
  label: string
  isCollapsed?: boolean
  onClick?: () => void
  isActive?: boolean
}

export function NavItem({ href, Icon, label, isCollapsed = false, onClick, isActive = false }: NavItemProps) {
  const handleClick = () => {
    if (onClick) onClick()
  }

  return (
    <Link 
      href={href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 transition-all hover:text-slate-900 dark:text-slate-50 dark:hover:text-slate-50",
        isActive ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-100 dark:hover:bg-slate-800",
        isCollapsed && "justify-center"
      )}
    >
      <Icon className="h-4 w-4" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  )
}
