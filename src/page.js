import fs from "node:fs";
import path from "node:path";
import { logInfo } from "./logger.js";

export function dateSlug(date, tz) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function writeHtmlPage(date, items, cfg) {
  const slug = dateSlug(date, cfg.timeZone);
  const dir = cfg.output.webDir;
  fs.mkdirSync(dir, { recursive: true });

  const out = buildHtml(date, items, cfg);
  const file = path.join(dir, `${slug}.html`);

  fs.writeFileSync(file, out, "utf8");
  logInfo(`Wrote HTML page ${file}`);
  return { slug, filePath: file };
}

function buildHtml(date, items, cfg) {
  const slug = dateSlug(date, cfg.timeZone);
  const title = `AI Daily Digest – ${slug}`;

  const list = items
    .map(
      i => {
        const viabilityBadge = i.viabilityScore > 0
          ? `<span class="score-badge" style="background:${getScoreColor(i.viabilityScore)};">💼 ${i.viabilityScore}</span>`
          : '';
        const relevanceBadge = i.relevanceScore > 0
          ? `<span class="score-badge" style="background:${getScoreColor(i.relevanceScore)};">⚡ ${i.relevanceScore}</span>`
          : '';
        const badges = viabilityBadge || relevanceBadge
          ? `<div style="margin:0.5rem 0;">${viabilityBadge} ${relevanceBadge}</div>`
          : '';

        return `
<article style="margin-bottom:1.5rem;">
  <h2><a href="${i.link}" style="color:#4ea8ff;">${esc(i.title)}</a></h2>
  <p style="color:#888;font-size:0.85rem;">
    ${esc(i.source || "")}
    ${i.pubDate ? " · " + i.pubDate.toISOString().slice(0,10) : ""}
  </p>
  ${badges}
  <p>${esc(i.summary)}</p>
</article>`;
      }
    )
    .join("\n");

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { background:#0b0c10; color:#e5e5e5; font-family:system-ui; padding:2rem; }
    a { color:#4ea8ff; }
    .score-badge {
      display:inline-block;
      color:#fff;
      padding:2px 10px;
      border-radius:4px;
      font-size:0.75rem;
      margin-right:0.5rem;
      font-weight:500;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${list}
</body>
</html>`;
}

function getScoreColor(score) {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#3b82f6'; // blue
  if (score >= 40) return '#f59e0b'; // orange
  return '#6b7280'; // gray
}

function esc(s = "") {
  return s
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");
}
