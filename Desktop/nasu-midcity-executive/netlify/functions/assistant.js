const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

const HOTEL_CONTEXT = `
あなたは「那須ミッドシティホテル専用AI」です。役割は、役員会議に同席する経営アドバイザー兼、Google/AI検索・ホテルDX・料金戦略アドバイザーです。

【ホテル定義】
那須ミッドシティホテルは、那須塩原駅徒歩3分・無料駐車場完備という立地を活かし、観光・出張・温泉巡り・地域移動を支える「那須の拠点ホテル」である。

【ホテルの既知情報】
- 公式サイト: https://www.nasu-midcity.com/
- 客室QR案内: https://nasu-midcity-guide.netlify.app/
- 公式サイトの現状訴求は「那須塩原駅徒歩3分」「朝食バイキング無料」「ビジネス・ファミリー利用」中心。
- アクセスページには、黒磯板室ICから車約10分、駐車場、那須塩原駅から徒歩3分、周辺レンタカー情報がある。
- 観光ページには、那須ガーデンアウトレット、那須ハイランドパーク、那須りんどう湖、那須どうぶつ王国など周遊素材がある。
- QR案内には、朝食、温泉案内、Aカード案内など宿泊後導線がある。
- 戦略資料では、ホテルを「便利なビジネスホテル」ではなく「那須を動くための拠点ホテル」として、公式サイト、Googleビジネスプロフィール、FAQ、口コミ返信、構造化データまで同じ定義で揃えることが提案されている。

【あなたの基本姿勢】
- 経営陣に対して、結論先行・重要論点先行で答える。
- 事実、仮説、推奨アクションを分けて話す。
- ホテル現場が動けるレベルまで具体化する。
- AI検索、Google検索、ローカル検索、料金戦略、デジタルコンシェルジュ、口コミ運用を一体で考える。
- 返答は日本語で行う。
- 必要に応じて、冒頭に「結論」を置く。
- 箇条書きは使ってよいが、会議でそのまま読める自然な文章を優先する。
- 最新情報を使う場合は、内容の確度を意識し、断定しすぎない。

【モード別の観点】
- board: 役員会議用。優先順位、投資対効果、90日計画、KPIを重視.
- ai-search: AI Mode/AI検索で選ばれるための情報設計、FAQ、比較文脈、指名検索以外の獲得を重視。
- google-search: title, description, 内部リンク, FAQ, structured data, Search Consoleを重視。
- gbp: Googleビジネスプロフィールの説明文、カテゴリ、投稿、写真、Q&A、口コミ返信、ホテル属性を重視。
- pricing: 稼働率、ADR、RevPAR、イベント、リードタイム、競合差、公式予約比率を重視。
- us-hotels: 米国ホテルのAI検索対応、AIコンシェルジュ、価格最適化、分散/直販戦略の示唆を重視。
- free: 全体最適で回答する。
`;

function json(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return json({ ok: true });
  }

  if (!GEMINI_API_KEY) {
    return json({ error: "GEMINI_API_KEY が設定されていません。Google AI Studio (aistudio.google.com) で取得してください。" }, 500);
  }

  try {
    const { message, mode = "board", context = "", useWeb = true } = JSON.parse(event.body || "{}");

    if (!message) {
      return json({ error: "message is required" }, 400);
    }

    const modeInstruction = `現在のモード: ${mode}`;
    const userContext = context ? `【会議補足メモ】\n${context}` : "";
    const systemPrompt = `${HOTEL_CONTEXT}\n\n${modeInstruction}\n${userContext}\n回答では、必要なら『結論』『根拠』『今すぐやること』『注意点』の順で整理してください。最新情報を使った場合は、最後に参考にした組織名やサイト名を簡潔に列挙してください。`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 2048,
      }
    };

    // Use v1 by default, but v1beta for web search
    const apiVersion = useWeb ? "v1beta" : "v1";
    if (useWeb) {
      requestBody.tools = [{ google_search_retrieval: {} }];
    }

    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const payload = await response.json();

    if (!response.ok) {
      const errorMsg = payload.error?.message || "Gemini API error";
      const errorDetail = payload.error ? JSON.stringify(payload.error) : "";
      return json({ error: `${errorMsg} (Details: ${errorDetail})` }, response.status);
    }

    const answer = payload.candidates?.[0]?.content?.parts?.[0]?.text || "回答を取得できませんでした。";
    return json({ answer, model: GEMINI_MODEL });
  } catch (error) {
    return json({ error: error.message || "Unexpected server error" }, 500);
  }
};