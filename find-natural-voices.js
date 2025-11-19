import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

const voices = await client.voices.getAll();

// Looking for natural, professional voices - not overly enthusiastic
// Male: George (warm resonance), Daniel (professional broadcast), Bill (comforting)
// Female: Lily (velvety British), Matilda (professional alto)

const targetVoices = ['George', 'Daniel', 'Bill', 'Lily', 'Matilda', 'Chris', 'Eric'];

console.log('NATURAL, PROFESSIONAL VOICES:\n');
console.log('='.repeat(80));

voices.voices
  .filter(v => targetVoices.includes(v.name) && v.category === 'premade')
  .forEach(v => {
    console.log(`\n${v.name} (${v.labels?.gender || 'unknown'}):`);
    console.log(`  ID: ${v.voiceId}`);
    console.log(`  Age: ${v.labels?.age || 'unknown'}`);
    console.log(`  Accent: ${v.labels?.accent || 'unknown'}`);
    console.log(`  Description: ${v.description}`);
    console.log(`  Preview: ${v.previewUrl}`);
  });

console.log('\n' + '='.repeat(80));
