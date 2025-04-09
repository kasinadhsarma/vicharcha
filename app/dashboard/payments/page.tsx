"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export default function Payments() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Clock className="h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-xl text-muted-foreground">
              Our payment system is currently under development
            </p>
            <div className="py-8">
              <div className="relative mx-auto w-24 h-24">
                <div className="animate-ping absolute w-full h-full rounded-full bg-primary/20"></div>
                <div className="relative flex items-center justify-center w-full h-full rounded-full bg-primary/30">
                  <Clock className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              We're working hard to bring you a secure and convenient payment experience.
              Check back soon!
            </p>
            <Button className="w-full" disabled>
              Payments Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

