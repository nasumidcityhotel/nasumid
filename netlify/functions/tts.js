const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GCP_TTS_API_KEY = process.env.GCP_TTS_API_KEY;

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

  try {
    const { text } = JSON.parse(event.body || "{}");

    if (!text) {
      return json({ error: "text is required" }, 400);
    }

    // 1. Gemini API (AI Studio) による高品質な音声生成を優先して試みる
    if (GEMINI_API_KEY) {
      try {
        const model = "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const requestBody = {
          contents: [
            {
              parts: [
                {
                  text: `以下の文章を、聞き取りやすく、非常に自然でクリアな日本語で朗読してください。前置きや解説、挨拶などの余計な発言は一切行わず、与えられた文章だけを最初から最後までそのまま読み上げてください。\n\n【対象文章】\n${text}`
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  // Aoede: 明るく聞き取りやすい日本語に適した女性風ボイス。
                  // その他の選択肢: Kore (落ち着いた女性風), Puck (ハキハキした男性風)
                  voiceName: "Aoede"
                }
              }
            }
          }
        };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });

        const payload = await response.json();

        if (response.ok) {
          const candidate = payload.candidates?.[0];
          const parts = candidate?.content?.parts || [];
          const audioPart = parts.find(p => p.inlineData && p.inlineData.mimeType?.startsWith("audio/"));

          if (audioPart && audioPart.inlineData?.data) {
            return json({ audioContent: audioPart.inlineData.data });
          }
        }
        console.warn("Gemini Audio Generation failed, falling back to GCP:", payload.error || payload);
      } catch (geminiError) {
        console.warn("Gemini Audio Generation error:", geminiError.message);
      }
    }

    // 2. Google Cloud Text-to-Speech (GCP TTS) へのフォールバック
    if (GCP_TTS_API_KEY) {
      try {
        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GCP_TTS_API_KEY}`;

        const requestBody = {
          input: { text },
          voice: {
            languageCode: "ja-JP",
            name: "ja-JP-Neural2-B" // 自然な日本語女性の音声モデル
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 1.02,
            pitch: 0.0
          }
        };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });

        const payload = await response.json();

        if (response.ok && payload.audioContent) {
          return json({ audioContent: payload.audioContent });
        }
      } catch (gcpError) {
        console.warn("GCP TTS fallback failed:", gcpError.message);
      }
    }

    // 3. APIキーがない、またはすべてのAPI呼び出しが失敗した場合はブラウザ標準の音声合成にフォールバック
    return json({ error: "音声生成APIを呼び出せませんでした。ローカル音声で再生します。", useFallback: true }, 200);
  } catch (error) {
    return json({ error: error.message, useFallback: true }, 200);
  }
};
