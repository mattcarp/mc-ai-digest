/**
 * Research Assistant API Server
 * Provides MVP analysis endpoint for digest articles
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static('public'));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY);

// MVP Analysis endpoint
app.post('/api/analyze-mvp', async (req, res) => {
  try {
    const { title, summary, link, model = 'claude' } = req.body;

    if (!title || !summary) {
      return res.status(400).json({ error: 'Missing title or summary' });
    }

    console.log(`Analyzing with ${model}: ${title}`);

    const prompt = `You're helping a technical founder evaluate this AI/tech article for startup potential. Be sharp, honest, and practical.

Article: ${title}
Summary: ${summary}
Link: ${link}

First, explain what this actually means:

**📄 What This Is (Plain English)**
- If this is a technical whitepaper or research, break down the core innovation in simple terms
- What problem does it solve?
- Why does it matter?
- What's the breakthrough here?

Then analyze the business opportunity:

**💡 MVP Feasibility** (⭐️⭐️⭐️⭐️⭐️)
- Build time for solo dev (realistic: X weeks)
- Stack: Next.js, Supabase, Render.com, Claude/OpenAI APIs
- Technical complexity (low/medium/high)
- Key technical challenges

**💰 Market Opportunity** (⭐️⭐️⭐️⭐️⭐️)
- Market size ($ TAM estimate)
- Target customers (who pays?)
- Revenue potential ($X-Y/month MRR within 6 months)
- Pricing model that works

**🎯 Monetization**
- Best revenue model (subscription/API/usage-based)
- Realistic pricing tiers
- Unit economics

**🏆 Competition**
- Who's already doing this?
- Your unfair advantage
- Barriers to entry (low/medium/high)

**⚡️ Go-to-Market**
- MVP features (bare minimum)
- Launch channel (Product Hunt? Twitter? Direct sales?)
- Time to first $1 (realistic estimate)

**🚨 Risks**
- Technical: What could go wrong?
- Market: Will people actually pay?
- Dependencies: API rate limits, platform risks

**🎨 Landing Page Strategy**
- Hero headline that hooks (write the actual headline)
- Problem statement (show the pain point)
- Solution in one sentence
- Social proof needed (testimonials? logos? metrics?)
- Primary CTA (exact button text)
- Secondary CTA (what's the backup action?)

**💳 Pricing Page Design**
- Pricing model (freemium? trial? straight paid?)
- Tier 1: Starter ($X/month) - what's included
- Tier 2: Pro ($Y/month) - what's included
- Tier 3: Enterprise ($Z/month or custom) - what's included
- Anchor pricing (which tier sells best and why?)
- What converts best for this market?

**🎬 Bottom Line**
Worth building? YES/NO and why (be brutally honest - 2-3 sentences)

Format as clean HTML: <h3> for sections, <ul>/<li> for bullets, <strong> for emphasis. Make it scannable and actionable. Use emojis in headings.`;

    let analysis;

    if (model === 'gemini' || model === 'gemini-3') {
      // Use Gemini 3.0
      const geminiModel = gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const result = await geminiModel.generateContent(prompt);
      analysis = result.response.text();
    } else {
      // Use Claude (default)
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      analysis = response.content[0].text;
    }

    res.json({ analysis, model });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Research Assistant API running on http://localhost:${PORT}`);
  console.log(`View digests at http://localhost:${PORT}/news/`);
});
