import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

const voices = await client.voices.getAll();

// Popular voices from research:
// Male: Aaron, Adam, Josh, James
// Female: Natasha, Cassidy, Charlotte

const popularNames = ['Aaron', 'Adam', 'Josh', 'James', 'Natasha', 'Cassidy', 'Charlotte', 'Rachel'];

console.log('MOST POPULAR PODCAST VOICES:\n');
console.log('='.repeat(80));

voices.voices
  .filter(v => popularNames.includes(v.name))
  .forEach(v => {
    console.log(`\n${v.name} (${v.labels?.gender || 'unknown'}):`);
    console.log(`  ID: ${v.voiceId}`);
    console.log(`  Age: ${v.labels?.age || 'unknown'}`);
    console.log(`  Accent: ${v.labels?.accent || 'unknown'}`);
    console.log(`  Description: ${v.description}`);
    console.log(`  Preview: ${v.previewUrl}`);
  });

console.log('\n' + '='.repeat(80));
