const fs = require('fs');

async function getSupportedVoices() {
  console.log('--- FETCHING ALL SUPPORTED GCP TTS VOICES ---');
  const GCP_TTS_API_KEY = 'AIzaSyAwuzXONJ4Mw_9pqbj6WsvRrxFh3nMCpP4';

  try {
    const res = await fetch(`https://texttospeech.googleapis.com/v1beta1/voices?key=${GCP_TTS_API_KEY}&languageCode=ja-JP`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('HTTP Status:', res.status);
    const data = await res.json();

    if (data.error) {
      console.error('API Error:', data.error.message);
      fs.writeFileSync('c:\\Users\\user\\Desktop\\nasumid\\gcp_voices_list.json', JSON.stringify(data, null, 2));
      return;
    }

    // 日本語 (ja-JP) のボイスを抽出
    const jaVoices = data.voices ? data.voices.filter(v => v.languageCodes.includes('ja-JP')) : [];
    
    // サマリーを作成
    const summary = jaVoices.map(v => ({
      name: v.name,
      ssmlGender: v.ssmlGender,
      naturalSampleRateHertz: v.naturalSampleRateHertz,
      supportedCharacters: v.supportedCharacters ? 'Yes' : 'No'
    }));

    const result = {
      timestamp: new Date().toISOString(),
      httpStatus: res.status,
      voicesCount: jaVoices.length,
      voices: summary,
      rawResponse: data
    };

    fs.writeFileSync('c:\\Users\\user\\Desktop\\nasumid\\gcp_voices_list.json', JSON.stringify(result, null, 2));
    console.log('--- COMPLETED: check c:\\Users\\user\\Desktop\\nasumid\\gcp_voices_list.json ---');
    console.log(`Found ${jaVoices.length} ja-JP voices.`);
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}

getSupportedVoices();
