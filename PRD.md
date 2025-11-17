# AI-Daily Digest – Product Requirements Document (PRD)

## 1. Summary

Build an automated “AI-Daily Digest” system that, every morning around 09:00 Malta time, delivers:

- A concise **SMS** with 1–3 top AI/tech headlines + a link.
- A detailed **HTML email** with summaries and links.
- A web page at `https://mattcarpenter.com/news/YYYY-MM-DD` archiving that day's digest.

Content focus: audio AI, video AI, multimodal, signal processing, ML research, datacenter/compute news.

Primary user: **Matt**.

---

## 2. Goals & Non-Goals

### Goals

- Fully automated daily pipeline.
- Highly technical content filtered by keywords.
- Feed ingestion from multiple AI-related sources.
- SMS + email + static HTML page generation.
- Configurable feed list and keywords.
- Easy to extend with LLM-based summarization later.

### Non-Goals (for v1)

- Subscriber management UI.
- Admin dashboard.
- Full search UI.
- Analytics dashboard.
- Sophisticated ranking beyond simple scoring (can be added later).

---

## 3. Users & Use Cases

### Primary User

- Matt: senior technologist, deep into AI/media, wants a curated, technical feed.

### Core Use Cases

1. **Morning glance**  
   At ~09:00 Malta time, user checks SMS for 2–3 headlines and link to the full digest.

2. **Daily reading**  
   User reads HTML email with 5–15 curated items, each with title, source, date, and summary.

3. **Later reference**  
   User opens `https://mattcarpenter.com/news/YYYY-MM-DD` to revisit a day’s digest.

4. **Tuning the feed**  
   User edits a YAML config file to add/remove feeds and adjust keyword list.

---

## 4. Functional Requirements

### 4.1 Content Ingestion

- Support multiple RSS/Atom feeds defined in a config file.
- For each feed:
  - Fetch latest items.
  - Extract: title, link, publication date, snippet/content, source name.
- Only consider items within last ~24 hours (relative to run time).

### 4.2 Filtering & Scoring

- Filter items by:
  - Having a valid `pubDate`.
  - Publication within the last N hours (configurable, default 24).
  - Matching configured keywords in title or content (case-insensitive).
- Score items based on:
  - Number of matching keywords.
  - Recency bonus (more recent items slightly favored).
- Return items sorted by descending score.

### 4.3 Summarization

- v1: simple deterministic summarization:
  - Use content snippet if available, otherwise title.
  - Truncate to `N` characters (default ~300) with word boundary.
- v2 (future): allow plugging in LLM-based summarizer.

### 4.4 Outputs

#### HTML Email

- One email per day, sent to `matt@mattcarpenter.com`.
- Subject: `AI Daily Digest – YYYY-MM-DD` (Malta time).
- HTML body:
  - Header: title & date.
  - List of items: title (link), source, date, summary.
  - Footer: link to the web version of the digest.

#### SMS via Twilio

- One SMS per day, sent to configured phone number.
- Body:
  - Very concise: up to 3 headlines + link to daily page.
  - Max length 160 characters; truncate with ellipsis.

#### Static HTML Page

- One page per day:
  - Path: `public/news/YYYY-MM-DD.html`.
  - Content:
    - Main heading with date.
    - List of items (same as email content).
- Intended to be served at `https://mattcarpenter.com/news/YYYY-MM-DD`.

### 4.5 Scheduling

- System must be runnable via a CLI script.
- Example cron entry:
  - `0 9 * * * cd /path/to/mc-news && pnpm digest >> logs/cron.log 2>&1`

---

## 5. Non-Functional Requirements

- **Performance:** Finish daily run within a few minutes for typical feed sizes.
- **Reliability:** Should handle partial feed failures gracefully and still produce a digest if other feeds succeed.
- **Maintainability:** Code should be modular (separate modules for config, feeds, filter, summarize, email, SMS, HTML).
- **Security:**
  - Credentials (SMTP, Twilio) via environment variables.
  - No secrets in the repo.
- **Portability:** Works with Node.js (ESM) and pnpm.

---

## 6. Configuration

- A YAML file `config/config.yaml` controls:
  - Time zone and logical run time.
  - Email sender/recipient.
  - SMTP host/port/secure.
  - Twilio numbers.
  - List of feed URLs.
  - Keywords.
  - Output base URL and directory.
  - Max number of daily items.

- Environment variables supply secrets:
  - `SMTP_USER`, `SMTP_PASS`
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
  - Optional: `DIGEST_CONFIG_PATH`

---

## 7. v1 Scope

In scope:

- RSS ingestion.
- Filtering and scoring.
- Simple summarization.
- Email + SMS + HTML outputs.
- Cron-friendly CLI.

Out of scope (future versions):

- LLM summarization.
- Multi-user support.
- Admin UI.
- Search and analytics.
