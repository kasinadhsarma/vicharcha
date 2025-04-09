"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, Video, Search, CalendarClock, Bell } from "lucide-react"

export default function ComingSoonCalls() {
  return (
    <div className="w-full px-4 py-6 max-w-3xl mx-auto">
      <Card className="border-0 md:border">
        <CardHeader className="border-b px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Calls</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search calls" className="pl-9 w-[200px]" disabled />
              </div>
              <Button size="sm" className="gap-1.5" disabled>
                <Phone className="h-4 w-4" />
                <span className="hidden md:inline">New Call</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-rose-500/10 rounded-full p-8 mb-6">
            <div className="bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-rose-500/20 rounded-full p-6">
              <Phone className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Calls Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            We&apos;re working hard to bring you a seamless calling experience. Stay tuned for updates on this exciting new feature!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md w-full">
            <Button variant="outline" className="flex-1 gap-2">
              <Bell className="h-4 w-4" />
              Get Notified
            </Button>
            <Button className="flex-1 gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              <CalendarClock className="h-4 w-4" />
              Join Waitlist
            </Button>
          </div>
          <div className="mt-12 flex gap-6">
            <div className="flex flex-col items-center">
              <div className="bg-purple-500/10 rounded-full p-3 mb-2">
                <Video className="h-5 w-5 text-purple-500" />
              </div>
              <p className="font-medium text-sm">Video Calls</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-500/10 rounded-full p-3 mb-2">
                <Phone className="h-5 w-5 text-blue-500" />
              </div>
              <p className="font-medium text-sm">Voice Calls</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-rose-500/10 rounded-full p-3 mb-2">
                <Bell className="h-5 w-5 text-rose-500" />
              </div>
              <p className="font-medium text-sm">Notifications</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}