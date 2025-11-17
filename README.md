# mc-news

AI-Powered Daily Digest: fetches AI/tech news from multiple RSS feeds, filters by keywords, analyzes with Claude AI, then sends:

- HTML email digest with AI summaries and business viability scores
- SMS summary via Twilio (includes top opportunity score)
- Static HTML page under `public/news/YYYY-MM-DD.html`

## Features

- **AI-Powered Analysis**: Uses Claude Sonnet 4.5 (or any LLM via OpenRouter) to:
  - Generate concise 2-3 sentence summaries focused on technical insights
  - Score business viability (0-100) based on monetization potential for solo developers
  - Score technical relevance (0-100) based on your keyword interests
- **Flexible LLM Provider**: Switch between Anthropic Claude and OpenRouter
- **Visual Score Badges**: Color-coded badges (green 80+, blue 60+, orange 40+, gray <40)
- **Graceful Degradation**: Falls back to simple summarization if AI is unavailable
- **GitHub Actions Ready**: Automated daily digest generation in the cloud

## Usage

1. Copy `config/config.example.yaml` to `config/config.yaml` and adjust values.
2. Copy `.env.example` to `.env` and set environment variables:

   - `SMTP_USER`, `SMTP_PASS` - Email credentials
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` - SMS credentials
   - `ANTHROPIC_API_KEY` - For Claude AI (or `OPENROUTER_API_KEY` for OpenRouter)

3. Install dependencies:

   ```sh
   pnpm install
   ```

4. Run digest manually:

   ```sh
   pnpm digest
   ```

5. (Optional) Run tests:

   ```sh
   pnpm test
   ```

## Deployment Options

### Option 1: GitHub Actions (Recommended)

1. Push this repo to GitHub
2. Add repository secrets:
   - `SMTP_USER`, `SMTP_PASS`
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
   - `ANTHROPIC_API_KEY`
3. The workflow in `.github/workflows/daily-digest.yml` runs daily at 7:00 AM UTC (9:00 AM Malta)
4. Generated HTML files are committed back to the repo automatically

### Option 2: Local Cron

Add a cron entry to run daily at 09:00:

```sh
0 9 * * * cd /path/to/mc-news && pnpm digest >> logs/cron.log 2>&1
```

## Configuration

### AI Provider & Model Selection

Edit `config/config.yaml` to switch models:

**Current (Default): Claude Haiku 4.5** - $4.10/month
```yaml
ai:
  provider: "anthropic"
  model: "claude-haiku-4-5"
```

**Option: Gemini 2.5 Pro via OpenRouter** - $6.60/month
```yaml
ai:
  provider: "openrouter"
  model: "google/gemini-2.5-pro"
```

**Option: GPT-4o mini via OpenRouter** - $0.54/month (ultra-cheap!)
```yaml
ai:
  provider: "openrouter"
  model: "openai/gpt-4o-mini"
```

**Option: Gemini 2.0 Flash via OpenRouter** - $0.36/month (cheapest!)
```yaml
ai:
  provider: "openrouter"
  model: "google/gemini-2.0-flash"
```

**Option: Claude Sonnet 4.5** - $12.30/month (premium quality)
```yaml
ai:
  provider: "anthropic"
  model: "claude-sonnet-4-20250514"
```

For OpenRouter models, set `OPENROUTER_API_KEY` in your `.env` file instead of `ANTHROPIC_API_KEY`.

### Scoring System

- **Business Viability (💼)**: 0-100 score focused on monetization potential
  - 81-100: Exceptional opportunity with clear path to $5K+ MRR
  - 61-80: Strong opportunity with proven demand patterns
  - 41-60: Moderate opportunity, validation needed
  - 21-40: Theoretical opportunity, high risk
  - 0-20: No clear monetization path

- **Technical Relevance (⚡)**: 0-100 score based on your keyword interests
  - 81-100: Breakthrough or directly applicable
  - 61-80: Highly relevant to core expertise
  - 41-60: Solid match to interests
  - 21-40: Somewhat relevant
  - 0-20: Tangentially related

## Cost Comparison (Daily Digest)

| Model | Daily Cost | Monthly (30d) | Annual | Quality |
|-------|-----------|---------------|--------|---------|
| **Claude Haiku 4.5** (default) | $0.14 | **$4.10** | $49.88 | Excellent ⭐ |
| Gemini 2.0 Flash | $0.01 | $0.36 | $4.38 | Very Good 🔥 |
| GPT-4o mini | $0.02 | $0.54 | $6.57 | Very Good 🔥 |
| Gemini 2.5 Pro | $0.22 | $6.60 | $80.30 | Premium |
| Claude Sonnet 4.5 | $0.41 | $12.30 | $149.65 | Premium |

**Current Setup**: Claude Haiku 4.5 at ~$4/month (67% cheaper than Sonnet 4.5, same quality)

## Testing

The project includes Playwright tests for:
- AI digest generation
- HTML output validation
- Score badge rendering
- Score range validation

Run with: `pnpm test`
