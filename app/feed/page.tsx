"use client"

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Clock, TrendingUp, Star, Users, Filter, MessageSquare, Share } from "lucide-react";
import { CreatePost } from "@/app/feed/create-post/page";
import { Post } from "../../lib/types";
import Stories from "./stories/page";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

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
  const filterRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

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

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        {showStories && <Stories />}
        <CreatePost onPostCreated={async () => setLoading(true)} initialCategory={category} />

        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={sortBy === "latest" ? "default" : "outline"} 
              onClick={() => setSortBy("latest")}
              className="gap-2 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Clock className="h-4 w-4" /> Latest
            </Button>
            <Button 
              variant={sortBy === "trending" ? "default" : "outline"} 
              onClick={() => setSortBy("trending")}
              className="gap-2 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <TrendingUp className="h-4 w-4" /> Trending
            </Button>
            <Button 
              variant={sortBy === "top" ? "default" : "outline"} 
              onClick={() => setSortBy("top")}
              className="gap-2 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Star className="h-4 w-4" /> Top
            </Button>
            <Button 
              variant={sortBy === "following" ? "default" : "outline"} 
              onClick={() => setSortBy("following")}
              className="gap-2 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Users className="h-4 w-4" /> Following
            </Button>
          </div>
          <div className="relative">
            <Button 
              variant="outline" 
              className={cn(
                "gap-2 transition-colors",
                isFilterOpen && "bg-accent text-accent-foreground"
              )}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4" /> 
              Filter
              {filterBy !== "all" && (
                <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  {filterBy}
                </span>
              )}
            </Button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 border rounded-md shadow-lg bg-background">
                {categoryFilters.map(filter => (
                  <button
                    key={filter}
                    className={`block w-full px-4 py-2 text-left hover:bg-accent transition-colors ${
                      filterBy === filter ? 'bg-accent/50 font-medium' : ''
                    }`}
                    onClick={() => handleFilterChange(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <AnimatePresence>
          {posts.map(post => (
            <motion.article key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-4">
              <Card className="w-full border-none bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
                <CardHeader className="pb-3 space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div>
                      <p className="font-semibold leading-none">{post.username || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {post.category && (
                    <div className="text-xs font-medium text-muted-foreground">
                      in {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="text-sm space-y-4">
                    <div className="whitespace-pre-wrap">{post.content}</div>
                    {post.mediaUrls?.length > 0 && (
                      <div className="grid gap-2 mt-2">
                        {post.mediaUrls.map((url, index) => (
                          <Image 
                            key={index}
                            src={url} 
                            alt="Post media"
                            width={800}
                            height={600}
                            className="rounded-lg max-h-96 w-full object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      {post.likes || 0}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {post.comments || 0} Comments
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </CardFooter>
              </Card>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function FeedPage() {
  return <MainContent category="all" showStories={true} />;
}
