import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs/promises';

console.log('🎙️ Testing Adam voice with today\'s AI news...\n');

async function testAdam() {
  try {
    const elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    // Get all voices to find Adam's ID
    const voices = await elevenLabs.voices.getAll();
    const adam = voices.voices.find(v => v.name === 'Adam');

    if (!adam) {
      console.error('Adam voice not found!');
      return;
    }

    console.log(`Found Adam voice: ${adam.voice_id}\n`);

    const script = `Good morning Matt! Welcome to your AI digest for Monday, November 18th.

Today's big story: Google just dropped Gemini 3, and they're claiming the crown in math, science, and agentic AI benchmarks.

But that's not all - researchers just released Uni-MoE-2-point-0-Omni, an open-source multimodal model that handles text, images, audio, AND video all at once. This is the kind of tech that makes you think about what's possible.

There's also some fascinating work on audio-visual dialogue systems. We're talking AI that can actually see and hear context during conversations - not just read text.

Let's dive in!`;

    console.log('🎵 Generating audio with Adam voice...');
    const audio = await elevenLabs.textToSpeech.convert(adam.voice_id, {
      text: script,
      model_id: 'eleven_multilingual_v2'
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    await fs.writeFile('adam-test.mp3', buffer);
    console.log(`✅ Generated! (${buffer.length} bytes)`);
    console.log('💾 Saved to adam-test.mp3\n');
    console.log('🎧 Playing now...\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdam();
