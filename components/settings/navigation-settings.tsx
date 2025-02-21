"use client"

import { useSettings } from "@/hooks/use-settings"
import { navItems } from "@/constants/navItems"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export function NavigationSettings() {
  const { settings, updateSettings } = useSettings()

  const handleQuickAccessToggle = (href: string) => {
    const currentItems = settings.navigation.quickAccessItems
    const newItems = currentItems.includes(href)
      ? currentItems.filter(item => item !== href)
      : [...currentItems, href].slice(0, 4) // Limit to 4 items
    
    updateSettings({
      navigation: {
        ...settings.navigation,
        quickAccessItems: newItems
      }
    })
  }

  const handleBottomNavToggle = (href: string) => {
    const currentItems = settings.navigation.bottomNavItems
    const newItems = currentItems.includes(href)
      ? currentItems.filter(item => item !== href)
      : [...currentItems, href].slice(0, 4) // Limit to 4 items
    
    updateSettings({
      navigation: {
        ...settings.navigation,
        bottomNavItems: newItems
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Access Items</CardTitle>
          <CardDescription>
            Choose up to 4 items to show at the top of your sidebar for quick access
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {navItems.map((item) => (
            <div key={item.href} className="flex items-center space-x-2">
              <Checkbox 
                id={`quick-${item.href}`}
                checked={settings.navigation.quickAccessItems.includes(item.href)}
                onCheckedChange={() => handleQuickAccessToggle(item.href)}
                disabled={!settings.navigation.quickAccessItems.includes(item.href) && 
                         settings.navigation.quickAccessItems.length >= 4}
              />
              <Label htmlFor={`quick-${item.href}`}>
                {item.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mobile Bottom Navigation</CardTitle>
          <CardDescription>
            Choose up to 4 items to show in the bottom navigation bar on mobile
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {navItems.map((item) => (
            <div key={item.href} className="flex items-center space-x-2">
              <Checkbox 
                id={`bottom-${item.href}`}
                checked={settings.navigation.bottomNavItems.includes(item.href)}
                onCheckedChange={() => handleBottomNavToggle(item.href)}
                disabled={!settings.navigation.bottomNavItems.includes(item.href) && 
                         settings.navigation.bottomNavItems.length >= 4}
              />
              <Label htmlFor={`bottom-${item.href}`}>
                {item.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
