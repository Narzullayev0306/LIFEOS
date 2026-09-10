'use client';

import React, { useEffect, useState } from 'react';
import Shell from '@/components/layout/Shell';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Wallet,
  Target,
  ArrowRight,
  Info,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react';
import { parseDashboardWidgets, WidgetConfig } from '@/lib/dashboardWidgets';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(1500); // 25 min default pomodoro
  const [showDisciplineExplainer, setShowDisciplineExplainer] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Ma’lumot yuklanmadi');
      const d = await res.json();
      setData(d);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const toggleHabit = async (habitId: string) => {
    try {
      await fetch('/api/habits/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId }),
      });
      fetchDashboard();
    } catch {
      // ignore
    }
  };

  const completeCurrentTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      fetchDashboard();
    } catch {
      // ignore
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Shell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="pulse-glow" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
            <p>LIFEOS yuklanmoqda...</p>
          </div>
        </div>
      </Shell>
    );
  }

  if (error || !data) {
    return (
      <Shell>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--accent-danger)' }}>
          <AlertCircle size={36} color="var(--accent-danger)" style={{ margin: '0 auto 1rem' }} />
          <h3>Tizim ma’lumotlarini yuklashda xatolik</h3>
          <p style={{ margin: '0.5rem 0 1.5rem' }}>{error || 'Qayta urinib ko‘ring'}</p>
          <button onClick={fetchDashboard} className="btn btn-primary">
            Qayta yuklash
          </button>
        </div>
      </Shell>
    );
  }

  const {
    userName,
    dayProgressPercent,
    currentTask,
    nextTask,
    topik,
    discipline,
    habits,
    finance,
    goals,
    dashboardWidgetsJson,
  } = data;

  const configuredWidgets = parseDashboardWidgets(dashboardWidgetsJson);
  const activeWidgets = configuredWidgets.filter((w) => w.enabled);

  // Widget Render Functions
  const renderTasksWidget = () => (
    <div key="tasks" className="grid-2">
      {/* Current Task Focus Card */}
      <div className="glass-card interactive">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem' }}>Hozirgi Vazifa</h3>
          </div>
          <span className="badge badge-indigo">
            {currentTask ? 'FAOL' : 'BO‘SH'}
          </span>
        </div>

        {currentTask ? (
          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {currentTask.title}
            </h4>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              <span>🕒 {currentTask.startTime || '--:--'} – {currentTask.endTime || '--:--'}</span>
              <span>⚡ Muhimlik: {currentTask.priority}</span>
            </div>

            {/* Focus Timer */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fokus Taymeri (Pomodoro)</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                  {formatTimer(timerSeconds)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  className={`btn ${timerActive ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                >
                  {timerActive ? 'To‘xtatish' : 'Boshlash'}
                </button>
                <button
                  onClick={() => setTimerSeconds(1500)}
                  className="btn btn-secondary btn-sm"
                >
                  Qayta
                </button>
              </div>
            </div>

            <button
              onClick={() => completeCurrentTask(currentTask.id)}
              className="btn btn-success"
              style={{ width: '100%' }}
            >
              <CheckCircle2 size={16} /> Vazifani Bajarildi Deb Belgilash
            </button>
          </div>
        ) : (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Hozirda rejalashtirilgan vazifa yo‘q.</p>
            <Link href="/planner" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
              Kunlik rejaga o‘tish
            </Link>
          </div>
        )}
      </div>

      {/* Next Task & Quick Overview */}
      <div className="glass-card interactive">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--accent-warning)" />
            <h3 style={{ fontSize: '1.1rem' }}>Keyingi Vazifa</h3>
          </div>
          <Link href="/planner" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            To‘liq Jadval →
          </Link>
        </div>

        {nextTask ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 40px)', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {nextTask.title}
              </h4>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <span>🕒 {nextTask.startTime || '--:--'} – {nextTask.endTime || '--:--'}</span>
                <span>Kategoriya: {nextTask.category}</span>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bugungi jami vazifalar:</span>
              <strong style={{ fontSize: '0.95rem' }}>
                {data.tasksCount.completed} / {data.tasksCount.total} bajarildi
              </strong>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Navbatda keyingi vazifa qolmadi. Kun muvaffaqiyatli yakunlanmoqda!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTopikWidget = () => (
    <div
      key="topik"
      className="glass-card interactive"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <BookOpen size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-topik)', fontWeight: 600, textTransform: 'uppercase' }}>
              TOPIK II Tayyorgarlik Markazi
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              Maqsad: {topik.targetLevel}-Daraja ({topik.targetScore} ball)
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {topik.daysToExam !== null && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-topik)', lineHeight: 1 }}>
                {topik.daysToExam}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kun qoldi</div>
            </div>
          )}
          <Link href="/topik" className="btn btn-primary">
            O‘rganishni Boshlash <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
            <span>Bugungi lug‘at takrori (SM-2)</span>
            <strong>{topik.vocabReviewedToday} / {topik.dailyVocabTarget} so‘z</strong>
          </div>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{
                width: `${Math.min(100, (topik.vocabReviewedToday / (topik.dailyVocabTarget || 1)) * 100)}%`,
                background: 'linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%)',
              }}
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
            <span>Bugungi dars vaqti</span>
            <strong>{topik.studyMinutesToday} / {topik.dailyStudyTarget} daqiqa</strong>
          </div>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{
                width: `${Math.min(100, (topik.studyMinutesToday / (topik.dailyStudyTarget || 1)) * 100)}%`,
                background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinanceWidget = () => (
    <div key="finance" className="glass-card interactive">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wallet size={18} color="var(--accent-success)" />
          <h3 style={{ fontSize: '1.1rem' }}>Moliyaviy Nazorat</h3>
        </div>
        <Link href="/finance" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
          Xarajat kiritish →
        </Link>
      </div>

      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        <div className="metric-box">
          <span className="metric-label">Bugungi xarajat</span>
          <span className="metric-value" style={{ fontSize: '1.4rem' }}>
            {finance.todayExpensesTotal.toLocaleString()} <span style={{ fontSize: '0.9rem' }}>UZS</span>
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Kunlik dinamik limit</span>
          <span
            className="metric-value"
            style={{
              fontSize: '1.4rem',
              color: finance.isOverBudget ? 'var(--accent-danger)' : 'var(--accent-success)',
            }}
          >
            {finance.dynamicDailyLimit.toLocaleString()} <span style={{ fontSize: '0.9rem' }}>UZS</span>
          </span>
        </div>
      </div>

      <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Oylik qolgan byudjet:</span>
          <strong>{finance.remainingBudget.toLocaleString()} UZS</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Oydan qolgan kunlar:</span>
          <strong>{finance.daysRemainingInMonth} kun</strong>
        </div>
      </div>
    </div>
  );

  const renderHabitsWidget = () => (
    <div key="habits" className="glass-card interactive">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.1rem' }}>Kunlik Odatlar</h3>
        </div>
        <span className="badge badge-emerald">
          {habits.completed} / {habits.total} bajarildi
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {habits.items.map((habit: any) => (
          <div
            key={habit.id}
            onClick={() => toggleHabit(habit.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: habit.completedToday ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)',
              border: `1px solid ${habit.completedToday ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: `2px solid ${habit.completedToday ? 'var(--accent-success)' : 'var(--border-medium)'}`,
                  backgroundColor: habit.completedToday ? 'var(--accent-success)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.65rem',
                }}
              >
                {habit.completedToday ? '✓' : ''}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{habit.name}</span>
            </div>

            <span style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              🔥 {habit.currentStreak} kun
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGoalsWidget = () => (
    <div key="goals" className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.1rem' }}>Asosiy Maqsadlar</h3>
        </div>
        <Link href="/goals" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
          Barchasini ko‘rish →
        </Link>
      </div>

      <div className="grid-3">
        {goals.map((goal: any) => (
          <div
            key={goal.id}
            style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
              {goal.priority} MUHIMLIK
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>{goal.title}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>Bosqichlar: {goal.milestonesCompleted}/{goal.milestonesTotal}</span>
              <span>{goal.progress}%</span>
            </div>
            <div className="progress-container" style={{ height: '5px' }}>
              <div className="progress-bar" style={{ width: `${goal.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Shell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Top Welcoming Banner & Day Progress */}
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Harakatdagi hayot
                </span>
                <Link
                  href="/profile?tab=dashboard"
                  title="Dashboard vidjetlarini shaxsiylashtirish"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-tertiary)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    textDecoration: 'none',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <SlidersHorizontal size={12} />
                  <span>Moslash</span>
                </Link>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Xush kelibsiz, {userName}! 👋
              </h1>
              <p style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>
                Bugungi kun intizomi: <strong style={{ color: 'var(--text-primary)' }}>{discipline.totalScore}/100 ball</strong>. Reja asosida harakatlaning.
              </p>
            </div>

            {/* Discipline Score Badge with Popover */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowDisciplineExplainer(!showDisciplineExplainer)}
                className="interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background:
                      discipline.totalScore >= 80
                        ? 'var(--accent-success-light)'
                        : discipline.totalScore >= 50
                        ? 'var(--accent-warning-light)'
                        : 'var(--accent-danger-light)',
                    color:
                      discipline.totalScore >= 80
                        ? 'var(--accent-success)'
                        : discipline.totalScore >= 50
                        ? 'var(--accent-warning)'
                        : 'var(--accent-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                  }}
                >
                  {discipline.totalScore}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Intizom ko‘rsatkichi</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Tahlilni ko‘rish <Info size={14} />
                  </div>
                </div>
              </div>

              {showDisciplineExplainer && (
                <div
                  className="glass-card animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '60px',
                    right: 0,
                    width: '320px',
                    zIndex: 50,
                    padding: '1.25rem',
                  }}
                >
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Intizom Balli Tahlili</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {discipline.explanation}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Rejalashtirilgan vazifalar:</span>
                      <strong>{discipline.tasksScore} / 35 ball</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Kunlik odatlar:</span>
                      <strong>{discipline.habitsScore} / 30 ball</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>TOPIK tayyorgarligi:</span>
                      <strong>{discipline.studyScore} / 25 ball</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Moliyaviy me’yor:</span>
                      <strong>{discipline.financeScore} / 10 ball</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Day Progress Indicator */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Kunlik vaqt oqimi</span>
              <span style={{ fontWeight: 600 }}>{dayProgressPercent}% o‘tdi</span>
            </div>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${dayProgressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Dynamically Rendered & Ordered Dashboard Widgets */}
        {activeWidgets.map((widget) => {
          switch (widget.id) {
            case 'tasks':
              return renderTasksWidget();
            case 'topik':
              return renderTopikWidget();
            case 'finance':
              return (
                <div key="finance_and_habits_pair" className="grid-2">
                  {renderFinanceWidget()}
                  {renderHabitsWidget()}
                </div>
              );
            case 'habits':
              // If finance was already rendered in the pair, skip duplicate
              if (activeWidgets.some((w) => w.id === 'finance')) {
                return null;
              }
              return renderHabitsWidget();
            case 'goals':
              return goals && goals.length > 0 ? renderGoalsWidget() : null;
            default:
              return null;
          }
        })}
      </div>
    </Shell>
  );
}
