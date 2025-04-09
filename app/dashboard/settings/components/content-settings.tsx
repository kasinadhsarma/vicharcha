"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/use-settings"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"

export function ContentSettings() {
  const { settings, updateSettings } = useSettings()
  const [showAgeVerification, setShowAgeVerification] = useState(false)
  const [dateOfBirth, setDateOfBirth] = useState(settings?.dateOfBirth || "")

  const handleAgeVerification = () => {
    if (!dateOfBirth) return;
    
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
    if (age >= 18) {
      updateSettings({ isAdultContentEnabled: true, dateOfBirth })
      setShowAgeVerification(false)
    } else {
      alert("You must be 18 or older to enable adult content")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Preferences</CardTitle>
        <CardDescription>
          Manage your content viewing preferences and restrictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Adult Content (18+)</Label>
            <p className="text-sm text-muted-foreground">
              Enable viewing of adult content
            </p>
          </div>
          <Switch
            checked={settings?.isAdultContentEnabled}
            onCheckedChange={() => {
              if (!settings?.isAdultContentEnabled) {
                setShowAgeVerification(true)
              } else {
                updateSettings({ isAdultContentEnabled: false })
              }
            }}
          />
        </div>

        {showAgeVerification && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Please verify your age to enable adult content</p>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
                <Button onClick={handleAgeVerification}>
                  Verify Age
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
