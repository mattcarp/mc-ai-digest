import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

async function listVoices() {
  try {
    const elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    console.log('🎤 Fetching available voices...\n');
    const voices = await elevenLabs.voices.getAll();

    console.log('TOP ENERGETIC/PODCAST VOICES:\n');

    // Filter for energetic voices
    const energetic = voices.voices.filter(v =>
      v.name.toLowerCase().includes('aaron') ||
      v.name.toLowerCase().includes('chad') ||
      v.name.toLowerCase().includes('josh') ||
      v.name.toLowerCase().includes('adam') ||
      v.name.toLowerCase().includes('antoni')
    );

    energetic.forEach(v => {
      console.log(`${v.name}`);
      console.log(`  ID: ${v.voice_id}`);
      console.log(`  Description: ${v.description || 'N/A'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

listVoices();
