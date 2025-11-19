import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

console.log('Fetching available voices...\n');

const voices = await client.voices.getAll();

console.log(`Found ${voices.voices.length} voices\n`);
console.log('='.repeat(80));

// Filter for high-quality premade voices
const premadeVoices = voices.voices
  .filter(v => v.category === 'premade')
  .sort((a, b) => a.name.localeCompare(b.name));

console.log('\nPREMADE VOICES (High Quality):');
console.log('='.repeat(80));

premadeVoices.forEach(voice => {
  const gender = voice.labels?.gender || 'unknown';
  const age = voice.labels?.age || '';
  const accent = voice.labels?.accent || '';
  const description = voice.labels?.description || voice.description || '';
  const useCase = voice.labels?.['use case'] || '';

  console.log(`\nName: ${voice.name}`);
  console.log(`ID: ${voice.voice_id || 'N/A'}`);
  console.log(`Gender: ${gender}`);
  if (age) console.log(`Age: ${age}`);
  if (accent) console.log(`Accent: ${accent}`);
  if (description) console.log(`Description: ${description}`);
  if (useCase) console.log(`Use case: ${useCase}`);
  console.log('-'.repeat(80));
});

// Show some good dialogue pairs
console.log('\n\nRECOMMENDED DIALOGUE PAIRS:');
console.log('='.repeat(80));

const males = premadeVoices.filter(v => v.labels?.gender === 'male');
const females = premadeVoices.filter(v => v.labels?.gender === 'female');

console.log('\nMALE VOICES:');
males.slice(0, 5).forEach(v => {
  console.log(`  - ${v.name} (${v.voice_id}): ${v.labels?.description || v.labels?.accent || ''}`);
});

console.log('\nFEMALE VOICES:');
females.slice(0, 5).forEach(v => {
  console.log(`  - ${v.name} (${v.voice_id}): ${v.labels?.description || v.labels?.accent || ''}`);
});
