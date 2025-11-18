# MC-News Product Roadmap

## ✅ Phase 1: Core Digest System (COMPLETE)
- [x] RSS feed ingestion from 7+ sources
- [x] AI-powered article analysis (Claude Haiku 4.5)
- [x] Business viability scoring (0-100)
- [x] Technical relevance scoring (0-100)
- [x] HTML email with dark theme and color-coded badges
- [x] SMS delivery via Twilio
- [x] Static HTML archive pages
- [x] GitHub Actions workflow (auto-commit daily)
- [x] Cost optimization (~$4.10/month vs $12.30)

## 🎙️ Phase 2: 3-Part Audio Podcast Experience (IN PROGRESS)

### Current Status:
- [x] Claude generates conversational script
- [x] ElevenLabs text-to-speech integration (Charlie voice)
- [x] SMS links directly to podcast audio
- [x] Basic podcast generation working
- [ ] 3-part audio pipeline (music + sung intro + dialogue)
- [ ] Suno AI sung intro integration
- [ ] Spotify music fade integration
- [ ] FFmpeg audio merging
- [ ] Pre-generation at 6 AM (ready by 9 AM)

### The Complete Podcast Experience:

**Part 1: Morning Music Fade (20 seconds)**
- Random track from Spotify playlist
- Fade in → peak → fade out
- Sets energetic morning vibe

**Part 2: Sung AI Intro (20 seconds)**
- Udio AI generates actual SUNG lyrics about today's top stories
- Studio-quality vocals with superior clarity and realism
- Dynamic genre rotation by day:
  - Monday: Jazz
  - Tuesday: Rock
  - Wednesday: Classical
  - Thursday: Electronic
  - Friday: Hip-hop
  - Weekend: Acoustic/Chill
- Example: *"It's Monday morning, AI news time! Gemini 3 reaching for the sky!"*
- Fades down smoothly into dialogue

**Part 3: News Dialogue (5-8 minutes)**
- Charlie voice (energetic Australian male, NOT boring monotone!)
- Conversational coverage of top 5 articles
- Business + technical insights
- Natural, engaging delivery

### Technical Pipeline:
```
6:00 AM - Build podcast:
  1. Fetch & analyze articles (Claude Haiku)
  2. Generate podcast script (Claude Sonnet)
  3. Generate Udio sung intro (dynamic lyrics from top stories)
  4. Generate dialogue audio (ElevenLabs Charlie voice)
  5. Get Spotify track + apply fades (FFmpeg)
  6. Merge: [Spotify] → [Udio intro] → [Dialogue] (FFmpeg)
  7. Save to public/news/audio/

9:00 AM - Deliver:
  - SMS with podcast link
  - Pre-built, polished, ready to play
```

### Cost Impact:
- Udio AI (via MusicAPI.ai): ~$10/month (music generation)
- ElevenLabs: ~$11/month (existing)
- Total: ~$21/month for premium audio experience

## 🌐 Phase 3: Web Deployment (NEXT)
- [ ] Upload public/news/ to mattcarpenter.com hosting
- [ ] Set up mattcarpenter.com/news/ subdirectory
- [ ] Test archive pages are accessible
- [ ] Add navigation between dates
- [ ] Add "Play Podcast" button on each page

---

## 🚀 Future Features (Prioritized)

### Priority 1: Research Assistant Mode
**Goal:** Interactive AI analysis of any article for MVP potential

**Features:**
- Click "Analyze for MVP" on any article
- AI evaluates:
  - MVP feasibility with your stack (Next.js, ShadCN, Render.com)
  - Market size estimation
  - Monetization opportunities for solo developer
  - Technical complexity assessment
  - Time-to-market estimate (weeks/months)
- Interactive chat to drill deeper
- Save analysis for later reference

**User Flow:**
1. Open mattcarpenter.com/news/2025-11-18
2. Click "💡 Analyze Business Potential" on article
3. AI generates detailed analysis
4. Chat with AI: "What if I used Supabase instead?"
5. Get revised analysis
6. Star article + save analysis

**Tech Stack:**
- Next.js frontend for interactive UI
- Claude for analysis generation
- Real-time streaming for chat
- Save to database (Supabase?)

**Estimated Time:** 2-3 hours
**Cost Impact:** +$0.05/analysis

---

### Priority 2: Audio Enhancements
**Goal:** Make podcast more engaging with musical intros

**Features:**
- 10-second musical intro in different genres
  - Monday: Jazz
  - Tuesday: Rock
  - Wednesday: Classical
  - Thursday: Electronic
  - Friday: Hip-hop
  - Weekend: Acoustic/Chill
- Sung intro with daily tagline
- Fade down music → dialogue starts
- ElevenLabs sound effects API

**User Experience:**
- Wake up at 9 AM
- SMS: "🎧 Your AI Digest Podcast is ready!"
- Click link
- Hear: [Upbeat jazz intro] "It's Monday, time for AI..." [fade] "Alex: Good morning..."

**Estimated Time:** 2 hours
**Cost Impact:** +$0.10/day for intro generation

---

### Priority 3: Trend Detection & Pattern Analysis
**Goal:** Track what's heating up in AI/tech over time

**Features:**
- Weekly digest showing trending topics
- Track keyword frequency over time
- Identify emerging patterns before mainstream
- "Hot this week" section
- Graph showing topic momentum
- Email alert: "🔥 Audio AI trending +300% this week"

**Data Tracked:**
- Keyword frequency (daily)
- Article count per topic
- Average scores per topic
- Cross-topic connections

**Output:**
- Weekly trend report (email)
- Trend dashboard on website
- Historical trend graphs

**Estimated Time:** 3-4 hours
**Database Required:** Yes (PostgreSQL or SQLite)

---

### Priority 4: Smart Alert System
**Goal:** Never miss high-priority articles

**Features:**
- Push notifications for articles scoring >85 on both metrics
- Custom alert rules:
  - "Alert if 'audio' AND 'real-time' in same article"
  - "Alert if business score >90"
  - "Alert if 3+ articles on same topic in one day"
- Multiple delivery channels:
  - iOS Push Notification
  - Email (high priority)
  - Slack webhook
  - Discord webhook
- Quiet hours (no alerts 10 PM - 7 AM)

**Config Example:**
```yaml
alerts:
  - name: "High-value opportunities"
    condition: "businessScore > 85 AND technicalScore > 80"
    channels: ["push", "email"]

  - name: "Audio AI breakthroughs"
    condition: "keywords includes ['audio', 'real-time']"
    channels: ["slack"]
```

**Estimated Time:** 2 hours
**Cost Impact:** Free (using existing infrastructure)

---

### Priority 5: Interactive Web Dashboard
**Goal:** Browse, search, and organize historical digests

**Features:**
- **Search & Filter:**
  - Full-text search across all articles
  - Filter by date range
  - Filter by score ranges
  - Filter by source
  - Filter by keywords

- **Article Management:**
  - Star/favorite articles
  - Tag articles with custom labels
  - Add personal notes
  - Create collections ("Audio AI Research", "Business Ideas")

- **Visualization:**
  - Score distribution charts
  - Timeline view of articles
  - Source performance dashboard
  - Keyword cloud

- **Export:**
  - Export starred articles to Notion
  - Export to Obsidian markdown
  - PDF report generation

**Tech Stack:**
- Next.js + ShadCN UI
- Supabase for data storage
- Vercel/Render for hosting
- Full-text search with PostgreSQL

**Estimated Time:** 4-6 hours (MVP)
**Hosting Cost:** $0-7/month (Vercel free tier or Render)

---

### Priority 6: Smart Feed Management
**Goal:** Automatically optimize feed quality

**Features:**
- **Auto-scoring feeds:**
  - Track hit rate (% of articles that make the digest)
  - Quality score (average article scores)
  - Freshness (how quickly they publish vs competitors)

- **Feed recommendations:**
  - "Based on your interests, try: arXiv cs.SD (speech)"
  - Discover feeds similar to top performers

- **Auto-pause low performers:**
  - If feed has <5% hit rate for 30 days → pause
  - Email: "Paused OpenAI Blog (0 relevant articles in 30 days)"

- **Feed analytics dashboard:**
  - Chart showing each feed's contribution
  - Best/worst performing sources
  - Diversity score (are you in an echo chamber?)

**Estimated Time:** 2 hours
**Database Required:** Yes

---

### Priority 7: LLM Experiment Mode
**Goal:** Compare different AI models for analysis

**Features:**
- Run same articles through multiple models:
  - Claude Haiku 4.5 (current)
  - Claude Sonnet 4.5
  - GPT-4o
  - Gemini 2.0 Flash
  - Llama 3.2

- **Compare:**
  - Summary quality (side-by-side)
  - Score accuracy (which model scores most useful?)
  - Cost per digest
  - Speed/latency

- **A/B Testing:**
  - "Use Sonnet for top 5, Haiku for rest"
  - Track which summaries you read most

- **Cost Dashboard:**
  - Daily cost breakdown by model
  - ROI analysis: "Sonnet costs 3x but saves you 10 min/day"

**Config Example:**
```yaml
llm_experiments:
  enabled: true
  models:
    - provider: "anthropic"
      model: "claude-sonnet-4-5"
      percentage: 20  # Use for 20% of articles

    - provider: "openai"
      model: "gpt-4o"
      percentage: 20

    - provider: "anthropic"
      model: "claude-haiku-4-5"
      percentage: 60  # Main workhorse
```

**Estimated Time:** 3 hours
**Cost Impact:** Variable (testing costs)

---

## 🎵 Bonus Features

### iOS Reminder Integration
- Alternative to SMS
- Native iOS reminder with link to podcast
- "Daily AI Digest" reminder at 9:00 AM
- Deep link to podcast audio

**Estimated Time:** 1 hour

---

### Multi-Voice Podcast
- Different voices for Alex (male) vs Sam (female)
- Natural conversation flow
- Voice cloning (use your own voice as host?)

**Estimated Time:** 1 hour
**Cost Impact:** Same (ElevenLabs supports multiple voices)

---

### Podcast Transcript & Chapters
- Auto-generated transcript
- Chapter markers for each article
- Skip to specific topic
- Search within podcast

**Estimated Time:** 2 hours

---

### Social Sharing
- Auto-generate social media posts
- "Just learned about [article] - here's why it matters..."
- Twitter/LinkedIn/Threads integration
- Share podcast clips (30-60 sec highlights)

**Estimated Time:** 3 hours

---

## 🐛 Bug Fixes & Improvements

### Feed Issues
- [ ] Fix OpenAI Blog RSS (403 error) - find alternative URL
- [ ] Fix Google AI Blog (404 error) - URL changed
- [ ] Add timeout handling for slow feeds
- [ ] Retry logic with exponential backoff

### Performance
- [ ] Cache AI responses (deduplication)
- [ ] Parallel feed fetching (currently sequential)
- [ ] Reduce token usage in prompts

### User Experience
- [ ] Better error messages
- [ ] Progress indicators during digest generation
- [ ] Email preview before sending
- [ ] Test mode (dry run without sending)

---

## 📊 Success Metrics

**Current State:**
- Daily digests: ✅ Working
- Email delivery: ✅ 100%
- SMS delivery: ✅ 100%
- GitHub Actions: ✅ Automated
- Cost: ✅ $4.10/month

**Target Metrics:**
- Podcast generation: ✅ 100% (once API key fixed)
- Time saved per day: 15-20 minutes
- Articles read per week: 30-50
- Business ideas identified: 2-3/month
- User satisfaction: ⭐⭐⭐⭐⭐

---

## 🗓️ Timeline Estimate

**Week 1-2:**
- ✅ Complete podcast deployment
- ✅ Web hosting setup
- 🎯 Research Assistant MVP

**Week 3-4:**
- 🎵 Musical intro
- 📊 Trend detection
- 🔔 Smart alerts

**Month 2:**
- 🖥️ Interactive dashboard
- 🤖 LLM experiments
- 📡 Smart feed management

**Month 3+:**
- Polish and optimization
- Advanced features
- Scale to multiple users?

---

## 💰 Total Cost Projection

**Current:** $4.10/month
- Claude Haiku: $4.10/month

**With All Features:**
- Claude (analysis): $6/month
- ElevenLabs (podcast): $11/month
- Hosting (Render/Vercel): $7/month
- Database (Supabase): Free tier
- **Total: ~$24/month**

**Time Saved:** ~10 hours/month
**ROI:** Priceless! 🚀

---

Last updated: 2025-11-18
