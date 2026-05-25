// src/components/ConciergeAutomation.tsx
import { useState, useEffect, useRef } from 'react';
import { Sparkles, User, Scissors, Car, Send, HelpCircle, Volume2, VolumeX, AlertCircle, Mic } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface ConciergeAutomationProps {
  customPrompt?: string;
  gcpTtsApiKey?: string;
}

export default function ConciergeAutomation({ customPrompt, gcpTtsApiKey }: ConciergeAutomationProps) {
  const [demoMode, setDemoMode] = useState<'beauty' | 'car'>('beauty');
  const [promptTone, setPromptTone] = useState<'polite' | 'casual' | 'simple' | 'custom'>('polite');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("お使いのブラウザは音声認識をサポートしていません。Google Chromeなどの対応ブラウザをご利用ください。");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setInputText(prev => {
          if (!prev.trim()) return resultText;
          return prev.trim() + ' ' + resultText;
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };


  // Audio Playback states for GCP TTS
  const [isTtsEnabled, setIsTtsEnabled] = useState(() => {
    return localStorage.getItem('adtown_tts_enabled') === 'true';
  });
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopTts = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setCurrentlyPlayingId(null);
  };

  const playTts = async (messageId: string, text: string) => {
    setTtsError(null);
    if (!gcpTtsApiKey) {
      setTtsError("音声合成APIキーが設定されていません。「CEO指令室」でキーを設定してください。");
      setTimeout(() => setTtsError(null), 5000);
      return;
    }

    // Stop currently playing audio if any
    stopTts();

    try {
      setCurrentlyPlayingId(messageId);

      const isBeauty = demoMode === 'beauty';
      // High-quality Neural2 voices
      const voiceName = isBeauty ? 'ja-JP-Neural2-B' : 'ja-JP-Neural2-C';
      const gender = isBeauty ? 'FEMALE' : 'MALE';

      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${gcpTtsApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'ja-JP',
            name: voiceName,
            ssmlGender: gender
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.05
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `APIエラー (Status: ${response.status})`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      if (data.audioContent) {
        const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        
        audio.onended = () => {
          setCurrentlyPlayingId(null);
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          setTtsError("音声データの再生中にエラーが発生しました。");
          setTimeout(() => setTtsError(null), 5000);
          setCurrentlyPlayingId(null);
          currentAudioRef.current = null;
        };

        await audio.play();
      } else {
        setCurrentlyPlayingId(null);
      }
    } catch (err: any) {
      console.error("Failed to synthesize speech", err);
      setTtsError(`音声合成エラー: ${err.message || '接続に失敗しました'}`);
      setTimeout(() => setTtsError(null), 7000);
      setCurrentlyPlayingId(null);
    }
  };

  const toggleTts = () => {
    setIsTtsEnabled(prev => {
      const next = !prev;
      localStorage.setItem('adtown_tts_enabled', String(next));
      if (!next) {
        stopTts();
      }
      return next;
    });
  };

  // Trigger auto-TTS on new AI messages if enabled
  useEffect(() => {
    if (messages.length === 0 || !isTtsEnabled || !gcpTtsApiKey) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender === 'ai' && lastMsg.id !== 'welcome') {
      // Small timeout to allow the text bubble animation to start
      const t = setTimeout(() => {
        playTts(lastMsg.id, lastMsg.text);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [messages, isTtsEnabled, gcpTtsApiKey]);

  // Stop audio on tab change / unmount
  useEffect(() => {
    return () => stopTts();
  }, []);

  const getSystemMessage = () => {
    if (promptTone === 'custom') {
      return customPrompt || 'カスタム指示が未設定です。CEO指令室からAIに生成させてください。';
    }
    if (demoMode === 'beauty') {
      switch (promptTone) {
        case 'polite':
          return 'お客様に寄り添う親切丁寧なサロンコンシェルジュ：優雅な敬語を使い、価格やメニューを丁寧にご説明します。';
        case 'casual':
          return '親しみやすいスタイリスト風アシスタント：フランクで明るいトーンで、お客様の髪の悩みに共感しながら案内します。';
        case 'simple':
          return '簡潔な案内係：無駄な挨拶を省き、メニュー料金や空き状況のみを箇条書きなどで端的に伝えます。';
      }
    } else {
      switch (promptTone) {
        case 'polite':
          return '信頼感のある自動車整備相談員：専門用語をかみ砕き、車検や点検の費用や手続きをきっちりと案内します。';
        case 'casual':
          return 'フランクなカーライフアドバイザー：車のトラブルにも親しみやすく答え、予約へのハードルを下げます。';
        case 'simple':
          return '車検予約ナビゲーター：価格と手順、必要書類などを簡潔に提示します。';
      }
    }
  };

  const getQuickQuestions = () => {
    if (demoMode === 'beauty') {
      return [
        'カットとカラーの料金を教えてください。',
        '今日の予約状況や空き時間はありますか？',
        'ショートカットが得意なスタイリストはいますか？'
      ];
    } else {
      return [
        '軽自動車の車検にはいくらかかりますか？',
        'スタッドレスタイヤへの交換予約をしたいです。',
        '走行中に警告灯がついたのですがどうすれば良いですか？'
      ];
    }
  };

  useEffect(() => {
    if (customPrompt) {
      setPromptTone('custom');
    }
  }, [customPrompt]);

  const initChat = () => {
    const welcome = demoMode === 'beauty'
      ? {
          id: 'welcome',
          sender: 'ai' as const,
          text: promptTone === 'custom'
            ? `【AIカスタム指令で稼働中】 adtownビューティーサロンのAIコンシェルジュです。CEOの指示に沿って、自動応答をお届けします。メニュー料金や本日の空き時間など、何でもお尋ねください。`
            : promptTone === 'polite'
              ? 'お電話ありがとうございます。adtownビューティーサロンのAIコンシェルジュでございます。本日のご予約状況の確認や、メニュー料金、スタイリストのご指名について24時間いつでもお手伝いいたします。何か気になる点はございますか？'
              : promptTone === 'casual'
                ? 'こんにちは！adtownビューティーサロンのAIアシスタントだよ。予約したい時間やメニューのこと、髪型の相談など、なんでも気軽に聞いてね！'
                : 'adtownビューティーサロンAI案内です。メニュー料金、空き状況、予約について質問を入力してください。',
          timestamp: new Date()
        }
      : {
          id: 'welcome',
          sender: 'ai' as const,
          text: promptTone === 'custom'
            ? `【AIカスタム指令で稼働中】 adtownオートサービスのAIコンシェルジュです。CEOの指示に従い、車検点検やタイヤ交換の24時間相談窓口を担当します。`
            : promptTone === 'polite'
              ? 'お車のトラブルや車検のご相談でしょうか？adtownオートサービスのAIテクニカルコンシェルジュです。車検の概算見積もり、パーツ交換・スタッドレスタイヤのご予約などを24時間いつでも承っております。ご希望の項目を教えてください。'
              : promptTone === 'casual'
                ? 'お疲れ様です！adtownオートサービスAI窓口です。車検の相談からタイヤ交換 of 予約まで、なんでも気軽に送ってね！警告灯がついた時の相談ものるよ。'
                : 'adtownオートサービスAI自動窓口。車検点検見積もり、タイヤ交換、不具合FAQについて質問を入力してください。',
          timestamp: new Date()
        };
    setMessages([welcome]);
  };

  // Re-initialize chat when mode or tone changes
  useEffect(() => {
    initChat();
  }, [demoMode, promptTone]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAiResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    const isBeauty = demoMode === 'beauty';

    if (promptTone === 'custom') {
      if (isBeauty) {
        if (lowerInput.includes('料金') || lowerInput.includes('メニュー') || lowerInput.includes('カット') || lowerInput.includes('カラー')) {
          return `【カスタムAI応答】ご指定の指示に沿ってご案内します。当店の骨格補正カットは5,500円、カラーは6,600円〜です。CEO指定のプロンプト「${customPrompt?.substring(0, 20)}...」に基づき、特別割引の適用や施術のご相談を承ります。`;
        }
        if (lowerInput.includes('予約') || lowerInput.includes('空き') || lowerInput.includes('今日') || lowerInput.includes('状況')) {
          return `【カスタムAI応答】本日は15:30以降または18:00にご予約可能です。ご指名やご希望時間があればお知らせください。`;
        }
        return `【カスタムAI応答】お問い合わせありがとうございます。CEOのカスタム指示「${customPrompt?.substring(0, 35)}...」に従い、24時間ご案内しております。気になるスタイルや予約時間をご指定ください。`;
      } else {
        if (lowerInput.includes('料金') || lowerInput.includes('費用') || lowerInput.includes('車検') || lowerInput.includes('軽')) {
          return `【カスタムAI応答】車検や各種点検の料金についてご案内します。軽自動車車検は45,000円〜となります。CEO指示のプロンプト「${customPrompt?.substring(0, 20)}...」に準拠し、事前見積もりや予約をお受けします。`;
        }
        if (lowerInput.includes('タイヤ') || lowerInput.includes('交換') || lowerInput.includes('予約')) {
          return `【カスタムAI応答】スタッドレスタイヤ等の履き替えは、今週の土曜日午前中または月曜日以降に空きがあります。`;
        }
        return `【カスタムAI応答】adtownオートサービスAI窓口です。CEOの指示「${customPrompt?.substring(0, 35)}...」に基づき、お車のトラブルや車検予約の相談に対応しております。`;
      }
    }

    if (isBeauty) {
      // Beauty Salon Responses
      if (lowerInput.includes('料金') || lowerInput.includes('メニュー') || lowerInput.includes('カット') || lowerInput.includes('カラー')) {
        switch (promptTone) {
          case 'polite':
            return '当店の基本メニュー料金をご案内いたします。\n・骨格補正カット：5,500円（シャンプー・ブロー込）\n・オーガニックカラー：6,600円〜\n・カット＋カラーセットコース：11,000円〜\nとなっております。髪の長さや状態によってお薬代が前後する場合がございますが、施術前に必ず詳細をお伝えしますのでご安心ください。';
          case 'casual':
            return 'メニュー料金はこんな感じだよ！\n・カット：5,500円\n・カラー：6,600円〜\nおすすめは、新規限定のカット＋カラーセット（11,000円〜）かな！髪へのダメージが少ない優しい薬剤を使っているよ！';
          case 'simple':
            return 'メニュー料金（税込）：\n・カット: 5,500円\n・カラー: 6,600円〜\n・カット+カラー: 11,000円〜';
        }
      }
      if (lowerInput.includes('予約') || lowerInput.includes('空き') || lowerInput.includes('今日') || lowerInput.includes('状況')) {
        switch (promptTone) {
          case 'polite':
            return '本日（5月24日）のご予約空き状況でございますね。ただいま確認いたしましたところ、15:30以降、および18:00にカットのみでしたら空きがございます。カラーなどセットメニューの場合は18:00にて承ることが可能でございます。ご希望のお時間はございますでしょうか？';
          case 'casual':
            return '今日の空き状況だね！えっと、15:30からカットならいけるよ！18:00からならカットもカラーも両方大丈夫！何時頃がいいかな？';
          case 'simple':
            return '本日（5/24）の空き時間：\n・15:30 (カットのみ)\n・18:00 (全メニュー対応可)';
        }
      }
      if (lowerInput.includes('スタイリスト') || lowerInput.includes('得意') || lowerInput.includes('スタッフ') || lowerInput.includes('ショート')) {
        switch (promptTone) {
          case 'polite':
            return 'ショートカットが得意なスタイリストをお探しですね。それでしたら、歴12年のトップスタイリスト「YUMI」を強くお薦めいたします。骨格や髪の生え癖を見極め、乾かすだけで美しくまとまるショートヘアをご提案し、多くのお客様から高い支持をいただいております。ご指名料は＋550円でございます。';
          case 'casual':
            return 'ショートカットなら間違いなく「YUMI」がおすすめ！骨格に合わせた似合わせショートが得意で、お家でのセットもすごく楽になるよ！指名料は550円かかるけど、絶対に満足してもらえると思う！';
          case 'simple':
            return 'ショートカット推奨スタイリスト：YUMI (歴12年 / 指名料550円)';
        }
      }
      // Default Beauty Response
      return promptTone === 'polite'
        ? 'かしこまりました。髪質改善トリートメントのご相談や、お子様連れでのご来店、その他スタイルのご要望など、何でもお気軽にお申し付けください。'
        : promptTone === 'casual'
          ? '了解だよ！他にも気になることがあったら、カラーの種類とかヘアケアの方法とか、なんでも聞いてね！'
          : '質問を受付しました。予約、料金、スタイリスト指名について個別にお答えします。';

    } else {
      // Car Service Responses
      if (lowerInput.includes('料金') || lowerInput.includes('費用') || lowerInput.includes('車検') || lowerInput.includes('軽')) {
        switch (promptTone) {
          case 'polite':
            return '軽自動車の基本車検料金をご案内いたします。当店の「adtown安心車検」では、基本検査料・税金・保険料を含め、総額約45,000円（※追加整備がない場合）から承っております。お客様のお車の年式や走行距離に合わせた最適なプランをご提案させていただきます。詳細な事前お見積もりは無料ですので、ぜひご利用ください。';
          case 'casual':
            return '軽自動車の車検だね！追加で直すパーツがなければ、自賠責や税金も含めて全部で約45,000円からいけるよ！見積もりは完全無料だから、まずは車検証を持ってきてくれたらすぐ出すよ！';
          case 'simple':
            return '軽自動車車検基本費用：約45,000円〜\n（重量税・自賠責保険・印紙代・基本点検料含む。追加整備費は別途実費）';
        }
      }
      if (lowerInput.includes('スタッドレス') || lowerInput.includes('タイヤ') || lowerInput.includes('交換') || lowerInput.includes('予約')) {
        switch (promptTone) {
          case 'polite':
            return 'スタッドレスタイヤへの交換予約ですね。承知いたしました。ただいまタイヤ履き替えの混雑期ではございますが、今週末の5月30日（土）午前中、または6月1日（月）以降であればスムーズにご案内可能でございます。お持ち込み、または当店でのご購入どちらをご希望でしょうか？';
          case 'casual':
            return 'タイヤ交換の予約だね！今週末の土曜日（5/30）の午前中が空いてるよ！月曜日以降ならいつでも大丈夫。タイヤは持ち込みかな？それともうちで買う感じ？';
          case 'simple':
            return 'タイヤ交換予約可能枠：\n・5/30 (土) 9:00 - 12:00\n・6/1 (月) 以降終日対応可\n※作業時間目安: 30〜45分';
        }
      }
      if (lowerInput.includes('警告灯') || lowerInput.includes('ランプ') || lowerInput.includes('かからない') || lowerInput.includes('エンジン') || lowerInput.includes('トラブル')) {
        switch (promptTone) {
          case 'polite':
            return 'インジケーターの警告灯が点灯したとのこと、ご不安なこととお察しいたします。赤い警告灯（ブレーキ、油圧、エンジン水温など）が点灯している場合は、直ちに安全な場所に停車し、エンジンを停止してください。当店へレッカー搬送いただくか、JAF等のロードサービスへご相談されることをお勧めします。警告灯のアイコンの形を教えていただけますでしょうか？';
          case 'casual':
            return '警告灯がついちゃった？それはちょっと心配だね。特に赤色のランプだったら、危ないからすぐに安全な場所へ車を止めてエンジンを切ってね！オレンジ色のランプなら、すぐに走れなくなるわけじゃないけど、早めに工場で見てもらった方がいいよ。どんな形のマークがついているかな？';
          case 'simple':
            return '警告灯対応指示：\n1. 赤色警告灯: 即時安全な場所に停車、エンジン停止。ロードサービスを要請。\n2. 黄色/橙色警告灯: 速やかに当店へ点検予約の上、低速走行でご来店ください。';
        }
      }
      // Default Car Response
      return promptTone === 'polite'
        ? 'かしこまりました。オイル交換、板金塗装の見積もり、中古車販売など、愛車のサポートは何でもお気軽にご相談くださいませ。'
        : promptTone === 'casual'
          ? 'オッケー！車検の事前点検とか、エアコンの効きが悪いなーとか、些細なことでもなんでも聞いてね！'
          : '質問を受信しました。車検、タイヤ、エンジン不具合等の対応をいたします。';
    }
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate AI thinking and reply
    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: Math.random().toString(),
        sender: 'ai',
        text: getAiResponse(text),
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 800);
  };

  return (
    <div className="concierge-automation">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        
        {/* 左側: チャットシミュレータ本体 */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '560px', padding: 0, overflow: 'hidden' }}>
          
          {/* チャットヘッダー（対象業界切り替え） */}
          <div style={{ display: 'flex', background: 'rgba(8, 14, 38, 0.9)', padding: '1rem', borderBottom: '1px solid rgba(0, 242, 254, 0.15)', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setDemoMode('beauty')}
                className={`badge ${demoMode === 'beauty' ? 'badge-primary' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 1rem', background: demoMode === 'beauty' ? '' : 'rgba(255,255,255,0.05)', color: demoMode === 'beauty' ? '' : 'var(--text-muted)' }}
              >
                <Scissors className="w-4 h-4" /> 美容室 (Salon AI)
              </button>
              <button 
                onClick={() => setDemoMode('car')}
                className={`badge ${demoMode === 'car' ? 'badge-success' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 1rem', background: demoMode === 'car' ? '' : 'rgba(255,255,255,0.05)', color: demoMode === 'car' ? '' : 'var(--text-muted)' }}
              >
                <Car className="w-4 h-4" /> 自動車整備 (Car AI)
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {gcpTtsApiKey ? (
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.72rem', color: isTtsEnabled ? 'var(--neon-cyan)' : 'var(--text-muted)', userSelect: 'none' }}>
                  <input 
                    type="checkbox" 
                    checked={isTtsEnabled} 
                    onChange={toggleTts}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>音声読み上げ: {isTtsEnabled ? 'ON' : 'OFF'}</span>
                </label>
              ) : (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  ※音声キー未接続
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                24時間自動応答稼働中
              </span>
            </div>
          </div>

          {/* 音声エラー警告表示 */}
          {ttsError && (
            <div style={{
              background: 'rgba(255, 0, 127, 0.1)',
              borderBottom: '1px solid rgba(255, 0, 127, 0.2)',
              color: 'var(--neon-pink)',
              padding: '0.6rem 1.25rem',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'fade-in-up 0.2s ease'
            }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{ttsError}</span>
            </div>
          )}

          {/* メッセージログ */}
          <div className="chat-messages" style={{ flexGrow: 1, padding: '1.5rem', overflowY: 'auto' }}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`chat-bubble ${msg.sender}`}
                style={{ 
                  whiteSpace: 'pre-wrap', 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? 'var(--grad-primary)' : 'rgba(13, 22, 47, 0.85)',
                  border: msg.sender === 'user' ? 'none' : '1px solid rgba(0, 242, 254, 0.15)',
                  marginBottom: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', width: '100%', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Sparkles className="w-3 h-3" style={{ color: 'var(--neon-blue)' }} />}
                    <span>{msg.sender === 'user' ? 'ユーザー' : `${demoMode === 'beauty' ? '美容室' : '自動車店'}AI窓口`}</span>
                  </div>
                  {msg.sender === 'ai' && gcpTtsApiKey && (
                    <button 
                      onClick={() => currentlyPlayingId === msg.id ? stopTts() : playTts(msg.id, msg.text)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: '2px', 
                        cursor: 'pointer', 
                        color: currentlyPlayingId === msg.id ? 'var(--neon-cyan)' : 'var(--text-muted)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '2px',
                        outline: 'none',
                        flexShrink: 0
                      }}
                      title="音声を再生/停止"
                    >
                      {currentlyPlayingId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span style={{ fontSize: '0.58rem', color: 'var(--neon-cyan)' }} className="animate-pulse">停止</span>
                        </>
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                <div>{msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* クイック質問リスト */}
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(5, 8, 20, 0.3)', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <HelpCircle className="w-3 h-3" /> クイック質問をクリックしてテスト送信
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {getQuickQuestions().map((q, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  style={{
                    fontSize: '0.75rem',
                    background: 'rgba(0, 242, 254, 0.06)',
                    border: '1px solid rgba(0, 242, 254, 0.15)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    color: 'var(--neon-blue)',
                    transition: 'all 0.2s'
                  }}
                  className="quick-q-btn"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* 送信入力 */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="chat-input-area"
            style={{ alignItems: 'center' }}
          >
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="質問を自由に入力、またはマイクで入力..."
              className="chat-text-input"
            />

            {/* 音声入力マイクボタン */}
            <button
              type="button"
              onClick={toggleListening}
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              style={{
                width: '42px',
                height: '42px',
                padding: 0,
                flexShrink: 0
              }}
              title={isListening ? "音声入力を停止" : "音声入力を開始"}
            >
              <Mic className="w-4 h-4" />
            </button>

            <button type="submit" className="chat-btn-send" style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* 右側: スクール生プロンプトワークスペース */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--neon-purple)' }} /> プロンプト開発ワークスペース
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              **【専任スタッフ・運用パートナーの実務イメージ】**
              担当者はクライアント（美容室や自動車店等）へヒアリングを行い、AIコンシェルジュの「プロンプト（指示書・指示トーン）」の設計・変更を行います。
            </p>

            {/* トーン切り替えボタン */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                プロンプト指示トーン（切り替えテスト）
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {customPrompt && (
                  <button 
                    onClick={() => setPromptTone('custom')}
                    className={`nav-item ${promptTone === 'custom' ? 'active' : ''}`}
                    style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', borderColor: 'var(--neon-purple)' }}
                  >
                    <span style={{ color: promptTone === 'custom' ? 'var(--neon-purple)' : 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Sparkles className="w-3.5 h-3.5" /> CEO指令室 AI生成トーン
                    </span>
                  </button>
                )}
                <button 
                  onClick={() => setPromptTone('polite')}
                  className={`nav-item ${promptTone === 'polite' ? 'active' : ''}`}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  <span style={{ color: promptTone === 'polite' ? 'var(--neon-blue)' : 'var(--text-muted)' }}>✓ 親切丁寧なアシスタント風</span>
                </button>
                <button 
                  onClick={() => setPromptTone('casual')}
                  className={`nav-item ${promptTone === 'casual' ? 'active' : ''}`}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  <span style={{ color: promptTone === 'casual' ? 'var(--neon-purple)' : 'var(--text-muted)' }}>✓ カジュアルでフレンドリー風</span>
                </button>
                <button 
                  onClick={() => setPromptTone('simple')}
                  className={`nav-item ${promptTone === 'simple' ? 'active' : ''}`}
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  <span style={{ color: promptTone === 'simple' ? 'var(--neon-cyan)' : 'var(--text-muted)' }}>✓ 簡潔な案内係風</span>
                </button>
              </div>
            </div>

            {/* システムメッセージプレビュー */}
            <div style={{ background: 'rgba(5, 8, 20, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--neon-cyan)', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>
                AI内部への指示プロンプト（システム設定）
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', lineHeight: '1.4' }}>
                {getSystemMessage()}
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--neon-cyan)' }}>
              LINE公式 ＆ Dify 本番連携手順ガイド
            </h4>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              <ol style={{ paddingLeft: '1.1rem' }}>
                <li style={{ marginBottom: '0.25rem' }}><strong>Dify (dify.ai)</strong> で「チャットボット」を作成し、店舗メニュー・料金表・FAQテキストを「ナレッジ」に学習させます。</li>
                <li style={{ marginBottom: '0.25rem' }}>上記の「指示プロンプト」をコピーし、Difyのシステム設定に貼り付けます。</li>
                <li style={{ marginBottom: '0.25rem' }}><strong>Make (make.com)</strong> などの連携ツールを経由して <strong>LINE Messaging API</strong> に接続し、LINE公式アカウント上での24時間自動返信を本番稼働させます。</li>
              </ol>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
