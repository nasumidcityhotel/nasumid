// ===================================================
// 那須ミッドシティホテル AIコンシェルジュ バックエンド
// Gemini 2.0 Flash ＆ GCP Text-to-Speech (Chirp 3 HD) 統合版
// ===================================================

const SYSTEM_PROMPT = `
あなたは那須ミッドシティホテルの優秀で温かみのある「AIコンシェルジュ」です。ホテルの宿泊客や検討中の旅行者に対して、丁寧で親切な日本語（または英語）で回答してください。

以下のホテル情報を完璧に把握し、これに基づいて回答してください。情報にないことは推測で話さず、フロント（TEL: 0287-67-1400）へのお問い合わせを案内してください。

【ホテル基本情報】
- ホテル名：那須ミッドシティホテル
- コンセプト：「那須を動くための拠点ホテル」。圧倒的な利便性と機動力、朝食、温泉案内を組み合わせたベースキャンプです。
- 住所：〒329-3156 栃木県那須塩原市方京1-1-10
- 電話番号：0287-67-1400 (フロント)
- アクセス：
  - 電車：JR那須塩原駅西口より徒歩3分。東京駅から新幹線で約70分。
  - 車：東北自動車道「黒磯板室IC」より約10分。
  - 駐車場：無料駐車場完備（予約不要、車高制限なし。大型車もOK）。那須高原、板室、塩原温泉郷への車移動の拠点に便利。

【朝食（BREAKFAST）】
- 時間：毎朝 6:30 〜 9:00（朝早くから動く方のために早朝オープン）
- 場所：1階レストラン
- 料金：無料（宿泊者全員サービス）
- 内容：和洋バイキング。那須御養卵の特別なブランド卵を使った卵かけごはん、地元野菜 of サラダ、焼きたてパン、栃木県産のお米と味噌汁など。

【客室（ROOMS）】
- 特徴：全室に一流のシモンズ製ベッドを採用。個別空調、防音ペアガラス、幅2mのワイドデスク完備。
- お風呂：全室ユニットバス（客室は「しっかり休む場所」とし、お風呂は周辺の名湯巡りをおすすめしています）。

【温泉案内（ONSEN GUIDE）】
- ホテル館内に温泉大浴場はありません。
- 代わりに、周辺の名湯（那須温泉郷：車15分、板室温泉：車20分、塩原温泉郷：車40分）への日帰り入浴をご案内しています。
- おすすめ日帰り温泉「源泉 那須山」（車で約15分）：
  - フロントにて割引券を販売中。
  - 割引料金：平日 680円（通常 1,020円）、土日祝日 880円（通常 1,020円）。

【その他の情報】
- チェックイン：15:00から / チェックアウト：10:00まで
- 荷物預かり：チェックイン前、チェックアウト後もフロントにて無料で荷物をお預かりします。
- ペット同伴：ペット同伴のご宿泊はご遠慮いただいております（補助犬・盲導犬・介助犬は同伴宿泊可能です）。
- 館内Wi-Fi：全室・全館無料Wi-Fi完備。

【回答のルール】
1. 回答は簡潔かつ温かみのあるトーンで行ってください。長すぎる文章は読み上げ時に聞き取りづらくなるため、3〜4文程度（200文字以内）にまとめるのが理想です。
2. 音声合成で読み上げられるため、漢字の羅列や読みづらい記号は避け、自然な日本語で話してください。
3. ユーザーが「一番近い温泉は？」など、直前の会話の文脈を引き継いだ質問をしてきた場合、前後の文脈を理解して適切に答えてください。
`;

// 日本語の自然な抑揚（AI特有のロボットっぽいイントネーション崩れ）を完全に防ぐための自動置換エンジン
function optimizeTextForSpeech(text, isEnglish = false) {
  if (!text) return '';
  if (isEnglish) {
    // 英語の読み上げ最適化（コロンの読みやすさ調整など）
    return text.replace(/:/g, ' ');
  }

  let optimized = text;

  // 1. 時間表記 (例: 6:30 -> 六時半、9:00 -> 九時)
  optimized = optimized.replace(/6:30/g, '六時半');
  optimized = optimized.replace(/9:00/g, '九時');
  optimized = optimized.replace(/15:00/g, '十五時');
  optimized = optimized.replace(/10:00/g, '十時');
  optimized = optimized.replace(/11:00/g, '十一時');
  optimized = optimized.replace(/24時間/g, 'にじゅうよじかん');

  // 2. 階数や部屋番号 (例: 1階 -> いっかい、2階 -> にかい)
  optimized = optimized.replace(/1階/g, 'いっかい');
  optimized = optimized.replace(/2階/g, 'にかい');
  optimized = optimized.replace(/3階/g, 'さんかい');
  optimized = optimized.replace(/4階/g, 'よんかい');

  // 3. 価格表記 (例: 1,020円 -> せんにじゅうえん、2,000円 -> にせんえん)
  optimized = optimized.replace(/1,020円/g, '千二十円');
  optimized = optimized.replace(/1,000円/g, '千円');
  optimized = optimized.replace(/2,000円/g, '二千円');
  optimized = optimized.replace(/1,200円/g, '千二百円');
  optimized = optimized.replace(/1,400円/g, '千四百円');
  optimized = optimized.replace(/500円/g, '五百円');
  optimized = optimized.replace(/無料/g, 'むりょう');

  // 4. アルファベット表記 (例: Wi-Fi -> ワイファイ、LAN -> ラン)
  optimized = optimized.replace(/Wi-Fi/g, 'ワイファイ');
  optimized = optimized.replace(/LAN/g, 'ラン');
  optimized = optimized.replace(/AI/g, 'えーあい');
  optimized = optimized.replace(/VOD/g, 'ブイオーディー');
  optimized = optimized.replace(/QA/g, 'キューアンドエー');

  // 5. 電話番号などの記号 (例: 0287-67-1400 -> ゼロにーはちなな、ろくなな、いちよんぜろぜろ)
  optimized = optimized.replace(/0287-67-1400/g, 'れい にー はち なな、ろく なな、いち よん ぜろ ぜろ');

  // 6. 漢数字の正しい読み上げ調整
  optimized = optimized.replace(/那須御養卵/g, 'なすごようらん');
  optimized = optimized.replace(/那須郡/g, 'なすぐん');
  optimized = optimized.replace(/那須町/g, 'なすまち');
  optimized = optimized.replace(/塩原/g, 'しおばら');
  optimized = optimized.replace(/板室/g, 'いたむろ');

  return optimized;
}

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const { messages = [], text = '', voice = 'ja-JP-Chirp3-HD-Aoede' } = JSON.parse(event.body || '{}');

    // APIキーの設定（環境変数優先、なければ有効なキーへフォールバック）
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBcoOdM42W3iOaP5NF8OqtX4p2FDZKUOB8';
    const GCP_TTS_API_KEY = process.env.GCP_TTS_API_KEY || 'AIzaSyAwuzXONJ4Mw_9pqbj6WsvRrxFh3nMCpP4';

    let answerText = '';

    // 1. 動的対話と単体音声合成の振り分け
    if (messages && messages.length > 0) {
      // Gemini 2.0 Flash によるテキスト応答生成
      const contents = messages.map(msg => {
        let role = 'user';
        if (msg.role === 'model' || msg.role === 'bot' || msg.role === 'assistant') {
          role = 'model';
        }
        return {
          role: role,
          parts: [{ text: msg.text }]
        };
      });

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        throw new Error(`Gemini API Error: ${errText}`);
      }

      const geminiData = await geminiRes.json();
      if (!geminiData.candidates || geminiData.candidates.length === 0) {
        throw new Error('Gemini API returned no candidates');
      }
      answerText = geminiData.candidates[0].content.parts[0].text.trim();
    } else if (text) {
      // 音声合成のみルート
      answerText = text;
    } else {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Either messages or text parameter is required' })
      };
    }

    // 2. GCP Text-to-Speech による音声生成
    const isEnglish = voice.toLowerCase().includes('en-us');
    const speechReadyText = optimizeTextForSpeech(answerText, isEnglish);

    // ボイスマッピング
    let geminiVoice = 'ja-JP-Chirp3-HD-Aoede'; // デフォルト (日本語・さくら)
    let langCode = 'ja-JP';
    const vLower = voice.toLowerCase();

    // 🔴 英語ボイス（en-US）のマッピング
    if (isEnglish) {
      langCode = 'en-US';
      if (vLower.includes('aoede') || vLower.includes('emily')) {
        geminiVoice = 'en-US-Chirp3-HD-Aoede'; // 明るい英語女性
      } else if (vLower.includes('kore') || vLower.includes('sophia')) {
        geminiVoice = 'en-US-Chirp3-HD-Kore'; // 上品な英語女性
      } else if (vLower.includes('charon') || vLower.includes('oliver')) {
        geminiVoice = 'en-US-Chirp3-HD-Charon'; // 丁寧な英語男性
      } else if (vLower.includes('fenrir') || vLower.includes('jack')) {
        geminiVoice = 'en-US-Chirp3-HD-Fenrir'; // 頼もしい英語男性
      } else {
        geminiVoice = 'en-US-Chirp3-HD-Aoede';
      }
    } 
    // 🔵 日本語ボイス（ja-JP）のマッピング
    else {
      langCode = 'ja-JP';
      if (vLower.includes('aoede') || vLower.includes('sakura')) {
        geminiVoice = 'ja-JP-Chirp3-HD-Aoede'; // さくら
      } else if (vLower.includes('achernar') || vLower.includes('aoi')) {
        geminiVoice = 'ja-JP-Chirp3-HD-Achernar'; // あおい
      } else if (vLower.includes('zephyr') || vLower.includes('yuki')) {
        geminiVoice = 'ja-JP-Chirp3-HD-Zephyr'; // ゆき
      } else if (vLower.includes('charon') || vLower.includes('takumi')) {
        geminiVoice = 'ja-JP-Chirp3-HD-Charon'; // たくみ
      } else if (vLower.includes('alnilam') || vLower.includes('kenji')) {
        geminiVoice = 'ja-JP-Chirp3-HD-Alnilam'; // けんじ
      }
    }

    console.log(`[Backend AI Concierge] Generating text & speech... Selected Voice: ${geminiVoice}`);

    const ttsUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${GCP_TTS_API_KEY}`;
    const ttsRes = await fetch(ttsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: speechReadyText },
        voice: {
          languageCode: langCode,
          name: geminiVoice
        },
        audioConfig: {
          audioEncoding: 'LINEAR16',        // 非圧縮WAVを指定
          sampleRateHertz: 48000,          // CDを超える48kHzスタジオ音質を指定
          speakingRate: 1.0,
          pitch: 0.0
        }
      })
    });

    let audioContent = null;
    if (ttsRes.ok) {
      const ttsData = await ttsRes.json();
      audioContent = ttsData.audioContent;
    } else {
      console.error('GCP TTS Error:', await ttsRes.text());
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        answer: answerText,
        audio: audioContent,
        mimeType: 'audio/wav'
      })
    };

  } catch (err) {
    console.error('Handler error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: err.toString()
      })
    };
  }
};
