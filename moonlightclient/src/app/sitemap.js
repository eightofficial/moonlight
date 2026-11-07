import connectDB from "@/db/mongodb/db";
import Product from "@/db/mongodb/product/productModule_fixed";
import { getPublicBlogs } from "@/services/public/BlogService";

const SITE_URL = "https://www.moonlightmachinery.com";

export const dynamic = "force-dynamic";

const staticPaths = [
  "/",
  "/getway",
  "/home",
  "/home/about",
  "/home/cart",
  "/home/contact",
  "/home/machines",
  "/home/privacy",
  "/home/return-policy",
  "/blog",
];

export default async function sitemap() {
  const [blogs] = await Promise.all([getPublicBlogs(), connectDB()]);
  const products = await Product.find({ slug: { $exists: true, $ne: "" } })
    .select("slug createdAt updatedAt")
    .lean();

  return [
    ...staticPaths.map((path) => ({
      url: new URL(path, SITE_URL).toString(),
      changeFrequency: "daily",
      priority: 0.7,
    })),
    ...products
      .filter((product) => product.slug)
      .map((product) => ({
        url: new URL(
          `/home/machines/${encodeURIComponent(product.slug)}`,
          SITE_URL,
        ).toString(),
        lastModified: product.updatedAt || product.createdAt,
        changeFrequency: "weekly",
        priority: 0.7,
      })),
    ...blogs
      .filter((blog) => blog.slug)
      .map((blog) => ({
        url: new URL(`/blog/${encodeURIComponent(blog.slug)}`, SITE_URL).toString(),
        lastModified: blog.created_at ? new Date(blog.created_at) : undefined,
        changeFrequency: "daily",
        priority: 0.8,
      })),
  ];
}
