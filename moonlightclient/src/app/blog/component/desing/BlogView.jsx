import Image from "next/image";
import Link from "next/link";
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

export default async function BlogPostPage({ data, products = [] }) {
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

                {products.length > 0 && (
                    <section
                        aria-labelledby="blog-products-heading"
                        className="mt-14 border-t border-gray-200 pt-10"
                    >
                        <h2
                            id="blog-products-heading"
                            className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl"
                        >
                            Products mentioned in this article
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            {products.map((product) => {
                                const images = product.images?.filter(
                                    (item) => typeof item === "string" && item.trim(),
                                ) || [];
                                const specs = product.specifications || {};
                                const dimensions = specs.dimensions;
                                const specificationRows = [
                                    ["SKU", product.sku],
                                    ["Category", product.category],
                                    ["Machine type", product.machineType],
                                    ["Production capacity", specs.productionCapacity],
                                    ["Motor", specs.motor],
                                    ["Total power", specs.totalPower],
                                    ["Power source", specs.powerSource],
                                    ["Voltage", specs.voltage],
                                    ["Phase", specs.phase],
                                    ["Weight", specs.weight],
                                    ["Raw material", specs.rawMaterial],
                                    ["Plate size", specs.plateSizeRange],
                                    ["Roller size", specs.rollerSize],
                                    ["Drive", specs.drive],
                                    ["Paper cup size", specs.paperCupSizeRange],
                                    ["Electricity estimate", specs.electricityBillEstimate],
                                ].filter(([, value]) => value);

                                if (
                                    dimensions &&
                                    [dimensions.length, dimensions.width, dimensions.height].some(
                                        (value) => value != null,
                                    )
                                ) {
                                    specificationRows.push([
                                        "Dimensions",
                                        [
                                            dimensions.length,
                                            dimensions.width,
                                            dimensions.height,
                                        ]
                                            .filter((value) => value != null)
                                            .join(" × ") +
                                            ` ${dimensions.unit || "inch"}`,
                                    ]);
                                }

                                const basePrice = Number(product.pricing?.basePrice);
                                const price =
                                    Number.isFinite(basePrice) && basePrice > 0
                                        ? `₹${basePrice.toLocaleString("en-IN")}`
                                        : product.pricing?.priceLabel || "Contact for price";

                                return (
                                    <article
                                        key={product.slug}
                                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                    >
                                        <Link
                                            href={`/home/machines/${encodeURIComponent(product.slug)}`}
                                            className="block"
                                            aria-label={`View ${product.name}`}
                                        >
                                            <div className="relative aspect-[16/10] bg-gray-100">
                                                {images[0] ? (
                                                    <Image
                                                        src={images[0]}
                                                        alt={product.name}
                                                        fill
                                                        unoptimized
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                                        Product image unavailable
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                {images.length > 1 && (
                                                    <div className="mb-4 flex gap-2 overflow-hidden">
                                                        {images.slice(1, 4).map((imageUrl, index) => (
                                                            <Image
                                                                key={imageUrl}
                                                                src={imageUrl}
                                                                alt={`${product.name} image ${index + 2}`}
                                                                width={96}
                                                                height={64}
                                                                unoptimized
                                                                className="h-16 w-24 rounded-md object-cover"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {product.name}
                                                    </h3>
                                                    <span className="whitespace-nowrap font-bold text-blue-800">
                                                        {price}
                                                    </span>
                                                </div>
                                                {product.description && (
                                                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                                                        {product.description}
                                                    </p>
                                                )}
                                                {specificationRows.length > 0 && (
                                                    <dl className="mt-5 grid grid-cols-1 gap-2 border-t border-gray-100 pt-4 sm:grid-cols-2">
                                                        {specificationRows.map(([label, value]) => (
                                                            <div key={label} className="text-sm">
                                                                <dt className="font-semibold text-gray-700">
                                                                    {label}
                                                                </dt>
                                                                <dd className="mt-0.5 text-gray-600">
                                                                    {value}
                                                                </dd>
                                                            </div>
                                                        ))}
                                                    </dl>
                                                )}
                                                {product.features?.length > 0 && (
                                                    <ul className="mt-4 flex flex-wrap gap-2">
                                                        {product.features.map((feature) => (
                                                            <li
                                                                key={feature}
                                                                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800"
                                                            >
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                <span className="mt-5 inline-flex font-semibold text-blue-800">
                                                    View product details
                                                </span>
                                            </div>
                                        </Link>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                )}

            </div>
        </article>
    );
}