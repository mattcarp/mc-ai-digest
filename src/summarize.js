export function summarizeItem(item, maxChars = 300) {
  const txt = item.content || item.title || "";
  if (txt.length <= maxChars) return txt.trim();
  const slice = txt.slice(0, maxChars);
  const ix = slice.lastIndexOf(" ");
  return (ix > 0 ? slice.slice(0, ix) : slice) + "…";
}
