import BlogCard from "./desing/BlogCard";

export default function MainBlog({ posts, loadError = false }) {
  return (
    <section className="flex w-full justify-center">
      <div className="blog-containe  w-full max-w-300 justify-center gap-4">
        {loadError ? (
          <p role="alert" className="px-4 py-16 text-center text-gray-600">
            Blog posts are temporarily unavailable. Please try again later.
          </p>
        ) : posts.length > 0 ? (
          posts.map((post) => <BlogCard key={post.slug} post={post} />)
        ) : (
          <p className="px-4 py-16 text-center text-gray-600">
            No blog posts are available yet.
          </p>
        )}
      </div>
    </section>
  );
}
