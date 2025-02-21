"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Plus } from "lucide-react"

export function GroupChat() {
  const [groupName, setGroupName] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const users = [
    { id: "1", name: "Alice Johnson", avatar: "/placeholder.svg?1" },
    { id: "2", name: "Bob Smith", avatar: "/placeholder.svg?2" },
    { id: "3", name: "Charlie Brown", avatar: "/placeholder.svg?3" },
    // Add more users as needed
  ]

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleCreateGroup = () => {
    // Logic to create the group chat
    console.log("Creating group:", groupName, "with users:", selectedUsers)
    // Reset state and close dialog
    setGroupName("")
    setSelectedUsers([])
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="mr-2 h-4 w-4" />
          New Group Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="group-name"
              placeholder="Group Name"
              className="col-span-4"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px] w-full rounded-md border">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-4 p-4 hover:bg-accent cursor-pointer"
                onClick={() => handleUserSelect(user.id)}
              >
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                </div>
                {selectedUsers.includes(user.id) && <div className="h-4 w-4 rounded-full bg-primary" />}
              </div>
            ))}
          </ScrollArea>
        </div>
        <Button onClick={handleCreateGroup} disabled={!groupName || selectedUsers.length < 2}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </DialogContent>
    </Dialog>
  )
}

