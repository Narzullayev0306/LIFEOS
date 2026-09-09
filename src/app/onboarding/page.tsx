'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  BookOpen,
  Wallet,
  CheckCircle2,
  Bell,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Flame,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [wakeTime, setWakeTime] = useState('06:30');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [studyStartTime, setStudyStartTime] = useState('19:30');
  const [studyEndTime, setStudyEndTime] = useState('21:30');

  const [topikLevel, setTopikLevel] = useState(5);
  const [topikScore, setTopikScore] = useState(200);
  const [examDate, setExamDate] = useState('2026-10-18');
  const [dailyVocabTarget, setDailyVocabTarget] = useState(25);
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(90);

  const [monthlyBudget, setMonthlyBudget] = useState(4500000);
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState(8000000);

  const [selectedHabits, setSelectedHabits] = useState([
    { name: 'Koreys tili 50 ta so‘z takrorlash', category: 'STUDY', color: '#8b5cf6' },
    { name: 'Ertalabki rejalashtirish (LIFEOS)', category: 'DISCIPLINE', color: '#6366f1' },
    { name: 'Kunlik xarajatlarni kiritish', category: 'FINANCE', color: '#10b981' },
    { name: 'Kamida 7 soat sifatli uyqu', category: 'HEALTH', color: '#3b82f6' },
  ]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleHabit = (name: string, category: string, color: string) => {
    if (selectedHabits.some((h) => h.name === name)) {
      setSelectedHabits(selectedHabits.filter((h) => h.name !== name));
    } else {
      setSelectedHabits([...selectedHabits, { name, category, color }]);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wakeTime,
          sleepTime,
          workStartTime,
          workEndTime,
          studyStartTime,
          studyEndTime,
          topikLevel,
          topikScore,
          examDate,
          dailyVocabTarget,
          dailyStudyMinutes,
          monthlyBudget,
          monthlyIncomeTarget,
          selectedHabits,
          notificationsEnabled,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Xatolik yuz berdi');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const availableHabits = [
    { name: 'Koreys tili 50 ta so‘z takrorlash', category: 'STUDY', color: '#8b5cf6' },
    { name: 'Ertalabki rejalashtirish (LIFEOS)', category: 'DISCIPLINE', color: '#6366f1' },
    { name: 'Kunlik xarajatlarni kiritish', category: 'FINANCE', color: '#10b981' },
    { name: 'Kamida 7 soat sifatli uyqu', category: 'HEALTH', color: '#3b82f6' },
    { name: 'Kuniga 2 litr toza suv ichish', category: 'HEALTH', color: '#06b6d4' },
    { name: 'Kechki 30 daqiqa kitob o‘qish', category: 'STUDY', color: '#ec4899' },
    { name: '45 daqiqa jismoniy mashq (Gym)', category: 'HEALTH', color: '#f59e0b' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #090d16 80%)',
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '640px',
          padding: '2.5rem',
        }}
      >
        {/* Header with Progress Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Flame size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>LIFEOS Onboarding</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Qadam {step} / 5: Shaxsiy boshqaruv tizimingizni sozlash
            </p>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="progress-container" style={{ marginBottom: '2rem', height: '6px' }}>
          <div
            className="progress-bar"
            style={{ width: `${(step / 5) * 100}%`, transition: 'width 0.3s ease' }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--accent-danger-light)',
              border: '1px solid var(--accent-danger)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </div>
        )}

        {/* STEP 1: TIME SCHEDULE */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Clock size={20} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.2rem' }}>Kun tartibi va uyqu rejimi</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              LIFEOS sizning uyqu va tiklanish soatlaringizni vazifalar to‘qnashuvidan himoya qiladi.
            </p>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Uyg‘onish vaqti</label>
                <input
                  type="time"
                  className="input"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Uyquga yotish vaqti</label>
                <input
                  type="time"
                  className="input"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Asosiy ish/o‘qish boshlanishi</label>
                <input
                  type="time"
                  className="input"
                  value={workStartTime}
                  onChange={(e) => setWorkStartTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Asosiy ish/o‘qish tugashi</label>
                <input
                  type="time"
                  className="input"
                  value={workEndTime}
                  onChange={(e) => setWorkEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">TOPIK o‘rganish boshlanishi</label>
                <input
                  type="time"
                  className="input"
                  value={studyStartTime}
                  onChange={(e) => setStudyStartTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">TOPIK o‘rganish tugashi</label>
                <input
                  type="time"
                  className="input"
                  value={studyEndTime}
                  onChange={(e) => setStudyEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TOPIK TARGET */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <BookOpen size={20} color="var(--accent-topik)" />
              <h2 style={{ fontSize: '1.2rem' }}>TOPIK II Imtihon Maqsadi</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Maqsad darajangiz va kunlik so‘z/vaqt me’yoringizni belgilang.
            </p>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Ko‘zlangan TOPIK darajasi</label>
                <select
                  className="select"
                  value={topikLevel}
                  onChange={(e) => setTopikLevel(Number(e.target.value))}
                >
                  <option value={3}>TOPIK 3-daraja (120+ ball)</option>
                  <option value={4}>TOPIK 4-daraja (150+ ball)</option>
                  <option value={5}>TOPIK 5-daraja (190+ ball)</option>
                  <option value={6}>TOPIK 6-daraja (230+ ball)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Maqsad ball (300 dan)</label>
                <input
                  type="number"
                  className="input"
                  value={topikScore}
                  onChange={(e) => setTopikScore(Number(e.target.value))}
                  min={120}
                  max={300}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Imtihon sanasi</label>
                <input
                  type="date"
                  className="input"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kunlik yangi lug‘at maqsadi</label>
                <input
                  type="number"
                  className="input"
                  value={dailyVocabTarget}
                  onChange={(e) => setDailyVocabTarget(Number(e.target.value))}
                  min={5}
                  max={100}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Kunlik dars davomiyligi (daqiqa)</label>
              <input
                type="number"
                className="input"
                value={dailyStudyMinutes}
                onChange={(e) => setDailyStudyMinutes(Number(e.target.value))}
                min={30}
                max={300}
              />
            </div>
          </div>
        )}

        {/* STEP 3: FINANCIAL TARGETS */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Wallet size={20} color="var(--accent-success)" />
              <h2 style={{ fontSize: '1.2rem' }}>Moliyaviy Reja va Byudjet</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              LIFEOS kunlik dinamik xarajat limitini hisoblab boradi.
            </p>

            <div className="form-group">
              <label className="form-label">Oylik xarajat byudjeti (UZS)</label>
              <input
                type="number"
                className="input"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                step={100000}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Taxminiy kunlik limit: ~{Math.round(monthlyBudget / 30).toLocaleString()} UZS / kun
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Oylik daromad maqsadi (UZS)</label>
              <input
                type="number"
                className="input"
                value={monthlyIncomeTarget}
                onChange={(e) => setMonthlyIncomeTarget(Number(e.target.value))}
                step={500000}
              />
            </div>
          </div>
        )}

        {/* STEP 4: HABITS */}
        {step === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={20} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.2rem' }}>Asosiy Kundalik Odatlar</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Boshlang‘ich odatlaringizni tanlang. Ular intizom ballingizni shakllantiradi.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {availableHabits.map((habit) => {
                const isSelected = selectedHabits.some((h) => h.name === habit.name);
                return (
                  <div
                    key={habit.name}
                    onClick={() => toggleHabit(habit.name, habit.category, habit.color)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--accent-primary-light)' : 'var(--bg-secondary)',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span style={{ fontSize: '0.925rem', fontWeight: 500 }}>{habit.name}</span>
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-medium)'}`,
                        backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.7rem',
                      }}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION & PLAN GENERATION */}
        {step === 5 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={20} color="var(--accent-warning)" />
              <h2 style={{ fontSize: '1.2rem' }}>Tayyormisiz? Kunlik Rejangizni Yaratamiz</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Kiritilgan me’yorlar asosida LIFEOS bugungi kun jadvali, TOPIK mashg‘ulotlari va intizom
              hisobini faollashtiradi.
            </p>

            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>⏰ <strong>Reja:</strong> {wakeTime} dan {sleepTime} gacha</div>
              <div>📖 <strong>TOPIK II:</strong> {topikLevel}-daraja maqsadi ({dailyStudyMinutes} min / {dailyVocabTarget} so‘z)</div>
              <div>💰 <strong>Oylik limit:</strong> {monthlyBudget.toLocaleString()} UZS</div>
              <div>🎯 <strong>Odatlar soni:</strong> {selectedHabits.length} ta faol odat</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="checkbox"
                id="notifications"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
              />
              <label htmlFor="notifications" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                Eslatmalar va kunlik tahlillarni qabul qilish
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} /> Ortga
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button onClick={() => setStep(step + 1)} className="btn btn-primary">
              Keyingi <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="btn btn-success btn-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Tayyorlanmoqda...' : 'Tizimni Boshlash'} <Sparkles size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
