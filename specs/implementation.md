# Implementation Plan

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Daily Digest Orchestrator               │
│                      (runDigest.js)                         │
└───────────┬─────────────────────────────────────────────────┘
            │
            ├──► Config Loader (config.js)
            │    └──► Load YAML + env vars
            │
            ├──► Feed Fetcher (feeds.js)
            │    └──► Fetch from 7+ RSS sources
            │         └──► Extract: title, link, date, content, source
            │
            ├──► Filter & Score (filter.js)
            │    └──► Filter by: date, keywords
            │    └──► Score by: keyword matches + recency
            │    └──► Sort & limit to maxItems
            │
            ├──► AI Analyzer (ai.js)
            │    └──► Parallel analysis of articles:
            │         ├──► Summary (2-3 sentences)
            │         ├──► Business Viability Score (0-100)
            │         └──► Technical Relevance Score (0-100)
            │    └──► Fallback: simple summarization
            │
            └──► Output Generators
                 ├──► Email (email.js)
                 │    └──► HTML email via SMTP
                 ├──► SMS (sms.js)
                 │    └──► SMS via Twilio
                 └──► Web Page (page.js)
                      └──► Static HTML file
```

---

### 1.2 Module Breakdown

#### Core Modules

| Module | File | Purpose | Dependencies |
|--------|------|---------|--------------|
| Main Orchestrator | `src/runDigest.js` | Coordinates entire digest pipeline | All modules |
| Configuration | `src/config.js` | Loads YAML config + env vars | js-yaml, dotenv |
| Feed Fetcher | `src/feeds.js` | Fetches RSS/Atom feeds | rss-parser, axios |
| Filter & Score | `src/filter.js` | Filters and scores articles | None |
| AI Analyzer | `src/ai.js` | AI-powered analysis | @anthropic-ai/sdk, axios |
| Email Generator | `src/email.js` | Creates and sends HTML email | nodemailer |
| SMS Generator | `src/sms.js` | Sends SMS via Twilio | twilio |
| Page Generator | `src/page.js` | Creates static HTML page | None |
| Logger | `src/logger.js` | Dual logging (console + file) | None |
| Fallback Summarizer | `src/summarize.js` | Simple text truncation | None |

#### Configuration Files

| File | Purpose |
|------|---------|
| `config/config.yaml` | Main configuration (not in git) |
| `config/config.example.yaml` | Template for config.yaml |
| `.env` | Environment variables (not in git) |
| `.env.example` | Template for .env |

#### Output Files

| File | Generated | Purpose |
|------|-----------|---------|
| `public/news/YYYY-MM-DD.html` | Daily | Archive page for web |
| `logs/digest.log` | Daily (append) | Operation logs |

---

## 2. Data Flow

### 2.1 Main Execution Flow

```
1. Load Configuration
   ├──► Read config/config.yaml
   ├──► Override with environment variables
   └──► Validate required settings

2. Initialize Services
   ├──► AI client (Anthropic/OpenRouter)
   ├──► SMTP transporter
   ├──► Twilio client
   └──► Logger

3. Fetch Articles
   ├──► For each feed in config.feeds:
   │    ├──► Fetch RSS/Atom XML
   │    ├──► Parse items
   │    └──► Extract fields
   └──► Aggregate all items (handle failures gracefully)

4. Filter & Score
   ├──► Filter by publication date (last 24h)
   ├──► Filter by keyword matches
   ├──► Score by: keyword count + recency
   ├──► Sort by score (descending)
   └──► Limit to config.output.maxItems

5. AI Analysis (Parallel)
   ├──► For each article (up to maxItems):
   │    ├──► Generate summary (2-3 sentences)
   │    ├──► Generate business viability score (0-100)
   │    └──► Generate technical relevance score (0-100)
   └──► Wait for all analyses to complete

6. Generate Outputs (Parallel)
   ├──► Email: Create HTML, send via SMTP
   ├──► SMS: Format text, send via Twilio
   └──► Web: Write HTML file to public/news/

7. Log Completion
   └──► Write summary to logs/digest.log
```

---

### 2.2 Article Object Schema

```javascript
{
  title: String,          // Article headline
  link: String,           // URL to full article
  pubDate: Date,          // Publication date
  content: String,        // Full content/description
  source: String,         // Feed source name
  score: Number,          // Relevance score
  summary: String,        // AI-generated summary (2-3 sentences)
  businessScore: Number,  // 0-100 business viability
  technicalScore: Number  // 0-100 technical relevance
}
```

---

## 3. Key Algorithms

### 3.1 Article Scoring Algorithm

```javascript
function scoreArticle(article, keywords, now) {
  let score = 0;

  // Keyword matching (case-insensitive)
  const text = (article.title + ' ' + article.content).toLowerCase();
  keywords.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      score += 1.0;  // +1 per keyword match
    }
  });

  // Recency bonus
  const hoursOld = (now - article.pubDate) / (1000 * 60 * 60);
  const recencyBonus = Math.max(0, (24 - hoursOld) * 0.1);
  score += recencyBonus;

  return score;
}
```

### 3.2 AI Analysis Prompts

**Summary Prompt:**
```
Provide a concise 2-3 sentence technical summary of this article.
Focus on key technical innovations, methods, or findings.
Avoid marketing language.

Article: [title and content]
```

**Business Viability Prompt:**
```
Rate the business viability of this technology for a solo developer
on a scale of 0-100, where:
- 0-24: Low potential (niche, academic, or requires massive infrastructure)
- 25-49: Moderate potential (requires significant investment or team)
- 50-74: Good potential (achievable with focus and resources)
- 75-100: High potential (immediate monetization opportunities)

Return ONLY a number between 0 and 100.

Article: [title and content]
```

**Technical Relevance Prompt:**
```
Rate how relevant this article is to these interests on a scale of 0-100:
Interests: [keyword list]

Where:
- 0-24: Barely related
- 25-49: Somewhat related
- 50-74: Closely related
- 75-100: Highly relevant

Return ONLY a number between 0 and 100.

Article: [title and content]
```

### 3.3 Parallel AI Analysis

```javascript
async function analyzeArticles(articles, aiClient) {
  const promises = articles.flatMap(article => [
    generateSummary(article, aiClient),
    generateBusinessScore(article, aiClient),
    generateTechnicalScore(article, aiClient)
  ]);

  await Promise.all(promises);
  // Results are written directly to article objects
}
```

---

## 4. Error Handling Strategy

### 4.1 Feed Fetching Errors

**Strategy:** Continue with available feeds
- Log error for failed feed
- Continue processing other feeds
- Produce digest from successful feeds only

### 4.2 AI Analysis Errors

**Strategy:** Graceful degradation
- Attempt AI analysis for each article
- If AI fails: use fallback summarizer (simple truncation)
- Set default scores (50 for business, 50 for technical)
- Log warning but continue

### 4.3 Output Delivery Errors

**Strategy:** Fail independently
- Email failure: log error, continue to SMS and web
- SMS failure: log error, continue to email and web
- Web failure: log error, continue to email and SMS

### 4.4 Configuration Errors

**Strategy:** Fail fast
- Invalid YAML: throw error immediately
- Missing required fields: throw error immediately
- Invalid credentials: fail at runtime with clear message

---

## 5. Configuration Design

### 5.1 YAML Structure

```yaml
timeZone: "Europe/Malta"
runTime: "09:00"

email:
  from: "Matt's AI Daily Digest <digest@mattcarpenter.com>"
  to: "matt@mattcarpenter.com"

smtp:
  host: "mail.privateemail.com"
  port: 587
  secure: false

twilio:
  fromNumber: "+16466635100"
  toNumber: "+35679420492"

feeds:
  - url: "https://openai.com/blog/rss/"
  - url: "https://ai.googleblog.com/feeds/posts/default"
  - url: "https://venturebeat.com/category/ai/feed/"
  - url: "https://www.marktechpost.com/feed/"
  - url: "https://rss.arxiv.org/rss/cs.AI"
  - url: "https://rss.arxiv.org/rss/cs.CV"
  - url: "https://rss.arxiv.org/rss/eess.AS"

keywords:
  - audio
  - video
  - multimodal
  - "signal processing"
  - "media asset"
  - "sentiment analysis"
  - "data centre"
  - "data center"
  - "compute infrastructure"
  - "datacenter"
  - inference

ai:
  provider: "anthropic"  # anthropic or openrouter
  model: "claude-haiku-4-5"

output:
  baseUrl: "https://mattcarpenter.com/news"
  webDir: "./public/news"
  maxItems: 15
```

### 5.2 Environment Variables

```bash
# SMTP Credentials
SMTP_USER=digest@mattcarpenter.com
SMTP_PASS=********

# Twilio Credentials
TWILIO_ACCOUNT_SID=AC********
TWILIO_AUTH_TOKEN=********

# AI Provider (choose one)
ANTHROPIC_API_KEY=sk-ant-********
# OR
OPENROUTER_API_KEY=sk-or-********

# Optional: Custom config path
DIGEST_CONFIG_PATH=/custom/path/to/config.yaml
```

---

## 6. Deployment Architecture

### 6.1 GitHub Actions Workflow

```yaml
name: Daily AI Digest

on:
  schedule:
    - cron: '0 7 * * *'  # 7:00 AM UTC = 9:00 AM Malta
  workflow_dispatch:     # Manual trigger

jobs:
  generate-digest:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - Checkout repository
      - Setup Node.js 20
      - Setup pnpm 10
      - Install dependencies
      - Create config.yaml (from embedded template)
      - Run digest (with secrets as env vars)
      - Commit & push generated files
```

**Secrets Required:**
- `SMTP_USER`
- `SMTP_PASS`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `ANTHROPIC_API_KEY`

**Committed Files:**
- `public/news/YYYY-MM-DD.html`
- `logs/digest.log` (appended)

### 6.2 Local Cron (Alternative)

```bash
# Crontab entry
0 9 * * * cd /Users/matt/Documents/projects/mc-news && /usr/local/bin/pnpm digest >> logs/cron.log 2>&1
```

**Requirements:**
- `config/config.yaml` must exist locally
- `.env` must contain all secrets
- `pnpm` must be in PATH

---

## 7. Testing Strategy

### 7.1 Test Suite (Playwright)

**Location:** `tests/digest.spec.js`

**Test Cases:**
1. **AI Digest Generation**
   - Run full digest
   - Verify articles have summaries
   - Verify scores are present

2. **HTML File Creation**
   - Check file exists at `public/news/YYYY-MM-DD.html`
   - Validate HTML structure
   - Check all articles rendered

3. **Score Badge Rendering**
   - Verify color coding (green, yellow, orange, red)
   - Validate score ranges (0-100)

4. **Log Verification**
   - Check `logs/digest.log` exists
   - Verify no critical errors
   - Confirm completion message

### 7.2 Manual Testing Checklist

- [ ] Email arrives in inbox
- [ ] Email displays correctly in Gmail, Outlook, Apple Mail
- [ ] SMS arrives on phone
- [ ] SMS link is clickable
- [ ] Web page loads at mattcarpenter.com/news/YYYY-MM-DD
- [ ] All article links work
- [ ] Scores are sensible and varied
- [ ] Summaries are accurate and concise

---

## 8. Performance Optimization

### 8.1 Parallel Operations

**Feed Fetching:** Sequential (to avoid rate limits)
**AI Analysis:** Parallel (3 operations per article × 15 articles = 45 concurrent)
**Output Generation:** Parallel (email, SMS, web)

### 8.2 Caching Strategy (Future)

**Article Deduplication:**
- Cache article URLs to avoid re-analyzing same content
- Use SHA-256 hash of (title + link) as cache key
- Store in SQLite or JSON file

**AI Response Caching:**
- Cache AI responses by article hash
- TTL: 7 days
- Reduces costs for recurring articles

### 8.3 Cost Optimization

**Model Selection:**
- Default: Claude Haiku 4.5 (~$4.10/month)
- Budget: Gemini 2.0 Flash (~$0.36/month)
- Premium: Claude Sonnet 4.5 (~$12.30/month)

**Token Optimization:**
- Truncate article content to 1000 chars before AI analysis
- Use concise prompts
- Request JSON responses when possible

---

## 9. Security Considerations

### 9.1 Secrets Management

**Never Commit:**
- API keys
- SMTP passwords
- Twilio tokens
- Phone numbers (in code)

**Storage:**
- Local: `.env` file (in .gitignore)
- GitHub: Repository secrets
- Production: Environment variables

### 9.2 Input Validation

**RSS Content:**
- Sanitize HTML before rendering
- Strip `<script>` tags
- Validate URLs before clicking
- Limit content length (prevent DOS)

**Configuration:**
- Validate email format
- Validate phone number format
- Validate URLs in feed list
- Check numeric ranges (maxItems, port, etc.)

### 9.3 API Security

**Rate Limiting:**
- Respect RSS feed rate limits (1 req/sec)
- Handle 429 responses gracefully
- Implement exponential backoff

**API Key Rotation:**
- Document process for rotating keys
- Support multiple API keys (future)

---

## 10. Monitoring & Observability

### 10.1 Logging Levels

**INFO:** Normal operations
- Digest start/completion
- Feed fetches
- Article counts
- Output generation

**ERROR:** Failures
- Feed fetch failures
- AI analysis failures
- Email/SMS delivery failures
- Configuration errors

### 10.2 Success Metrics

**Daily:**
- Number of feeds fetched successfully
- Number of articles filtered
- Number of articles in final digest
- AI analysis success rate
- Email delivery success (SMTP response)
- SMS delivery success (Twilio SID)

**Weekly:**
- Average articles per day
- Feed reliability (% uptime)
- AI cost per digest
- Keyword match distribution

### 10.3 Alerting (Future)

**Critical:**
- Digest fails to run for 2+ days
- All feeds failing
- Email delivery fails

**Warning:**
- Single feed failing
- AI analysis degraded mode
- SMS delivery fails

---

## 11. Extensibility Points

### 11.1 Adding New AI Providers

**Steps:**
1. Add provider to `src/ai.js`
2. Implement `analyzeArticle()` method
3. Add API key env var
4. Update config schema
5. Document in README

**Example:** Adding Gemini
```javascript
// src/ai.js
if (provider === 'gemini') {
  // Use Google AI SDK
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Implement analysis methods
}
```

### 11.2 Adding New Output Channels

**Steps:**
1. Create new module (e.g., `src/slack.js`)
2. Implement `sendToSlack(articles)` method
3. Add configuration to `config.yaml`
4. Call from `runDigest.js`

**Example:** Slack integration
```javascript
// src/slack.js
export async function sendToSlack(articles, webhookUrl) {
  // Format articles as Slack blocks
  // POST to webhook
}
```

### 11.3 Adding New Feeds

**Steps:**
1. Add URL to `config/config.yaml` under `feeds:`
2. Restart digest (or wait for next run)
3. Monitor logs for fetch success

**No code changes required!**

### 11.4 Custom Scoring Algorithms

**Steps:**
1. Modify `src/filter.js` → `scoreArticle()`
2. Add new scoring parameters to config
3. Update documentation

**Example:** Add source weighting
```javascript
const sourceWeights = {
  'OpenAI Blog': 1.5,
  'arXiv': 1.2,
  'VentureBeat': 0.8
};
score *= (sourceWeights[article.source] || 1.0);
```

---

## 12. Migration & Upgrade Path

### 12.1 Future Database Migration

**Current:** File-based (HTML archives, log file)
**Future:** PostgreSQL or SQLite

**Migration Steps:**
1. Create database schema
2. Write migration script to import existing HTML files
3. Update modules to read/write from DB
4. Maintain backward compatibility with file output

### 12.2 Multi-User Support

**Current:** Single user (Matt)
**Future:** Multiple users with preferences

**Changes Required:**
1. User model (preferences, email, phone, keywords)
2. Per-user digest generation
3. User management UI
4. Authentication/authorization
5. Database for user storage

---

## 13. Known Limitations & Future Improvements

### Current Limitations

1. **No article deduplication** - Same article may appear from multiple feeds
2. **No caching** - Re-analyzes all articles daily (cost inefficiency)
3. **No search** - Can't search historical digests
4. **No analytics** - No tracking of which articles are read/clicked
5. **No personalization** - All users get same digest (future: multi-user)
6. **Fixed keywords** - Requires manual config update
7. **No machine learning** - Scoring is rule-based, not learned

### Planned Improvements (v2)

1. **Article deduplication** via URL hashing
2. **AI response caching** to reduce costs
3. **Web search interface** for historical digests
4. **Click tracking** via shortened URLs
5. **Adaptive keywords** - Learn from read patterns
6. **Sentiment analysis** - Filter out negative news
7. **Topic clustering** - Group related articles
8. **Trend detection** - Highlight emerging topics

---

## 14. Dependency Management

### 14.1 Production Dependencies

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| @anthropic-ai/sdk | Latest | Claude AI | MIT |
| rss-parser | ^3.13.0 | RSS parsing | MIT |
| nodemailer | ^6.9.0 | Email delivery | MIT |
| twilio | ^5.3.4 | SMS delivery | MIT |
| js-yaml | ^4.1.0 | YAML parsing | MIT |
| axios | ^1.7.9 | HTTP client | MIT |
| dotenv | ^16.4.7 | Env loading | BSD-2-Clause |

### 14.2 Development Dependencies

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| @playwright/test | ^1.49.1 | Testing | Apache-2.0 |

### 14.3 Update Strategy

**Frequency:** Monthly security updates
**Process:**
1. Run `pnpm update --latest`
2. Run tests: `pnpm test`
3. Test digest: `pnpm digest`
4. Commit updates if tests pass

---

## 15. Disaster Recovery

### 15.1 Backup Strategy

**What to Backup:**
- `config/config.yaml` - Configuration
- `.env` - Secrets (encrypted)
- `public/news/*.html` - Archive files
- `logs/digest.log` - Operation history

**Backup Location:**
- GitHub (for HTML archives via auto-commit)
- 1Password (for secrets)
- Time Machine (local backups)

### 15.2 Recovery Scenarios

**Scenario 1: Lost config.yaml**
- Restore from `config/config.example.yaml`
- Update with personal settings
- Restore secrets from 1Password

**Scenario 2: Lost HTML archives**
- Restore from GitHub history
- Or regenerate by re-running digest for past dates (if feeds still have data)

**Scenario 3: GitHub Actions quota exceeded**
- Switch to local cron
- Run manually until quota resets

**Scenario 4: API key compromised**
- Rotate API key immediately
- Update GitHub secrets
- Update local `.env`
- Restart digest

---

## 16. Development Workflow

### 16.1 Local Development

```bash
# Clone repo
git clone https://github.com/mattcarp/mc-ai-digest.git
cd mc-ai-digest

# Install dependencies
pnpm install

# Copy config templates
cp config/config.example.yaml config/config.yaml
cp .env.example .env

# Edit configs
# - config/config.yaml: Set personal preferences
# - .env: Add API keys and credentials

# Run digest
pnpm digest

# Run tests
pnpm test
```

### 16.2 Adding New Features

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... edit files ...

# Test locally
pnpm digest
pnpm test

# Commit and push
git acm "Add new feature"
git push

# Create PR (if collaborating)
# Otherwise merge to main
```

### 16.3 Debugging

**Enable verbose logging:**
```javascript
// src/logger.js
const logLevel = process.env.LOG_LEVEL || 'DEBUG';
```

**Test individual modules:**
```bash
# Test feed fetching only
node -e "import('./src/feeds.js').then(m => m.fetchFeeds(...))"

# Test AI analysis only
node -e "import('./src/ai.js').then(m => m.analyzeArticle(...))"
```

**Check GitHub Actions logs:**
```bash
gh run list --workflow daily-digest.yml
gh run view <run-id> --log
```

---

## 17. Performance Benchmarks

### 17.1 Expected Performance (15 articles)

| Operation | Duration | Notes |
|-----------|----------|-------|
| Feed Fetching | 5-10s | 7 feeds sequential |
| Filtering | <1s | In-memory operations |
| AI Analysis | 8-15s | 45 parallel requests |
| Email Generation | 1-2s | HTML rendering |
| SMS Sending | 1s | Twilio API call |
| Web Page | <1s | File write |
| **Total** | **15-30s** | End-to-end |

### 17.2 Cost Benchmarks (per digest)

| AI Model | Cost/Day | Cost/Month | Notes |
|----------|----------|------------|-------|
| Claude Haiku 4.5 | $0.14 | $4.10 | Default |
| Gemini 2.0 Flash | $0.01 | $0.36 | Cheapest |
| GPT-4o mini | $0.02 | $0.54 | Mid-tier |
| Claude Sonnet 4.5 | $0.41 | $12.30 | Premium |

**Assumptions:** 15 articles × 3 AI calls × 500 tokens avg

---

This implementation plan provides a comprehensive technical blueprint for the mc-news AI digest system, covering architecture, algorithms, deployment, testing, security, and future extensibility.
