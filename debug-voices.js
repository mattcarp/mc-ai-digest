import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

const voices = await client.voices.getAll();
console.log('First voice structure:');
console.log(JSON.stringify(voices.voices[0], null, 2));
