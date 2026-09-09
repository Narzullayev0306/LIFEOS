'use client';

import React, { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import {
  CheckCircle2,
  Flame,
  Plus,
  TrendingUp,
  Award,
  Calendar,
  Trash2,
  Edit2,
  Info,
  X,
  Target,
} from 'lucide-react';

export default function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [disciplineData, setDisciplineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new habit
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('HEALTH');
  const [frequency, setFrequency] = useState('DAILY');
  const [color, setColor] = useState('#10b981');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, dRes] = await Promise.all([
        fetch('/api/habits'),
        fetch('/api/discipline/history'),
      ]);
      const hData = await hRes.json();
      const dData = await dRes.json();
      setHabits(hData.habits || []);
      setDisciplineData(dData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleHabit = async (habitId: string) => {
    try {
      await fetch('/api/habits/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, category, frequency, color }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setDescription('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Odatni o‘chirishga ishonchingiz komilmi?')) return;
    try {
      await fetch(`/api/habits/${habitId}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Shell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Score Metrics */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Odatlar & Intizom Tizimi</h1>
                <p style={{ fontSize: '0.85rem' }}>Shaxsiy o‘sish, odatlar zanjiri va intizom koeffitsiyenti</p>
              </div>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> Yangi Odat Qo‘shish
            </button>
          </div>

          {/* Discipline Scores Grid */}
          <div className="grid-3">
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bugungi Intizom Balli</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-success)', margin: '0.25rem 0' }}>
                {disciplineData?.dailyScore?.totalScore ?? '--'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {disciplineData?.dailyScore?.explanation || 'Kunlik faoliyat asosida hisoblangan'}
              </p>
            </div>

            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Haftalik O‘rtacha Intizom</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', margin: '0.25rem 0' }}>
                {disciplineData?.weeklyAverage ?? '--'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Oxirgi 7 kunlik barqarorlik ko‘rsatkichi
              </p>
            </div>

            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Oylik Intizom Reytingi</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-warning)', margin: '0.25rem 0' }}>
                {disciplineData?.monthlyAverage ?? '--'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Uzoq muddatli natijalar va odatlar barqarorligi
              </p>
            </div>
          </div>
        </div>

        {/* 7-Day Discipline Trend Chart & Score Formula Explainer */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* 7-Day Bar Chart */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>7 Kunlik Intizom Dinamikasi</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', paddingTop: '1rem' }}>
              {disciplineData?.last7Days?.map((d: any, idx: number) => {
                const heightPercent = Math.max(10, d.totalScore);
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {d.totalScore}
                    </span>
                    <div
                      style={{
                        width: '32px',
                        height: `${heightPercent * 1.3}px`,
                        borderRadius: 'var(--radius-sm)',
                        background:
                          d.totalScore >= 80
                            ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
                            : d.totalScore >= 50
                            ? 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)'
                            : 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                        transition: 'height 0.4s ease',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.dayName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transparent Score Explainer */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Info size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.05rem' }}>Ball Hisoblash Formulassi</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>📋 Rejali vazifalar:</span>
                <strong>Maks. 35 ball</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>⚡ Bajarilgan odatlar:</span>
                <strong>Maks. 30 ball</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>📖 TOPIK dars me’yori:</span>
                <strong>Maks. 25 ball</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>💰 Byudjetga rioya:</span>
                <strong>Maks. 10 ball</strong>
              </div>
            </div>
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Ortiqcha xarajatlar moliyaviy ballni kamaytiradi. Barcha ko‘rsatkichlar shaffof hisoblanadi.
            </div>
          </div>
        </div>

        {/* Habits Matrix */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Odatlar Zanjiri & Tarixi</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {habits.filter((h) => h.completedToday).length} / {habits.length} bugun bajarildi
            </span>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>Odatlar yuklanmoqda...</p>
          ) : habits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Target size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p>Hozircha odatlar mavjud emas.</p>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                <Plus size={14} /> Yangi odat qo‘shish
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: habit.completedToday ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                    border: `1px solid ${habit.completedToday ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: `2px solid ${habit.completedToday ? 'var(--accent-success)' : 'var(--border-medium)'}`,
                        backgroundColor: habit.completedToday ? 'var(--accent-success)' : 'transparent',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {habit.completedToday ? <CheckCircle2 size={20} /> : ''}
                    </button>

                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {habit.name}
                      </h4>
                      {habit.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{habit.description}</p>
                      )}
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>Kategoriya: {habit.category}</span>
                        <span>Davriylik: {habit.frequency}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {/* Streak Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-warning)', fontWeight: 700, fontSize: '0.95rem' }}>
                      <Flame size={18} />
                      <span>{habit.currentStreak} kunlik zanjir</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        (Eng yaxshi: {habit.bestStreak})
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      title="O‘chirish"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Habit Modal */}
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1rem',
            }}
          >
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Yangi Odat Qo‘shish</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateHabit}>
                <div className="form-group">
                  <label className="form-label">Odat Nomi *</label>
                  <input
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Masalan: Kuniga 2 litr toza suv ichish"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tavsif (ixtiyoriy)</label>
                  <textarea
                    className="textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nima uchun bu odat sizga muhim..."
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Kategoriya</label>
                    <select
                      className="select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="HEALTH">Salomatlik & Sport</option>
                      <option value="STUDY">O‘qish & TOPIK</option>
                      <option value="DISCIPLINE">Intizom</option>
                      <option value="FINANCE">Moliya</option>
                      <option value="MINDFULNESS">Xotirjamlik</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Takrorlanish</label>
                    <select
                      className="select"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                    >
                      <option value="DAILY">Har kuni</option>
                      <option value="WEEKDAYS">Ish kunlari</option>
                      <option value="WEEKLY">Haftada bir</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                    Bekor qilish
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Odatni Saqlash
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
