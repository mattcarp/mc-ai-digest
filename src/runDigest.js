import { loadConfig } from "./config.js";
import { fetchAllFeeds } from "./feeds.js";
import { filterAndScoreItems } from "./filter.js";
import { summarizeItem } from "./summarize.js";
import { writeHtmlPage } from "./page.js";
import { sendDigestEmail } from "./email.js";
import { sendDigestSms } from "./sms.js";
import { logInfo, logError } from "./logger.js";
import { initializeAI, analyzeArticle } from "./ai.js";

async function run() {
  logInfo("Starting daily digest…");

  try {
    const cfg = loadConfig();
    const now = new Date();

    // Initialize AI if configured
    if (cfg.ai) {
      initializeAI(cfg.ai);
    }

    const raw = await fetchAllFeeds(cfg.feeds);
    const filtered = filterAndScoreItems(raw, cfg.keywords, 24);

    const max = cfg.output.maxItems || 15;
    const topItems = filtered.slice(0, max);

    // Use AI for analysis if available, otherwise fallback to simple summarization
    let items;
    if (cfg.ai) {
      logInfo("Analyzing articles with AI...");
      items = await Promise.all(
        topItems.map(item => analyzeArticle(item, cfg.keywords))
      );
      logInfo("AI analysis complete");
    } else {
      logInfo("AI not configured, using simple summarization");
      items = topItems.map(i => ({
        ...i,
        summary: summarizeItem(i),
        viabilityScore: 0,
        relevanceScore: 0,
      }));
    }

    const { slug } = writeHtmlPage(now, items, cfg);

    await sendDigestEmail(now, items, cfg);
    await sendDigestSms(now, items, cfg);

    logInfo(`Digest completed for ${slug}`);
  } catch (err) {
    logError("Digest run failed", err);
    process.exitCode = 1;
  }
}

run();
