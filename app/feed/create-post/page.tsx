"use client"

import { type Post } from "@/lib/types"
import { CreatePostForm } from "../components/create-post-form"

export default function CreatePostPage() {
  const handlePostCreated = async (post: Post) => {
    console.log('Post created:', post)
  }

  return (
    <div className="container max-w-3xl mx-auto py-6">
      <CreatePostForm onPostCreated={handlePostCreated} />
    </div>
  )
}
