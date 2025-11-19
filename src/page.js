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

        // Generate unique ID for this article
        const articleId = Buffer.from(i.link).toString('base64').slice(0, 16);

        return `
<article style="margin-bottom:1.5rem;">
  <h2><a href="${i.link}" style="color:#4ea8ff;">${esc(i.title)}</a></h2>
  <p style="color:#888;font-size:0.85rem;">
    ${esc(i.source || "")}
    ${i.pubDate ? " · " + i.pubDate.toISOString().slice(0,10) : ""}
  </p>
  ${badges}
  <p>${esc(i.summary)}</p>
  <button
    onclick="analyzeForMVP('${articleId}', ${esc(JSON.stringify(i.title))}, ${esc(JSON.stringify(i.summary))}, ${esc(JSON.stringify(i.link))})"
    style="background:#8b5cf6;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:500;margin-top:0.5rem;"
    onmouseover="this.style.background='#7c3aed'"
    onmouseout="this.style.background='#8b5cf6'"
  >
    💡 Analyze for MVP
  </button>
  <div id="analysis-${articleId}" style="margin-top:1rem;"></div>
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
    .analysis-box {
      background:#1a1b26;
      border-left:4px solid #8b5cf6;
      padding:1rem;
      border-radius:6px;
      color:#c9d1d9;
    }
    .loading {
      color:#888;
      font-style:italic;
    }
  </style>
  <script>
    async function analyzeForMVP(articleId, title, summary, link) {
      const container = document.getElementById('analysis-' + articleId);
      container.innerHTML = '<p class="loading">Analyzing business potential with Claude AI...</p>';

      try {
        const response = await fetch('/api/analyze-mvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, summary, link })
        });

        if (!response.ok) {
          throw new Error('Analysis failed');
        }

        const data = await response.json();
        container.innerHTML = '<div class="analysis-box">' + data.analysis + '</div>';
      } catch (error) {
        container.innerHTML = '<p style="color:#ef4444;">Error: ' + error.message + '</p>';
      }
    }
  </script>
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
