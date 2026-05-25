// src/components/CooCommandCenter.tsx
import { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Key, RefreshCw, Terminal, 
  CheckCircle, User, Users, Mic
} from 'lucide-react';

interface AgentLog {
  id: string;
  sender: 'ceo' | 'coo' | 'departments';
  senderName: string;
  text: string;
  timestamp: Date;
  status: 'thinking' | 'done' | 'error';
}

interface CooCommandCenterProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  onGenerationComplete: (data: {
    jsonLd: string;
    conciergePrompt: string;
    newTasks: any[];
  }) => void;
  onResetAllData?: () => void;
  gcpTtsApiKey: string;
  setGcpTtsApiKey: (key: string) => void;
}

export default function CooCommandCenter({ apiKey, setApiKey, onGenerationComplete, onResetAllData, gcpTtsApiKey, setGcpTtsApiKey }: CooCommandCenterProps) {
  const [ceoInstruction, setCeoInstruction] = useState('那須塩原の新しい美容室「adtownヘアメイク」のGEO対策とLINE予約コンシェルジュを立ち上げて、専任スタッフに集客実務のアクションプランをアサインしてくれ。');
  
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
        setCeoInstruction(prev => {
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

  
  // Load logs from LocalStorage on init
  const [logs, setLogs] = useState<AgentLog[]>(() => {
    const saved = localStorage.getItem('adtown_coo_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((l: any) => ({
          ...l,
          timestamp: new Date(l.timestamp)
        }));
      } catch (e) {
        console.error('Failed to parse coo logs', e);
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [ttsApiKeyInput, setTtsApiKeyInput] = useState('');
  const [showKeyPanel, setShowKeyPanel] = useState(false);

  // Save logs to LocalStorage when they change
  useEffect(() => {
    if (logs.length > 0) {
      localStorage.setItem('adtown_coo_logs', JSON.stringify(logs));
    }
  }, [logs]);

  // Listen to reset event
  useEffect(() => {
    const handleReset = () => {
      setLogs([]);
    };
    window.addEventListener('adtown-reset-data', handleReset);
    return () => {
      window.removeEventListener('adtown-reset-data', handleReset);
    };
  }, []);

  // Sync API keys to inputs
  useEffect(() => {
    if (apiKey) setApiKeyInput(apiKey);
    if (gcpTtsApiKey) setTtsApiKeyInput(gcpTtsApiKey);
  }, [apiKey, gcpTtsApiKey]);

  // Check if API key is provided via env
  useEffect(() => {
    const processEnv = (globalThis as any).process?.env || {};
    const envKey = import.meta.env.VITE_GEMINI_API_KEY || 
                   import.meta.env.GEMINI_API_KEY || 
                   processEnv.GEMINI_API_KEY;
    if (envKey && !apiKey) {
      setApiKey(envKey);
    }
    const envTtsKey = import.meta.env.VITE_GCP_TTS_API_KEY || 
                      import.meta.env.GCP_TTS_API_KEY || 
                      processEnv.GCP_TTS_API_KEY;
    if (envTtsKey && !gcpTtsApiKey) {
      setGcpTtsApiKey(envTtsKey);
    }
  }, [apiKey, setApiKey, gcpTtsApiKey, setGcpTtsApiKey]);

  const handleSaveApiKeys = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      localStorage.setItem('adtown_gemini_api_key', apiKeyInput.trim());
    }
    if (ttsApiKeyInput.trim()) {
      setGcpTtsApiKey(ttsApiKeyInput.trim());
      localStorage.setItem('adtown_gcp_tts_api_key', ttsApiKeyInput.trim());
    }
    setShowKeyPanel(false);
  };

  const callGemini = async (prompt: string, isJson: boolean = false) => {
    const currentKey = apiKey || localStorage.getItem('adtown_gemini_api_key') || '';
    if (!currentKey) {
      throw new Error('Gemini API Key が設定されていません。');
    }

    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: isJson ? {
          responseMimeType: 'application/json'
        } : undefined
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `APIエラーが発生しました (Status: ${response.status})`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  };

  const executeAgentCooperation = async () => {
    if (!ceoInstruction.trim()) return;
    const currentKey = apiKey || localStorage.getItem('adtown_gemini_api_key') || '';
    if (!currentKey) {
      setShowKeyPanel(true);
      return;
    }

    setLoading(true);
    
    // 1. CEOの指示をログに追加
    const newLogs: AgentLog[] = [
      {
        id: 'ceo-1',
        sender: 'ceo',
        senderName: 'CEO (あなた)',
        text: ceoInstruction,
        timestamp: new Date(),
        status: 'done'
      }
    ];
    setLogs(newLogs);

    // 2. COOエージェント起動（思考中）
    const cooLogId = 'coo-' + Math.random().toString();
    const cooThinkingLog: AgentLog = {
      id: cooLogId,
      sender: 'coo',
      senderName: 'COO (最高執行責任者)',
      text: '指示を受領しました。タスクを分解し、専門部署にアサイン指示書を作成しています...',
      timestamp: new Date(),
      status: 'thinking'
    };
    setLogs(prev => [...prev, cooThinkingLog]);

    try {
      const currentDate = new Date().toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // COOへプロンプト送信
      const cooPrompt = `
あなたは株式会社adtown AI事業部のCOOです。CEO（社長）から以下の命令を受けました：
「${ceoInstruction}」

なお、本日の日付は ${currentDate} です。

この指示を達成するために、以下の部署へ実行指示書を作成してください。
・① AIインテリジェンス・リサーチ部 (アルゴリズム解析指示)
・② AIローカルデータ連携部 (データ連携・構造化指示)
・③ AI選定・GEO対策部 (GBP最適化、MEO、専任スタッフアサイン)
・④ AI利益改善チーム運営課 (スタッフの手配と実務管理)
・⑥ AI財務・マネジメント管理部 (スタッフ報酬分配の設計)

回答は、COOとして非常に論理的かつフォーマルで頼もしい口調で、割り振るタスクを明確に箇条書きで示してください。
また、作成する実行指示書内のスケジュールやログ、計画などの日付には、必ず本日（${currentDate}）を基準にした2026年の日付を使用し、2023年などの古い過去の日付は絶対に使用しないでください。
`;
      const cooResponse = await callGemini(cooPrompt);

      // COO思考完了
      setLogs(prev => prev.map(l => l.id === cooLogId ? {
        ...l,
        text: cooResponse,
        status: 'done' as const
      } : l));

      // 3. 専門部署（リサーチ部＆GEO対策部等）起動（思考中）
      const deptLogId = 'dept-' + Math.random().toString();
      const deptThinkingLog: AgentLog = {
        id: deptLogId,
        sender: 'departments',
        senderName: 'AI選定・データ戦略合同部会',
        text: 'COOの指示に基づき、JSON-LD構造化データ、コンシェルジュ用プロンプト、専任スタッフアサイン用の実務タスクを生成しています...',
        timestamp: new Date(),
        status: 'thinking'
      };
      setLogs(prev => [...prev, deptThinkingLog]);

      // 専門部署へプロンプト送信 (JSON出力を要請)
      const deptPrompt = `
    
    
    
    
あなたは株式会社adtown AI事業部の「AIインテリジェンス・リサーチ部」「AIローカルデータ連携部」「AI選定・GEO対策部」の合同AIタスクフォースです。
COOの指示「${cooResponse}」およびCEOの命令「${ceoInstruction}」に基づき、以下の3つの成果物を厳密なJSON形式で生成してください。

なお、本日の日付は ${currentDate} です。

1. "jsonLd": 対象店舗のAIクローラー最適化用のSchema.org JSON-LDデータ。店舗情報や営業時間、那須ポータルちゃんねる等の架空の連携データを含めてください。
2. "conciergePrompt": 対象店舗向けAIコンシェルジュ（美容室または自動車店等の業種に合わせる）の性格や応答ルールを定義した詳細なプロンプト指示（日本語で300文字以上）。
3. "newTasks": 専任スタッフに割り当てるための実務タスク（To Doカンバン用）を2〜3個生成してください。
   各タスクには以下のプロパティを持たせてください：
   - "title": タスク内容（例：「Googleビジネスプロフィールの写真最適化投稿」）
   - "client": クライアント店舗名（CEO指示から抽出、または命名）
   - "student": 担当する専任スタッフ名（架空の「◯◯ ◯◯ (専任スタッフ)」）
   - "price": クライアントへの提案価格（数字、例: 55000）
   - "payout": スタッフへの分配報酬（数字、例: 22000）
   - "difficulty": 難易度（"初級", "中級", "上級" のいずれか）

※重要※
すべての成果物（JSON-LD、プロンプト、タスクなど）の日付や、それらに関連するログ、説明等には、必ず本日（${currentDate}）を基準にした現在の年（2026年）を使用してください。2023年などの古い過去の日付は絶対に使用しないでください。

出力は以下のJSON構造に完全準拠してください：
{
  "jsonLd": "(ここにJSON-LD文字列。\\nで改行を含め、エスケープしてください)",
  "conciergePrompt": "(ここにコンシェルジュプロンプト文字列)",
  "newTasks": [
    {
      "title": "タスクタイトル",
      "client": "店舗名",
      "student": "スクール生名",
      "price": 55000,
      "payout": 22000,
      "difficulty": "初級"
    }
  ]
}

JSON以外の説明、マークダウンの \`\`\`json などの囲み、前置き文は一切含めず、純粋なJSON文字列のみを出力してください。
`;
      const deptResponse = await callGemini(deptPrompt, true);

      // JSONレスポンスのパースとクリーンアップ
      let parsedData;
      try {
        // 余分なマークダウンを消し去る
        const cleanedJson = deptResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleanedJson);
      } catch (parseErr) {
        console.error('JSONパースエラー。AI応答:', deptResponse);
        throw new Error('AIが不正なフォーマットで出力しました。再試行してください。');
      }

      // 専門部署思考完了
      setLogs(prev => prev.map(l => l.id === deptLogId ? {
        ...l,
        text: `【自律協調 成果物の生成完了】\n\n✓ AIクローラー最適化データ(JSON-LD)の設計完了\n✓ AIコンシェルジュ用カスタムプロンプトの設計完了\n✓ スクール生向けアサインタスク(${parsedData.newTasks?.length || 0}件)の自動作成完了\n\n成果物は各システム画面に自動で反映されました。`,
        status: 'done' as const
      } : l));

      // 親コンポーネント（App.tsx）へ状態を引き渡す
      onGenerationComplete({
        jsonLd: parsedData.jsonLd || '',
        conciergePrompt: parsedData.conciergePrompt || '',
        newTasks: parsedData.newTasks || []
      });

    } catch (err: any) {
      console.error(err);
      setLogs(prev => prev.map(l => l.status === 'thinking' ? {
        ...l,
        text: `エラーが発生しました: ${err.message || '接続に失敗しました'}`,
        status: 'error' as const
      } : l));
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (sender: string) => {
    switch (sender) {
      case 'ceo': return <User className="w-5 h-5 text-white" />;
      case 'coo': return <Users className="w-5 h-5" style={{ color: 'var(--neon-cyan)' }} />;
      default: return <Sparkles className="w-5 h-5" style={{ color: 'var(--neon-purple)' }} />;
    }
  };

  const hasEnvKey = !!(import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY);

  return (
    <div className="coo-command-center">
      <div className="coo-main-layout">
        
        {/* 左側: 指令タイムライン */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* CEO司令入力 */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal className="w-5 h-5" style={{ color: 'var(--neon-blue)' }} /> CEOからCOOへの業務指令
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              YouTubeデモと同様に、CEOとしての指示を入力して「送信」すると、本物のAIがCOOとして業務を分解し、専門部署エージェントと連携して自動的に成果物と案件管理を作成・反映します。
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <textarea 
                value={ceoInstruction}
                onChange={(e) => setCeoInstruction(e.target.value)}
                disabled={loading}
                placeholder="CEOとしての指示を入力するか、音声ボタンを押してマイクで話しかけてください..."
                style={{
                  flexGrow: 1,
                  background: 'rgba(5, 8, 20, 0.8)',
                  border: '1px solid rgba(0, 242, 254, 0.2)',
                  borderRadius: '10px',
                  padding: '1rem',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  height: '80px',
                  resize: 'none',
                  outline: 'none'
                }}
              />
              
              {/* 音声入力マイクボタン */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                style={{
                  width: '60px',
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  padding: 0
                }}
                title={isListening ? "音声入力を停止" : "音声入力を開始"}
              >
                <Mic className="w-5 h-5" />
                <span style={{ fontSize: '0.65rem' }}>{isListening ? "停止" : "音声"}</span>
              </button>

              <button 
                onClick={executeAgentCooperation}
                disabled={loading || !ceoInstruction.trim()}
                className="chat-btn-send animate-pulse-glow"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '90px', gap: '0.25rem', height: '80px' }}
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>指令送信</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* エージェント協調ログ */}
          <div className="glass-card" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                エージェント自律対話・タスク処理ログ
              </h4>
              {onResetAllData && (
                <button 
                  onClick={onResetAllData}
                  style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--neon-pink)', 
                    background: 'rgba(255, 0, 127, 0.1)', 
                    border: '1px solid rgba(255, 0, 127, 0.2)', 
                    padding: '0.3rem 0.75rem', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="reset-btn"
                >
                  デモデータ＆履歴リセット
                </button>
              )}
            </div>
            
            {logs.length === 0 ? (
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                <Sparkles className="w-10 h-10 animate-float" style={{ color: 'var(--neon-purple)', marginBottom: '0.75rem' }} />
                <p style={{ fontSize: '0.85rem', textAlign: 'center' }}>
                  CEO指令を送信すると、AIエージェントたちの自律的な連携処理ログがここにリアルタイムに展開されます。
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {logs.map((log) => (
                  <div 
                    key={log.id} 
                    style={{ 
                      display: 'flex', 
                      gap: '1rem', 
                      background: log.sender === 'ceo' ? 'rgba(255,255,255,0.02)' : 'rgba(13, 22, 47, 0.4)',
                      padding: '1.25rem', 
                      borderRadius: '12px', 
                      border: `1px solid ${log.status === 'thinking' ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.05)'}`,
                      animation: log.status === 'thinking' ? 'pulse-glow 2s infinite' : 'fade-in-up 0.3s ease'
                    }}
                  >
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: log.sender === 'ceo' ? 'var(--grad-purple)' : log.sender === 'coo' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(185, 39, 252, 0.15)',
                      border: `1px solid ${log.sender === 'ceo' ? 'var(--neon-purple)' : log.sender === 'coo' ? 'var(--neon-cyan)' : 'var(--neon-purple)'}`,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getLogIcon(log.sender)}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: log.sender === 'ceo' ? 'var(--text-main)' : log.sender === 'coo' ? 'var(--neon-cyan)' : 'var(--neon-purple)' }}>
                          {log.senderName}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div style={{ 
                        fontSize: '0.88rem', 
                        color: log.status === 'error' ? 'var(--neon-pink)' : 'var(--text-main)', 
                        lineHeight: '1.6', 
                        whiteSpace: 'pre-wrap' 
                      }}>
                        {log.text}
                      </div>

                      {log.status === 'thinking' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--neon-cyan)' }} />
                          <span style={{ fontSize: '0.72rem', color: 'var(--neon-cyan)' }}>AIモデル思考中・自律タスク生成中...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* 右側: APIキー設定＆システムガイド */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* APIキー接続状態 */}
          <div className="glass-card" style={{ borderColor: (apiKey && gcpTtsApiKey) ? 'rgba(9, 241, 184, 0.3)' : apiKey ? 'rgba(255, 200, 0, 0.3)' : 'rgba(255, 159, 67, 0.3)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key className="w-4 h-4" style={{ color: apiKey ? 'var(--neon-cyan)' : 'var(--neon-orange)' }} /> AIシステム接続ステータス
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Gemini API Key */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: apiKey ? 'var(--neon-cyan)' : 'var(--neon-orange)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Gemini API (対話): {apiKey ? '接続中' : '未接続'}</span>
                </div>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {apiKey ? (hasEnvKey ? '✓ 環境変数から自動ロード' : '✓ 手動設定キーで稼働中') : '※マルチエージェント動作に必要です。'}
                </p>
              </div>

              {/* GCP TTS API Key */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: gcpTtsApiKey ? 'var(--neon-cyan)' : 'var(--neon-orange)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>GCP TTS API (音声): {gcpTtsApiKey ? '接続中' : '未接続'}</span>
                </div>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {gcpTtsApiKey ? '✓ ロード済み（自動音声が動作します）' : '※AI返答の音声読み上げに必要です。'}
                </p>
              </div>

              <button 
                onClick={() => setShowKeyPanel(prev => !prev)}
                style={{ fontSize: '0.75rem', color: 'var(--neon-blue)', marginTop: '0.25rem', textDecoration: 'underline', alignSelf: 'flex-start' }}
              >
                {showKeyPanel ? '設定フォームを閉じる' : 'APIキーを設定・変更する'}
              </button>
            </div>

            {/* APIキー入力フォーム (アコーディオン) */}
            {showKeyPanel && (
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Google Gemini API Key
                  </label>
                  <input 
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    style={{ width: '100%', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    GCP Text-to-Speech API Key
                  </label>
                  <input 
                    type="password"
                    value={ttsApiKeyInput}
                    onChange={(e) => setTtsApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    style={{ width: '100%', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', maxWidth: '180px', lineHeight: '1.3' }}>
                    ※入力されたキーはブラウザにのみ保存されます。
                  </span>
                  <button 
                    onClick={handleSaveApiKeys}
                    className="chat-btn-send"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}
                  >
                    保存する
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* マルチエージェント解説 */}
          <div className="glass-card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--neon-purple)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles className="w-4 h-4" /> 自律協調の仕組み
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '0.75rem' }}>
              <strong>1. COOエージェント（指揮官）:</strong><br />
              CEOの自然言語指示を受け取り、それがどの部署の業務であるかを判断し、タスクを論理的に分割・整理します。
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '0.75rem' }}>
              <strong>2. 専門部署AI（実務チーム）:</strong><br />
              COOのタスク分解指示に沿って、実際に動作する構造化JSON-LDコード、AIコンシェルジュ専用プロンプト、アサインする実務タスク（To Doリスト）を即座に生成し、システム全体に同期・反映させます。
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--neon-cyan)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
              ✓ これにより、adtownは営業（指示）と全体のチェックのみを行い、実務はAIとスクール生で自律的に回る「怪物AI会社」のサイクルを本当に体験できます。
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
