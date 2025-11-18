import 'dotenv/config';
import { loadConfig } from './src/config.js';
import { fetchAllFeeds } from './src/feeds.js';
import { filterAndScoreItems } from './src/filter.js';
import { initializeAI, analyzeArticle, getAIClient } from './src/ai.js';
import { generatePodcast } from './src/podcast.js';
import fs from 'fs/promises';

console.log('🎙️ Generating TODAY\'S podcast from real articles...\n');

async function generateTodaysPodcast() {
  try {
    const cfg = loadConfig();

    // Initialize AI
    initializeAI(cfg.ai);
    console.log('✅ AI initialized\n');

    console.log('📡 Fetching feeds...');
    const raw = await fetchAllFeeds(cfg.feeds);
    console.log(`✅ Fetched ${raw.length} articles\n`);

    console.log('🔍 Filtering by keywords...');
    const filtered = filterAndScoreItems(raw, cfg.keywords, 24);
    console.log(`✅ Found ${filtered.length} relevant articles\n`);

    const topItems = filtered.slice(0, 15);

    console.log('🤖 Running AI analysis on top 15 articles...');
    const items = await Promise.all(
      topItems.map(item => analyzeArticle(item, cfg.keywords))
    );
    console.log('✅ AI analysis complete\n');

    console.log('📊 Top 5 articles for podcast:');
    items.slice(0, 5).forEach((item, i) => {
      console.log(`${i + 1}. ${item.title}`);
      console.log(`   Business: ${item.businessScore}, Technical: ${item.technicalScore}\n`);
    });

    console.log('🎙️ Generating podcast script and audio...\n');
    const aiClient = getAIClient();
    const podcast = await generatePodcast(
      items,
      aiClient,
      process.env.ELEVENLABS_API_KEY,
      'today',
      './public/news/audio',
      'https://mattcarpenter.com/news/audio'
    );

    console.log('\n✅ PODCAST READY!');
    console.log(`📝 Script: ${podcast.scriptPath}`);
    console.log(`🎵 Audio: ${podcast.audioPath}`);
    console.log(`🌐 URL: ${podcast.audioUrl}`);
    console.log('\n🎧 Playing now...\n');

    // Copy to easy location and play
    await fs.copyFile(podcast.audioPath, './todays-podcast.mp3');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generateTodaysPodcast();
