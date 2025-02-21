"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Clock, TrendingUp, Star, Users, Filter } from "lucide-react";
import { CreatePost } from "@/app/feed/create-post/page";
import { Post } from "../../lib/types";
import Stories from "./stories/page";

const categoryFilters: string[] = ["all", "general", "news", "entertainment", "sports", "technology", "politics"];

interface MainContentProps {
  category: string;
  showStories?: boolean;
}

function MainContent({ category, showStories = false }: MainContentProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<string>("latest");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch(`/api/posts?category=${category}`);
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data: Post[] = await response.json();
        setPosts(data);
      } catch {
        toast({ variant: "destructive", title: "Error", description: "Could not load posts." });
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [category, toast]);

  const handleFilterChange = (selectedFilter: string) => {
    setFilterBy(selectedFilter);
    setIsFilterOpen(false);
  };

  if (loading) return <Skeleton className="h-20 w-full" />;

  return (
    <div className="w-full">
      {showStories && <Stories />}
      <CreatePost onPostCreated={async () => setLoading(true)} initialCategory={category} />

      <div className="flex flex-wrap items-center justify-between gap-6 py-4">
        <div className="flex gap-4">
          <Button variant={sortBy === "latest" ? "default" : "outline"} onClick={() => setSortBy("latest")}><Clock className="h-4 w-4" /> Latest</Button>
          <Button variant={sortBy === "trending" ? "default" : "outline"} onClick={() => setSortBy("trending")}><TrendingUp className="h-4 w-4" /> Trending</Button>
          <Button variant={sortBy === "top" ? "default" : "outline"} onClick={() => setSortBy("top")}><Star className="h-4 w-4" /> Top</Button>
          <Button variant={sortBy === "following" ? "default" : "outline"} onClick={() => setSortBy("following")}><Users className="h-4 w-4" /> Following</Button>
        </div>
        <div className="relative">
          <Button variant="outline" className="gap-2" onClick={() => setIsFilterOpen(!isFilterOpen)}><Filter className="h-4 w-4" /> Filter</Button>
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 border rounded-md shadow-lg bg-gray-800 text-white dark:bg-gray-700 dark:text-gray-200">
              {categoryFilters.map(filter => (
                <button
                  key={filter}
                  className={`block w-full px-4 py-2 text-left ${filterBy === filter ? 'bg-gray-600' : ''}`}
                  onClick={() => handleFilterChange(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {posts.map(post => (
          <motion.article key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div>{post.content}</div>
          </motion.article>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function FeedPage() {
  return <MainContent category="all" showStories={true} />;
}
