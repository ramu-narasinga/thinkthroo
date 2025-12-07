/**
 * Utility to extract table of contents from markdown content
 */
export function extractTocFromMarkdown(markdown: string) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc: Array<{ depth: number; title: string; url: string }> = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length; // Number of # characters
    const title = match[2].trim();
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    toc.push({
      depth: level,
      title: title,
      url: `#${id}`,
    });
  }

  return toc;
}
