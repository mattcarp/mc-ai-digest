import 'dotenv/config';
import fs from 'fs/promises';

console.log('Testing ElevenLabs Text-to-Dialogue API...\n');

const BRIAN_VOICE_ID = 'nPczCjzI2devNBz1zQrb'; // Middle-aged male, resonant
const SARAH_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Young female, confident

const testDialogue = [
  {
    text: "Hey Sarah, have you seen the latest news about Gemini 3? It's pretty impressive!",
    voice_id: BRIAN_VOICE_ID
  },
  {
    text: "Oh absolutely! The multimodal capabilities are really exciting. What stands out to you most?",
    voice_id: SARAH_VOICE_ID
  },
  {
    text: "The audio and video processing is incredible. It can handle real-time streams with almost no latency.",
    voice_id: BRIAN_VOICE_ID
  },
  {
    text: "That's huge for business applications. I'm thinking about content moderation and live transcription services.",
    voice_id: SARAH_VOICE_ID
  },
  {
    text: "Exactly. This could completely change how we build AI-powered products.",
    voice_id: BRIAN_VOICE_ID
  }
];

console.log(`Generating ${testDialogue.length}-turn dialogue...\n`);

try {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-dialogue', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: testDialogue,
      model_id: 'eleven_v3', // v3 model with dialogue support
      output_format: 'mp3_44100_128'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}):`, errorText);
    process.exit(1);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile('test-dialogue.mp3', buffer);

  console.log(`Success! Generated ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  console.log('Saved to test-dialogue.mp3\n');
  console.log('Playing audio...\n');

  const { exec } = await import('child_process');
  exec('open test-dialogue.mp3');

} catch (error) {
  console.error('Error:', error.message);
}
