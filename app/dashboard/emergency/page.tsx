"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Ambulance, BadgeIcon as Police, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function EmergencyPage() {
  const services = [
    {
      title: "Medical Services",
      icon: Ambulance,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Fire Services",
      icon: Flame,
      color: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      title: "Police Services",
      icon: Police,
      color: "text-yellow-500 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Emergency Response Dashboard
          </h1>
        </div>
        <Badge variant="outline" className="px-4 py-2 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600">
          Coming Soon
        </Badge>
      </div>

      {/* Main Card */}
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-gray-900 dark:text-white">
            <Clock className="h-6 w-6 text-primary dark:text-gray-400" />
            Emergency Services Platform Under Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            {/* Service Buttons */}
            <div className="grid gap-4 md:grid-cols-3">
              {services.map((service) => (
                <div 
                  key={service.title} 
                  className={`${service.bgColor} rounded-lg p-4 flex items-center justify-center gap-2 opacity-50`}
                >
                  <service.icon className={`h-6 w-6 ${service.color}`} />
                  <span className="font-medium text-gray-900 dark:text-white">{service.title}</span>
                </div>
              ))}
            </div>
            
            {/* Information Section */}
            <div className="max-w-lg mx-auto space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                We&apos;re building a comprehensive emergency response system to serve you better.
              </p>

              {/* Animated Alert */}
              <div className="py-6">
                <div className="relative mx-auto w-24 h-24">
                  <div className="animate-ping absolute w-full h-full rounded-full bg-red-500/20"></div>
                  <div className="relative flex items-center justify-center w-full h-full rounded-full bg-red-500/30">
                    <AlertTriangle className="h-12 w-12 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Emergency Numbers */}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For emergencies, please continue to use your local emergency services numbers:
                <br />
                <span className="font-medium text-gray-900 dark:text-white">
                  Police: 100 | Fire: 101 | Ambulance: 102
                </span>
              </p>
            </div>

            {/* Disabled Button */}
            <Button className="w-full max-w-md mx-auto bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-300" disabled>
              Platform Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}