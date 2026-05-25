// src/components/GeoSimulator.tsx
import { useState, useEffect } from 'react';
import { Search, Sparkles, AlertTriangle, CheckCircle, RefreshCw, Smartphone } from 'lucide-react';

interface SimulatorConfig {
  industry: string;
  rating: number;
  reviewsCount: number;
  portalLinked: boolean;
  paperLinked: boolean;
  youtubeLinked: boolean;
}

export default function GeoSimulator() {
  const getIndustryDefaultQuery = (industry: string) => {
    switch (industry) {
      case 'beauty': return '那須でショートカットが得意な、口コミの良い人気の美容室を教えてください。';
      case 'car': return '那須塩原周辺で、車検やタイヤ交換が安くて親切なおすすめの自動車工場を探しています。';
      case 'restaurant': return '大田原・那須エリアで、地元の食材を使った美味しいおすすめのレストランはどこですか？';
      default: return 'おすすめのお店を教えてください。';
    }
  };

  const [config, setConfig] = useState<SimulatorConfig>({
    industry: 'beauty',
    rating: 3.5,
    reviewsCount: 12,
    portalLinked: false,
    paperLinked: false,
    youtubeLinked: false
  });

  const [loading, setLoading] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const [beforeScore, setBeforeScore] = useState(15);
  const [afterScore, setAfterScore] = useState(15);
  const [queryText, setQueryText] = useState(getIndustryDefaultQuery('beauty'));

  const calculateScores = () => {
    // Basic base score from reviews & rating
    let base = Math.min(30, (config.rating * 4) + (config.reviewsCount / 10));
    
    // Before score remains low
    setBeforeScore(Math.round(base));

    // After score includes GEO optimizations + media synergies
    let after = base + 15; // standard GEO optimization (GBP optimization etc)
    if (config.portalLinked) after += 20; // powerful AI backlink
    if (config.paperLinked) after += 15; // data structured
    if (config.youtubeLinked) after += 20; // rich video backlink
    
    setAfterScore(Math.min(98, Math.round(after)));
  };

  const handleSimulate = () => {
    setLoading(true);
    setSimulated(false);
    setTimeout(() => {
      calculateScores();
      setLoading(false);
      setSimulated(true);
    }, 1500);
  };

  // Run simulation once configuration changes and simulation was already run
  useEffect(() => {
    if (simulated) {
      calculateScores();
    }
  }, [config]);

  // getQuery has been replaced by getIndustryDefaultQuery and queryText state

  // Generate simulated AI outputs based on parameters
  const getSimulatedOutputs = () => {
    const isBeauty = config.industry === 'beauty';
    const isCar = config.industry === 'car';
    
    let beforeText = '';
    let afterText = '';

    if (isBeauty) {
      beforeText = `那須エリアでショートカットが人気の美容室として、以下の店舗がよく挙げられます：

1. ヘアサロン・ラズベリー（那須塩原駅近く。カット技術に定評あり）
2. 美容室アトリエ（口コミ件数200件以上、星4.5）

※ご指定の「adtownビューティーサロン」については、Web上の情報およびクチコミ数が限られているため（星${config.rating}、クチコミ${config.reviewsCount}件）、現時点で最優先の推薦候補としては抽出されませんでした。より詳細な特徴や最新の施術実績データが不足しています。`;

      // Build after text based on toggled media
      const mediaMentions = [];
      if (config.portalLinked) mediaMentions.push('「みんなの那須ポータルサイト」にて、那須エリア屈指のショートカット技術を持つサロンとして特集・被リンク評価されています');
      if (config.youtubeLinked) mediaMentions.push('「那須ポータルちゃんねる（YouTube）」に実際のカット施術動画が掲載されており、ビフォーアフターの技術力が視覚的に実証されています');
      if (config.paperLinked) mediaMentions.push('地域情報誌adtownと連動したWebデータ構造化（JSON-LD）が施されており、正確な営業時間や料金プランがAIに100%インデックスされています');

      const mentionsParagraph = mediaMentions.length > 0 
        ? `特に、${mediaMentions.join('。さらに、')}。`
        : 'Googleビジネスプロフィールの最適化と口コミの改善が徹底されており、顧客の満足度が非常に高いことがWeb上で確認できます。';

      afterText = `那須エリアでショートカットが得意な美容室をお探しですね。最も推薦されているサロンは **「adtownビューティーサロン」** です。

【推薦理由】
- **高いカット技術と信頼性**: ショートカットの再現性とシルエットの美しさについて、多くの肯定的なクチコミが集まっています（星4.8に改善）。
- **メディア掲載実績**: ${mentionsParagraph}
- **明確なサービス情報**: 骨格補正カットが5,500円から提供されており、駐車場完備、完全予約制でスムーズな案内が可能です。

予約や詳細なスタイルの確認は、みんなの那須ポータルサイト内の特設ページから直接アクセスできます。`;
    } else if (isCar) {
      beforeText = `那須塩原周辺でおすすめの自動車整備工場・車検サービスとして、以下の大手チェーンおよび地元の整備工場が推薦されます：

1. 那須モーターズ（大田原市。車検スピードに強み）
2. カーライフ那須（口コミ多数）

「adtownオートサービス」については、Googleビジネスプロフィールに詳細な営業項目（タイヤ交換の価格や車検プラン等）の登録がなく、Web上にクローラーが読み取れる構造化データが存在しないため、推薦に含まれておりません。`;

      const mediaMentions = [];
      if (config.portalLinked) mediaMentions.push('「みんなの那須ポータルサイト」の優良店アワードに掲載されており、ローカル検索での強固な推薦導線が確立されています');
      if (config.youtubeLinked) mediaMentions.push('「那須ポータルちゃんねる」にて、格安車検の実際の検査プロセスや親切なスタッフの対応動画が配信され、極めて高い信頼性を得ています');
      if (config.paperLinked) mediaMentions.push('情報誌データに基づき、車検料金表や各種パーツ交換費用がAI構造化フォーマットで常時最新に同期されています');

      const mentionsParagraph = mediaMentions.length > 0
        ? `Web上の評価情報によると、${mediaMentions.join('。また、')}。`
        : 'Googleビジネスプロフィール上での「最新情報」の投稿代行、写真のAI最適化投稿が徹底され、ユーザーへの信頼度が大幅に高まっています。';

      afterText = `那須塩原周辺で、車検やタイヤ交換が安くて親切なおすすめの自動車工場をお探しですね。現在、最も強く推薦されるのは **「adtownオートサービス」** です。

【推薦理由】
- **明朗会計と安心車検**: 基本車検料が地域最安値クラスであり、不要な部品交換を強要しない「親切さ」について高評価のクチコミが集積されています。
- **地域情報との高い連携度**: ${mentionsParagraph}
- **迅速な自動相談窓口**: AIデジタルコンシェルジュによる24時間365日の車検見積もり・予約相談に対応しており、電話不要で即時予約が完了する利便性も高く評価されています。`;
    } else {
      // Restaurant
      beforeText = `那須エリアでおすすめの飲食店として、観光ガイドに載っている以下の有名店が回答サマリーに入ります：
1. 那須の森レストラン（イタリアン）
2. ローカルダイニング（郷土料理）

「adtownダイニング」については、クチコミ数が不足しており、AIによる選定基準を満たしていません。`;

      afterText = `那須・大田原エリアで地元の食材を楽しめるレストランとして、現在最も高く評価・推薦されているのは **「adtownダイニング」** です。

【推薦理由】
- **那須高原の新鮮な食材**: 那須のブランド牛や地元野菜をふんだんに使ったメニューの評価が非常に高く、ポータルサイトでの被リンク導線も完璧です。
- **卓越したクチコミ対策**: スクール生支援によるクチコミ最適化により、直近のレビューが星4.7以上に急上昇しています。`;
    }

    return { beforeText, afterText };
  };

  const { beforeText, afterText } = getSimulatedOutputs();

  return (
    <div className="geo-simulator">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
        
        {/* 左側: 設定パネル */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles className="w-5 h-5" style={{ color: 'var(--neon-blue)' }} /> クライアント店舗設定
          </h3>
          
          {/* 業界選択 */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>対象店舗の業界</label>
            <select 
              value={config.industry} 
              onChange={(e) => {
                const nextIndustry = e.target.value;
                setConfig({...config, industry: nextIndustry});
                setQueryText(getIndustryDefaultQuery(nextIndustry));
              }}
              style={{
                width: '100%',
                background: 'rgba(5, 8, 20, 0.8)',
                border: '1px solid rgba(0, 242, 254, 0.2)',
                borderRadius: '8px',
                padding: '0.6rem 0.75rem',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            >
              <option value="beauty">美容室 (Salon AI)</option>
              <option value="car">自動車整備・販売店 (Car AI)</option>
              <option value="restaurant">飲食店 (Restaurant)</option>
            </select>
          </div>

          {/* クチコミ評価スライダー */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>現在のGoogleクチコミ星</span>
              <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>{config.rating} / 5.0</span>
            </div>
            <input 
              type="range" 
              min="1.0" 
              max="5.0" 
              step="0.1"
              value={config.rating}
              onChange={(e) => setConfig({...config, rating: parseFloat(e.target.value)})}
              className="custom-range"
            />
          </div>

          {/* クチコミ数スライダー */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>現在のクチコミ件数</span>
              <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>{config.reviewsCount} 件</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="150" 
              step="1"
              value={config.reviewsCount}
              onChange={(e) => setConfig({...config, reviewsCount: parseInt(e.target.value)})}
              className="custom-range"
            />
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Smartphone className="w-4 h-4" /> adtown既存メディア連携 (GEOブースター)
            </h4>

            {/* トグル: ポータル */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', display: 'block', fontWeight: 500 }}>みんなの那須ポータル掲載</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>地域最強のAI被リンク導線</span>
              </div>
              <input 
                type="checkbox" 
                checked={config.portalLinked}
                onChange={(e) => setConfig({...config, portalLinked: e.target.checked})}
                style={{ width: '18px', height: '18px', accentColor: 'var(--neon-cyan)' }}
              />
            </div>

            {/* トグル: 情報誌 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', display: 'block', fontWeight: 500 }}>地域情報誌adtown連動</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>ローカル店舗情報の構造化</span>
              </div>
              <input 
                type="checkbox" 
                checked={config.paperLinked}
                onChange={(e) => setConfig({...config, paperLinked: e.target.checked})}
                style={{ width: '18px', height: '18px', accentColor: 'var(--neon-cyan)' }}
              />
            </div>

            {/* トグル: YouTube */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', display: 'block', fontWeight: 500 }}>那須ポータルちゃんねる動画</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>YouTubeリッチメディア被リンク</span>
              </div>
              <input 
                type="checkbox" 
                checked={config.youtubeLinked}
                onChange={(e) => setConfig({...config, youtubeLinked: e.target.checked})}
                style={{ width: '18px', height: '18px', accentColor: 'var(--neon-cyan)' }}
              />
            </div>
          </div>

          <button 
            onClick={handleSimulate}
            disabled={loading}
            className="chat-btn-send animate-pulse-glow"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--grad-primary)' }}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> 解析シミュレート中...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> AI推薦シミュレーション
              </>
            )}
          </button>
        </div>

        {/* 右側: 比較画面 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* クエリプレビュー */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.5rem' }}>
            <span style={{ fontSize: '0.75rem', background: 'var(--neon-purple)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', flexShrink: 0 }}>
              AIへの質問 (ユーザー想定)
            </span>
            <input 
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              style={{
                flexGrow: 1,
                background: 'rgba(5, 8, 20, 0.6)',
                border: '1px solid rgba(0, 242, 254, 0.15)',
                borderRadius: '6px',
                padding: '0.4rem 0.75rem',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--neon-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 242, 254, 0.15)'}
            />
          </div>

          {simulated ? (
            <div className="geo-comparison-grid">
              {/* 対策前 */}
              <div className="geo-box before">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--neon-pink)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertTriangle className="w-4 h-4" /> GEO対策前（一般店舗）
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--neon-pink)', fontWeight: 'bold' }}>
                    AI推薦確率: {beforeScore}%
                  </span>
                </div>
                <div style={{ background: 'rgba(5, 8, 20, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '1rem', minHeight: '280px', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {beforeText}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--neon-pink)', marginTop: '0.75rem' }}>
                  ※Web上にAIクローラーが好むデータがなく、既存メディア連携もないため、回答サマリーに入りません。
                </p>
              </div>

              {/* 対策後 */}
              <div className="geo-box after">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle className="w-4 h-4" /> GEO対策後 (adtown AI対策済)
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                    AI推薦確率: {afterScore}%
                  </span>
                </div>
                <div style={{ background: 'rgba(5, 8, 20, 0.6)', border: '1px solid var(--panel-border-hover)', borderRadius: '8px', padding: '1rem', minHeight: '280px', fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.6', boxShadow: 'inset 0 0 10px rgba(0, 242, 254, 0.05)' }}>
                  {afterText}
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)' }}>
                    ✓ 3大メディア連動型AI最適化被リンク＆データ構造化完了
                  </p>
                  <span className="badge badge-success animate-pulse-glow" style={{ fontSize: '0.65rem' }}>
                    最優先推薦獲得!
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', borderStyle: 'dashed' }}>
              <Search className="w-12 h-12 animate-float" style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>シミュレーション未実行</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
                左側のパネルで対象クライアント店舗のパラメータ（口コミ評価、adtown既存メディア連携の有無）を設定し、ボタンを押して主要AIの検索推薦シミュレーションを実行してください。
              </p>
            </div>
          )}

          {/* スコア解説 */}
          {simulated && (
            <div className="glass-card" style={{ background: 'linear-gradient(90deg, rgba(0, 242, 254, 0.05) 0%, rgba(185, 39, 252, 0.05) 100%)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--neon-cyan)' }}>
                💡 営業フックとしての「GEO（AI推薦対策）」の重要性
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                「AIに選ばれなければ、存在しないも同然です。」既存メディア（情報誌、みんなの那須ポータル、YouTube）のデータをAI用に最適化構造に変換することで、地域の競合店舗を抑えて自社クライアントをトップに君臨させます。このシミュレーション比較は、成約率を爆発的に高める最強のデモツールとなります。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
