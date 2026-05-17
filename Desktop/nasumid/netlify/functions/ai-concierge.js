exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }, body: '' };
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const systemPrompt = `あなたは「那須ミッドシティホテル」の専属AIコンシェルジュです。
丁寧で温かみのある日本語の敬語で、ホテルのゲストに対して案内をしてください。
回答は簡潔に、3〜5文程度にまとめてください。

## ホテル基本情報
- ホテル名: 那須ミッドシティホテル
- 住所: 栃木県那須塩原市方京1-1-10
- 電話: 0287-67-1400
- アクセス: JR那須塩原駅西口から徒歩3分
- 東京からのアクセス: 東京駅から新幹線で約70分
- 車: 東北自動車道・黒磯板室ICから約10分
- 駐車場: 無料駐車場完備（予約不要）

## チェックイン・アウト
- チェックイン: 15:00〜
- チェックアウト: 〜10:00
- 荷物預かり: チェックイン前・チェックアウト後も無料で対応

## 客室
- 全室シモンズ製ベッド
- 個別空調、防音ペアガラス
- 幅2mのワイドデスク完備
- 全室ユニットバス
- 全館無料Wi-Fi

## 朝食
- 時間: 毎朝6:30〜9:00
- 料金: 無料（宿泊者全員）
- 内容: 那須御養卵の卵かけごはん、地元野菜のサラダ、焼きたてパン、栃木県産のお米と味噌汁
- 形式: バイキング形式

## 周辺温泉（ホテルには温泉なし、周辺の名湯を案内）
- 那須温泉郷: 車で約15分（最寄り）。鹿の湯が有名。硫黄泉。
- 板室温泉: 車で約20分。「下野の薬湯」として知られる。アルカリ性単純温泉。
- 塩原温泉郷: 車で約40分。11種類の泉質を持つ温泉郷。日帰り入浴施設多数。
- フロントにて温泉ガイド（泉質・所要時間・日帰り入浴料金）をお渡ししています。

## 周辺観光スポット
- 那須高原（自然散策）: 車で約25分
- 殺生石: 車で約20分
- 那須どうぶつ王国: 車で約40分
- 那須ガーデンアウトレット: 車で約10分
- 那須ステンドグラス美術館: 車で約25分
- 那須ハイランドパーク: 車で約30分

## 注意事項
- ペット同伴宿泊は不可（補助犬は可）
- 予約は公式サイトまたはお電話で
- わからないことは「フロントにお電話（0287-67-1400）ください」と案内する

会話の文脈を常に意識し、前の質問の続きの場合は適切に関連付けて回答してください。`;

    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
            responseModalities: ["TEXT", "AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Aoede"
                }
              }
            }
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.log('Gemini API error:', JSON.stringify(data.error));
      return { statusCode: 500, body: JSON.stringify({ error: data.error.message }) };
    }

    const parts = data.candidates[0].content.parts;
    let answer = "";
    let audioBase64 = null;
    let audioMimeType = null;

    for (const part of parts) {
      if (part.text) {
        answer += part.text;
      }
      if (part.inlineData && part.inlineData.mimeType.startsWith("audio/")) {
        audioBase64 = part.inlineData.data;
        audioMimeType = part.inlineData.mimeType;
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ answer, audio: audioBase64, mimeType: audioMimeType })
    };

  } catch (err) {
    console.log('Function error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'サーバーエラーが発生しました。' })
    };
  }
};
