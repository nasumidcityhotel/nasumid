const https = require('https');

exports.handler = async (event) => {
  const { text } = event.queryStringParameters || {};
  if (!text) {
    return { 
      statusCode: 400, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Missing text parameter' 
    };
  }

  const speakerId = 2; // 四国めたん (ノーマル)
  const ttsUrl = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(text)}&speaker=${speakerId}`;

  // Node.jsのバージョンや外部ライブラリ（fetch）に一切依存しない、Node標準のhttpsモジュールで実装します
  return new Promise((resolve) => {
    https.get(ttsUrl, (res) => {
      if (res.statusCode !== 200) {
        resolve({
          statusCode: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: `TTS Server responded with status ${res.statusCode}` })
        });
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          statusCode: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400'
          },
          body: buffer.toString('base64'),
          isBase64Encoded: true
        });
      });
    }).on('error', (err) => {
      console.error('TTS Proxy HTTP Error:', err);
      resolve({
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: err.message })
      });
    });
  });
};
