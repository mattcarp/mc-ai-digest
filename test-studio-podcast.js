import 'dotenv/config';
import fs from 'fs/promises';

console.log('Testing ElevenLabs Studio Podcasts API...\n');

const BRIAN_VOICE_ID = 'nPczCjzI2devNBz1zQrb'; // Middle-aged male, resonant
const SARAH_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Young female, confident

// Sample article summaries for podcast
const articleSummaries = `
1. Gemini 3.0 Flash Released with Multimodal Capabilities
   Google announces Gemini 3.0 Flash with advanced audio and video processing. The model can handle real-time streams with sub-100ms latency. Business score: 85/100, Technical score: 92/100.

2. OpenAI Introduces Real-Time API for Voice Applications
   New real-time API enables natural voice conversations in applications. Supports interruptions and streaming responses. Business score: 88/100, Technical score: 89/100.

3. Anthropic Launches Claude 3.5 Haiku with 4x Speed Improvement
   Claude 3.5 Haiku delivers flagship-quality performance at 4x the speed. Optimized for high-volume applications. Business score: 82/100, Technical score: 87/100.
`;

console.log('Creating podcast project...\n');

try {
  // Step 1: Create the podcast project
  const createResponse = await fetch('https://api.elevenlabs.io/v1/studio/podcasts', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model_id: 'eleven_v3',
      mode: {
        type: 'conversation',
        conversation: {
          host_voice_id: BRIAN_VOICE_ID,
          guest_voice_id: SARAH_VOICE_ID
        }
      },
      source: {
        type: 'text',
        text: articleSummaries
      },
      quality_preset: 'standard',
      duration_scale: 'short',
      intro: "Welcome to your daily AI digest! I'm Brian.",
      outro: "Thanks for listening! Stay curious.",
      instructions_prompt: "Discuss these AI news stories in a natural, conversational way. Brian explains technical concepts, Sarah asks clarifying questions and connects to business applications. Keep it engaging and informative."
    })
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error(`Create API Error (${createResponse.status}):`, errorText);
    process.exit(1);
  }

  const project = await createResponse.json();
  console.log('Project created:', project.project_id);
  console.log('State:', project.state);
  console.log('\nWaiting for podcast generation...\n');

  // Step 2: Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

    const statusResponse = await fetch(`https://api.elevenlabs.io/v1/studio/podcasts/${project.project_id}`, {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });

    if (!statusResponse.ok) {
      console.error('Status check failed:', statusResponse.status);
      continue;
    }

    const status = await statusResponse.json();
    console.log(`Attempt ${attempts + 1}/${maxAttempts}: ${status.state}`);

    if (status.state === 'completed') {
      console.log('\nPodcast generation complete!');
      console.log('Audio URL:', status.audio_url);

      // Download the audio
      console.log('\nDownloading audio...');
      const audioResponse = await fetch(status.audio_url);
      const arrayBuffer = await audioResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await fs.writeFile('test-studio-podcast.mp3', buffer);
      console.log(`Saved ${(buffer.length / 1024 / 1024).toFixed(2)} MB to test-studio-podcast.mp3\n`);

      console.log('Playing audio...\n');
      const { exec } = await import('child_process');
      exec('open test-studio-podcast.mp3');

      break;
    } else if (status.state === 'failed') {
      console.error('\nPodcast generation failed:', status.error);
      process.exit(1);
    }

    attempts++;
  }

  if (attempts >= maxAttempts) {
    console.error('\nTimeout: Podcast generation took too long');
  }

} catch (error) {
  console.error('Error:', error.message);
}
