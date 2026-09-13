import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

const blogs = defineCollection({
  name: "blogs",
  directory: "content/blogs",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    updated: z.string().optional(),
    tags: z.array(z.string()).optional(),
    cover: z.string().optional(),
    author: z.string().optional(),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const code = await compileMDX(context, document);
    const filePath = document._meta.path;

    // Extract locale from filename
    // Format: filename.locale.mdx (e.g., article.zh.mdx, article.pt-BR.mdx)
    // or just filename.mdx (default to 'en')
    const match = filePath.match(/\.([a-z]{2}(?:-[A-Za-z]{2})?)$/);
    const locale = match ? match[1] : "en";

    // Generate slug without locale suffix
    const slug = filePath.replace(/\.[a-z]{2}(?:-[A-Za-z]{2})?$/, "");

    return {
      ...document,
      slug,
      locale,
      code,
    };
  },
});

export default defineConfig({
  collections: [blogs],
});
