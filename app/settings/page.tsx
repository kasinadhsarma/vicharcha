"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeSettings } from "@/components/settings/theme-settings"
import { LanguageSettings } from "@/components/settings/language"
import { PrivacySettings } from "@/components/settings/privacy-settings"
import { NavigationSettings } from "@/components/settings/navigation-settings"

export default function SettingsPage() {
  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your preferences and customize your experience.
        </p>
      </div>
      
      <Tabs defaultValue="navigation" className="space-y-6">
        <TabsList>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        <TabsContent value="navigation">
          <NavigationSettings />
        </TabsContent>
        <TabsContent value="theme">
          <ThemeSettings />
        </TabsContent>
        <TabsContent value="language">
          <LanguageSettings />
        </TabsContent>
        <TabsContent value="privacy">
          <PrivacySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
