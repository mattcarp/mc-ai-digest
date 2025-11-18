import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs/promises';

console.log('🎵 Generating morning intro teaser...\n');

async function generateIntro() {
  try {
    const elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    // Fun energetic intro
    const intro = "Good morning Matt! It's Monday, November 18th, and you've got 15 fresh AI insights waiting for you. Grab your coffee and let's dive in!";

    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice

    console.log('🎵 Generating intro audio...');
    const audio = await elevenLabs.textToSpeech.convert(voiceId, {
      text: intro,
      model_id: 'eleven_multilingual_v2'
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    await fs.writeFile('morning-intro.mp3', buffer);
    console.log(`✅ Morning intro generated! (${buffer.length} bytes)`);
    console.log('💾 Saved to morning-intro.mp3\n');
    console.log('🎧 Playing now...');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generateIntro();
