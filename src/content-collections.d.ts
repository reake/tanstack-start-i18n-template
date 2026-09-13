declare module "content-collections" {
  type Blog = {
    title: string;
    description: string;
    date: string;
    updated?: string;
    tags?: string[];
    cover?: string;
    author?: string;
    locale: string;
    content: string;
    code: string;
    slug: string;
    _meta: {
      path: string;
      filePath: string;
      fileName: string;
      directory: string;
      extension: string;
    };
  };

  export const allBlogs: Blog[];
}
