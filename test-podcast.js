import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';

console.log('🎙️ Testing podcast generation...\n');

// Test data - just 2 articles
const testArticles = [
  {
    title: "Uni-MoE-2.0-Omni: Scaling Language-Centric Omnimodal Learning",
    source: "arXiv",
    summary: "This paper introduces Uni-MoE-2.0-Omni, an advanced Mixture-of-Experts model based on Qwen2.5-7B. The model processes text, images, audio, and video through a unified architecture using modality-specific encoders and expert routing.",
    businessScore: 22,
    technicalScore: 92,
    link: "https://example.com/1"
  },
  {
    title: "AV-Dialog: Spoken Dialogue Models with Audio-Visual Understanding",
    source: "arXiv",
    summary: "AV-Dialog extends large language models with audio-visual understanding for natural spoken conversations. The model processes both speech and visual context simultaneously, enabling richer multimodal interactions.",
    businessScore: 35,
    technicalScore: 85,
    link: "https://example.com/2"
  }
];

async function testPodcast() {
  try {
    // Step 1: Generate script with Claude
    console.log('📝 Generating podcast script with Claude...');
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are creating a script for a daily AI news podcast. Two hosts (Alex and Sam) discuss the top AI/tech news in a conversational, engaging way.

Guidelines:
- Keep it conversational and natural
- Alex is more technical
- Sam asks clarifying questions
- Total length: 2-3 minutes (about 400-600 words)
- Start with a brief intro, discuss the articles, end with sign-off

Today's articles:
${testArticles.map((a, i) => `
${i + 1}. ${a.title}
   Summary: ${a.summary}
   Business: ${a.businessScore}/100, Technical: ${a.technicalScore}/100
`).join('\n')}

Format exactly like:
Alex: [dialogue]
Sam: [dialogue]

Make it engaging and conversational. Start now:`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const script = response.content[0].text;
    console.log('✅ Script generated!');
    console.log('\n--- SCRIPT ---');
    console.log(script);
    console.log('--- END SCRIPT ---\n');

    // Save script
    await fs.writeFile('test-script.txt', script);
    console.log('💾 Saved to test-script.txt\n');

    // Step 2: Generate audio with ElevenLabs
    console.log('🎵 Generating audio with ElevenLabs...');
    const elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    // Use a specific voice ID (default voice)
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice

    const audio = await elevenLabs.textToSpeech.convert(voiceId, {
      text: script,
      model_id: 'eleven_multilingual_v2'
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Save audio
    await fs.writeFile('test-podcast.mp3', buffer);
    console.log(`✅ Audio generated! (${buffer.length} bytes)`);
    console.log('💾 Saved to test-podcast.mp3\n');

    console.log('🎉 SUCCESS! You can now play test-podcast.mp3');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
  }
}

testPodcast();
