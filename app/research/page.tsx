"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, BookOpen, ArrowUpRight, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResearchArticle {
  id: string;
  title: string;
  author: string;
  abstract: string;
  category: string;
  publishDate: string;
  readTime: string;
  citations: number;
  imageUrl?: string;
}

export default function ResearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock research articles - In production, this would come from an API
  const articles: ResearchArticle[] = [
    {
      id: "1",
      title: "Advances in Quantum Computing",
      author: "Dr. Sarah Johnson",
      abstract: "Recent developments in quantum computing architecture and their implications for future technology.",
      category: "Computer Science",
      publishDate: "2025-02-01",
      readTime: "12 min",
      citations: 45,
      imageUrl: "/placeholder.svg?height=200&width=300"
    },
    {
      id: "2",
      title: "Machine Learning in Healthcare",
      author: "Dr. Michael Chen",
      abstract: "Applications of machine learning algorithms in diagnostic medicine and patient care.",
      category: "Healthcare",
      publishDate: "2025-01-28",
      readTime: "15 min",
      citations: 32,
      imageUrl: "/placeholder.svg?height=200&width=300"
    },
    // Add more mock articles as needed
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.abstract.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Research Articles</h1>
          <p className="text-muted-foreground">Explore the latest research in various fields</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          Submit Research
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="computer science">Computer Science</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="physics">Physics</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {article.imageUrl && (
              <div className="relative h-48">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold line-clamp-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground">{article.author}</p>
              </div>
              <p className="text-sm line-clamp-3">{article.abstract}</p>
              <div className="flex justify-between items-center pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {article.readTime}
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {article.citations} citations
                </div>
                <Button variant="ghost" size="icon">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
