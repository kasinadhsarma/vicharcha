"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, PackageOpen, Truck, CreditCard, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ShoppingPage() {
  const features = [
    {
      icon: PackageOpen,
      title: "Wide Selection",
      description: "Explore thousands of products"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable shipping"
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Safe transaction processing"
    }
  ]

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vicharcha Shopping</h1>
        <Badge variant="outline" className="px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Shopping Platform Under Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-8">
            <div className="py-6">
              <div className="relative mx-auto w-24 h-24">
                <div className="animate-ping absolute w-full h-full rounded-full bg-primary/20"></div>
                <div className="relative flex items-center justify-center w-full h-full rounded-full bg-primary/30">
                  <ShoppingCart className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>

            <div className="max-w-lg mx-auto">
              <p className="text-lg text-muted-foreground">
                We're building an amazing shopping experience just for you.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <div 
                  key={feature.title}
                  className="p-6 rounded-lg bg-muted/50 text-center space-y-2"
                >
                  <feature.icon className="h-8 w-8 mx-auto text-primary" />
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="max-w-lg mx-auto space-y-4">
              <p className="text-sm text-muted-foreground">
                Our team is working hard to bring you a seamless shopping experience.
                Stay tuned for updates!
              </p>
              
              <Button className="w-full" disabled>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Shop Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

