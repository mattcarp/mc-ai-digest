/**
 * Podcast generation module - converts digest articles into audio podcast
 * using ElevenLabs Text-to-Dialogue API
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs/promises';
import path from 'path';
import { logInfo, logError } from './logger.js';

/**
 * Generate a podcast script from digest articles using Claude
 * @param {Array} articles - Array of article objects with summaries and scores
 * @param {Object} aiClient - Anthropic AI client
 * @returns {Promise<string>} - Podcast script in dialogue format
 */
export async function generatePodcastScript(articles, aiClient) {
  logInfo('Generating podcast script from articles...');

  // Take top 5 most relevant articles for the podcast
  const topArticles = articles.slice(0, 5);

  const prompt = `You are creating a script for a daily AI news podcast. Two hosts discuss the top AI/tech news in a conversational, engaging way.

Guidelines:
- Keep it conversational and natural, like two friends discussing tech news
- Brian has a deep, resonant voice - he's analytical and explains technical concepts
- Sarah has a warm, confident voice - she asks clarifying questions and connects ideas to business applications
- Total length: 5-8 minutes of dialogue (roughly 1200-2000 words)
- Start with a brief intro, then dive into the articles
- End with a quick recap and sign-off
- Use natural speech patterns (contractions, pauses, enthusiasm)
- Focus on the most interesting/impactful articles

Today's articles:
${topArticles.map((article, i) => `
${i + 1}. ${article.title}
   Source: ${article.source}
   Summary: ${article.summary}
   Business Viability: ${article.businessScore}/100
   Technical Relevance: ${article.technicalScore}/100
   Link: ${article.link}
`).join('\n')}

Format the script exactly like this:
Brian: [dialogue]
Sarah: [dialogue]
Brian: [dialogue]

Make it engaging, informative, and conversational. Start now:`;

  const response = await aiClient.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const script = response.content[0].text;
  logInfo(`Generated podcast script (${script.length} characters)`);

  return script;
}

/**
 * Convert podcast script to ElevenLabs text-to-dialogue format
 * @param {string} script - Raw podcast script with "Brian:" and "Sarah:" prefixes
 * @returns {Array} - Array of {text, voice_id} objects for dialogue API
 */
function formatScriptForDialogue(script) {
  const BRIAN_VOICE_ID = 'nPczCjzI2devNBz1zQrb'; // Middle-aged male, resonant
  const SARAH_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Young female, confident and warm

  const lines = script.split('\n').filter(line => line.trim());
  const dialogue = [];

  for (const line of lines) {
    if (line.startsWith('Brian:')) {
      dialogue.push({
        text: line.replace('Brian:', '').trim(),
        voice_id: BRIAN_VOICE_ID
      });
    } else if (line.startsWith('Sarah:')) {
      dialogue.push({
        text: line.replace('Sarah:', '').trim(),
        voice_id: SARAH_VOICE_ID
      });
    }
  }

  return dialogue;
}

/**
 * Generate audio podcast using ElevenLabs Text-to-Dialogue API
 * @param {string} script - Podcast script in dialogue format
 * @param {string} apiKey - ElevenLabs API key
 * @returns {Promise<Buffer>} - Audio file as buffer
 */
export async function generateAudio(script, apiKey) {
  logInfo('Generating two-person dialogue audio with ElevenLabs...');

  try {
    // Convert script to dialogue format
    const dialogue = formatScriptForDialogue(script);
    logInfo(`Converted script to ${dialogue.length} dialogue turns`);

    // Use text-to-dialogue API endpoint directly
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-dialogue', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: dialogue,
        model_id: 'eleven_v3', // v3 model with dialogue support
        output_format: 'mp3_44100_128'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    logInfo(`Generated dialogue audio (${buffer.length} bytes, ${dialogue.length} turns)`);
    return buffer;

  } catch (error) {
    logError('ElevenLabs dialogue generation failed:', error);
    throw error;
  }
}

/**
 * Save audio file to disk
 * @param {Buffer} audioBuffer - Audio data
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} outputDir - Directory to save audio
 * @returns {Promise<string>} - Path to saved audio file
 */
export async function saveAudioFile(audioBuffer, date, outputDir) {
  const filename = `${date}.mp3`;
  const filepath = path.join(outputDir, filename);

  // Ensure directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Write audio file
  await fs.writeFile(filepath, audioBuffer);

  logInfo(`Saved audio to ${filepath}`);
  return filepath;
}

/**
 * Main function to generate complete podcast from articles
 * @param {Array} articles - Digest articles
 * @param {Object} aiClient - Anthropic AI client
 * @param {string} elevenLabsKey - ElevenLabs API key
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} outputDir - Directory for audio files
 * @returns {Promise<Object>} - { scriptPath, audioPath, audioUrl }
 */
export async function generatePodcast(articles, aiClient, elevenLabsKey, date, outputDir, baseUrl) {
  try {
    // 0. Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // 1. Generate script
    const script = await generatePodcastScript(articles, aiClient);

    // 2. Save script for reference
    const scriptPath = path.join(outputDir, `${date}-script.txt`);
    await fs.writeFile(scriptPath, script);
    logInfo(`Saved script to ${scriptPath}`);

    // 3. Generate audio
    const audioBuffer = await generateAudio(script, elevenLabsKey);

    // 4. Save audio file
    const audioPath = await saveAudioFile(audioBuffer, date, outputDir);

    // 5. Generate public URL
    const audioUrl = `${baseUrl}/${date}.mp3`;

    logInfo(`Podcast generated successfully: ${audioUrl}`);

    return {
      scriptPath,
      audioPath,
      audioUrl
    };

  } catch (error) {
    logError('Podcast generation failed:', error);
    throw error;
  }
}
