"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Sparkles, Brain, MessageSquare, Lightbulb, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AIPage() {
  const features = [
    {
      icon: Brain,
      title: "Advanced Natural Language Processing",
      description: "Understand and respond to complex queries with human-like comprehension"
    },
    {
      icon: MessageSquare,
      title: "Smart Document Analysis",
      description: "Extract insights and analyze documents with advanced AI capabilities"
    },
    {
      icon: Lightbulb,
      title: "Personalized Learning",
      description: "Adapt to your preferences and provide tailored recommendations"
    }
  ]

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Assistant</h1>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          Coming Soon
        </Badge>
      </div>

      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            AI Platform Under Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-8">
            <div className="py-6">
              <div className="relative mx-auto w-24 h-24">
                <div className="animate-ping absolute w-full h-full rounded-full bg-primary/20"></div>
                <div className="relative flex items-center justify-center w-full h-full rounded-full bg-primary/30">
                  <Bot className="h-12 w-12 text-primary" />
                  <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </div>

            <div className="max-w-lg mx-auto">
              <p className="text-lg text-muted-foreground">
                We're building an intelligent AI assistant to enhance your experience.
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
                Our team is working hard to bring you a powerful AI assistant.
                Stay tuned for updates!
              </p>
              
              <Button className="w-full" disabled>
                <Bot className="mr-2 h-4 w-4" />
                AI Assistant Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

