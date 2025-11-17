import Parser from "rss-parser";
import { logInfo, logError } from "./logger.js";

const parser = new Parser();

export async function fetchAllFeeds(feeds) {
  const items = [];

  for (const feed of feeds) {
    try {
      logInfo(`Fetching feed ${feed.url}`);
      const parsed = await parser.parseURL(feed.url);

      for (const item of parsed.items || []) {
        items.push({
          title: item.title || "",
          link: item.link || "",
          pubDate: item.pubDate ? new Date(item.pubDate) : null,
          content: item.contentSnippet || item.content || "",
          source: parsed.title || feed.url
        });
      }
    } catch (err) {
      logError(`Feed failed: ${feed.url}`, err);
    }
  }

  logInfo(`Fetched ${items.length} items`);
  return items;
}
