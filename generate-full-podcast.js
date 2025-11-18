import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';

console.log('🎙️ Generating FULL podcast with today\'s top 5 AI stories...\n');

async function generateFullPodcast() {
  try {
    // Initialize Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Today's top 5 stories (from our earlier analysis)
    const topStories = [
      {
        title: "Google unveils Gemini 3 claiming the lead in math, science, multimodal and agentic AI benchmarks",
        businessScore: 15,
        technicalScore: 35
      },
      {
        title: "Uni-MoE-2.0-Omni: An Open Qwen2.5-7B Based Omnimodal MoE for Text, Image, Audio and Video Understanding",
        businessScore: 28,
        technicalScore: 78
      },
      {
        title: "DialogGraph-LLM: Graph-Informed LLMs for End-to-End Audio Dialogue Intent Recognition",
        businessScore: 23,
        technicalScore: 78
      },
      {
        title: "GCAgent: Long-Video Understanding via Schematic and Narrative Episodic Memory",
        businessScore: 28,
        technicalScore: 78
      },
      {
        title: "APVR: Hour-Level Long Video Understanding with Adaptive Positional Visual Resampler",
        businessScore: 28,
        technicalScore: 78
      }
    ];

    console.log('📝 Generating conversational script with Claude Sonnet...\n');

    // Generate a natural, engaging podcast script
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are creating a script for Matt's morning AI news podcast. Write an engaging, conversational 5-8 minute script covering these top 5 AI stories from today (Monday, November 18th, 2025):

${topStories.map((story, i) => `${i + 1}. ${story.title}
   Business Score: ${story.businessScore}/100, Technical Score: ${story.technicalScore}/100`).join('\n\n')}

Style guidelines:
- Natural, energetic conversational tone (NOT boring or monotone!)
- Speak directly to Matt as "you"
- Start with "Good morning Matt! Your AI digest for Monday, November 18th."
- Explain why each story matters for business and technical relevance
- Use accessible language, avoid overly academic terms
- Include transitions between stories
- End with "That's your digest for today - now go build something amazing!"
- NO host names (no "Alex" or "Sam") - just direct narration
- Target 800-1000 words for 5-8 minutes of audio

Write the complete script now:`
      }]
    });

    const script = message.content[0].text;
    console.log('✅ Script generated!\n');
    console.log('---SCRIPT PREVIEW---');
    console.log(script.substring(0, 500) + '...\n');

    // Save script
    await fs.writeFile('full-podcast-script.txt', script);
    console.log('💾 Script saved to full-podcast-script.txt\n');

    // Generate audio with Charlie voice
    console.log('🎵 Generating audio with Charlie voice (this may take 2-3 minutes)...\n');

    const elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    const audio = await elevenLabs.textToSpeech.convert('IKne3meq5aSn9XLyUdCD', {
      text: script,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    await fs.writeFile('full-podcast.mp3', buffer);
    console.log(`✅ Podcast generated! (${buffer.length} bytes = ${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
    console.log('💾 Saved to full-podcast.mp3\n');
    console.log('🎧 Ready to play!\n');

    const durationEstimate = Math.round(buffer.length / 32000); // Rough estimate
    console.log(`⏱️  Estimated duration: ~${Math.floor(durationEstimate / 60)}:${(durationEstimate % 60).toString().padStart(2, '0')} minutes\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Connection')) {
      console.error('\n⚠️  Network timeout - try again with stable connection');
    }
  }
}

generateFullPodcast();
