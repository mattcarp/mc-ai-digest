import 'dotenv/config';
import fs from 'fs/promises';

console.log('Testing natural dialogue with Chris & Lily...\n');

const CHRIS_VOICE_ID = 'iP95p4xoKVk53GoZ742B'; // Male - natural, down-to-earth
const LILY_VOICE_ID = 'pFZP5JQG7iQjIQuC4Bku'; // Female - velvety British, warm

const naturalDialogue = [
  {
    text: "Alright, so Gemini 3.0 Flash just dropped. Sub-100 millisecond latency for multimodal processing.",
    voice_id: CHRIS_VOICE_ID
  },
  {
    text: "Right, and before everyone loses their minds - what's the actual business case here?",
    voice_id: LILY_VOICE_ID
  },
  {
    text: "[pauses] Fair question. So we're talking real-time audio and video streams. Think content moderation, live transcription, that kind of thing.",
    voice_id: CHRIS_VOICE_ID
  },
  {
    text: "Okay, so not just another overhyped demo. This could actually matter for production systems.",
    voice_id: LILY_VOICE_ID
  },
  {
    text: "Exactly. And with that 92 technical score and 85 business score, [pauses] yeah, this is worth paying attention to.",
    voice_id: CHRIS_VOICE_ID
  },
  {
    text: "[sighs] Finally, some progress that's not just marketing bullshit.",
    voice_id: LILY_VOICE_ID
  },
  {
    text: "[chuckles] Right? The latency numbers are damn impressive for once.",
    voice_id: CHRIS_VOICE_ID
  }
];

console.log(`Generating ${naturalDialogue.length}-turn dialogue...\n`);

try {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-dialogue', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: naturalDialogue,
      model_id: 'eleven_v3',
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

  await fs.writeFile('test-natural-dialogue.mp3', buffer);

  console.log(`Success! Generated ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  console.log('Saved to test-natural-dialogue.mp3\n');
  console.log('Playing audio...\n');

  const { exec } = await import('child_process');
  exec('open test-natural-dialogue.mp3');

} catch (error) {
  console.error('Error:', error.message);
}
