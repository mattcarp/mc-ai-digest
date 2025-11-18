import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs/promises';

console.log('🎙️ Testing Charlie voice...\n');

async function testCharlie() {
  try {
    const elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    const script = `Good morning Matt! Your AI digest for Monday, November 18th is here.

Big news today: Google unveiled Gemini 3, claiming leadership in math, science, and agentic AI benchmarks. They're really pushing hard in the multimodal space.

We've also got Uni-MoE-2-point-0-Omni dropping - an open-source model handling text, images, audio, and video simultaneously. This is exactly the kind of omnimodal tech that could change how we build applications.

Plus there's new research on audio-visual dialogue systems that actually understand what they see AND hear. Pretty wild stuff.

Let's get into it!`;

    console.log('🎵 Generating with Charlie (Australian male, natural)...');
    const audio = await elevenLabs.textToSpeech.convert('IKne3meq5aSn9XLyUdCD', {
      text: script,
      model_id: 'eleven_multilingual_v2'
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    await fs.writeFile('charlie-test.mp3', buffer);
    console.log(`✅ Generated! (${buffer.length} bytes)`);
    console.log('🎧 Playing now...\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCharlie();
