import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs/promises';

console.log('🎙️ Quick audio test...\n');

async function quickTest() {
  try {
    console.log('🎵 Generating audio with ElevenLabs...');
    const elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    // Super short test - just 40 characters
    const testScript = "Alex: Hey Matt! Sam: Your podcast is ready!";

    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice

    const audio = await elevenLabs.textToSpeech.convert(voiceId, {
      text: testScript,
      model_id: 'eleven_multilingual_v2'
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Save audio
    await fs.writeFile('quick-test.mp3', buffer);
    console.log(`✅ Audio generated! (${buffer.length} bytes)`);
    console.log('💾 Saved to quick-test.mp3\n');

    console.log('🎉 Play it now: open quick-test.mp3');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.status) {
      console.error('Status:', error.status);
      console.error('Body:', error.body);
    }
  }
}

quickTest();
