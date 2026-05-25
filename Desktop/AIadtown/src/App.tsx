// src/App.tsx
import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import GeoSimulator from './components/GeoSimulator';
import LocalDataStrategy from './components/LocalDataStrategy';
import ConciergeAutomation from './components/ConciergeAutomation';
import TalentGigBoard from './components/TalentGigBoard';
import CooCommandCenter from './components/CooCommandCenter';
import { 
  Building2, Search, Database, MessageSquare, Briefcase, 
  MapPin, Sparkles, Terminal
} from 'lucide-react';

type TabType = 'dashboard' | 'coo' | 'geo' | 'data' | 'concierge' | 'talent';

interface GeneratedData {
  jsonLd: string;
  conciergePrompt: string;
  newTasks: any[];
}

export interface Task {
  id: string;
  title: string;
  client: string;
  student: string;
  status: 'todo' | 'progress' | 'completed';
  price: number;
  payout: number;
  difficulty: '初級' | '中級' | '上級';
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: '美容室AのGoogleビジネスプロフィール写真・情報最適化',
    client: 'ヘアーサロン那須',
    student: '佐藤 健太 (専任スタッフ)',
    status: 'todo',
    price: 55000,
    payout: 22000,
    difficulty: '初級'
  },
  {
    id: 'task-2',
    title: 'カフェB of Googleクチコミ返信AIテンプレート設計',
    client: 'Nasu Cafe & Bakery',
    student: '鈴木 美咲 (専任スタッフ)',
    status: 'progress',
    price: 33000,
    payout: 13200,
    difficulty: '初級'
  },
  {
    id: 'task-3',
    title: '自動車整備工場C of AIコンシェルジュ初期プロンプト設計',
    client: '那須野オートサービス',
    student: '高橋 翔太 (専任スタッフ)',
    status: 'progress',
    price: 110000,
    payout: 55000,
    difficulty: '中級'
  },
  {
    id: 'task-4',
    title: '観光ポータルみんなの那須掲載店舗データのAI最適化入力',
    client: '大田原ステーキハウス',
    student: '渡辺 奈々 (専任スタッフ)',
    status: 'completed',
    price: 44000,
    payout: 17600,
    difficulty: '初級'
  },
  {
    id: 'task-5',
    title: '美容室D向けLINE連携予約AIアシスタントの結合テスト',
    client: 'Hair & Make Salon Violet',
    student: '田中 雅也 (専任スタッフ)',
    status: 'completed',
    price: 165000,
    payout: 82500,
    difficulty: '上級'
  }
];

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [apiKey, setApiKey] = useState('');
  const [gcpTtsApiKey, setGcpTtsApiKey] = useState('');
  
  // Global states sync with AI Agent Generations (Load from LocalStorage)
  const [generatedJsonLd, setGeneratedJsonLd] = useState<string>(() => {
    return localStorage.getItem('adtown_generated_json_ld') || '';
  });
  const [generatedConciergePrompt, setGeneratedConciergePrompt] = useState<string>(() => {
    return localStorage.getItem('adtown_generated_concierge_prompt') || '';
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('adtown_kanban_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
    return INITIAL_TASKS;
  });

  // Load API keys from localStorage if exists, fallback to env variables (including define process.env)
  useEffect(() => {
    const processEnv = (globalThis as any).process?.env || {};
    const savedKey = localStorage.getItem('adtown_gemini_api_key');
    
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      const envKey = import.meta.env.VITE_GEMINI_API_KEY || 
                     import.meta.env.GEMINI_API_KEY || 
                     processEnv.GEMINI_API_KEY;
      if (envKey) {
        setApiKey(envKey);
      }
    }
    
    const envTtsKey = localStorage.getItem('adtown_gcp_tts_api_key') || 
                      import.meta.env.VITE_GCP_TTS_API_KEY || 
                      import.meta.env.GCP_TTS_API_KEY || 
                      processEnv.GCP_TTS_API_KEY;
    if (envTtsKey) {
      setGcpTtsApiKey(envTtsKey);
    }
  }, []);

  const handleGenerationComplete = (data: GeneratedData) => {
    if (data.jsonLd) {
      setGeneratedJsonLd(data.jsonLd);
      localStorage.setItem('adtown_generated_json_ld', data.jsonLd);
    }
    if (data.conciergePrompt) {
      setGeneratedConciergePrompt(data.conciergePrompt);
      localStorage.setItem('adtown_generated_concierge_prompt', data.conciergePrompt);
    }
    if (data.newTasks && data.newTasks.length > 0) {
      const formatted = data.newTasks.map((t: any, i: number) => ({
        id: `ext-task-${i}-${Date.now()}`,
        title: t.title || 'AI生成タスク',
        client: t.client || '新規店舗',
        student: t.student || '未アサイン',
        status: 'todo' as const,
        price: Number(t.price) || 55000,
        payout: Number(t.payout) || 22000,
        difficulty: (t.difficulty || '初級') as '初級' | '中級' | '上級'
      }));

      setTasks(prev => {
        const updated = [...prev, ...formatted];
        localStorage.setItem('adtown_kanban_tasks', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleMoveTask = (taskId: string, newStatus: 'todo' | 'progress' | 'completed') => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
      localStorage.setItem('adtown_kanban_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const handleResetAllData = () => {
    if (window.confirm('すべてのAI生成成果物、ログ、タスクの進捗状況を初期状態にリセットしますか？')) {
      setGeneratedJsonLd('');
      setGeneratedConciergePrompt('');
      setTasks(INITIAL_TASKS);
      localStorage.removeItem('adtown_generated_json_ld');
      localStorage.removeItem('adtown_generated_concierge_prompt');
      localStorage.removeItem('adtown_kanban_tasks');
      localStorage.removeItem('adtown_coo_logs');
      // CooCommandCenter にリセットを通知する
      window.dispatchEvent(new Event('adtown-reset-data'));
    }
  };

  const getPageHeader = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'AI事業部 統合ダッシュボード',
          subtitle: 'サクセス研究社・田代校長との協業による、既存メディアとAIを融合した組織構造'
        };
      case 'coo':
        return {
          title: 'CEO指令室 (本物マルチエージェント協調)',
          subtitle: 'Gemini APIを接続し、CEOの自然言語による指示から自律的にタスク分解と成果物を自動生成'
        };
      case 'geo':
        return {
          title: 'GEO (AI推薦・検索対策) シミュレーター',
          subtitle: '主要AIエンジンへの露出度と、既存3大メディア（情報誌·ポータル·YouTube）のシナジー効果の可視化'
        };
      case 'data':
        return {
          title: 'AIローカルデータ連携＆最適化',
          subtitle: '紙・WEB・動画メディアの資産を、AIクローラーが好むJSON-LD構造化データに変換·蓄積'
        };
      case 'concierge':
        return {
          title: 'AIデジタルコンシェルジュ (自動応答デモ)',
          subtitle: '美容室や自動車整備店を想定した、24時間自動の接客・予約自動受付システム'
        };
      case 'talent':
        return {
          title: '専任スタッフアサイン ＆ 自動分配システム（社内用）',
          subtitle: 'ディレクターや稼働パートナーへの実務タスク管理と、Stripe Connectによる先行回収・自動分配シミュレーター'
        };
    }
  };

  const headerInfo = getPageHeader();


  return (
    <div className="app-layout">
      {/* サイドバーナビゲーション */}
      <aside className="app-sidebar">
        <div>
          <div className="logo-section">
            <div className="logo-icon">
              <Sparkles className="w-5 h-5" style={{ color: '#fff' }} />
            </div>
            <div className="logo-text">
              <h1 className="gradient-text" style={{ fontWeight: 800 }}>adtown AI</h1>
              <p>Division Hub</p>
            </div>
          </div>

          <nav className="nav-menu">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <Building2 className="nav-icon" />
              <span>組織図＆シナジー</span>
            </button>

            <button 
              onClick={() => setActiveTab('coo')}
              className={`nav-item ${activeTab === 'coo' ? 'active' : ''}`}
            >
              <Terminal className="nav-icon" style={{ color: apiKey ? 'var(--neon-cyan)' : 'inherit' }} />
              <span>CEO指令室 (本物AI)</span>
            </button>

            <button 
              onClick={() => setActiveTab('geo')}
              className={`nav-item ${activeTab === 'geo' ? 'active' : ''}`}
            >
              <Search className="nav-icon" />
              <span>GEOシミュレーター</span>
            </button>

            <button 
              onClick={() => setActiveTab('data')}
              className={`nav-item ${activeTab === 'data' ? 'active' : ''}`}
            >
              <Database className="nav-icon" />
              <span>データ連携·構造化</span>
            </button>

            <button 
              onClick={() => setActiveTab('concierge')}
              className={`nav-item ${activeTab === 'concierge' ? 'active' : ''}`}
            >
              <MessageSquare className="nav-icon" />
              <span>AIコンシェルジュ</span>
            </button>

            <button 
              onClick={() => setActiveTab('talent')}
              className={`nav-item ${activeTab === 'talent' ? 'active' : ''}`}
            >
              <Briefcase className="nav-icon" />
              <span>社内運用＆自動分配</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', justifyContent: 'center' }}>
            <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--neon-cyan)' }} />
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>栃木県那須塩原市石林698-35</span>
          </div>
          <div className="footer-info">
            © {new Date().getFullYear()} 株式会社adtown<br />
            AI事業部 (AI会社)
          </div>
        </div>
      </aside>

      {/* メインコンテンツエリア */}
      <main className="app-content">
        <header className="page-header">
          <div className="header-title">
            <h2 className="gradient-text-neon">{headerInfo.title}</h2>
            <p>{headerInfo.subtitle}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-primary">Ver 2.0 (アップデート版)</span>
          </div>
        </header>

        {/* 動的に切り替わるコンテンツ (状態を保持するためにdisplay: noneで制御) */}
        <section className="tab-content-wrapper">
          <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
            <Dashboard />
          </div>
          <div style={{ display: activeTab === 'coo' ? 'block' : 'none' }}>
            <CooCommandCenter 
              apiKey={apiKey} 
              setApiKey={setApiKey} 
              onGenerationComplete={handleGenerationComplete} 
              onResetAllData={handleResetAllData}
              gcpTtsApiKey={gcpTtsApiKey}
              setGcpTtsApiKey={setGcpTtsApiKey}
            />
          </div>
          <div style={{ display: activeTab === 'geo' ? 'block' : 'none' }}>
            <GeoSimulator />
          </div>
          <div style={{ display: activeTab === 'data' ? 'block' : 'none' }}>
            <LocalDataStrategy initialJsonLd={generatedJsonLd} />
          </div>
          <div style={{ display: activeTab === 'concierge' ? 'block' : 'none' }}>
            <ConciergeAutomation customPrompt={generatedConciergePrompt} gcpTtsApiKey={gcpTtsApiKey} />
          </div>
          <div style={{ display: activeTab === 'talent' ? 'block' : 'none' }}>
            <TalentGigBoard tasks={tasks} onMoveTask={handleMoveTask} apiKey={apiKey} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
