import { 
  Home, 
  MessageSquare, 
  Film, 
  Bot, 
  BookOpen, 
  Phone, 
  Users, 
  ShoppingBag, 
  Siren, 
  CreditCard,
  User,
  Settings,
  Palette,
  Search,
  Bell
} from "lucide-react"

export type NavLocation = 'sidebar' | 'mobile-bottom' | 'mobile-drawer' | 'mobile-top' | 'profile-menu';

export interface NavItem {
  href: string
  label: string
  icon: any // Using any for now since we're using Lucide icons
  locations: NavLocation[]
}

// Primary navigation items
export const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    locations: ['sidebar', 'mobile-bottom']
  },
  {
    href: "/messages",
    label: "Messages",
    icon: MessageSquare,
    locations: ['sidebar', 'mobile-bottom']
  },
  {
    href: "/reels",
    label: "Reels",
    icon: Film,
    locations: ['sidebar', 'mobile-bottom']
  },
  {
    href: "/calls",
    label: "Calls",
    icon: Phone,
    locations: ['sidebar', 'mobile-bottom']
  },
  {
    href: "/ai-assistant",
    label: "AI Assistant",
    icon: Bot,
    locations: ['sidebar', 'mobile-drawer']
  },
  {
    href: "/research",
    label: "Research",
    icon: BookOpen,
    locations: ['sidebar', 'mobile-drawer']
  },
  {
    href: "/social",
    label: "Social",
    icon: Users,
    locations: ['sidebar', 'mobile-drawer']
  },
  {
    href: "/shopping",
    label: "Shopping",
    icon: ShoppingBag,
    locations: ['sidebar', 'mobile-drawer']
  },
  {
    href: "/emergency",
    label: "Emergency",
    icon: Siren,
    locations: ['sidebar', 'mobile-drawer']
  },
  {
    href: "/payments",
    label: "Payments",
    icon: CreditCard,
    locations: ['sidebar', 'mobile-drawer']
  }
]

// Profile related items
export const profileItems: NavItem[] = [
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    locations: ['profile-menu']
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    locations: ['profile-menu']
  },
  {
    href: "/theme",
    label: "Change Theme",
    icon: Palette,
    locations: ['profile-menu']
  }
]

// Utility items that appear in specific locations
export const utilityItems: NavItem[] = [
  {
    href: "/search",
    label: "Search",
    icon: Search,
    locations: ['mobile-top']
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
    locations: ['mobile-top']
  }
]
