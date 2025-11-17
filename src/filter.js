import { logInfo } from "./logger.js";

export function filterAndScoreItems(items, keywords, hoursBack = 24) {
  const now = Date.now();
  const limit = hoursBack * 3600 * 1000;
  const kw = keywords.map(k => k.toLowerCase());

  const out = items
    .filter(i => {
      if (!i.pubDate) return false;
      const age = now - i.pubDate.getTime();
      if (age < 0 || age > limit) return false;

      const text = (i.title + " " + i.content).toLowerCase();
      return kw.some(k => text.includes(k));
    })
    .map(i => {
      const text = (i.title + " " + i.content).toLowerCase();
      const matches = kw.filter(k => text.includes(k));
      const ageHours = (now - i.pubDate.getTime()) / 3600000;
      const recency = Math.max(0, 24 - ageHours) / 24;
      return { ...i, score: matches.length + recency };
    })
    .sort((a, b) => b.score - a.score);

  logInfo(`Filtered ${out.length} relevant items`);
  return out;
}
