import BlogPostPage from "../component/desing/BlogView";
import { getPublicBlogBySlug } from "@/services/public/BlogService";
import connectDB from "@/db/mongodb/db";
import Product from "@/db/mongodb/product/productModule_fixed";
import { getBlogProductSlugs } from "@/lib/blogProducts";
import { notFound } from "next/navigation";

const SITE_URL = "https://www.moonlightmachinery.com";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getPublicBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog post not found | Moonlight Machinery",
      robots: { index: false, follow: true },
    };
  }

  const url = `${SITE_URL}/blog/${slug}`;
  const title = blog.blog_title?.trim() || "Moonlight Machinery Blog";
  const description =
    blog.blog_description?.trim().slice(0, 160) ||
    `Read ${title} on the Moonlight Machinery blog.`;
  const image = blog.image_url || blog.images?.[0] || "/logo.png";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: "Moonlight Machinery",
      publishedTime: blog.created_at || undefined,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPage({ params }) {
  const { slug } = await params;
  const blog = await getPublicBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const productSlugs = getBlogProductSlugs(blog.content);
  let products = [];

  if (productSlugs.length) {
    await connectDB();
    const productRecords = await Product.find({ slug: { $in: productSlugs } })
      .select(
        "name slug sku description category machineType pricing images specifications features",
      )
      .lean();
    const productsBySlug = new Map(
      productRecords.map((product) => [product.slug, product]),
    );
    products = productSlugs
      .map((productSlug) => productsBySlug.get(productSlug))
      .filter(Boolean);
  }

  const url = `${SITE_URL}/blog/${slug}`;
  const image = blog.image_url || blog.images?.[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: blog.blog_title,
        description: blog.blog_description || "",
        image: image ? [image] : undefined || "/logo.png",
        datePublished: blog.created_at || undefined,
        dateModified: blog.updated_at || blog.created_at || undefined,
        author: {
          "@type": "Organization",
          name: "Moonlight Machinery",
        },
        publisher: {
          "@type": "Organization",
          name: "Moonlight Machinery",
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/android-chrome-512x512.png`,
          },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blogs",
            item: `${SITE_URL}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: blog.blog_title,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <>
      <BlogPostPage data={blog} products={products} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
