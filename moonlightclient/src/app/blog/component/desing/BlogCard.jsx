import Image from "next/image";
import Link from "next/link";

export default function BlogCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group mb-2 mt-12 w-full flex h-auto bg-gray-50 cursor-pointer flex-col items-start gap-4 px-4 sm:h-[120px] sm:flex-row sm:items-center sm:gap-5 md:px-0"
    >
      <div className="relative h-[180px] w-full flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-[110px] sm:w-[180px]">
        <Image
          src={post.image_url || "/logo.png"}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          alt={post.blog_title || "Blog thumbnail"}
          fill
          sizes="(max-width: 640px) 100vw, 180px"
        />
      </div>

      <article className="flex h-fit w-full flex-col justify-between py-0.5">
        <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
          <span className="text-gray-600">Moonlight Machinery</span>
          {post.created_at && (
            <>
              <span aria-hidden="true">•</span>
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

        <div className="space-y-1 mt-1 sm:mt-0">
          <h2 className="line-clamp-1 text-base font-semibold text-gray-900 transition-colors group-hover:text-blue-600 sm:text-lg">
            {post.blog_title}
          </h2>
          <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
            {post.blog_description}
          </p>
        </div>
      </article>
    </Link>
  );
}