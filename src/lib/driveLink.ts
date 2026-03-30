/**
 * Ensures Google Drive / Docs URLs work in <a href> after CSV import or plain text paste.
 */
export function normalizeDriveLink(raw: string | undefined | null): string | undefined {
  if (raw == null) return undefined;
  let s = String(raw).trim();
  if (!s) return undefined;

  // Excel sometimes exports the formula text instead of the URL
  const hyperlink = s.match(/^=HYPERLINK\s*\(\s*"([^"]+)"/i);
  if (hyperlink) {
    s = hyperlink[1].trim();
  }

  if (/^https?:\/\//i.test(s)) return s;
  if (/^drive\.google\.com\//i.test(s)) return `https://${s}`;
  if (/^docs\.google\.com\//i.test(s)) return `https://${s}`;
  if (/^www\.drive\.google\.com\//i.test(s)) return `https://${s.replace(/^www\./i, "")}`;

  const embedded = s.match(/((?:https?:\/\/)?(?:www\.)?(?:drive|docs)\.google\.com\/[^\s"'<>]+)/i);
  if (embedded) {
    let url = embedded[1];
    if (!/^https?:\/\//i.test(url)) url = `https://${url.replace(/^www\./i, "")}`;
    return url;
  }

  return s;
}
