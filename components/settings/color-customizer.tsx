"use client"

import { useState } from "react"
import { Paintbrush, Save } from "lucide-react"
import { ColorTheme } from "@/lib/theme-settings"
import { useColorCustomization } from "@/hooks/use-color-customization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ColorCustomizerProps {
  theme: ColorTheme;
  onSave: (theme: ColorTheme) => void;
  onCancel: () => void;
}

export function ColorCustomizer({ theme, onSave, onCancel }: ColorCustomizerProps) {
  const { customTheme, setHue, updateColor } = useColorCustomization(theme)
  const [themeName, setThemeName] = useState(theme.name)

  const handleSave = () => {
    if (!customTheme) return
    onSave({
      ...customTheme,
      name: themeName
    })
  }

  const mainHue = customTheme ? parseInt(customTheme.colors.primary.split(" ")[0].replace("hsl(", ""), 10) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5" />
          Customize Theme
        </CardTitle>
        <CardDescription>
          Adjust colors to create your perfect theme
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Theme Name</Label>
          <Input 
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            placeholder="My Custom Theme"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Base Color</Label>
            <Slider
              value={[mainHue]}
              onValueChange={([hue]) => setHue(hue)}
              min={0}
              max={360}
              step={1}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
            />
            <div className="h-4 w-full rounded-md" style={{
              background: `linear-gradient(to right, 
                hsl(0, 50%, 60%),
                hsl(60, 50%, 60%),
                hsl(120, 50%, 60%),
                hsl(180, 50%, 60%),
                hsl(240, 50%, 60%),
                hsl(300, 50%, 60%),
                hsl(360, 50%, 60%)
              )`
            }} />
          </div>

          <div className="grid gap-4">
            {customTheme && Object.entries(customTheme.colors).map(([key, value]) => {
              const matches = value.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/)
              const [h, s, l] = matches ? [
                parseInt(matches[1], 10),
                parseInt(matches[2], 10),
                parseInt(matches[3], 10)
              ] : [0, 0, 0]
              return (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key.replace("-", " ")}</Label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-8 w-8 rounded-md border"
                      style={{ backgroundColor: value }}
                    />
                    <div className="grid grid-cols-3 gap-4 flex-1">
                      <div>
                        <Label className="text-xs">Hue</Label>
                        <Input
                          type="number"
                          min={0}
                          max={360}
                          value={h}
                          onChange={(e) => updateColor(key as keyof ColorTheme["colors"], `hsl(${e.target.value} ${s}% ${l}%)`)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Saturation</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={s}
                          onChange={(e) => updateColor(key as keyof ColorTheme["colors"], `hsl(${h} ${e.target.value}% ${l}%)`)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Lightness</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={l}
                          onChange={(e) => updateColor(key as keyof ColorTheme["colors"], `hsl(${h} ${s}% ${e.target.value}%)`)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Theme
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
