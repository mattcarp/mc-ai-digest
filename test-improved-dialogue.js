import 'dotenv/config';
import fs from 'fs/promises';

console.log('Testing improved dialogue with audio tags and Adam/Jessica voices...\n');

const ADAM_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Male - warm, emotional depth
const JESSICA_VOICE_ID = 'cgSgspJ2msm6clMCkdW9'; // Female - playful, popular

const improvedDialogue = [
  {
    text: "[excited] Hey Jessica, good morning! Have you seen the latest Gemini 3.0 news?",
    voice_id: ADAM_VOICE_ID
  },
  {
    text: "[chuckles] Morning Adam! Oh yeah, I saw that! [pauses] The multimodal stuff looks incredible.",
    voice_id: JESSICA_VOICE_ID
  },
  {
    text: "[thoughtful] Right? So what makes this really interesting is the real-time processing. We're talking sub-100 millisecond latency for audio and video streams.",
    voice_id: ADAM_VOICE_ID
  },
  {
    text: "[surprised] Wow, that's fast! [pauses] So what does that mean for businesses?",
    voice_id: JESSICA_VOICE_ID
  },
  {
    text: "[excited] Great question! Think about content moderation, live transcription, real-time translation... [pauses] The applications are huge.",
    voice_id: ADAM_VOICE_ID
  },
  {
    text: "[excited] Oh I see! [laughs] This could completely change how we build AI products!",
    voice_id: JESSICA_VOICE_ID
  },
  {
    text: "[thoughtful] Exactly. And with that business score of 85 and technical score of 92, [pauses] this is definitely something to pay attention to.",
    voice_id: ADAM_VOICE_ID
  }
];

console.log(`Generating ${improvedDialogue.length}-turn dialogue with audio tags...\n`);

try {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-dialogue', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: improvedDialogue,
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

  await fs.writeFile('test-improved-dialogue.mp3', buffer);

  console.log(`Success! Generated ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  console.log('Saved to test-improved-dialogue.mp3\n');
  console.log('Playing audio...\n');

  const { exec } = await import('child_process');
  exec('open test-improved-dialogue.mp3');

} catch (error) {
  console.error('Error:', error.message);
}
