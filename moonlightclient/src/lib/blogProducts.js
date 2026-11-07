const SITE_URL = "https://www.moonlightmachinery.com";

function getEditorBlocks(content) {
  let parsedContent = content;

  if (typeof parsedContent === "string") {
    try {
      parsedContent = JSON.parse(parsedContent);
    } catch (error) {
      console.error("Failed to parse Editor.js blog content for products:", error);
      return [];
    }
  }

  if (Array.isArray(parsedContent)) {
    return parsedContent;
  }

  return Array.isArray(parsedContent?.blocks) ? parsedContent.blocks : [];
}

function collectLinks(value, links, key = "") {
  if (typeof value === "string") {
    if (["href", "link", "url"].includes(key)) {
      links.push(value);
    }

    const anchorPattern = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
    for (const match of value.matchAll(anchorPattern)) {
      links.push(match[1] || match[2] || match[3]);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectLinks(item, links));
    return;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([childKey, childValue]) => {
      collectLinks(childValue, links, childKey);
    });
  }
}

export function getBlogProductSlugs(content) {
  const links = [];
  getEditorBlocks(content).forEach((block) =>
    collectLinks(block?.data, links),
  );

  const slugs = new Set();

  links.forEach((link) => {
    try {
      const { pathname } = new URL(link.trim(), SITE_URL);
      const match = pathname.match(/^\/home\/machines\/([^/]+)\/?$/i);
      if (match) {
        slugs.add(decodeURIComponent(match[1]));
      }
    } catch {
      // Ignore malformed links while preserving valid links in the article.
    }
  });

  return [...slugs];
}
