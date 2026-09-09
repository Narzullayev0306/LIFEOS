'use client';

import React, { useState } from 'react';
import Shell from '@/components/layout/Shell';
import {
  Sparkles,
  Calendar,
  BookOpen,
  Wallet,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Send,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

export default function AiAssistantPage() {
  const [activeFeature, setActiveFeature] = useState<
    'SCHEDULE_ADVICE' | 'TOPIK_ANALYSIS' | 'FINANCE_REVIEW' | 'DAILY_SUMMARY'
  >('SCHEDULE_ADVICE');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [executingAction, setExecutingAction] = useState(false);

  const runAnalysis = async (
    feature = activeFeature,
    prompt = customPrompt
  ) => {
    setLoading(true);
    setAnalysisResult(null);
    setActionSuccess(null);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature,
          userPrompt: prompt,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteProposedAction = async () => {
    if (!analysisResult?.proposedAction) return;

    setExecutingAction(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          executeAction: true,
          actionPayload: analysisResult.proposedAction.payload,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionSuccess('Taklif qilingan amal muvaffaqiyatli bajarildi!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExecutingAction(false);
    }
  };

  const featureCards = [
    {
      id: 'SCHEDULE_ADVICE',
      title: 'Jadval & Reja Tahlili',
      desc: 'To‘qnashuvlarni topish, tanaffuslar va tiklanish vaqtlarini rejalashtirish',
      icon: Calendar,
      color: '#6366f1',
    },
    {
      id: 'TOPIK_ANALYSIS',
      title: 'TOPIK Strategiyasi',
      desc: 'Imtihongacha qolgan kunlar, so‘z yodlash va zaif bo‘limlar tahlili',
      icon: BookOpen,
      color: '#8b5cf6',
    },
    {
      id: 'FINANCE_REVIEW',
      title: 'Moliya & Limit Nazorati',
      desc: 'Ortiqcha xarajatlarni aniqlash va dinamik limitni qayta muvozanatlash',
      icon: Wallet,
      color: '#10b981',
    },
    {
      id: 'DAILY_SUMMARY',
      title: 'Kun Yakuniy Xulosasi',
      desc: 'Bugungi intizom, bajarilgan ishlar va ertangi kun uchun tavsiyalar',
      icon: CheckCircle,
      color: '#f59e0b',
    },
  ];

  return (
    <Shell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
              }}
            >
              <Sparkles size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>AI Qaror Ko‘makchisi</h1>
              <p style={{ fontSize: '0.85rem' }}>Aqlli tavsiyalar, rejani muvozanatlash va xavfsiz tasdiqlash tizimi</p>
            </div>
          </div>
        </div>

        {/* Feature Selector Grid */}
        <div className="grid-4">
          {featureCards.map((f) => {
            const Icon = f.icon;
            const isSelected = activeFeature === f.id;
            return (
              <div
                key={f.id}
                onClick={() => {
                  setActiveFeature(f.id as any);
                  runAnalysis(f.id as any);
                }}
                className={`glass-card interactive ${isSelected ? 'pulse-glow' : ''}`}
                style={{
                  border: `1px solid ${isSelected ? f.color : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: `${f.color}22`,
                    color: f.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Interactive Query Input */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Aniq so‘rov yoki savol berish</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              className="input"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Masalan: Bugun jadvalimda bo‘sh vaqt bormi? Yoki TOPIK inshosini qachon yozsam ma’qul?"
              onKeyDown={(e) => {
                if (e.key === 'Enter') runAnalysis();
              }}
            />
            <button
              onClick={() => runAnalysis()}
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '0 1.5rem' }}
            >
              <Send size={16} /> {loading ? 'Tahlil...' : 'Tahlil Qilish'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldAlert size={14} />
            <span>Xavfsizlik: Barcha kiritilgan ma’lumotlar sanitizatsiya qilinadi. Hech qanday muhim ma’lumot ruxsatsiz o‘zgartirilmaydi.</span>
          </div>
        </div>

        {/* Analysis Results */}
        {loading && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="pulse-glow" style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
            <p>Sun’iy intellekt ma’lumotlaringizni tahlil qilmoqda...</p>
          </div>
        )}

        {analysisResult && !loading && (
          <div className="glass-card animate-fade-in" style={{ border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="var(--accent-warning)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Tahliliy Xulosa & Tavsiyalar</h3>
              </div>
              <span className="badge badge-indigo">Tayyor</span>
            </div>

            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              {analysisResult.summary}
            </p>

            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Amaliy Tavsiyalar:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {analysisResult.recommendations?.map((rec: string, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                  }}
                >
                  <span style={{ color: 'var(--accent-success)', fontWeight: 700 }}>•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>

            {/* Consequential Action Confirmation Safeguard */}
            {analysisResult.proposedAction && !actionSuccess && (
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid var(--accent-primary)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <ShieldAlert size={18} color="var(--accent-warning)" />
                    <span>Tasdiqlash talab qilinadigan amal:</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {analysisResult.proposedAction.title} — {analysisResult.proposedAction.description}
                  </p>
                </div>

                <button
                  onClick={handleExecuteProposedAction}
                  disabled={executingAction}
                  className="btn btn-success"
                >
                  {executingAction ? 'Bajarilmoqda...' : 'Tasdiqlash va Bajarish'} <ArrowRight size={16} />
                </button>
              </div>
            )}

            {actionSuccess && (
              <div
                className="animate-fade-in"
                style={{
                  padding: '0.85rem 1.25rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid var(--accent-success)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-success)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                ✓ {actionSuccess}
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
