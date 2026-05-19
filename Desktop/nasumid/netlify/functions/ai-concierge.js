// ===================================================
// 那須ミッドシティホテル AIコンシェルジュ バックエンド
// 【絶対堅牢・超安定版】httpsモジュール完全統一 ＆ VOICEVOX・GCP TTS 統合
// ===================================================

const https = require('https');
const { URL } = require('url');

// 超堅牢な HTTP GET 関数 (WAV/MP3バイナリ・JSON両対応)
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error("GET failed with status " + res.statusCode + " for " + url));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    }).on('error', reject);
  });
}

// 超堅牢な HTTP POST 関数 (Gemini / GCP TTS 用)
function httpPost(url, payload) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        if (res.statusCode >= 400) {
          reject(new Error("POST failed status " + res.statusCode + ": " + body));
        } else {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error("JSON parse error on body: " + body));
          }
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

const SYSTEM_PROMPT = `
あなたは那須ミッドシティホテルの優秀で温かみのある公式「AIコンシェルジュ（もりなすちゃん）」です。ホテルの宿泊客や検討中の旅行者に対して、丁寧で親切な日本語（または英語）で回答してください。

以下のホテル情報およびデジタルガイドブックの詳細知識を完璧に記憶し、これに基づいてプロフェッショナルかつ親しみやすく回答してください。AIが知らないことを聞かれた際や、緊急の対応が必要なトラブルの際は、絶対に推測で答えず、必ず「客室の電話機より内線9番でフロントまでおかけください」と直接案内してください。情報にないことは推測で話さないでください。

【那須ミッドシティホテル RAGナレッジベース】

◆ 1. 施設・サービス（設備・ビジネス対応・お子様添い寝無料）
- 朝食バイキング無料サービス：宿泊のお客様は全員無料！地産地消の和朝食や焼き立てクロワッサンを中心とした洋朝食を提供。
  - 朝食営業時間：6:45〜9:30（ラストオーダー 9:15）。場所：1階レストラン「オールヴォワール」。
  - 外来料金：大人 950円、お子様（4歳〜小学生）650円。
  - 和食メニュー：一番人気の特別な卵かけご飯、国内産白米、栃木県産コシヒカリの成熟玄米、料理長特製朝粥、高菜漬け、きくらげ昆布、梅干、つぼ漬け等。
  - 洋食メニュー：自家製クロワッサン、ダイアモンドギッフェリ、胡麻ロール、ミニコッペ、スクランブルエッグ等。
  - サラダ・シリアルコーナー：ポテトサラダまたはマカロニサラダ、コールスロー、季節の葉物サラダ、海藻サラダ等。
- ビジネス対応：
  - ロビーは無線LAN（無料）、客室はWi-Fiおよび有線LANを無料でご利用いただけます。
  - 客室内のデスクは幅2m以上と非常に大きく、デスクライトや電源コンセント完備。PC作業や書類仕事が快適に行えます。
  - フロントにてコピー・FAX（有料）を承ります。
  - ズボンプレッサー、消臭スプレー、コインランドリーも完備しており、ビジネス出張に最適。
  - 全室シモンズ製ベッドを導入。エアコンは各客室で個別コントロール可能です。防音ペアガラス窓を採用。
- お子様の添い寝無料：
  - 小学生以下のお子様は、保護者の方と同じベッドで添い寝される場合、宿泊料金が無料になります！
  - 大人2人・子供2人の4人家族でも、ツインルームでおとな2人の通常料金のままご宿泊可能です。
  - 添い寝のお子様のアメニティ（タオル、室内着、スリッパ、歯ブラシ等）は付属しませんのでご持参ください（フロントで有料レンタルも可能）。
  - 4歳〜小学生の添い寝のお子様が朝食バイキングをご利用の場合、別途650円を頂戴いたします。
  - デラックスツインを除き、エキストラベッドの追加はできません。

◆ 2. 朝食・「究極の卵かけご飯（TKG）」のこだわり
70年の歴史を持つ「稲見商店」のブランド卵「那須御養卵」を3種類から選んで贅沢に味わえます。
- 那須御養卵「白玉（しらだま）」：コクと甘みが強く、卵特有の生臭さがない一番人気の白殻卵。よもぎ粉末や木酢酸、ファフィア酵母など20種類以上をブレンドしたオリジナル配合飼料で育てられています。
- 那須御養卵「赤玉（あかだま）」：多くのシェフやパティシエに支持されるプレミアムなブランド卵。テレビやネットでも数多く紹介されています。
- 純国産鶏「さくら」の卵：日本で唯一の純国産鶏が産むさくら色の卵。大田原産の唐辛子「栃木三鷹（カプサイシン）」と北海道産ホタテ貝殻を餌にブレンドし、殻が丈夫で鮮度が長持ち。粘度が高く濃厚で、卵料理がふわふわになります。

◆ 3. 夕食（1階レストラン「オールヴォワール」）
- 営業時間：17:30〜21:00。お一人様からご家族まで歓迎。那須の食材にこだわったホテルクオリティの味をお届け。
- ビジネスマン向け「ちょい飲みセット（¥1,500）」：生ビール（中）・ハイボール・レモンサワーから1杯 ＋ 選べるお料理3品。1時間でサクッと飲める大人気セット。
- ディナーコース：
  - ステーキコースディナー：オードブル盛り合わせ、本日のスープ、パスタ、とちぎ和牛のラウンドステーキ温野菜添え、グリーンサラダ、パン又はライス、デザート盛り合わせ＆デミタスコーヒー。
  - カジュアルディナーコース：アミューズ、本日のスープ、選べるメイン料理（目鯛のソテー ブールブランソース または 那須高原豚のステーキ）、グリーンサラダ、パン又はライス、デザート＆デミタスコーヒー。
- 栃木の素材中心メニュー（スープ・サラダ・ライスまたはパン・コーヒー付）：
  - ハンバーグステーキ 200g：那須高原豚と国産牛のジューシー合挽き。和風またはマスタードソース。
  - 那須高原豚ロースステーキ 130g：甘みのある脂身が特徴のブランド豚。和風またはマスタードソース。
  - ヤシオマスのバターソテー 120g：栃木県特産プレミアムニジマス「ヤシオマス」を使用。
- キッズプレート：煮込みハンバーグ、フライドポテト、チキンライス、目玉焼き、海老フライタルタルソース、サラダ、ミニデザート、orangeジュース。
- 単品メニュー：ボロネーゼ、ペスカトーレ、ペペロンチーノ、ミックスピザ、ピッツァ・クワトロ、栃木和牛スタミナ丼、豚バラすた丼、栃木和牛すじ温茶漬け。

◆ 4. 那須・塩原の日帰り温泉ガイド（アクセス・営業時間・特徴）
当ホテルには大浴場がございませんが、周辺の素晴らしい日帰り温泉をご案内しています。
- 大鷹の湯（車で約10分）：★一番のおすすめ！★
  - 営業時間：昼の部 10:00〜14:00（最終受付13:00）/ 夜の部 18:00〜21:00（最終受付20:00）。
  - 料金：大人1,000円、小学生600円。貸切風呂は45分5,000円。
  - 泉質：ナトリウム-塩化物・炭酸水素塩温泉（源泉59.1℃）。五ツ星源泉100%掛け流しの茶褐色（ウーロン茶色）のとろみある極上モール泉。
- 千本松温泉（車で約15分）：
  - 営業時間：13:00〜23:00（最終受付22:30）。定休日なし。
  - 料金：平日大人700円 / 土日祝大人800円。
  - 泉質：アルカリ性美肌の湯（植物由来天然モール泉）。夜23時まで営業しているので遅い時間の利用に最適。
- 那須塩原駅前温泉（車で約5分・徒歩26分）：★当ホテルから最寄りの温泉！★
  - 営業時間：平日13:00〜21:00（最終受付20:00）。定休日：第3火曜日。
  - 料金：大人1,000円、子供500円。
  - 泉質：エメラルドグリーンの100%源泉かけ流し。2020年オープンで内湯・露天・サウナ完備の新しい綺麗な施設。
- みかえりの郷 彩花の湯（車で約15分）：
  - 営業時間：10:00〜21:00（最終受付20:30）。定休：第3水曜。
  - 料金：大人700円、小人400円。
  - 特徴：山々を見渡せる絶景露天風呂とサウナを完備。
- 鹿の湯（車で約35分）：
  - 営業時間：8:00〜18:00。料金：大人500円、小学生300円。
  - 泉質：乳白色の強い酸性硫黄泉。1300年の歴史を持つ名湯。非常に高コスパ。

◆ 5. Aカード現金キャッシュバックシステム
- Aカードとは：全国470以上の加盟ホテルで利用できる、入会費・年会費完全無料の最強ポイントカード。
- 還元率：宿泊料金の10%以上のポイントが付与（当ホテル特別の20%ポイント付与プランもあり！他社サイト経由は5%）。
- キャッシュバック：貯まったポイントは、加盟ホテルのフロントで「その場で即座に現金としてキャッシュバック」されます！（5,500ポイント＝5,000円、9,700ポイント＝10,000円、19,000ポイント＝20,000円など。貯めるほど還元率アップ）。
- 登録方法：フロントで「入会したい」と伝えるだけでその場で即時発行（住所記入不要でらくらくチェックイン）。WEBやアプリから登録すると500ポイントプレゼント！

【回答のルール】
1. 質問された「特定の1つの事柄」に対してのみ、ピンポイントで回答してください。余計な情報は一切含めないでください。
2. 知らないことは勝手に推測せず、必ず「客室の電話機より内線9番でフロントまでおかけください」と案内してください。
3. 1回の回答は、原則として【1〜2文程度】で簡潔に答えてください。話が長くならないようにしてください。
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

// VOICEVOX v3 API から確実に音声バイナリを取得するための堅牢ポーリング関数 (httpsモジュール使用)
async function getVoicevoxAudioV3(text, speaker, apiKey) {
  const url = "https://api.tts.quest/v3/voicevox/synthesis?key=" + apiKey + "&text=" + encodeURIComponent(text) + "&speaker=" + speaker;
  
  // 1. 生成開始リクエスト
  const initBuffer = await httpGet(url);
  const json = JSON.parse(initBuffer.toString('utf-8'));
  
  if (!json.success) throw new Error("VOICEVOX synthesis init failed");
  
  const mp3Url = json.mp3Url;
  const statusUrl = json.audioStatusUrl;

  // 2. 生成完了まで最大15秒間ポーリング
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const statBuffer = await httpGet(statusUrl);
    const statJson = JSON.parse(statBuffer.toString('utf-8'));
    
    if (statJson.isAudioReady) {
      // 3. 準備完了したら mp3Url からバイナリをダウンロード
      const audioBuffer = await httpGet(mp3Url);
      return audioBuffer.toString('base64');
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
    const GOOGLE_CLOUD_API = (process.env.GOOGLE_CLOUD_API || '').trim();
    const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
    const GCP_TTS_API_KEY = process.env.GCP_TTS_API_KEY || GEMINI_API_KEY || GOOGLE_CLOUD_API;

    if (!text) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Text required' }) };

    let answerText = text;

    // 1. Gemini RAG 回答生成 (無料キーの429制限を回避するため、有料GCPキーとの二重リトライ防御システム)
    if (!ttsOnly) {
      console.log("[Backend AI Concierge] Generating answer via Gemini (with dual-key retry)...");
      const keysToTry = [GEMINI_API_KEY, GOOGLE_CLOUD_API, GCP_TTS_API_KEY];
      let success = false;

      for (const key of keysToTry) {
        if (!key) continue;
        try {
          const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + key;
          const payload = {
            contents: [{ parts: [{ text: SYSTEM_PROMPT }, { text: "ユーザーの質問: " + text }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 200 }
          };
          const geminiData = await httpPost(geminiUrl, payload);
          if (geminiData.candidates && geminiData.candidates[0].content.parts[0]) {
            answerText = geminiData.candidates[0].content.parts[0].text.trim();
            success = true;
            console.log("[Backend AI Concierge] Gemini generated answer successfully using key: " + key.substring(0, 8) + "...");
            break;
          }
        } catch (geminiErr) { 
          console.error("Gemini attempt failed with key " + key.substring(0, 8) + "... :", geminiErr.message || geminiErr); 
        }
      }
    }

    const isEnglish = voice.toLowerCase().includes('en-us');
    const speechReadyText = optimizeTextForSpeech(answerText, isEnglish);

    let audioContent = null;

    if (isEnglish) {
      // 英語はGCP TTS (Neural2 or Chirp)
      let gcpVoiceName = 'en-US-Chirp3-HD-Aoede';
      const vLower = voice.toLowerCase();
      if (vLower.includes('kore') || vLower.includes('sophia')) gcpVoiceName = 'en-US-Chirp3-HD-Kore';
      else if (vLower.includes('neural2-f') || vLower.includes('lily')) gcpVoiceName = 'en-US-Neural2-F';

      try {
        const ttsUrl = "https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=" + GCP_TTS_API_KEY;
        const payload = {
          input: { text: speechReadyText },
          voice: { languageCode: 'en-US', name: gcpVoiceName },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 1.05 }
        };
        const ttsData = await httpPost(ttsUrl, payload);
        audioContent = ttsData.audioContent;
      } catch (e) { console.error('GCP TTS Exception:', e); }

    } else {
      // 日本語は可愛い VOICEVOX アニメ声に完全復活！
      let voicevoxSpeaker = 2; // デフォルト：四国めたん
      const vLower = voice.toLowerCase();
      if (vLower.includes('achernar') || vLower.includes('aoi')) voicevoxSpeaker = 8; // 春日部つむぎ
      else if (vLower.includes('zephyr') || vLower.includes('mei')) voicevoxSpeaker = 10; // 雨晴はう

      const VOICEVOX_API_KEY = process.env.VOICEVOX_API_KEY || 'j-81N719n201661';
      console.log("[Backend TTS] Synthesizing Japanese speech via VOICEVOX (tts.quest) Speaker ID: " + voicevoxSpeaker);

      try {
        audioContent = await getVoicevoxAudioV3(speechReadyText, voicevoxSpeaker, VOICEVOX_API_KEY);
      } catch (err) {
        console.error('VOICEVOX Exception (falling back to GCP Neural2-B):', err);
        // VOICEVOX障害時の緊急フォールバック: ja-JP-Neural2-B (実在する有効なボイス名) で確実に取得
        try {
          const ttsUrl = "https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=" + GCP_TTS_API_KEY;
          const payload = {
            input: { text: speechReadyText },
            voice: { languageCode: 'ja-JP', name: 'ja-JP-Neural2-B' },
            audioConfig: { audioEncoding: 'MP3', speakingRate: 1.08, pitch: 2.0 }
          };
          const ttsData = await httpPost(ttsUrl, payload);
          audioContent = ttsData.audioContent;
        } catch(fallbackErr) {
          console.error('GCP TTS Fallback Exception:', fallbackErr);
        }
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
    return { 
      statusCode: 500, 
      headers: corsHeaders, 
      body: JSON.stringify({ error: err.toString() }) 
    };
  }
};
