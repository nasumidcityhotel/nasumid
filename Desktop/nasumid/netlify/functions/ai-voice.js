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

  try {
    // Netlify (Node 18+) 環境のグローバルfetchを使用し、極めてシンプルかつビルドエラーを起こさない構成にします
    const response = await fetch(ttsUrl);
    if (!response.ok) throw new Error(`TTS server responded with status: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      },
      body: base64Audio,
      isBase64Encoded: true
    };
  } catch (err) {
    console.error('TTS Proxy Error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
