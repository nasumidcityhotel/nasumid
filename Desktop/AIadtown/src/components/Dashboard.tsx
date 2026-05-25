// src/components/Dashboard.tsx
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  Building2, Users, TrendingUp, Wallet, Search, Database, 
  Map, Award, CheckCircle2, X, ArrowRightLeft
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  role: string;
  description: string;
  synergy: string[];
  gig?: string;
  kpi: string;
  icon: ReactNode;
  color: string;
}

export default function Dashboard() {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Synergy loop animation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const departments: Department[] = [
    {
      id: 'research',
      name: '① AIインテリジェンス・リサーチ部',
      role: 'すべての事業の羅針盤（アルゴリズム解析）',
      description: '主要AI（ChatGPT、Gemini、Perplexity、Copilot等）が、地域の店舗や企業をどのような基準で評価・推薦しているかのアルゴリズム分析を担当します。',
      synergy: [
        '【AI集客】「どうすればAIに選ばれるか」の最新チェックリストを作成。',
        '【スクール】リサーチ結果をそのまま最新の講義テキストとして反映。',
        '【既存メディア】ポータルサイトや情報誌の「どの書き方を変えればAIに評価されるか」を指示。'
      ],
      kpi: 'アルゴリズム解析更新頻度: 週1回 / 主要AI推奨検知精度: 98%',
      icon: <Search className="w-6 h-6" />,
      color: 'var(--neon-blue)'
    },
    {
      id: 'localdata',
      name: '② AIローカルデータ連携部',
      role: '既存3大メディアのAI最適化（データ連携）',
      description: '紙の地域情報誌、みんなの那須ポータルサイト、YouTube動画の全データを、AIクローラーが「最も好む構造（JSON-LD等）」に組み替えてWeb上に格納するデータ管理部署。',
      synergy: [
        '【既存メディア×AI集客】「adtownのポータルサイトやYouTubeに掲載されているから、主要AIに一発で選ばれる」という、既存メディアの広告価値を何倍にも引き上げる地域最強のAI被リンク（推薦元）導線を構築します。'
      ],
      kpi: '構造化データ変換率: 100% / クローラー検知被リンク数: 25,000+',
      icon: <Database className="w-6 h-6" />,
      color: 'var(--neon-cyan)'
    },
    {
      id: 'geo',
      name: '③ AI選定·GEO対策部',
      role: '「AI集客支援サービス」の実践部隊',
      description: '「AIに選ばれなければ、存在しないも同然。」を現実の店舗に導入し、売上を爆発させる実務部隊。クライアントのGoogleビジネスプロフィールの最適化、SNS自動化、Web情報の構造化を徹底実行します。',
      synergy: [
        '【スクール連携】スクール受講生（協業プラン）をこの部署のアシスタントとして参画させ、地道な運用代行業務（口コミ対策や写真投稿など）をリアルな有料案件として発注。'
      ],
      gig: 'Googleビジネスプロフィール更新、店舗写真のAI最適化投稿代行、口コミ改善実務など。',
      kpi: 'クライアント店舗平均AI推薦順位: 1.4位 / GEO対策維持率: 94%',
      icon: <Map className="w-6 h-6" />,
      color: 'var(--neon-purple)'
    },
    {
      id: 'school',
      name: '④ AI利益改善スクール運営課',
      role: '「AI実践スクール」の運営·人材アサイン',
      description: '株式会社adtown会議室でのリアル講義（6ヶ月、月2回、1回3時間）の進行管理。受講生（独立志望の個人、自社導入目的の経営者）のスキル・課題の管理を行います。',
      synergy: [
        '受講生の習熟度に応じて、②のデータ入力や、③のGEO対策実務へ適切に人材をアサイン（配置）し、受講中に実績と報酬を積ませるハブとなります。'
      ],
      kpi: 'スクール卒業率: 92% / 受講中案件アサイン率: 85%',
      icon: <Award className="w-6 h-6" />,
      color: 'var(--neon-orange)'
    },
    {
      id: 'marketing',
      name: '⑤ メディア＆AIクロスマーケティング部',
      role: '営業·案件獲得の心臓部（クロスセル営業）',
      description: '既存メディアの広告主（情報誌・ポータルサイト掲載企業）に対し、「情報誌の広告 ＋ AI集客支援サービス」をセットにした新・利益改善プランをクロスセル提案。スクール受講生の集客も担当。',
      synergy: [
        'リサーチ部が作った「地域AI推薦の現状レポート」を武器にすることで、既存メディアの枠売り営業から、高単価な「企業利益改善コンサルティング」へと営業の成約率と客単価を跳ね上げます。'
      ],
      kpi: 'セット提案成約率: 58% / 新規リード獲得数: 80件/月',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'var(--neon-pink)'
    },
    {
      id: 'finance',
      name: '⑥ AI財務·マネジメント管理部',
      role: 'お金の回収·スクール生への報酬分配（自動化）',
      description: 'スクール運営、AI集客サービス、既存メディアの広告収入における、すべてのお金の流れの完全自動化・一元管理を行います。',
      synergy: [
        'Stripe等を用いた先行自動回収により未回収リスクをゼロにし、クラウドタスクシステムと連動してスクール生への報酬をミスなく自動計算・分配します。'
      ],
      kpi: '未回収金発生率: 0.0% / 分配処理工数: 95%削減',
      icon: <Wallet className="w-6 h-6" />,
      color: 'var(--text-main)'
    }
  ];

  const synergySteps = [
    {
      title: '1. 最新アルゴリズム解析',
      desc: 'リサーチ部が主要AI（ChatGPT等）の推薦アルゴリズムを解析し、最新チェックリスト化。',
      dept: 'AIインテリジェンス・リサーチ部'
    },
    {
      title: '2. 既存メディアデータのAI構造化',
      desc: '情報誌・ポータル・YouTubeの全データをAIが好む構造に組み替え、強力な被リンク導線を構築。',
      dept: 'AIローカルデータ連携部'
    },
    {
      title: '3. クロスセル営業と案件獲得',
      desc: '既存広告主に「メディア掲載＋AI集客（GEO）」をセット提案し、高単価コンサル契約を獲得。',
      dept: 'メディア＆AIクロスマーケティング部'
    },
    {
      title: '4. スクールでの実践人材育成',
      desc: '月2回×3時間のリアル講義でスクール生を育成。実績を積ませるため実務へアサイン。',
      dept: 'AI利益改善スクール運営課'
    },
    {
      title: '5. スクール生協業によるGEO実務',
      desc: '受講生がアシスタントとして口コミ改善や写真投稿などの運用実務を実行、成果を創出。',
      dept: 'AI選定・GEO対策部'
    },
    {
      title: '6. Stripe金流の自動回収と分配',
      desc: 'Stripeで月額保守料や受講料を自動回収。受講生の作業完了を検知し報酬を自動分配。',
      dept: 'AI財務・マネジメント管理部'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* 統合KPIサマリー */}
      <div className="dashboard-grid">
        <div className="glass-card">
          <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GEO導入クライアント数</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--neon-blue)' }}>124 社</h3>
            </div>
            <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--neon-blue)' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', marginTop: '0.5rem' }}>那須地域独占率 42%</div>
        </div>

        <div className="glass-card">
          <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>スクールアクティブ受講生</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--neon-purple)' }}>48 名</h3>
            </div>
            <div style={{ background: 'rgba(185, 39, 252, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <Users className="w-5 h-5" style={{ color: 'var(--neon-purple)' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', marginTop: '0.5rem' }}>実務参画率 85%</div>
        </div>

        <div className="glass-card">
          <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>既存メディア広告主数</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--neon-cyan)' }}>312 件</h3>
            </div>
            <div style={{ background: 'rgba(9, 241, 184, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <Building2 className="w-5 h-5" style={{ color: 'var(--neon-cyan)' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>情報誌/ポータル/YouTube</div>
        </div>

        <div className="glass-card">
          <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stripe自動回収稼働率</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0.25rem 0', color: '#10b981' }}>100.0 %</h3>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <Wallet className="w-5 h-5" style={{ color: '#10b981' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem' }}>未回収リスク 0%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginTop: '1.5rem' }}>
        {/* 組織図セクション */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 className="w-5 h-5" /> 組織図・体制（インタラクティブ）
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            各ノードをクリックすると、部署の詳細、5つのコア事業とのつながり、スクール生への実務の割り振りが確認できます。
          </p>

          <div className="org-chart-container">
            {/* 田代校長×adtownの共同体制 */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div className="org-node ceo" style={{ minWidth: '180px' }}>
                <div className="org-node-title" style={{ color: 'var(--neon-purple)' }}>共同代表 / パートナー</div>
                <div className="org-node-name">サクセス研究社</div>
                <div className="org-node-desc">田代 校長</div>
              </div>
              <ArrowRightLeft style={{ color: 'var(--neon-purple)' }} />
              <div className="org-node ceo" style={{ minWidth: '180px' }}>
                <div className="org-node-title" style={{ color: 'var(--neon-purple)' }}>代表取締役社長 (CEO)</div>
                <div className="org-node-name">株式会社adtown</div>
                <div className="org-node-desc">最高経営責任者</div>
              </div>
            </div>

            <div className="org-connector-vertical"></div>

            {/* COO */}
            <div className="org-node coo">
              <div className="org-node-title" style={{ color: 'var(--neon-cyan)' }}>最高執行責任者 (COO)</div>
              <div className="org-node-name">AI事業統括マネージャー</div>
              <div className="org-node-desc">全体ディレクション・進行管理</div>
            </div>

            <div className="org-connector-vertical"></div>

            {/* 6大部署 */}
            <div className="org-departments">
              {departments.map((dept) => (
                <div 
                  key={dept.id} 
                  className="org-node" 
                  style={{ borderColor: dept.id === selectedDept?.id ? dept.color : 'rgba(0,242,254,0.15)' }}
                  onClick={() => setSelectedDept(dept)}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', color: dept.color }}>
                    {dept.icon}
                  </div>
                  <div className="org-node-name" style={{ fontSize: '0.95rem' }}>{dept.name.replace(/^\S+\s/, '')}</div>
                  <div className="org-node-desc">{dept.role}</div>
                  <div style={{ fontSize: '0.7rem', color: dept.color, marginTop: '0.5rem', textDecoration: 'underline' }}>
                    詳細を表示
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 利益循環サイクルセクション */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp className="w-5 h-5" /> 怪物AI会社 利益循環エンジン
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            既存メディアの資産と新AI事業が、どのように相乗効果を生み出し、自動金流システムで分配されるかのステップ循環。
          </p>

          <div className="synergy-container">
            {synergySteps.map((step, idx) => (
              <div 
                key={idx} 
                className={`synergy-step ${idx === activeStep ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveStep(idx)}
              >
                <div className="step-num">{idx + 1}</div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: idx === activeStep ? 'var(--neon-cyan)' : 'var(--text-main)' }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {step.desc}
                  </p>
                  <span style={{ fontSize: '0.65rem', color: 'var(--neon-blue)', background: 'rgba(0,242,254,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.3rem' }}>
                    担当: {step.dept}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 部署詳細モーダル */}
      {selectedDept && (
        <div className="modal-overlay" onClick={() => setSelectedDept(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDept(null)}>
              <X className="w-6 h-6" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ color: selectedDept.color }}>
                {selectedDept.icon}
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{selectedDept.name}</h2>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>部署の役割</h4>
              <p style={{ fontSize: '0.95rem', fontWeight: 500, color: selectedDept.color }}>{selectedDept.role}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.6' }}>
                {selectedDept.description}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(5, 8, 20, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--neon-cyan)' }} /> 5事業（メディア＆新AI）とのつながり·シナジー
              </h4>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {selectedDept.synergy.map((syn, i) => (
                  <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                    • {syn}
                  </li>
                ))}
              </ul>
            </div>

            {selectedDept.gig && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--neon-orange)', fontWeight: 700, marginBottom: '0.25rem' }}>スクール生（協業パートナー）の実務</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{selectedDept.gig}</p>
              </div>
            )}

            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.25rem' }}>主要目標・部門KPI</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--neon-cyan)', fontWeight: 600 }}>{selectedDept.kpi}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
