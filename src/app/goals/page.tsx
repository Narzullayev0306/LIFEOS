'use client';

import React, { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  Layers,
  Flag,
  Sparkles,
  X,
} from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('CAREER');
  const [timeframe, setTimeframe] = useState('MONTHLY');
  const [priority, setPriority] = useState('HIGH');
  const [targetDate, setTargetDate] = useState('');
  const [milestonesInput, setMilestonesInput] = useState('');

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/goals');
      const d = await res.json();
      if (res.ok) {
        setGoals(d.goals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    try {
      await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleMilestoneId: milestoneId }),
      });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const milestones = milestonesInput
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          timeframe,
          priority,
          targetDate: targetDate || null,
          milestones,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setMilestonesInput('');
        fetchGoals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Maqsadni o‘chirishga ishonchingiz komilmi?')) return;
    try {
      await fetch(`/api/goals/${goalId}`, { method: 'DELETE' });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredGoals = goals.filter(
    (g) => selectedTimeframe === 'all' || g.timeframe === selectedTimeframe
  );

  return (
    <Shell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Filter Tabs */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                }}
              >
                <Target size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Maqsadlar & OKR Tizimi</h1>
                <p style={{ fontSize: '0.85rem' }}>Uzoq muddatli qarashdan kunlik amallargacha bog‘liqlik</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                className="select"
                style={{ width: '180px' }}
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              >
                <option value="all">Barcha muddatlar</option>
                <option value="LONG_TERM">Uzoq muddatli (1-3 yil)</option>
                <option value="ANNUAL">Yillik maqsadlar</option>
                <option value="MONTHLY">Oylik maqsadlar</option>
                <option value="WEEKLY">Haftalik maqsadlar</option>
              </select>

              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={16} /> Yangi Maqsad
              </button>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>Maqsadlar yuklanmoqda...</p>
        ) : filteredGoals.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Target size={44} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <h3>Hozircha maqsadlar belgilanmagan</h3>
            <p style={{ margin: '0.5rem 0 1.5rem', color: 'var(--text-secondary)' }}>
              Aniq maqsadlar qo‘yish hayot intizomini 3 barobar oshiradi.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <Plus size={16} /> Birinchi maqsadni belgilash
            </button>
          </div>
        ) : (
          <div className="grid-2">
            {filteredGoals.map((goal) => (
              <div key={goal.id} className="glass-card interactive">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-indigo">{goal.timeframe}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-amber">{goal.priority}</span>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{goal.title}</h3>
                {goal.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {goal.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                    <span>Umumiy bajarilish:</span>
                    <strong>{goal.progress}%</strong>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>

                {/* Milestones Checklist */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Asosiy bosqichlar (Milestones):
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {goal.milestones.map((m: any) => (
                        <div
                          key={m.id}
                          onClick={() => handleToggleMilestone(goal.id, m.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: m.isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
                            border: `1px solid ${m.isCompleted ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          <span
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '4px',
                              border: `2px solid ${m.isCompleted ? 'var(--accent-success)' : 'var(--border-medium)'}`,
                              backgroundColor: m.isCompleted ? 'var(--accent-success)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '0.65rem',
                            }}
                          >
                            {m.isCompleted ? '✓' : ''}
                          </span>
                          <span
                            style={{
                              textDecoration: m.isCompleted ? 'line-through' : 'none',
                              color: m.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                            }}
                          >
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Goal Modal */}
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Yangi Maqsad Qo‘shish</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateGoal}>
                <div className="form-group">
                  <label className="form-label">Maqsad Sarlavhasi *</label>
                  <input
                    type="text"
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Masalan: Koreyada magistratura grantini yutish"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Batafsil Tavsif</label>
                  <textarea
                    className="textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Natijalar, sabablar va mezonlar..."
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Muddat / Vaqt doirasi</label>
                    <select
                      className="select"
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                    >
                      <option value="MONTHLY">Oylik</option>
                      <option value="WEEKLY">Haftalik</option>
                      <option value="ANNUAL">Yillik</option>
                      <option value="LONG_TERM">Uzoq muddatli</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Muhimlik</label>
                    <select
                      className="select"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="HIGH">Yuqori</option>
                      <option value="MEDIUM">O‘rtacha</option>
                      <option value="LOW">Past</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bosqichlar (Har bir qatorga bittadan)</label>
                  <textarea
                    className="textarea"
                    value={milestonesInput}
                    onChange={(e) => setMilestonesInput(e.target.value)}
                    placeholder="1. TOPIK 5-daraja olish&#10;2. Tavsiyanomalar tayyorlash&#10;3. Hujjat topshirish"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                    Bekor qilish
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Maqsadni Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
