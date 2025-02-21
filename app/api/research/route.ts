import { NextRequest, NextResponse } from 'next/server';
import { mockDB } from '@/lib/mock-db';
import { types } from 'cassandra-driver';

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

// Mock data - In production, this would come from a database
const mockArticles: ResearchArticle[] = [
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
  {
    id: "3",
    title: "Sustainable Energy Solutions",
    author: "Dr. Emily Williams",
    abstract: "Innovative approaches to renewable energy generation and storage systems.",
    category: "Engineering",
    publishDate: "2025-01-25",
    readTime: "18 min",
    citations: 28,
    imageUrl: "/placeholder.svg?height=200&width=300"
  },
  {
    id: "4",
    title: "Dark Matter Detection Methods",
    author: "Dr. Robert Kim",
    abstract: "New experimental approaches to detecting dark matter particles.",
    category: "Physics",
    publishDate: "2025-01-20",
    readTime: "20 min",
    citations: 56,
    imageUrl: "/placeholder.svg?height=200&width=300"
  }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();

    let filteredArticles = [...mockArticles];

    // Apply category filter
    if (category && category !== 'all') {
      filteredArticles = filteredArticles.filter(
        article => article.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply search filter
    if (search) {
      filteredArticles = filteredArticles.filter(
        article =>
          article.title.toLowerCase().includes(search) ||
          article.abstract.toLowerCase().includes(search) ||
          article.author.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(filteredArticles);
  } catch (error) {
    console.error('Error fetching research articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.abstract || !data.author || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const articleId = types.Uuid.random().toString();
    const now = new Date();
    
    const newArticle: ResearchArticle = {
      id: articleId,
      title: data.title,
      author: data.author,
      abstract: data.abstract,
      category: data.category,
      publishDate: now.toISOString(),
      readTime: `${Math.ceil(data.abstract.length / 1000)} min`,
      citations: 0,
      imageUrl: data.imageUrl || "/placeholder.svg?height=200&width=300"
    };

    // In a real app, save to database
    // await mockDB.query(
    //   'INSERT INTO research_articles (...) VALUES (...)',
    //   [...]
    // );

    return NextResponse.json(newArticle);
  } catch (error) {
    console.error('Error creating research article:', error);
    return NextResponse.json(
      { error: 'Failed to create research article' },
      { status: 500 }
    );
  }
}
