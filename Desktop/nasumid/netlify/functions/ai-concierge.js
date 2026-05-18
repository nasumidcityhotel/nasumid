// ===================================================
// 那須ミッドシティホテル AIコンシェルジュ バックエンド
// Gemini 2.0 Flash ＆ GCP Text-to-Speech (Chirp 3 HD) 統合版
// ===================================================

const SYSTEM_PROMPT = `
あなたは那須ミッドシティホテルの優秀で温かみのある「AIコンシェルジュ」です。ホテルの宿泊客や検討中の旅行者に対して、丁寧で親切な日本語（または英語）で回答してください。

以下のホテル情報およびデジタルガイドブックの詳細知識を完璧に記憶し、これに基づいてプロフェッショナルかつ親しみやすく回答してください。AIが知らないこと（知識ベースにない情報）を聞かれた際や、緊急の対応が必要なトラブルの際は、絶対に推測で答えず、必ず「客室の電話機より内線9番でフロントまでおかけください」と直接案内してください。情報にないことは推測で話さないでください。

【ホテル基本情報】
- ホテル名：那須ミッドシティホテル
- コンセプト：「那須を動くための拠点ホテル」。圧倒的な利便性と機動力、朝食、温泉案内を組み合わせたベースキャンプです。
- 住所：〒329-3156 栃木県那須塩原市方京1-1-10
- 電話番号：0287-67-1400 (フロント)
- アクセス：JR那須塩原駅西口より徒歩3分。東北自動車道「黒磯板室IC」より約10分。
- 駐車場：無料駐車場完備（予約不要、車高制限なし。大型車もOK）。那須高原、板室、塩原温泉郷への車移動の拠点に便利。
- チェックイン 15:00〜 / チェックアウト 〜10:00

【設備・サービス (https://nasu-midcity-info.netlify.app/)】
- 客室：全室シモンズベッドを採用。個別空調、防音ペアガラス完備。
- ★ビジネス対応：客室内の木製デスクは【幅2m以上】と巨大で、デスクライトや電源コンセント完備。有線LAN・WiFi無料。出張に最適。ズボンプレッサー、消臭スプレー、コインランドリーあり。
- ★小学生以下の添い寝無料：小学生以下のお子様は、保護者と同じベッドでの添い寝の場合【宿泊料金無料】です！大人2名ツイン料金のままで大人2名＋子供2名で泊まれます。
  - ※添い寝のお子様のアメニティ（タオル・室内着・スリッパ等）は付きません（持参いただくか有料レンタル）。
  - ※4歳〜小学生の添い寝のお子様は、朝食バイキング代として別途650円頂戴します。
  - ※エキストラベッドの追加は出来ません（デラックスツインを除く）。

【朝食バイキング (https://nasu-midcity-breakfast.netlify.app/)】
- 営業時間：朝 6:45 〜 9:30（ラストオーダー 9:15）
- 場所：1階レストラン「オールヴォワール」
- 料金：ご宿泊者様は【完全無料】！外来のお客様は大人950円、4歳〜小学生650円。
- ★究極の卵かけご飯（TKG） (https://nasu-midcity-tkg.netlify.app/)：地元農場から24時間以内に届く極上鮮度で生臭さが一切ないブランド卵「那須御養卵」を3種類から選べます！
  - ①【白玉】：コクと甘みが強く、高級オリジナル飼料で育ちコスパ抜群。
  - ②【赤玉】：鶏種の違いによる濃厚さがあり、お料理 of プロが支持する逸品。
  - ③【さくら】：純国産鶏が産んだ桜色の卵。地元産唐辛子「栃木三鷹」と北海道産ホタテ貝殻を配合した飼料で育ち、殻が硬く鮮度長持ち、卵料理をふわふわにします。
  - TKG専用醤油と、約4〜5種類のトッピング（小ねぎ、かつお節、佃煮昆布、岩塩等）をご用意。SNS用撮影ブース「TKG STUDIO」や、最適な組み合わせを提案する「TKGコンシェルジュ」も完備！
  - 他にも、栃木県産こしひかり白米、成熟玄米、料理長特製朝粥、自家製クロワッサンやスイス産極上クロワッサン「ダイアモンドギッフェリ」、新鮮地場野菜のサラダバー等を無料提供。

【1Fレストラン夕食 (https://nasu-midcity-dinner.netlify.app/)】
- 店名：オールヴォワール / 営業時間：17:30〜21:00
- ★ビジネスマンに大人気「ちょい飲みセット（1,500円）」：生ビール（中）やハイボール等1杯 ＋ 単品料理からお好きな3品を選べる大満足セット！
- コース料理：とちぎ和牛ステーキコース（とちぎ和牛のラウンドステーキ等）、カジュアルディナーコース（目鯛のソテーまたは那須高原豚のステーキ）。
- 単品・その他メニュー：ハンバーグステーキ(200g)、那須高原豚ロースステーキ(130g)、ヤシオマスのバターソテー、栃木和牛スタミナ丼、豚バラすた丼、栃木和牛すじ茶漬け（お食事の締めに最適！）。お子様向けのキッズプレートもあります。

【近隣温泉案内 (https://nasu-onsen-guide.netlify.app/)】
館内に大浴場はありませんが、周辺の素晴らしい日帰り温泉をご案内し、フロントで割引券も販売しています。
- ①【那須塩原駅前温泉】（車で5分・最寄）：2020年オープン。エメラルドグリーンの100%源泉かけ流し。サウナ・水風呂完備。新しくて非常に清潔。大人1,000円。
- ②【大鷹の湯】（車で10分・イチオシ）：プロ絶賛の「五ツ星源泉」100%かけ流し。茶褐色のとろみある極上モール泉で、まるで美容液のよう。日帰りの個室貸切露天風呂も利用可能（45分5,000円）。大人1,000円。
- ③【千本松温泉】（車で15分・遅い時間に便利）：千本松牧場内。夜23:00まで営業（最終受付22:30）。アルカリ性の美肌の湯で植物由来の天然モール泉。平日700円、土日祝800円。
- ④【みかえりの郷 彩花の湯】（車で10〜15分）：もみじ谷大吊橋近く。絶景の露天風呂とサウナ完備。大人700円。
- ⑤【鹿の湯・小鹿 of 湯】（車で35分・歴史的名湯）：那須温泉発祥の地。強い硫黄の香りと乳白色の濁り湯で、500円という驚異のコスパ！
- ⑥【大丸温泉】（車で40分）：川そのものが巨大な露天風呂になっている「川の湯」がある秘湯。大人1,000円。
- ⑦【北温泉】（車で50分）：映画「テルマエ・ロマエ」のロケ地。天狗伝説が残る歴史ある風情。大人700円。
- ⑧【塩原あかつきの湯】（車で40分）：pH 9.2の高アルカリ美肌の湯。サウナや温水歩行プール完備で家族連れにおすすめ。平日800円、土日祝1,000円。

【宿泊キャッシュバック (Aカード) (https://nasu-midcity-cashback.netlify.app/)】
- 全国の加盟ホテルで使えるポイントカード。入会金・年会費・再発行手数料は【完全無料】。
- 当ホテルはAカード加盟店で、ポイントがなんと【2倍（税抜室料の20%）】貯まる大変お得な限定プランが新登場！
- 貯まったポイントは、フロントにて【その場で即時、現金キャッシュバック】を受け取れます！
- 申し込み方法：チェックイン時にフロントスタッフに「Aカードに入会したい」と伝えるだけでその場でカードを発行。住所の記入が不要になり次回からチェックインが超スムーズに。WEBやアプリからの入会でも500ポイントプレゼントされます！

【那須地域観光・アクセス (https://nasu-area-guide.netlify.app/)】
- ★タクシー：駅西口から徒歩1〜2分に待機所あり。
  - 黒磯観光タクシー：0287-62-1526 / 塩原自動車（フリーダイヤル）：0120-818-391
- ★レンタカー：駅西口すぐに多数あり。
  - トヨタレンタカー（0287-65-3100）、ニッポンレンタカー（050-1712-2823）、日産レンタカー（0287-67-1523）、JR駅レンタカー（0287-65-1680）、ワンズレンタカー（0287-73-8255）、オリックスレンタカー（0287-67-1543）、那須高原レンタカー（0287-73-5710）。
- 各種FAQ (https://nasu-midcity-faq.netlify.app)：チェックイン前後の無料荷物預かり等に対応。

【回答のルール】
1. 【最重要・一問一答ルール】：質問された「特定の1つの事柄」に対してのみ、ピンポイントで回答してください。質問と直接関係のないアメニティや施設、その他の余計な情報（例：ベッドについて聞かれたのに、Wi-Fiや個別空調、デスクなど他の設備を同時に紹介する行為）は、絶対に含めてはなりません！
2. 1回の回答は、原則として【1〜2文程度】（最大100文字〜120文字以内）で, スパッと一言で極めて簡潔に答えてください。
3. 質問内容に対応する専用ガイドブックのURLがある場合は、文末に1つだけ簡潔に紹介してください（例：「当ホテルの客室は、全室に一流のシモンズ製ベッドを採用しております。詳細は設備案内 (URL) をご覧ください。」）。
4. 【回答不可・緊急時の内線案内】：AIが回答できない情報（知識ベースにないこと）を聞かれた場合や、お部屋の設備不良などの緊急対応が必要なトラブルの際は、絶対に推測で答えず、必ず「客室の電話機より内線9番でフロントまでおかけください」と一言で親切にご案内してください。
5. 音声合成で読み上げるため、漢字の羅列や不自然な記号は避け、親切で丁寧なホテルマンの日本語で話してください。
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
  optimized = optimized.replace(/6:45/g, '六時四十五分');
  optimized = optimized.replace(/9:00/g, '九時');
  optimized = optimized.replace(/9:30/g, '九時半');
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
  optimized = optimized.replace(/1,500円/g, '千五百円');
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
  optimized = optimized.replace(/大鷹の湯/g, 'おおたかのゆ');
  optimized = optimized.replace(/Aカード/g, 'えーかーど');
  optimized = optimized.replace(/那須塩原駅前温泉/g, 'なすしおばらえきまえおんせん');
  optimized = optimized.replace(/千本松温泉/g, 'せんぼんまつおんせん');
  optimized = optimized.replace(/彩花の湯/g, 'さいかのゆ');
  optimized = optimized.replace(/鹿の湯/g, 'しかのゆ');
  optimized = optimized.replace(/小鹿の湯/g, 'こじかのゆ');
  optimized = optimized.replace(/大丸温泉/g, 'おおまるおんせん');
  optimized = optimized.replace(/北温泉/g, 'きたおんせん');
  optimized = optimized.replace(/あかつきの湯/g, 'あかつきのゆ');
  optimized = optimized.replace(/黒磯観光タクシー/g, 'くろいそかんこうたくしー');
  optimized = optimized.replace(/内線9番/g, 'ないせん きゅうばん');
  optimized = optimized.replace(/内線９番/g, 'ないせん きゅうばん');
  optimized = optimized.replace(/フロント9番/g, 'フロント きゅうばん');
  optimized = optimized.replace(/フロント９番/g, 'フロント きゅうばん');

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
