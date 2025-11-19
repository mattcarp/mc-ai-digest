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

  const prompt = `You are creating a script for a daily AI news podcast. Two hosts (Alex and Sam) discuss the top AI/tech news in a conversational, engaging way.

Guidelines:
- Keep it conversational and natural, like two friends discussing tech news
- Alex is more technical and analytical
- Sam asks clarifying questions and connects ideas to practical applications
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
Alex: [dialogue]
Sam: [dialogue]
Alex: [dialogue]

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
 * Convert podcast script to ElevenLabs dialogue format
 * @param {string} script - Raw podcast script
 * @returns {string} - Formatted dialogue for ElevenLabs
 */
function formatScriptForElevenLabs(script) {
  // ElevenLabs expects format like:
  // Speaker 1: Text here
  // Speaker 2: More text

  // Clean up the script and ensure proper format
  const lines = script.split('\n').filter(line => line.trim());
  return lines.join('\n');
}

/**
 * Generate audio podcast using ElevenLabs API with chunked generation
 * to avoid timeouts on long scripts
 * @param {string} script - Podcast script in dialogue format
 * @param {string} apiKey - ElevenLabs API key
 * @returns {Promise<Buffer>} - Audio file as buffer
 */
export async function generateAudio(script, apiKey) {
  logInfo('Generating audio with ElevenLabs (chunked)...');

  const client = new ElevenLabsClient({ apiKey });
  const CHARLIE_VOICE_ID = 'IKne3meq5aSn9XLyUdCD'; // Australian male voice

  try {
    // Format script for ElevenLabs
    const formattedScript = formatScriptForElevenLabs(script);

    // Split into chunks to avoid quota/timeout issues (~1500 chars each)
    const chunks = [];
    const lines = formattedScript.split('\n');
    let currentChunk = '';

    for (const line of lines) {
      if (currentChunk.length + line.length > 1500 && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = line + '\n';
      } else {
        currentChunk += line + '\n';
      }
    }
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    logInfo(`Split script into ${chunks.length} chunks for generation`);

    const audioChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      logInfo(`Generating chunk ${i + 1}/${chunks.length}...`);

      const audio = await client.textToSpeech.convert(CHARLIE_VOICE_ID, {
        text: chunks[i],
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      });

      const chunkBuffers = [];
      for await (const chunk of audio) {
        chunkBuffers.push(chunk);
      }
      const buffer = Buffer.concat(chunkBuffers);
      audioChunks.push(buffer);

      logInfo(`Chunk ${i + 1} done (${buffer.length} bytes)`);

      // Small delay to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Merge all chunks
    const finalBuffer = Buffer.concat(audioChunks);
    logInfo(`Generated complete audio (${finalBuffer.length} bytes)`);
    return finalBuffer;

  } catch (error) {
    logError('ElevenLabs audio generation failed:', error);
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
