"use client"

import { Sidebar as SidebarDesktop } from "./Sidebar"
import { MobileNavigation } from "./mobile-navigation"

export function Sidebar() {
  return (
    <>
      <SidebarDesktop />
      <MobileNavigation />
    </>
  )
}
