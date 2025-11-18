import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs/promises';

console.log('🎙️ Generating conversational news sample...\n');

async function generateConversation() {
  try {
    const elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    // Natural conversational intro about today's top AI news
    const conversation = `Good morning Matt! Welcome to your AI digest for Monday, November 18th.

Today we're covering some exciting developments in multimodal AI. Google just unveiled Gemini 3, claiming leadership in math, science, and agentic AI benchmarks. Meanwhile, researchers released Uni-MoE-2.0-Omni, an open-source model that handles text, images, audio, and video all at once.

There's also fascinating work on audio-visual dialogue systems that can actually see and hear context during conversations. And if you're interested in long-form video understanding, there's a new system called GCAgent that can process hours of video content.

Let's dive into the details.`;

    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice

    console.log('🎵 Generating audio...');
    const audio = await elevenLabs.textToSpeech.convert(voiceId, {
      text: conversation,
      model_id: 'eleven_multilingual_v2'
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    await fs.writeFile('conversation-sample.mp3', buffer);
    console.log(`✅ Conversation generated! (${buffer.length} bytes)`);
    console.log('💾 Saved to conversation-sample.mp3\n');
    console.log('🎧 Playing now...\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generateConversation();
