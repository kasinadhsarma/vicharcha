"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  MapPin, 
  Clock, 
  Briefcase, 
  Users,
  Search,
  Filter,
  Bookmark,
  Share2,
  MessageSquare,
  UserPlus,
  Bell,
  Linkedin,
  Twitter,
  Globe,
  Mail,
  Image,
  Link2
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  postedDate: string
  description: string
  requirements: string[]
  salary?: string
  applicants?: number
}

interface Connection {
  id: string
  name: string
  title: string
  company: string
  mutualConnections: number
  avatar: string
  skills: string[]
  isFollowing: boolean
}

const JobPost = ({ job }: { job: Job }) => (
  <Card className="mb-4 hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-xl text-primary">{job.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground font-medium">{job.company}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{job.postedDate}</span>
            </div>
            {job.salary && (
              <Badge variant="secondary" className="font-normal">
                {job.salary}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {job.requirements.map((req, index) => (
              <Badge key={index} variant="outline">
                {req}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{job.applicants || 0} applicants</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
              <Button>Apply Now</Button>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

const CreateJobPost = () => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt="Profile" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Input 
              placeholder="Share a job opportunity..."
              className="border-none bg-transparent focus-visible:ring-0"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Image className="mr-2 h-4 w-4" />
              Add Media
            </Button>
            <Button variant="outline" className="flex-1">
              <Link2 className="mr-2 h-4 w-4" />
              Add Link
            </Button>
          </div>
          <Button className="w-full">
            <Briefcase className="mr-2 h-4 w-4" />
            Create Job Post
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const NetworkProfile = ({ connection }: { connection: Connection }) => (
  <Card className="mb-4 hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={connection.avatar} alt={connection.name} />
          <AvatarFallback>{connection.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{connection.name}</h3>
              <p className="text-sm text-muted-foreground">{connection.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{connection.company}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              {connection.isFollowing ? (
                <Button variant="secondary" size="sm">Following</Button>
              ) : (
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {connection.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="font-normal">
                {skill}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center gap-4 pt-3 mt-3 border-t">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{connection.mutualConnections} mutual connections</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

const NetworkStats = () => (
  <div className="grid grid-cols-3 gap-4 mb-6">
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <h4 className="text-2xl font-bold">486</h4>
          <p className="text-sm text-muted-foreground">Total Connections</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <h4 className="text-2xl font-bold">32</h4>
          <p className="text-sm text-muted-foreground">Profile Views</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <h4 className="text-2xl font-bold">12</h4>
          <p className="text-sm text-muted-foreground">Pending Invites</p>
        </div>
      </CardContent>
    </Card>
  </div>
)

const NetworkSearch = () => (
  <Card className="mb-6">
    <CardContent className="p-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search your network..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Grow Network
        </Button>
      </div>
    </CardContent>
  </Card>
)

export default function SocialPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [connections, setConnections] = useState<Connection[]>([])

  useEffect(() => {
    setJobs([
      {
        id: "1",
        title: "Senior Software Engineer",
        company: "TechCorp",
        location: "Remote",
        type: "Full-time",
        postedDate: "2 days ago",
        salary: "$130,000 - $180,000",
        applicants: 45,
        description: "We're looking for an experienced software engineer to join our team and help build scalable solutions for enterprise clients...",
        requirements: ["React", "Node.js", "5+ years", "Cloud", "System Design"],
      },
      {
        id: "2",
        title: "Product Designer",
        company: "DesignHub",
        location: "New York, NY",
        type: "Full-time",
        postedDate: "1 day ago",
        salary: "$90,000 - $130,000",
        applicants: 28,
        description: "Join our design team to create beautiful and functional products that delight users and solve real business problems...",
        requirements: ["Figma", "UI/UX", "Design Systems", "User Research"],
      },
    ])

    setConnections([
      {
        id: "1",
        name: "Sarah Chen",
        title: "Senior Product Designer",
        company: "DesignCo",
        mutualConnections: 15,
        avatar: "/placeholder.svg",
        skills: ["UI/UX", "Design Systems", "User Research"],
        isFollowing: true
      },
      {
        id: "2",
        name: "Michael Rodriguez",
        title: "Engineering Manager",
        company: "TechStart",
        mutualConnections: 23,
        avatar: "/placeholder.svg",
        skills: ["Leadership", "React", "System Architecture"],
        isFollowing: false
      },
      {
        id: "3",
        name: "Emma Watson",
        title: "Marketing Director",
        company: "GrowthLabs",
        mutualConnections: 8,
        avatar: "/placeholder.svg",
        skills: ["Digital Marketing", "Brand Strategy", "Analytics"],
        isFollowing: true
      }
    ])
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Professional Network</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="jobs" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Jobs
              </TabsTrigger>
              <TabsTrigger value="network">
                <Users className="mr-2 h-4 w-4" />
                Network
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="mt-0">
              <CreateJobPost />
              <ScrollArea className="h-[calc(100vh-16rem)] min-h-[400px]">
                <AnimatePresence>
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <JobPost job={job} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="network" className="mt-0">
              <NetworkStats />
              <NetworkSearch />
              <ScrollArea className="h-[calc(100vh-24rem)] min-h-[400px]">
                <AnimatePresence>
                  {connections.map((connection, index) => (
                    <motion.div
                      key={connection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <NetworkProfile connection={connection} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}