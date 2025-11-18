# Requirements Specification

## 1. Overview

AI-powered daily news digest system that automatically fetches, analyzes, filters, and delivers curated AI/tech news via email, SMS, and archived HTML pages.

**Version:** 1.0
**Last Updated:** 2025-11-18
**Target User:** Matt Carpenter

---

## 2. Functional Requirements

### 2.1 Content Ingestion (FR-001)

**FR-001.1** - System SHALL fetch content from RSS/Atom feeds configured in `config/config.yaml`

**FR-001.2** - System SHALL extract the following fields from each feed item:
- Title (required)
- Link/URL (required)
- Publication date (required)
- Content/description (optional)
- Source name (required)

**FR-001.3** - System SHALL handle individual feed failures gracefully without stopping the entire digest process

**FR-001.4** - System SHALL log all feed fetch attempts with success/failure status

**FR-001.5** - System SHALL support at least 10 concurrent feed sources

---

### 2.2 Content Filtering & Scoring (FR-002)

**FR-002.1** - System SHALL filter articles published within the last 24 hours (configurable)

**FR-002.2** - System SHALL filter articles based on keyword matching (case-insensitive) against:
- Article title
- Article content/description

**FR-002.3** - System SHALL score articles based on:
- Number of keyword matches (weight: 1.0 per match)
- Recency (weight: 0.1 bonus for each hour newer)

**FR-002.4** - System SHALL sort filtered articles by score in descending order

**FR-002.5** - System SHALL limit final output to configurable `maxItems` (default: 15)

**FR-002.6** - System SHALL exclude articles without valid publication dates

---

### 2.3 AI Analysis (FR-003)

**FR-003.1** - System SHALL analyze each article using configured AI provider (Anthropic Claude or OpenRouter)

**FR-003.2** - System SHALL generate for each article:
- **Summary**: 2-3 sentence technical summary
- **Business Viability Score** (0-100): Monetization potential for solo developers
- **Technical Relevance Score** (0-100): Alignment with configured keywords/interests

**FR-003.3** - System SHALL execute all AI operations in parallel for performance

**FR-003.4** - System SHALL fallback to simple truncation if AI analysis fails

**FR-003.5** - System SHALL support provider-agnostic AI integration via:
- Environment variables for API keys
- Config file for model selection
- Pluggable provider architecture

**FR-003.6** - System SHALL optimize for cost by defaulting to Claude Haiku 4.5 model

---

### 2.4 Email Output (FR-004)

**FR-004.1** - System SHALL send one HTML email per day to configured recipient

**FR-004.2** - Email subject SHALL follow format: `AI Daily Digest – YYYY-MM-DD`

**FR-004.3** - Email body SHALL include:
- Header with digest date
- List of articles with:
  - Title (clickable link)
  - Source name
  - Publication date
  - AI-generated summary
  - Business viability score badge (color-coded)
  - Technical relevance score badge (color-coded)
- Footer with link to web version

**FR-004.4** - Email SHALL use dark theme with color-coded score badges:
- Green (75-100): High value
- Yellow (50-74): Medium value
- Orange (25-49): Low-medium value
- Red (0-24): Low value

**FR-004.5** - Email SHALL be sent via SMTP with configurable host/port/credentials

---

### 2.5 SMS Output (FR-005)

**FR-005.1** - System SHALL send one SMS per day via Twilio to configured phone number

**FR-005.2** - SMS body SHALL include:
- Top headline
- Opportunity score (average of business viability + technical relevance)
- Link to full digest

**FR-005.3** - SMS length SHALL NOT exceed 320 characters

**FR-005.4** - SMS SHALL truncate content with ellipsis if needed

---

### 2.6 Static HTML Page Output (FR-006)

**FR-006.1** - System SHALL generate one standalone HTML file per day

**FR-006.2** - File path SHALL follow format: `public/news/YYYY-MM-DD.html`

**FR-006.3** - HTML page SHALL be self-contained (no external CSS/JS dependencies)

**FR-006.4** - HTML page SHALL include same content as email (header, articles, footer)

**FR-006.5** - HTML page SHALL be accessible at `https://mattcarpenter.com/news/YYYY-MM-DD`

---

### 2.7 Configuration Management (FR-007)

**FR-007.1** - System SHALL load configuration from YAML file at `config/config.yaml`

**FR-007.2** - System SHALL support environment variable overrides for:
- `SMTP_USER`
- `SMTP_PASS`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY`
- `DIGEST_CONFIG_PATH`

**FR-007.3** - Configuration SHALL include:
- Timezone (e.g., "Europe/Malta")
- Logical run time (e.g., "09:00")
- Email settings (from, to)
- SMTP settings (host, port, secure)
- Twilio settings (fromNumber, toNumber)
- Feed list (array of URLs)
- Keyword list (array of terms)
- AI settings (provider, model)
- Output settings (baseUrl, webDir, maxItems)

**FR-007.4** - System SHALL validate configuration on startup and fail fast with clear error messages

---

### 2.8 Logging (FR-008)

**FR-008.1** - System SHALL log all operations to:
- Console (stdout)
- File at `logs/digest.log`

**FR-008.2** - Log entries SHALL include:
- Timestamp (ISO 8601 format)
- Log level (INFO, ERROR)
- Message

**FR-008.3** - System SHALL log:
- Digest start/completion
- Feed fetch attempts and results
- AI analysis progress
- Article counts (fetched, filtered, final)
- Output generation (email sent, SMS sent, HTML created)
- All errors with stack traces

---

### 2.9 Scheduling & Automation (FR-009)

**FR-009.1** - System SHALL be runnable via CLI command: `pnpm digest`

**FR-009.2** - System SHALL support GitHub Actions workflow for daily automation

**FR-009.3** - GitHub Actions workflow SHALL:
- Run daily at 7:00 AM UTC (9:00 AM Malta time)
- Create config.yaml from template
- Execute digest generation
- Auto-commit generated HTML files and logs
- Support manual triggering via workflow_dispatch

**FR-009.4** - System SHALL support local cron scheduling as alternative to GitHub Actions

---

## 3. Non-Functional Requirements

### 3.1 Performance (NFR-001)

**NFR-001.1** - System SHALL complete daily digest generation within 5 minutes for typical workload (300+ articles)

**NFR-001.2** - System SHALL execute AI analysis operations in parallel to minimize runtime

**NFR-001.3** - System SHALL cache AI results to avoid re-analyzing same articles (future enhancement)

---

### 3.2 Reliability (NFR-002)

**NFR-002.1** - System SHALL continue digest generation even if individual feeds fail

**NFR-002.2** - System SHALL produce output even if AI analysis fails (using fallback summarization)

**NFR-002.3** - System SHALL handle network timeouts gracefully

**NFR-002.4** - System SHALL retry failed operations up to 3 times with exponential backoff (future enhancement)

---

### 3.3 Maintainability (NFR-003)

**NFR-003.1** - Code SHALL be organized into separate modules:
- `config.js` - Configuration loading
- `feeds.js` - RSS fetching
- `filter.js` - Filtering and scoring
- `ai.js` - AI analysis
- `email.js` - Email generation
- `sms.js` - SMS sending
- `page.js` - HTML page generation
- `logger.js` - Logging
- `runDigest.js` - Main orchestrator

**NFR-003.2** - Code SHALL use ES modules (ESM) syntax

**NFR-003.3** - Code SHALL include JSDoc comments for all public functions

**NFR-003.4** - Code SHALL follow modular design patterns for easy extension

---

### 3.4 Security (NFR-004)

**NFR-004.1** - Credentials SHALL be stored in environment variables, NOT in code or config files

**NFR-004.2** - `config.yaml` SHALL be excluded from version control via `.gitignore`

**NFR-004.3** - System SHALL NOT log sensitive information (API keys, passwords, phone numbers)

**NFR-004.4** - System SHALL use HTTPS for all external API calls

**NFR-004.5** - System SHALL validate and sanitize all external content before rendering in HTML

---

### 3.5 Cost Optimization (NFR-005)

**NFR-005.1** - System SHALL default to Claude Haiku 4.5 model (~$4.10/month) instead of Sonnet (~$12.30/month)

**NFR-005.2** - System SHALL provide cost estimates in documentation for different AI models:
- Claude Haiku 4.5: ~$0.14/day
- Gemini 2.0 Flash: ~$0.01/day
- GPT-4o mini: ~$0.02/day
- Claude Sonnet 4.5: ~$0.41/day

**NFR-005.3** - System SHALL support switching AI providers without code changes

---

### 3.6 Testability (NFR-006)

**NFR-006.1** - System SHALL include Playwright test suite covering:
- AI digest generation
- HTML file creation
- Score badge rendering
- Score validation (0-100 range)
- Log file verification

**NFR-006.2** - Tests SHALL run independently without requiring live feeds or API keys

**NFR-006.3** - GitHub Actions workflow SHALL run tests before deploying

---

### 3.7 Portability (NFR-007)

**NFR-007.1** - System SHALL run on Node.js v20+

**NFR-007.2** - System SHALL use pnpm for dependency management

**NFR-007.3** - System SHALL work on macOS, Linux, and Windows (via GitHub Actions)

**NFR-007.4** - System SHALL minimize external dependencies

---

## 4. Data Requirements

### 4.1 Input Data

**DR-001** - RSS/Atom feeds from at least 7 sources
**DR-002** - Keywords list with minimum 5 terms
**DR-003** - Configuration in YAML format
**DR-004** - Environment variables for secrets

### 4.2 Output Data

**DR-005** - One HTML email per day
**DR-006** - One SMS per day
**DR-007** - One HTML file per day in `public/news/` directory
**DR-008** - Log file at `logs/digest.log`

### 4.3 Data Retention

**DR-009** - HTML archive files retained indefinitely
**DR-010** - Log file appended daily (manual rotation required)
**DR-011** - No database or persistent storage required

---

## 5. Interface Requirements

### 5.1 External APIs

**IF-001** - Anthropic Claude API for AI analysis
**IF-002** - OpenRouter API (alternative AI provider)
**IF-003** - Twilio API for SMS delivery
**IF-004** - SMTP server for email delivery
**IF-005** - RSS/Atom feeds (public endpoints)

### 5.2 User Interfaces

**IF-006** - CLI interface via `pnpm digest` command
**IF-007** - Email interface (HTML rendering in email clients)
**IF-008** - SMS interface (plain text)
**IF-009** - Web interface (static HTML pages)

---

## 6. Constraints

**C-001** - Must use Node.js (ESM modules)
**C-002** - Must use pnpm package manager
**C-003** - Must work with GitHub Actions (free tier)
**C-004** - Must not exceed 2 minutes GitHub Actions runtime per digest
**C-005** - Must support Malta timezone (Europe/Malta)
**C-006** - Must use Twilio for SMS (no alternative providers in v1)

---

## 7. Assumptions

**A-001** - RSS feeds remain publicly accessible
**A-002** - Anthropic/OpenRouter APIs remain available and pricing stable
**A-003** - User has valid Twilio account with SMS credits
**A-004** - User has SMTP access for email delivery
**A-005** - User has GitHub Actions enabled with sufficient budget ($15/month set)
**A-006** - HTML files will be manually deployed to mattcarpenter.com
**A-007** - Single user (Matt) - no multi-tenancy required

---

## 8. Dependencies

**D-001** - @anthropic-ai/sdk - Claude AI integration
**D-002** - rss-parser - RSS/Atom feed parsing
**D-003** - nodemailer - Email delivery
**D-004** - twilio - SMS delivery
**D-005** - js-yaml - YAML configuration parsing
**D-006** - axios - HTTP requests
**D-007** - dotenv - Environment variable loading
**D-008** - @playwright/test - Testing framework (dev dependency)

---

## 9. Out of Scope (Future Versions)

**OS-001** - Multi-user support with individual preferences
**OS-002** - Admin dashboard for feed/keyword management
**OS-003** - Web-based search interface for historical digests
**OS-004** - Analytics dashboard (open rates, click tracking)
**OS-005** - Slack/Discord integration
**OS-006** - Push notifications
**OS-007** - Mobile app
**OS-008** - User authentication and authorization
**OS-009** - Database storage (currently file-based)
**OS-010** - Real-time digest updates
