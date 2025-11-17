import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import { logInfo, logError } from './logger.js';

/**
 * AI-powered article analysis using Claude via Anthropic or OpenRouter
 */

let client = null;
let config = null;

/**
 * Initialize AI client with configuration
 * @param {Object} aiConfig - AI configuration from config.yaml
 */
export function initializeAI(aiConfig) {
  config = aiConfig;

  if (config.provider === 'anthropic') {
    client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
    });
    logInfo(`AI initialized with Anthropic (model: ${config.model})`);
  } else if (config.provider === 'openrouter') {
    // OpenRouter uses custom axios client
    logInfo(`AI initialized with OpenRouter (model: ${config.model})`);
  } else {
    throw new Error(`Unknown AI provider: ${config.provider}`);
  }
}

/**
 * Call LLM with a prompt
 * @param {string} systemPrompt - System instructions
 * @param {string} userPrompt - User message
 * @returns {Promise<string>} - LLM response
 */
async function callLLM(systemPrompt, userPrompt) {
  if (config.provider === 'anthropic') {
    const response = await client.messages.create({
      model: config.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    return response.content[0].text;
  } else if (config.provider === 'openrouter') {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1024,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey || process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content;
  }
  throw new Error(`Unknown provider: ${config.provider}`);
}

/**
 * Generate AI-powered summary for an article
 * @param {Object} item - Article item with title, content, link
 * @returns {Promise<string>} - 2-3 sentence summary
 */
export async function summarizeArticle(item) {
  const systemPrompt = `You are a technical news analyst specializing in AI, ML, audio/video processing, and emerging technologies.
Generate concise, insightful summaries that capture the key technical points and implications.
Your summaries should be 2-3 sentences maximum and focus on what matters to advanced developers and researchers.`;

  const userPrompt = `Summarize this article in 2-3 sentences:

Title: ${item.title}
Content: ${item.content ? item.content.substring(0, 1000) : 'No content available'}
Source: ${item.source}

Focus on technical details, novel approaches, and practical implications.`;

  try {
    const summary = await callLLM(systemPrompt, userPrompt);
    logInfo(`Generated summary for: ${item.title.substring(0, 50)}...`);
    return summary.trim();
  } catch (error) {
    logError(`Failed to summarize article: ${error.message}`);
    // Fallback to simple truncation
    return item.content
      ? item.content.substring(0, 300).replace(/\s+\S*$/, '') + '...'
      : item.title;
  }
}

/**
 * Score article's business viability as a solo developer opportunity
 * @param {Object} item - Article item
 * @returns {Promise<number>} - Viability score 0-100
 */
export async function scoreBusinessViability(item) {
  const systemPrompt = `You are a business analyst evaluating technology opportunities for solo advanced developers.
Rate each article's business viability from 0-100 based on MONETIZATION POTENTIAL.

Consider:
- Realistic revenue opportunity (MRR/ARR) within 12 months
- Market demand and willingness to pay
- Competitive landscape
- Monetization models (SaaS, API, tooling, consulting)

Scoring guide:
- 0-20: No clear monetization path or oversaturated market
- 21-40: Theoretical opportunity but high risk or unclear demand
- 41-60: Moderate opportunity, some validation needed
- 61-80: Strong opportunity with proven demand patterns
- 81-100: Exceptional opportunity with clear path to $5K+ MRR

Return ONLY a number from 0-100, nothing else.`;

  const userPrompt = `Rate the business viability of this technology/research:

Title: ${item.title}
Content: ${item.content ? item.content.substring(0, 1000) : 'No content available'}
Source: ${item.source}

Score (0-100):`;

  try {
    const scoreText = await callLLM(systemPrompt, userPrompt);
    const score = parseInt(scoreText.trim().match(/\d+/)?.[0] || '0', 10);
    const clampedScore = Math.max(0, Math.min(100, score));
    logInfo(`Business viability score for "${item.title.substring(0, 40)}...": ${clampedScore}`);
    return clampedScore;
  } catch (error) {
    logError(`Failed to score business viability: ${error.message}`);
    return 0; // Default to 0 on error
  }
}

/**
 * Score article's technical relevance to user's interests
 * @param {Object} item - Article item
 * @param {Array<string>} keywords - User's keyword interests
 * @returns {Promise<number>} - Relevance score 0-100
 */
export async function scoreTechnicalRelevance(item, keywords) {
  const systemPrompt = `You are a technical relevance analyst for an expert in AI, ML, audio/video processing, signal processing, and multimodal systems.
Rate each article's technical relevance from 0-100.

Consider:
- Alignment with user's core interests: ${keywords.join(', ')}
- Technical depth and novelty
- Practical applicability
- Research vs. product announcements (favor novel research)

Scoring guide:
- 0-20: Tangentially related or marketing fluff
- 21-40: Somewhat relevant but not core interest
- 41-60: Solid match to interests
- 61-80: Highly relevant to core expertise
- 81-100: Breakthrough or directly applicable to current work

Return ONLY a number from 0-100, nothing else.`;

  const userPrompt = `Rate the technical relevance:

Title: ${item.title}
Content: ${item.content ? item.content.substring(0, 1000) : 'No content available'}
Source: ${item.source}

Score (0-100):`;

  try {
    const scoreText = await callLLM(systemPrompt, userPrompt);
    const score = parseInt(scoreText.trim().match(/\d+/)?.[0] || '0', 10);
    const clampedScore = Math.max(0, Math.min(100, score));
    logInfo(`Technical relevance score for "${item.title.substring(0, 40)}...": ${clampedScore}`);
    return clampedScore;
  } catch (error) {
    logError(`Failed to score technical relevance: ${error.message}`);
    return 0; // Default to 0 on error
  }
}

/**
 * Analyze an article with AI: summary + both scores
 * @param {Object} item - Article item
 * @param {Array<string>} keywords - User's keyword interests
 * @returns {Promise<Object>} - Enhanced item with summary, viabilityScore, relevanceScore
 */
export async function analyzeArticle(item, keywords) {
  try {
    // Run all three AI calls in parallel for speed
    const [summary, viabilityScore, relevanceScore] = await Promise.all([
      summarizeArticle(item),
      scoreBusinessViability(item),
      scoreTechnicalRelevance(item, keywords),
    ]);

    return {
      ...item,
      summary,
      viabilityScore,
      relevanceScore,
    };
  } catch (error) {
    logError(`Failed to analyze article "${item.title}": ${error.message}`);
    // Return item with fallback values
    return {
      ...item,
      summary: item.content ? item.content.substring(0, 300).replace(/\s+\S*$/, '') + '...' : item.title,
      viabilityScore: 0,
      relevanceScore: 0,
    };
  }
}
