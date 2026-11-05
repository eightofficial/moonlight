import Image from "next/image";
import Link from "next/link";

function PostMeta({ post }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
      <span className="text-slate-700">Moonlight Machinery</span>
      {post.created_at && (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })}
          </time>
        </>
      )}
    </div>
  );
}

export default function BlogCard({ post, variant = "list" }) {
  if (variant === "featured") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl md:grid-cols-2"
      >
        <div className="relative min-h-64 overflow-hidden bg-slate-100 sm:min-h-80 md:min-h-[390px]">
          <Image
            src={post.image_url || "/logo.png"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            alt={post.blog_title || "Blog thumbnail"}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <span className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-800 shadow-sm">
            Featured article
          </span>
        </div>
        <article className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
          <PostMeta post={post} />
          <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-slate-950 transition-colors group-hover:text-blue-800 sm:text-3xl lg:text-4xl">
            {post.blog_title}
          </h2>
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600 sm:text-base">
            {post.blog_description}
          </p>
          <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-blue-800">
            Read the article
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </article>
      </Link>
    );
  }

  if (variant === "grid") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <Image
            src={post.image_url || "/logo.png"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            alt={post.blog_title || "Blog thumbnail"}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <article className="flex flex-1 flex-col p-5 sm:p-6">
          <PostMeta post={post} />
          <h2 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-slate-950 transition-colors group-hover:text-blue-800 sm:text-xl">
            {post.blog_title}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {post.blog_description}
          </p>
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-blue-800">
            Read article <span aria-hidden="true">→</span>
          </span>
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex w-full flex-col items-start gap-4 py-5 first:pt-4 sm:flex-row sm:items-center sm:gap-6"
    >
      <div className="relative h-48 w-full flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-44">
        <Image
          src={post.image_url || "/logo.png"}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          alt={post.blog_title || "Blog thumbnail"}
          fill
          sizes="(max-width: 640px) 100vw, 176px"
        />
      </div>

      <article className="w-full">
        <PostMeta post={post} />
        <h2 className="mt-2 line-clamp-2 text-base font-semibold text-slate-950 transition-colors group-hover:text-blue-800 sm:text-lg">
          {post.blog_title}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {post.blog_description}
        </p>
      </article>
    </Link>
  );
}