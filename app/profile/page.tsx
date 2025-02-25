"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Sparkles, 
  MapPin, 
  LinkIcon, 
  Mail, 
  Shield, 
  Star,
  Heart,
  Share2,
  MessageSquare,
  Image as ImageIcon,
  Calendar,
  Trophy,
  Users,
  MoreHorizontal
} from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-optimized Header */}
      <div className="relative">
        <div className="h-32 sm:h-48 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm" />
        
        <div className="container max-w-4xl mx-auto px-4">
          <div className="relative -mt-16 sm:-mt-24 mb-6 flex flex-col items-center">
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-background shadow-xl">
              <AvatarImage src={`/placeholder.svg?text=${user?.name?.[0] || "U"}`} />
              <AvatarFallback className="text-4xl">{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            
            <div className="mt-4 text-center">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{user?.name || "User Name"}</h1>
                <div className="flex gap-2">
                  <Badge variant="premium" className="bg-gradient-to-r from-amber-500 to-orange-500">
                    <Sparkles className="h-3 w-3 mr-1" /> Pro
                  </Badge>
                  <Badge variant="outline" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    <Shield className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                </div>
              </div>
              <p className="text-lg font-medium text-muted-foreground mb-2">Senior Software Developer</p>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-4 px-4">
                Passionate about building beautiful user interfaces and solving complex problems. 
                Experienced in React, TypeScript, and modern web technologies.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-4">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Users className="h-4 w-4 mr-2" /> Connect
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" /> Message
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>

            {/* Mobile-friendly contact info */}
            <div className="w-full max-w-md">
              <Card className="border shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" /> Mumbai, India
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" /> {user?.email}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <LinkIcon className="h-4 w-4 shrink-0" /> github.com/username
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" /> Joined April 2023
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 pb-8">
        {/* Mobile-responsive Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Posts", value: "128", icon: Star, color: "from-blue-500 to-cyan-500" },
            { label: "Followers", value: "2.4K", icon: Users, color: "from-purple-500 to-pink-500" },
            { label: "Likes", value: "15.6K", icon: Heart, color: "from-rose-500 to-red-500" },
            { label: "Awards", value: "24", icon: Trophy, color: "from-amber-500 to-yellow-500" },
          ].map((stat) => (
            <Card key={stat.label} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10 mb-2`}>
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile-optimized Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-4 gap-1 bg-transparent p-0">
            {[
              { value: "posts", label: "Posts", icon: Star },
              { value: "media", label: "Media", icon: ImageIcon },
              { value: "likes", label: "Likes", icon: Heart },
              { value: "network", label: "Network", icon: Users },
            ].map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value}
                className="flex-col gap-1 py-2 px-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-xs">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[calc(100vh-24rem)] mt-6">
            <TabsContent value="posts">
              <div className="grid gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`/placeholder.svg?text=${user?.name?.[0]}`} />
                          <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{user?.name}</p>
                              <p className="text-xs text-muted-foreground">2h ago</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="mt-2 text-sm">
                            Just launched a new feature! 🚀 Really proud of this one.
                            #WebDev #Coding
                          </p>
                          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                            <Button variant="ghost" size="sm" className="h-8">
                              <Heart className="h-4 w-4 mr-2" />
                              <span className="text-xs">45</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              <span className="text-xs">12</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 ml-auto">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="media">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="aspect-square overflow-hidden group relative">
                    <img
                      src={`/placeholder.svg?height=300&width=300&text=Media+${i + 1}`}
                      alt={`Media ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 flex gap-2">
                        <div className="flex items-center gap-1 text-white text-xs">
                          <Heart className="h-4 w-4" /> 45
                        </div>
                        <div className="flex items-center gap-1 text-white text-xs">
                          <MessageSquare className="h-4 w-4" /> 12
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="likes">
              <div className="grid gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`/placeholder.svg?text=U${i}`} />
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">User {i + 1}</p>
                          <p className="text-xs text-muted-foreground">
                            You liked their post • 3d ago
                          </p>
                        </div>
                        <Heart className="h-4 w-4 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="network">
              <div className="grid gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`/placeholder.svg?text=C${i}`} />
                          <AvatarFallback>C{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold truncate">Sarah Connor {i + 1}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                Senior Developer at TechCorp
                              </p>
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>12 mutual</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="shrink-0">
                              Connect
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  )
}