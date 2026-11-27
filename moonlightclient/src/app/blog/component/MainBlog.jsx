"use client";

import BlogCard from "./desing/BlogCard";
import { useState } from "react";

const INITIAL_POST_COUNT = 10;
const POSTS_PER_LOAD = 12;

export default function MainBlog({ posts, loadError = false }) {
  const [visiblePostCount, setVisiblePostCount] = useState(
    Math.min(INITIAL_POST_COUNT, posts.length),
  );
  const visiblePosts = posts.slice(0, visiblePostCount);

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
            <BlogCard post={visiblePosts[0]} variant="featured" />

            {visiblePosts.length > 1 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                {visiblePosts.slice(1, 3).map((post) => (
                  <BlogCard key={post.slug} post={post} variant="grid" />
                ))}
              </div>
            )}

            {visiblePosts.length > 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  More from the journal
                </h2>
                <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-4 sm:px-6">
                  {visiblePosts.slice(3).map((post) => (
                    <BlogCard key={post.slug} post={post} />
                  ))}
                </div>
              </div>
            )}

            {visiblePostCount < posts.length && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisiblePostCount((count) =>
                      Math.min(count + POSTS_PER_LOAD, posts.length),
                    )
                  }
                  className="rounded-full border border-blue-800 px-6 py-3 text-sm font-bold text-blue-800 transition-colors hover:bg-blue-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  Show more
                </button>
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
