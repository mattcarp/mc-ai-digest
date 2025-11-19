import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

const voices = await client.voices.getAll();

const targetVoices = ['Adam', 'Sarah', 'Jessica', 'Brian', 'Charlie'];

console.log('VOICE IDs for Dialogue Podcast:\n');
console.log('='.repeat(80));

voices.voices
  .filter(v => targetVoices.includes(v.name))
  .forEach(v => {
    console.log(`\n${v.name} (${v.labels?.gender}):`);
    console.log(`  ID: ${v.voiceId}`);
    console.log(`  Age: ${v.labels?.age}`);
    console.log(`  Accent: ${v.labels?.accent}`);
    console.log(`  Description: ${v.description}`);
    console.log(`  Preview: ${v.previewUrl}`);
  });

console.log('\n' + '='.repeat(80));
