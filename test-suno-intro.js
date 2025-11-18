import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';

console.log('🎵 Testing Suno API for sung intro...\n');

async function testSunoIntro() {
  try {
    const apiKey = process.env.SUNO_API_KEY;

    if (!apiKey) {
      console.error('❌ SUNO_API_KEY not found in .env');
      return;
    }

    console.log(`🔑 Using API key: ${apiKey.substring(0, 8)}...`);

    // Generate a 20-second jazz intro about today's AI news
    const prompt = `Create a 20-second upbeat jazz intro song with vocals about AI news. Lyrics: "Good morning Matt, it's time for AI! Gemini 3 is reaching for the sky! Multimodal models everywhere, audio and video in the air! Your daily digest starts right here!"`;

    console.log('📝 Prompt:', prompt);
    console.log('\n🎼 Generating music with Suno...\n');

    // Try different possible API endpoints
    const endpoints = [
      'https://api.sunoapi.net/api/generate',
      'https://api.aimlapi.com/suno/generate',
      'https://sunoapi.com/api/generate'
    ];

    let response;
    let successfulEndpoint;

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);

        response = await axios.post(endpoint, {
          prompt: prompt,
          make_instrumental: false,
          model: 'chirp-v3-5',
          wait_audio: true
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000 // 2 minutes
        });

        successfulEndpoint = endpoint;
        console.log(`✅ Success with ${endpoint}!\n`);
        break;

      } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        continue;
      }
    }

    if (!response) {
      console.error('\n❌ All endpoints failed. The API key may be from a different service.');
      console.log('\nPlease check which service provided the key:');
      console.log('- sunoapi.net');
      console.log('- musicapi.ai');
      console.log('- aimlapi.com');
      return;
    }

    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.data.audio_url) {
      console.log('\n🎵 Downloading audio...');
      const audioResponse = await axios.get(response.data.audio_url, {
        responseType: 'arraybuffer'
      });

      await fs.writeFile('suno-intro.mp3', audioResponse.data);
      console.log('✅ Saved to suno-intro.mp3');
      console.log('🎧 Ready to play!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testSunoIntro();
