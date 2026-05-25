// src/components/TalentGigBoard.tsx
import { useState } from 'react';
import { 
  Briefcase, Wallet, CreditCard, ChevronRight
} from 'lucide-react';

import type { Task } from '../App';

interface TalentGigBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: 'todo' | 'progress' | 'completed') => void;
  apiKey?: string;
}

export default function TalentGigBoard({ tasks, onMoveTask }: TalentGigBoardProps) {
  // Financial simulator state
  const [studentsCount, setStudentsCount] = useState(40);
  const [clientsCount, setClientsCount] = useState(100);
  const [payoutRate, setPayoutRate] = useState(40); // 40%

  // Stripe financial calculations
  const clientMonthlyFee = 33000; // 33,000 yen/month (保守管理料)
  const studentMonthlyFee = 33000; // 33,000 yen/month (ライセンス保守料)
  const stripeFeeRate = 0.036; // Stripe 決済手数料 3.6%

  const totalClientRevenue = clientsCount * clientMonthlyFee; 
  const totalStudentRevenue = studentsCount * studentMonthlyFee; 
  
  // Stripe手数料計算
  const clientStripeFee = totalClientRevenue * stripeFeeRate;
  const studentStripeFee = totalStudentRevenue * stripeFeeRate;
  const totalStripeFees = clientStripeFee + studentStripeFee;
  
  const totalPayout = totalClientRevenue * (payoutRate / 100); 
  const adtownShare = totalClientRevenue * (1 - (payoutRate / 100)) - clientStripeFee; 
  
  const totalAdtownMonthlyRevenue = adtownShare + (totalStudentRevenue - studentStripeFee); 
  const averageStudentPayout = studentsCount > 0 ? Math.round(totalPayout / studentsCount) : 0;

  const moveTask = (taskId: string, newStatus: 'todo' | 'progress' | 'completed') => {
    onMoveTask(taskId, newStatus);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case '初級': return 'var(--neon-cyan)';
      case '中級': return 'var(--neon-blue)';
      case '上級': return 'var(--neon-purple)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="talent-gig-board">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        
        {/* 左側: 専任スタッフアサインカンバン */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase className="w-5 h-5" style={{ color: 'var(--neon-blue)' }} /> 専任スタッフ 案件実行・管理カンバンボード
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            スタッフの担当領域やスキルに応じて、AI選定・GEO対策部やデータ連携部の実務タスク（地道な運用代行など）を割り当てます。ステータスボタンでカードを移動できます。
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            
            {/* 未着手 (To Do) */}
            <div style={{ background: 'rgba(5, 8, 20, 0.4)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid var(--neon-pink)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--neon-pink)' }}>未着手</span>
                <span className="badge" style={{ background: 'rgba(255,0,127,0.1)', color: 'var(--neon-pink)' }}>
                  {tasks.filter(t => t.status === 'todo').length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.filter(t => t.status === 'todo').map(task => (
                  <div key={task.id} style={{ background: 'rgba(13, 22, 47, 0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.85rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge" style={{ fontSize: '0.65rem', border: `1px solid ${getDifficultyColor(task.difficulty)}`, color: getDifficultyColor(task.difficulty) }}>{task.difficulty}</span>
                      <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>¥{task.payout.toLocaleString()} 報酬</span>
                    </div>
                    <h5 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>{task.title}</h5>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.75rem' }}>
                      クライアント: {task.client}<br/>
                      担当者: {task.student}
                    </div>
                    <button 
                      onClick={() => moveTask(task.id, 'progress')}
                      style={{ width: '100%', padding: '0.35rem', background: 'rgba(0,242,254,0.1)', color: 'var(--neon-blue)', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                    >
                      着手する <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 進行中 (In Progress) */}
            <div style={{ background: 'rgba(5, 8, 20, 0.4)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid var(--neon-blue)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--neon-blue)' }}>進行中</span>
                <span className="badge" style={{ background: 'rgba(0,242,254,0.1)', color: 'var(--neon-blue)' }}>
                  {tasks.filter(t => t.status === 'progress').length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.filter(t => t.status === 'progress').map(task => (
                  <div key={task.id} style={{ background: 'rgba(13, 22, 47, 0.8)', border: '1px solid rgba(0,242,254,0.15)', borderRadius: '8px', padding: '0.85rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge" style={{ fontSize: '0.65rem', border: `1px solid ${getDifficultyColor(task.difficulty)}`, color: getDifficultyColor(task.difficulty) }}>{task.difficulty}</span>
                      <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>¥{task.payout.toLocaleString()} 報酬</span>
                    </div>
                    <h5 style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>{task.title}</h5>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.75rem' }}>
                      クライアント: {task.client}<br/>
                      担当者: {task.student}
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button 
                        onClick={() => moveTask(task.id, 'todo')}
                        style={{ flex: 1, padding: '0.35rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', borderRadius: '4px', fontSize: '0.7rem' }}
                      >
                        戻す
                      </button>
                      <button 
                        onClick={() => moveTask(task.id, 'completed')}
                        style={{ flex: 1, padding: '0.35rem', background: 'rgba(9,241,184,0.1)', color: 'var(--neon-cyan)', borderRadius: '4px', fontSize: '0.7rem' }}
                      >
                        完了
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 完了 (Completed) */}
            <div style={{ background: 'rgba(5, 8, 20, 0.4)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid var(--neon-cyan)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--neon-cyan)' }}>完了</span>
                <span className="badge" style={{ background: 'rgba(9,241,184,0.1)', color: 'var(--neon-cyan)' }}>
                  {tasks.filter(t => t.status === 'completed').length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.filter(t => t.status === 'completed').map(task => (
                  <div key={task.id} style={{ background: 'rgba(13, 22, 47, 0.6)', border: '1px solid rgba(9,241,184,0.15)', borderRadius: '8px', padding: '0.85rem', fontSize: '0.8rem', opacity: 0.8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge" style={{ fontSize: '0.65rem', border: `1px solid ${getDifficultyColor(task.difficulty)}`, color: getDifficultyColor(task.difficulty) }}>{task.difficulty}</span>
                      <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>¥{task.payout.toLocaleString()} 報酬</span>
                    </div>
                    <h5 style={{ fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: '0.35rem' }}>{task.title}</h5>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.5rem' }}>
                      クライアント: {task.client}<br/>
                      担当者: {task.student}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      ✓ 財務処理完了(報酬分配対象)
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* 右側: 財務シミュレーター */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wallet className="w-5 h-5" style={{ color: 'var(--neon-purple)' }} /> Stripe 金流・報酬自動分配シミュレーター
            </h3>
            
            {/* スライダー1: 稼働パートナー数 */}
            <div className="range-slider-group">
              <div className="range-slider-label">
                <span>① 稼働パートナー数（アソシエイト数）</span>
                <span className="value">{studentsCount} 名</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                step="5"
                value={studentsCount}
                onChange={(e) => setStudentsCount(parseInt(e.target.value))}
                className="custom-range"
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ライセンス保守費: 月額33,000円 / 人</span>
            </div>

            {/* スライダー2: AI集客クライアント店舗数 */}
            <div className="range-slider-group">
              <div className="range-slider-label">
                <span>② GEO対策クライアント数 (ストック保守料)</span>
                <span className="value">{clientsCount} 社</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="300" 
                step="10"
                value={clientsCount}
                onChange={(e) => setClientsCount(parseInt(e.target.value))}
                className="custom-range"
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>集客保守料: 月額33,000円 / 店舗</span>
            </div>

            {/* スライダー3: 稼働パートナーへの配分率 */}
            <div className="range-slider-group">
              <div className="range-slider-label">
                <span>③ 稼働パートナーへの実務配分率</span>
                <span className="value">{payoutRate} %</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="60" 
                step="5"
                value={payoutRate}
                onChange={(e) => setPayoutRate(parseInt(e.target.value))}
                className="custom-range"
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>GEO保守料の中から実務をした稼働パートナーに分配</span>
            </div>

            {/* 計算結果表示 */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              <div className="financial-metric-card">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>adtown月間手残り純利 (Stripe手数料3.6%差引済)</span>
                <span className="financial-metric-val profit">
                  ¥{totalAdtownMonthlyRevenue.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                  (内訳: 保守粗利 ¥{adtownShare.toLocaleString()} + パートナー売上純利 ¥{(totalStudentRevenue - studentStripeFee).toLocaleString()} / Stripe手数料総額: ¥{totalStripeFees.toLocaleString()})
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                
                <div className="financial-metric-card" style={{ padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>パートナー総分配額</span>
                  <span className="financial-metric-val" style={{ fontSize: '1.15rem', color: 'var(--neon-blue)' }}>
                    ¥{totalPayout.toLocaleString()}
                  </span>
                </div>

                <div className="financial-metric-card" style={{ padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>パートナー平均月間報酬</span>
                  <span className="financial-metric-val" style={{ fontSize: '1.15rem', color: 'var(--neon-purple)' }}>
                    ¥{averageStudentPayout.toLocaleString()}
                  </span>
                </div>

              </div>

            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CreditCard className="w-4 h-4" /> Stripe Connect 自動分配・回収システム本番導入ガイド
            </h4>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              <ol style={{ paddingLeft: '1.1rem' }}>
                <li style={{ marginBottom: '0.25rem' }}><strong>Stripeアカウント</strong>を開設し、<strong>Stripe Connect</strong> (Express) を有効化します。</li>
                <li style={{ marginBottom: '0.25rem' }}>稼働パートナーをプラットフォームに連携口座として紐付け、個別のConnectアカウント（受取口座）を設定します。</li>
                <li style={{ marginBottom: '0.25rem' }}>クラウドタスク完了検知 ➔ Make (make.com) などの連携ツールを経由してStripe Connectの <strong>Transfer API</strong> を実行し、稼働パートナーのConnect口座へ報酬を全自動分配・送金します。</li>
              </ol>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
