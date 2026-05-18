// ===================================================
// 那須ミッドシティホテル AIコンシェルジュ バックエンド
// Gemini 2.0 Flash ＆ VOICEVOX (tts.quest) 完全対応版
// ===================================================

const https = require('https');

const SYSTEM_PROMPT = `
あなたは那須ミッドシティホテルの優秀で温かみのある「AIコンシェルジュ」です。ホテルの宿泊客や検討中の旅行者に対して、丁寧で親切な日本語（または英語）で回答してください。

以下のホテル情報およびデジタルガイドブックの詳細知識を完璧に記憶し、これに基づいてプロフェッショナルかつ親しみやすく回答してください。AIが知らないこと（知識ベースにない情報）を聞かれた際や、緊急の対応が必要なトラブルの際は、絶対に推測で答えず、必ず「客室の電話機より内線9番でフロントまでおかけください」と直接案内してください。情報にないことは推測で話さないでください。

【ホテル基本情報】
- ホテル名：那須ミッドシティホテル
- コンセプト：「那須を動くための拠点ホテル」。圧倒的な利便性と機動力、朝食、温泉案内を組み合わせたベースキャンプです。
- 住所：〒329-3156 栃木県那須塩原市方京1-1-10
- 電話番号：0287-67-1400 (フロント)
- アクセス：JR那須塩原駅西口より徒歩3分。東北自動車道「黒磯板室IC」より約10分。
- 駐車場：無料駐車場完備（予約不要、しゃこうせいげんなし。大型車もOK）。那須高原、板室、塩原温泉郷への車移動の拠点に便利。
- チェックイン 15:00〜 / チェックアウト 〜11:00

【回答のルール】
1. 質問された「特定の1つの事柄」に対してのみ、ピンポイントで回答してください。
2. 知らないことは勝手に推測せず、必ず「内線9番」へ案内してください。
3. 1回の回答は、原則として【1〜2文程度】で簡潔に答えてください。
`;

function optimizeTextForSpeech(text, isEnglish = false) {
  if (!text) return '';
  if (isEnglish) return text.replace(/:/g, ' ');

  let optimized = text;
  optimized = optimized.replace(/6:30/g, '六時半');
  optimized = optimized.replace(/6:45/g, '六時四十五分');
  optimized = optimized.replace(/9:00/g, '九時');
  optimized = optimized.replace(/9:30/g, '九時半');
  optimized = optimized.replace(/15:00/g, '十五時');
  optimized = optimized.replace(/11:00/g, '十一時');
  optimized = optimized.replace(/1階/g, 'いっかい');
  optimized = optimized.replace(/2階/g, 'にかい');
  optimized = optimized.replace(/1,000円/g, '千円');
  optimized = optimized.replace(/無料/g, 'むりょう');
  optimized = optimized.replace(/Wi-Fi/g, 'ワイファイ');
  optimized = optimized.replace(/0287-67-1400/g, 'れい にー はち なな、ろく なな、いち よん ぜろ ぜろ');
  optimized = optimized.replace(/那須御養卵/g, 'なすごようらん');
  optimized = optimized.replace(/大鷹の湯/g, 'おおたかのゆ');
  optimized = optimized.replace(/Aカード/g, 'えーかーど');
  optimized = optimized.replace(/内線9番/g, 'ないせん きゅうばん');
  optimized = optimized.replace(/🍆/g, '');
  optimized = optimized.replace(/[🌸💎❄️🎀👑🌼⭐🌟✨🦊💡🍀🎵👀👩👨🏨📞📱]/g, '');
  optimized = optimized.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');

  return optimized;
}

// VOICEVOX v3 API から確実に音声バイナリを取得するためのポーリング関数
async function getVoicevoxAudioV3(text, speaker, apiKey) {
  const url = `https://api.tts.quest/v3/voicevox/synthesis?key=${apiKey}&text=${encodeURIComponent(text)}&speaker=${speaker}`;
  const res = await fetch(url);
  const json = await res.json();
  
  if (!json.success) throw new Error("VOICEVOX synthesis init failed");
  
  const mp3Url = json.mp3Url;
  const statusUrl = json.audioStatusUrl;

  // 生成完了まで最大15秒間ポーリング
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const statRes = await fetch(statusUrl);
    const statJson = await statRes.json();
    
    if (statJson.isAudioReady) {
      // 準備完了したら mp3Url からバイナリをダウンロード
      const audioRes = await fetch(mp3Url);
      const arrayBuffer = await audioRes.arrayBuffer();
      return Buffer.from(arrayBuffer).toString('base64');
    }
    if (statJson.isAudioError) {
      throw new Error("VOICEVOX synthesis processing error");
    }
  }
  throw new Error("VOICEVOX synthesis timeout");
}

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };

  try {
    const { text = '', voice = 'ja-JP-Chirp3-HD-Aoede', ttsOnly = false } = JSON.parse(event.body || '{}');
    const GCP_TTS_API_KEY = process.env.GCP_TTS_API_KEY || 'AIzaSyAwuzXONJ4Mw_9pqbj6WsvRrxFh3nMCpP4';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!text) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Text required' }) };

    let answerText = text;

    if (!ttsOnly && GEMINI_API_KEY) {
      console.log(`[Backend AI Concierge] Generating answer via Gemini...`);
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: SYSTEM_PROMPT }, { text: `ユーザーの質問: ${text}` }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 200 }
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          if (geminiData.candidates && geminiData.candidates[0].content.parts[0]) {
            answerText = geminiData.candidates[0].content.parts[0].text.trim();
          }
        }
      } catch (geminiErr) { console.error('Gemini Error:', geminiErr); }
    }

    const isEnglish = voice.toLowerCase().includes('en-us');
    const speechReadyText = optimizeTextForSpeech(answerText, isEnglish);

    let audioContent = null;

    if (isEnglish) {
      // 英語はGCP TTS (Neural2 or Chirp) を継続
      let gcpVoiceName = 'en-US-Chirp3-HD-Aoede';
      const vLower = voice.toLowerCase();
      if (vLower.includes('kore') || vLower.includes('sophia')) gcpVoiceName = 'en-US-Chirp3-HD-Kore';
      else if (vLower.includes('neural2-f') || vLower.includes('lily')) gcpVoiceName = 'en-US-Neural2-F';

      try {
        const ttsUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${GCP_TTS_API_KEY}`;
        const ttsRes = await fetch(ttsUrl, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: speechReadyText },
            voice: { languageCode: 'en-US', name: gcpVoiceName },
            audioConfig: { audioEncoding: 'MP3', speakingRate: 1.05 }
          })
        });
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          audioContent = ttsData.audioContent;
        }
      } catch (e) { console.error('GCP TTS Exception:', e); }

    } else {
      // 日本語は可愛い VOICEVOX (tts.quest) アニメ声に完全復活！！！
      let voicevoxSpeaker = 2; // デフォルト：四国めたん(さくら)
      const vLower = voice.toLowerCase();
      if (vLower.includes('achernar') || vLower.includes('aoi')) voicevoxSpeaker = 8; // 春日部つむぎ(あおい)
      else if (vLower.includes('zephyr') || vLower.includes('mei')) voicevoxSpeaker = 10; // 雨晴はう(めい)

      const VOICEVOX_API_KEY = process.env.VOICEVOX_API_KEY || 'free';
      console.log(`[Backend TTS] Synthesizing Japanese speech via VOICEVOX (tts.quest) Speaker ID: ${voicevoxSpeaker}`);

      try {
        audioContent = await getVoicevoxAudioV3(speechReadyText, voicevoxSpeaker, VOICEVOX_API_KEY);
      } catch (err) {
        console.error('VOICEVOX Exception:', err);
        // VOICEVOXがタイムアウトした時の緊急フォールバック: GCPの高品質な「自然な女性の声(Neural2-F)」を使う（決してStandard-Aではない）
        try {
          console.log('[Backend TTS] VOICEVOX failed, falling back to GCP Neural2-F');
          const ttsUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${GCP_TTS_API_KEY}`;
          const ttsRes = await fetch(ttsUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: { text: speechReadyText },
              voice: { languageCode: 'ja-JP', name: 'ja-JP-Neural2-F' },
              audioConfig: { audioEncoding: 'MP3', speakingRate: 1.08, pitch: 2.0 }
            })
          });
          if (ttsRes.ok) {
            const ttsData = await ttsRes.json();
            audioContent = ttsData.audioContent;
          }
        } catch(fallbackErr) {}
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        answer: answerText,
        audio: audioContent,
        mimeType: 'audio/mp3'
      })
    };

  } catch (err) {
    console.error('Handler error:', err);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.toString() }) };
  }
};
