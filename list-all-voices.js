import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

async function listAllVoices() {
  try {
    const elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    console.log('🎤 Fetching ALL available voices...\n');
    const result = await elevenLabs.voices.getAll();

    console.log(`Total voices: ${result.voices.length}\n`);

    result.voices.slice(0, 15).forEach((v, i) => {
      console.log(`${i + 1}. ${v.name}`);
      console.log(`   ID: ${v.voiceId || v.voice_id}`);
      console.log(`   Category: ${v.category || 'N/A'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
}

listAllVoices();
