"use client"

import { useState, useEffect} from "react"
import { cn } from "@/lib/utils"
import { useThemeSettings } from "@/hooks/use-theme-settings"
import { PrivacySettings } from "./components/privacy-settings"
import { ThemeSettings } from "./components/theme-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LanguageSettings } from "./components/language"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bell,
  Bug,
  Camera,
  Globe,
  HelpCircle,
  Monitor,
  Palette,
  RefreshCw,
  Save,
  Shield,
  Smartphone,
  Tablet,
  Terminal,
  User,
  X,

} from "lucide-react"

type DeviceType = "mobile" | "tablet" | "desktop"

interface DevicePreviewProps {
  children: React.ReactNode;
  device: DeviceType;
}

const deviceStyles = {
  mobile: "w-[375px] h-[667px]",
  tablet: "w-[768px] h-[1024px]",
  desktop: "w-[1280px] h-[800px]"
} as const

const DevicePreview = ({ children, device }: DevicePreviewProps) => {
  return (
    <div className={`border rounded-lg overflow-hidden ${deviceStyles[device]} mx-auto`}>
      <div className="h-6 bg-muted flex items-center px-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>
      <div className="overflow-auto h-[calc(100%-24px)]">
        {children}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { theme, colorTheme } = useThemeSettings()
  const [notifications, ] = useState({
    email: true,
    push: false,
    sms: false,
  })
  const [previewDevice, setPreviewDevice] = useState<DeviceType>("desktop")
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false)
  const [breakpoint, setBreakpoint] = useState("")
  const [savedChanges, setSavedChanges] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < 640) return setBreakpoint("xs")
      if (width < 768) return setBreakpoint("sm")
      if (width < 1024) return setBreakpoint("md")
      if (width < 1280) return setBreakpoint("lg")
      return setBreakpoint("xl")
    }

    updateBreakpoint()
    window.addEventListener("resize", updateBreakpoint)
    return () => window.removeEventListener("resize", updateBreakpoint)
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSavedChanges({ theme, colorTheme, notifications })
    setIsLoading(false)
  }

  const MainContent = () => (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and settings</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isDevelopmentMode && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {isDevelopmentMode && (
        <Alert className="mb-6">
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium">Development Mode Active</p>
              <p className="text-sm text-muted-foreground">Current Breakpoint: {breakpoint}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={previewDevice === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewDevice("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
              <Button
                variant={previewDevice === "tablet" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewDevice("tablet")}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={previewDevice === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewDevice("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="h-[calc(100vh-12rem)] flex flex-col">
        <Tabs defaultValue="account" className="flex-1 overflow-hidden">
          <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 pb-2 border-b shadow-sm">
            <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full lg:w-auto">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Language</span>
              </TabsTrigger>
              <TabsTrigger value="help" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Help</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-y-auto flex-1 pr-4 -mr-4">
            {/* Account Tab */}
            <TabsContent value="account" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account settings and set email preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder-user.jpg" alt="Profile picture" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue="john@example.com" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="mt-4 space-y-6">
              <ThemeSettings />
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="mt-4 space-y-6">
              <PrivacySettings />
            </TabsContent>

            {/* Language Tab */}
            <TabsContent value="language" className="mt-4 space-y-6">
              <LanguageSettings />
            </TabsContent>

            {/* Help Tab */}
            <TabsContent value="help" className="mt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Help & Support</CardTitle>
                  <CardDescription>Get help with your account and app usage.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Contact support for assistance.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {isDevelopmentMode && (
              <Card className="mt-6 mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Developer Tools</CardTitle>
                  <CardDescription>Debug and development utilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Current Breakpoint</Label>
                      <div className="p-2 border rounded bg-muted">
                        <code>{breakpoint}</code>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Window Dimensions</Label>
                      <div className="p-2 border rounded bg-muted">
                        <code>{typeof window !== 'undefined' ? `${window.innerWidth}px × ${window.innerHeight}px` : 'Loading...'}</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Saved State</Label>
                    <div className="p-2 border rounded bg-muted">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(savedChanges, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => console.log('Current State:', { theme, colorTheme, notifications })}>
                      <Terminal className="h-4 w-4 mr-2" />
                      Log State
                    </Button>
                    <Button variant="outline" onClick={() => localStorage.clear()}>
                      <X className="h-4 w-4 mr-2" />
                      Clear Storage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  )

  const DevelopmentControls = () => (
    <div className="fixed bottom-4 right-4 flex items-center gap-2">
      <div className={cn(
        "flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-full p-2 shadow-lg transition-all duration-200",
        isDevelopmentMode && "bg-accent"
      )}>
        {isDevelopmentMode && (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full h-8 w-8 p-0"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <div className="h-4 border-l border-border/50" />
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={previewDevice === "mobile" ? "default" : "ghost"}
                className="rounded-full h-8 w-8 p-0"
                onClick={() => setPreviewDevice("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={previewDevice === "tablet" ? "default" : "ghost"}
                className="rounded-full h-8 w-8 p-0"
                onClick={() => setPreviewDevice("tablet")}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={previewDevice === "desktop" ? "default" : "ghost"}
                className="rounded-full h-8 w-8 p-0"
                onClick={() => setPreviewDevice("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-4 border-l border-border/50" />
          </>
        )}
        <Button
          size="sm"
          variant={isDevelopmentMode ? "default" : "ghost"}
          onClick={() => setIsDevelopmentMode(!isDevelopmentMode)}
          className="rounded-full h-8 w-8 p-0"
        >
          <Bug className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {isDevelopmentMode && previewDevice !== "desktop" ? (
        <div className="p-4">
          <DevicePreview device={previewDevice}>
            <MainContent />
          </DevicePreview>
        </div>
      ) : (
        <MainContent />
      )}
      <DevelopmentControls />
    </>
  )
}
