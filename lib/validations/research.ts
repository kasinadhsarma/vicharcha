import { z } from "zod";

export const researchArticleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  author: z.string().min(3, "Author name must be at least 3 characters"),
  abstract: z.string().min(20, "Abstract must be at least 20 characters long"),
  category: z.string().min(2, "Category is required"),
  publishDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Publish date must be in YYYY-MM-DD format"),
  readTime: z.string().min(1, "Read time is required"),
  citations: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});
