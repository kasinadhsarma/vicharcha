"use client"

import { Phone, Video, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Calls() {
  return (
    <div className="w-full px-4 py-6 max-w-3xl mx-auto">
      <Card className="border-0 md:border">
        <CardHeader className="border-b px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Calls</CardTitle>
            <Button size="sm" className="gap-1.5" disabled>
              <Phone className="h-4 w-4" />
              <span className="hidden md:inline">New Call</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px] text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <Phone className="h-8 w-8 text-purple-500" />
              </div>
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full p-1.5">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mt-4">Calls Coming Soon</h2>
            <p className="text-muted-foreground max-w-md">
              We&apos;re working on bringing you a seamless calling experience. Voice and video calls will be available soon!
            </p>
            
            <div className="flex gap-3 mt-6">
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <Phone className="h-4 w-4 mr-1" />
                Voice Calls
              </Badge>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <Video className="h-4 w-4 mr-1" />
                Video Calls
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}