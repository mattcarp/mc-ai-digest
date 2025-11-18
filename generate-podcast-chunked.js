import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs/promises';

console.log('🎙️ Generating podcast in chunks to avoid timeouts...\n');

async function generateChunkedPodcast() {
  try {
    // Read the full script
    const fullScript = await fs.readFile('full-podcast-script.txt', 'utf-8');

    // Split into smaller chunks (around 1500 chars each for safety)
    const chunks = [];
    const lines = fullScript.split('\n');
    let currentChunk = '';

    for (const line of lines) {
      if (currentChunk.length + line.length > 1500 && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = line + '\n';
      } else {
        currentChunk += line + '\n';
      }
    }
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    console.log(`📝 Split script into ${chunks.length} chunks\n`);

    const elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    const audioChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`🎵 Generating chunk ${i + 1}/${chunks.length}...`);

      try {
        const audio = await elevenLabs.textToSpeech.convert('IKne3meq5aSn9XLyUdCD', {
          text: chunks[i],
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        });

        const chunkBuffers = [];
        for await (const chunk of audio) {
          chunkBuffers.push(chunk);
        }
        const buffer = Buffer.concat(chunkBuffers);
        audioChunks.push(buffer);

        console.log(`  ✅ Chunk ${i + 1} done (${buffer.length} bytes)`);

        // Small delay between chunks to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (err) {
        console.error(`  ❌ Chunk ${i + 1} failed: ${err.message}`);
        throw err;
      }
    }

    // Combine all chunks
    console.log('\n🔧 Merging all audio chunks...');
    const finalAudio = Buffer.concat(audioChunks);

    await fs.writeFile('full-podcast-chunked.mp3', finalAudio);
    console.log(`✅ Complete podcast generated! (${(finalAudio.length / 1024 / 1024).toFixed(2)} MB)`);
    console.log('💾 Saved to full-podcast-chunked.mp3\n');
    console.log('🎧 Ready to play!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generateChunkedPodcast();
