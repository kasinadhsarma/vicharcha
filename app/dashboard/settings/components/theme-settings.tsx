"use client"

import { useState } from "react"
import { Check, Palette, Plus } from "lucide-react"
import { defaultThemes, type ColorTheme, createCustomTheme } from "@/lib/theme-settings"
import { useThemeSettings } from "@/hooks/use-theme-settings"
import { ColorCustomizer } from "./color-customizer"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ThemeSettings() {
  const { theme, colorTheme, isLoading, setTheme, setColorTheme } = useThemeSettings()
  const [editingTheme, setEditingTheme] = useState<ColorTheme | null>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Settings
        </CardTitle>
        <CardDescription>
          Customize the appearance of the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {editingTheme ? (
          <ColorCustomizer 
            theme={editingTheme}
            onSave={(updatedTheme) => {
              setColorTheme(updatedTheme.id)
              setEditingTheme(null)
            }}
            onCancel={() => setEditingTheme(null)}
          />
        ) : (
          <>
            {/* Mode Selection */}
            <div className="space-y-2">
              <Label>Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="w-full"
                  disabled={isLoading}
                >
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="w-full"
                  disabled={isLoading}
                >
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className="w-full"
                  disabled={isLoading}
                >
                  System
                </Button>
              </div>
            </div>

            {/* Color Theme Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Color Theme</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const hue = Math.floor(Math.random() * 360)
                    const newTheme = createCustomTheme(
                      `custom-${Date.now()}`,
                      "Custom Theme",
                      hue
                    )
                    setEditingTheme(newTheme)
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Custom Theme
                </Button>
              </div>

              <RadioGroup
                value={colorTheme}
                onValueChange={(value) => {
                  const theme = defaultThemes.find(t => t.id === value)
                  if (theme?.isCustom) {
                    setEditingTheme(theme)
                  } else {
                    setColorTheme(value)
                  }
                }}
                className="grid grid-cols-2 gap-4"
              >
                {defaultThemes.map((colorTheme) => (
                  <div key={colorTheme.id}>
                    <RadioGroupItem
                      value={colorTheme.id}
                      id={colorTheme.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={colorTheme.id}
                      className={cn(
                        "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4",
                        "hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary",
                        "[&:has([data-state=checked])]:border-primary cursor-pointer",
                        colorTheme.isCustom && "border-dashed"
                      )}
                    >
                      <div className="flex w-full flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            {colorTheme.name}
                          </span>
                          <Check className="h-4 w-4 text-primary opacity-0 peer-data-[state=checked]:opacity-100" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div 
                            className="h-8 w-full rounded-md border" 
                            style={{ backgroundColor: colorTheme.colors.background }}
                            title="Background"
                          />
                          <div 
                            className="h-8 w-full rounded-md border"
                            style={{ backgroundColor: colorTheme.colors.primary }}
                            title="Primary"
                          />
                          <div 
                            className="h-8 w-full rounded-md border"
                            style={{ backgroundColor: colorTheme.colors.secondary }}
                            title="Secondary"
                          />
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}