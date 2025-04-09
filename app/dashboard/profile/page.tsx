"use client"

import { useState } from "react"
import { useAuth } from "@/app/login/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import CreateJobPost from "./components/create-job-post"
import { Sparkles, MapPin, LinkIcon, Mail, Phone, Edit, Shield, Star } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("posts")

  return (
    <div className="container max-w-4xl mx-auto py-8">
      {/* Profile Header */}
      <Card className="relative mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 opacity-20" />
        <div className="h-32 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500" />
        <CardContent className="relative -mt-16 p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={`/placeholder.svg?text=${user?.name?.[0] || "U"}`} />
              <AvatarFallback className="text-4xl">{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-3xl font-bold">{user?.name || "User Name"}</h1>
                <Badge variant="premium" className="bg-gradient-to-r from-amber-500 to-orange-500">
                  <Sparkles className="h-3 w-3 mr-1" /> Premium
                </Badge>
                <Badge variant="outline" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <Shield className="h-3 w-3 mr-1" /> Verified
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">Software Developer & Tech Enthusiast</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Mumbai, India
                </div>
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" /> github.com/username
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" /> {user?.email || "email@example.com"}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" /> {user?.phoneNumber || "+91 XXXXX XXXXX"}
                </div>
              </div>
            </div>
            <Button className="absolute top-6 right-6" variant="outline">
              <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Posts", value: "128", icon: Star },
          { label: "Followers", value: "2.4K", icon: Star },
          { label: "Following", value: "1.2K", icon: Star },
          { label: "Connections", value: "500+", icon: Star },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="create-job-post">Create Job Post</TabsTrigger>
        </TabsList>
        <ScrollArea className="h-[500px] mt-6">
          <TabsContent value="posts">
            <div className="grid gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg?text=${user?.name?.[0] || "U"}`} />
                        <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user?.name || "User Name"}</p>
                        <p className="text-sm text-muted-foreground">Posted 2 hours ago</p>
                      </div>
                    </div>
                    <p>This is a sample post content. In a real app, this would be actual user content.</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="media">
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="aspect-square">
                  <CardContent className="p-0">
                    <img
                      src={`/placeholder.svg?height=300&width=300&text=Media+${i + 1}`}
                      alt={`Media ${i + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="likes">
            <div className="grid gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">Liked posts will appear here</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="connections">
            <div className="grid gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={`/placeholder.svg?text=C${i}`} />
                          <AvatarFallback>C{i}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">Connection {i + 1}</p>
                          <p className="text-sm text-muted-foreground">Professional Title</p>
                        </div>
                      </div>
                      <Button variant="outline">Message</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="create-job-post">
            <CreateJobPost />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
