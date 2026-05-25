// src/components/LocalDataStrategy.tsx
import { useState } from 'react';
import { Database, Copy, Check, FileCode, ArrowRight, Share2, Video, BookOpen, Globe } from 'lucide-react';

interface LocalDataStrategyProps {
  initialJsonLd?: string;
}

export default function LocalDataStrategy({ initialJsonLd }: LocalDataStrategyProps) {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: 'adtownビューティーサロン',
    industry: 'BeautySalon',
    city: '那須塩原市',
    address: '石林698-35',
    telephone: '0287-00-0000',
    opens: '10:00',
    closes: '19:00',
    youtubeUrl: 'https://www.youtube.com/watch?v=example',
    portalUrl: 'https://nasu-portal.example.com/salon'
  });

  const generateJsonLd = () => {
    return `{
  "@context": "https://schema.org",
  "@type": "${formData.industry}",
  "name": "${formData.name}",
  "image": [
    "https://nasu-portal.example.com/images/salon-main.jpg"
  ],
  "telephone": "${formData.telephone}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "${formData.address}",
    "addressLocality": "${formData.city}",
    "addressRegion": "栃木県",
    "postalCode": "329-2700",
    "addressCountry": "JP"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 36.8837,
    "longitude": 140.0076
  },
  "url": "${formData.portalUrl}",
  "sameAs": [
    "${formData.youtubeUrl}"
  ],
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "opens": "${formData.opens}",
    "closes": "${formData.closes}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "株式会社adtown AI事業部",
    "logo": {
      "@type": "ImageObject",
      "url": "https://adtown.example.com/logo.png"
    }
  }
}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(initialJsonLd || generateJsonLd());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="local-data-strategy">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
        
        {/* 左側: ローカルデータ構造化ジェネレーター */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCode className="w-5 h-5" style={{ color: 'var(--neon-cyan)' }} /> AIクローラー最適化 (JSON-LD) ジェネレーター
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            店舗の情報を入力すると、主要AI（Google GeminiやChatGPTなど）のクローラーが「最も効率的に学習・評価」できる構造化データをリアルタイムで自動生成します。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>店舗名 / 企業名</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '6px', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>スキーマタイプ</label>
                <select 
                  value={formData.industry} 
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  style={{ width: '100%', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '6px', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="BeautySalon">美容室 (BeautySalon)</option>
                  <option value="AutoRepair">自動車整備 (AutoRepair)</option>
                  <option value="Restaurant">レストラン (Restaurant)</option>
                  <option value="Hotel">ホテル/宿泊 (Hotel)</option>
                  <option value="LocalBusiness">一般店舗 (LocalBusiness)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>市区町村</label>
                <input 
                  type="text" 
                  value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  style={{ width: '100%', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '6px', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>番地以降</label>
                <input 
                  type="text" 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={{ width: '100%', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '6px', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>電話番号</label>
                <input 
                  type="text" 
                  value={formData.telephone} 
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  style={{ width: '100%', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '6px', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>開店時間</label>
                <input 
                  type="text" 
                  value={formData.opens} 
                  onChange={(e) => setFormData({...formData, opens: e.target.value})}
                  style={{ width: '100%', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '6px', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>閉店時間</label>
                <input 
                  type="text" 
                  value={formData.closes} 
                  onChange={(e) => setFormData({...formData, closes: e.target.value})}
                  style={{ width: '100%', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '6px', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>那須ポータルちゃんねる (YouTube) 掲載URL</label>
              <input 
                type="text" 
                value={formData.youtubeUrl} 
                onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                style={{ width: '100%', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '6px', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>みんなの那須ポータルサイト 掲載URL</label>
              <input 
                type="text" 
                value={formData.portalUrl} 
                onChange={(e) => setFormData({...formData, portalUrl: e.target.value})}
                style={{ width: '100%', background: 'rgba(5, 8, 20, 0.8)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '6px', padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* 右側: 生成結果 ＆ データ連携マップ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* JSON-LD コードプレビュー */}
          <div className="glass-card" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Database className="w-4 h-4" /> 生成されたJSON-LD構造化データ
              </span>
              <button 
                onClick={handleCopy}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: copied ? 'var(--neon-cyan)' : 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'コピー完了' : 'コードをコピー'}
              </button>
            </div>
            
            <textarea 
              readOnly 
              value={initialJsonLd || generateJsonLd()}
              style={{
                width: '100%',
                flexGrow: 1,
                minHeight: '260px',
                background: '#04060d',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px',
                padding: '1rem',
                color: '#a5d6ff',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                lineHeight: '1.5',
                resize: 'none',
                outline: 'none'
              }}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              ※このコードをクライアント店舗のWebサイトの &lt;head&gt; 内に埋め込むことで、AI検索クローラーへの評価が最適化されます。
            </p>
          </div>

          {/* ローカルデータ連携（地域OS連携） */}
          <div className="glass-card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--neon-blue)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Share2 className="w-4 h-4" /> Nasu AI（地域OS）ローカルビッグデータ連携構想
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              adtown既存3大メディアに蓄積された店舗情報をAI最適化フォーマットに一元集約し、将来的な「那須の地域OS AI」の頭脳（ローカルビッグデータ）を構築します。
            </p>

            {/* フロービジュアル */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(5, 8, 20, 0.4)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ background: 'rgba(255, 159, 67, 0.1)', padding: '0.5rem', borderRadius: '50%', color: 'var(--neon-orange)' }}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>地域情報誌</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>店舗特徴データ</span>
              </div>

              <ArrowRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '0.5rem', borderRadius: '50%', color: 'var(--neon-blue)' }}>
                  <Globe className="w-5 h-5" />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>那須ポータル</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>詳細Web被リンク</span>
              </div>

              <ArrowRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ background: 'rgba(255, 0, 127, 0.1)', padding: '0.5rem', borderRadius: '50%', color: 'var(--neon-pink)' }}>
                  <Video className="w-5 h-5" />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>YouTube動画</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>施術/店舗動画資産</span>
              </div>

              <ArrowRight className="w-4 h-4" style={{ color: 'var(--neon-cyan)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', background: 'rgba(9, 241, 184, 0.1)', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(9, 241, 184, 0.3)' }}>
                <Database className="w-5 h-5" style={{ color: 'var(--neon-cyan)' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--neon-cyan)' }}>Nasu AI 頭脳</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>構造化ビッグデータ</span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
