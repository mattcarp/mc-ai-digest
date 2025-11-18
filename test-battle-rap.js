import 'dotenv/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs/promises';

console.log('🎤 Generating AI News Battle Rap...\n');

async function generateBattleRap() {
  try {
    const elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    // Fun battle rap about AI news
    const battleRap = `Alex: Yo Matt, listen up, it's time to drop some knowledge,
Multimodal AI, straight outta research college!
Gemini 3's claiming the throne, benchmarks on fire,
But Uni-MoE-2.0 got that omni desire!

Sam: Hold up Alex, let me break it down real quick,
Audio, video, images - this model's doing tricks!
Mixture-of-Experts routing like a boss all day,
Your coffee's getting cold while we're serving AI buffet!

Alex: Ha! Dialogue systems understanding what you say and see,
AV-Dialog's bringing conversations to reality!
No more chatbots that are deaf and blind,
We're talking full context, audio-visual combined!

Sam: Bars! But check this - long video understanding too,
GCAgent watching hours while we're just watching you!
Schematic memory, narrative flow, it's getting deep,
This AI never sleeps while Matt's trying to sleep!

Alex: Alright alright, we'll let you get back to your day,
But tomorrow morning, we'll be back to play!
AI digest delivered fresh, no delay,
Your daily dose of tech news, the only way!

Both: Peace out Matt! Time to innovate and create!`;

    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel voice

    console.log('🎵 Generating battle rap audio...');
    const audio = await elevenLabs.textToSpeech.convert(voiceId, {
      text: battleRap,
      model_id: 'eleven_multilingual_v2'
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    await fs.writeFile('battle-rap.mp3', buffer);
    console.log(`✅ Battle rap generated! (${buffer.length} bytes)`);
    console.log('💾 Saved to battle-rap.mp3\n');
    console.log('🎤 DROPPING BARS NOW...\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generateBattleRap();
