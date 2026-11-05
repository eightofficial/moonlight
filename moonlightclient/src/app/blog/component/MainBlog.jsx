import BlogCard from "./desing/BlogCard";

export default function MainBlog({ posts, loadError = false }) {
  return (
    <section className="w-full bg-[#f7f8fa] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-9 max-w-2xl sm:mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Moonlight Machinery Journal
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Ideas for your next big move.
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
            Practical guides, industry insights, and inspiration for building a
            smarter manufacturing business.
          </p>
        </header>

        {loadError ? (
          <p
            role="alert"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-16 text-center text-slate-600"
          >
            Blog posts are temporarily unavailable. Please try again later.
          </p>
        ) : posts.length > 0 ? (
          <div className="space-y-10 sm:space-y-12">
            <BlogCard post={posts[0]} variant="featured" />

            {posts.length > 1 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                {posts.slice(1, 3).map((post) => (
                  <BlogCard key={post.slug} post={post} variant="grid" />
                ))}
              </div>
            )}

            {posts.length > 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  More from the journal
                </h2>
                <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-4 sm:px-6">
                  {posts.slice(3).map((post) => (
                    <BlogCard key={post.slug} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-16 text-center text-slate-600">
            No blog posts are available yet.
          </p>
        )}
      </div>
    </section>
  );
}
