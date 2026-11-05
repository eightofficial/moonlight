import Image from "next/image";
import React from "react";
import edjsHTML from "editorjs-html";

// Helper functions for custom parsers
function escapeHtml(str = "") {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function slugifyHeading(text = "") {
    return text
        .toLowerCase()
        .replace(/<[^>]*>?/gm, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

// Custom parsers enhanced with Tailwind CSS utility classes for gorgeous UI styling
const customParsers = {
    checklist: (block) => {
        const items = (block.data?.items || [])
            .map(
                (item) => `
          <li class="flex items-start gap-3 my-2 ${item.checked ? "line-through text-gray-400" : "text-gray-700"}">
            <span class="flex items-center justify-center w-5 h-5 mt-0.5 rounded border ${item.checked ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 bg-white"} text-xs">${item.checked ? "✓" : ""}</span>
            <span class="text-base">${item.text}</span>
          </li>`,
            )
            .join("");
        return `<ul class="my-6 space-y-1 list-none p-0">${items}</ul>`;
    },

    delimiter: () => `<div class="flex items-center justify-center my-10 text-gray-400 tracking-widest text-xl">•••</div>`,

    code: (block) =>
        `<pre class="my-6 p-4 rounded-xl bg-gray-900 text-gray-100 overflow-x-auto text-sm font-mono shadow-inner"><code>${escapeHtml(block.data?.code || "")}</code></pre>`,

    header: (block) => {
        const level = Math.min(Math.max(block.data?.level || 2, 1), 6);
        const styles = {
            1: "text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mt-10 mb-4",
            2: "text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-8 mb-4",
            3: "text-xl sm:text-2xl font-semibold text-gray-900 mt-6 mb-3",
            4: "text-lg font-semibold text-gray-900 mt-4 mb-2",
            5: "text-base font-semibold text-gray-900 mt-4 mb-2",
            6: "text-sm font-semibold text-gray-900 mt-4 mb-2",
        };
        return `<h${level} id="${slugifyHeading(block.data?.text)}" class="${styles[level] || styles[2]}">${block.data?.text || ""}</h${level}>`;
    },

    paragraph: (block) => `<p class="text-base sm:text-lg text-gray-700 leading-relaxed my-4">${block.data?.text || ""}</p>`,

    list: (block) => {
        const tag = block.data?.style === "ordered" ? "ol" : "ul";
        const listStyle = tag === "ol" ? "list-decimal" : "list-disc";
        const items = (block.data?.items || [])
            .map(
                (item) => `<li class="my-1.5 pl-1">${typeof item === "string" ? item : item.content}</li>`,
            )
            .join("");
        return `<${tag} class="${listStyle} list-inside my-6 space-y-2 text-gray-700 text-base sm:text-lg">${items}</${tag}>`;
    },

    quote: (block) => `
    <figure class="my-8 pl-6 border-l-4 border-blue-600 bg-blue-50/50 py-4 pr-4 rounded-r-xl">
      <blockquote class="text-lg italic text-gray-800 font-medium">${block.data?.text || ""}</blockquote>
      ${block.data?.caption ? `<figcaption class="mt-2 text-sm text-gray-500 font-semibold">— ${block.data.caption}</figcaption>` : ""}
    </figure>`,

    warning: (block) => `
    <div class="my-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col gap-1 shadow-sm" role="alert">
      ${block.data?.title ? `<strong class="font-bold text-amber-940 flex items-center gap-2">⚠️ ${block.data.title}</strong>` : ""}
      <p class="text-base m-0 text-amber-800">${block.data?.message || ""}</p>
    </div>`,

    alert: (block) => `
    <div class="my-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 shadow-sm" role="status">
      <p class="text-base m-0">${block.data?.message || ""}</p>
    </div>`,

    image: (block) => {
        const url = block.data?.file?.url || block.data?.url || "";
        const caption = block.data?.caption || "";
        const withBorder = block.data?.withBorder ? "border border-gray-200" : "";
        const stretched = block.data?.stretched ? "w-full" : "max-w-full mx-auto rounded-2xl shadow-md";
        return `
      <figure class="my-8 ${stretched}">
        <img src="${url}" alt="${caption || "Article image"}" class="w-full h-auto object-cover rounded-xl ${withBorder}" loading="lazy" />
        ${caption ? `<figcaption class="text-center text-sm text-gray-500 mt-3 italic">${caption}</figcaption>` : ""}
      </figure>`;
    },

    table: (block) => {
        const rows = block.data?.content || [];
        const [head, ...body] = rows;
        const hasHeadings = !!block.data?.withHeadings && head;
        const headHtml = hasHeadings
            ? `<thead class="bg-gray-100 text-gray-700 text-sm uppercase font-semibold"><tr>${head.map((c) => `<th class="px-4 py-3 border-b border-gray-200 text-left">${c}</th>`).join("")}</tr></thead>`
            : "";
        const bodyRows = hasHeadings ? body : rows;
        const bodyHtml = `<divide class="divide-y divide-gray-200">${bodyRows
            .map((row) => `<tr class="hover:bg-gray-50/50 transition-colors">${row.map((c) => `<td class="px-4 py-3 text-gray-700 text-sm">${c}</td>`).join("")}</tr>`)
            .join("")}</divide>`;
        return `<div class="my-8 overflow-x-auto rounded-xl border border-gray-200 shadow-sm"><table class="w-full text-left border-collapse bg-white">${headHtml}<tbody class="divide-y divide-gray-200">${bodyHtml}</tbody></table></div>`;
    },

    embed: (block) => `
    <div class="my-8 overflow-hidden rounded-xl shadow-md bg-gray-100 aspect-video">
      <iframe
        src="${block.data?.embed || ""}"
        title="${block.data?.caption || "Embedded content"}"
        class="w-full h-full border-0"
        loading="lazy"
        allowfullscreen
      ></iframe>
      ${block.data?.caption ? `<p class="text-center text-sm text-gray-500 p-2 italic">${block.data.caption}</p>` : ""}
    </div>`,

    raw: (block) => `<div class="my-6">${block.data?.html || ""}</div>`,
};

const edjsParser = edjsHTML(customParsers);

export default async function BlogPostPage({ data }) {
    if (!data) {
        return <div className="text-center py-20 text-gray-500">Blog post not found.</div>;
    }

    let contentObj = data.content;
    if (typeof contentObj === "string") {
        try {
            contentObj = JSON.parse(contentObj);
        } catch (e) {
            console.error("Error parsing content string:", e);
            contentObj = { blocks: [] };
        }
    }

    const formattedData = Array.isArray(contentObj)
        ? { blocks: contentObj }
        : contentObj || { blocks: [] };

    const parsedBlocks = formattedData.blocks
        .map((block, idx) => {
            try {
                const parserFn = customParsers[block.type];
                if (parserFn) return parserFn(block);

                const result = edjsParser.parse({ blocks: [block] });
                return Array.isArray(result) ? result[0] : "";
            } catch (err) {
                console.error(`Failed to render block #${idx} (type: "${block.type}")`, err);
                return "";
            }
        })
        .filter(Boolean);

    return (
        <article className="min-h-screen bg-white px-4 py-8 sm:py-16">
            <div className="mx-auto max-w-[1000px]">
                
                {/* Blog Header / Meta */}
                <div className="space-y-4 mb-10 border-b border-gray-100 pb-8">
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 font-medium">
                        <span className="text-gray-900 font-semibold">Moonlight Machinery</span>
                        <span>•</span>
                        <span>{data.readingTime || "5 min read"}</span>
                        <span>•</span>
                        <time dateTime={data.created_at || undefined}>
                            {data.created_at
                                ? new Date(data.created_at).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    timeZone: "UTC",
                                })
                                : "Recent"}
                        </time>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                        {data.blog_title}
                    </h1>

                    <p className="text-lg text-gray-600 leading-relaxed">
                        {data.blog_description}
                    </p>
                </div>

                {/* Featured Cover Image */}
                {/* {(data.image_url || data.images?.[0]) && (
                    <div className="relative w-full h-[280px] sm:h-[400px] mb-12 overflow-hidden rounded-2xl shadow-md bg-gray-100">
                        <Image
                            src={data.image_url || data.images[0]}
                            alt={data.blog_title || "Blog cover"}
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>
                )} */}

                {/* Styled Content Container */}
                <div className="blog-content-body">
                    {parsedBlocks.map((htmlString, index) => (
                        <div
                            key={`block-${index}`}
                            dangerouslySetInnerHTML={{ __html: htmlString }}
                        />
                    ))}
                </div>

            </div>
        </article>
    );
}