'use client';

import React, { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import {
  User as UserIcon,
  Clock,
  Bell,
  Globe,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  Shield,
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState('Asia/Tashkent');
  const [currency, setCurrency] = useState('UZS');
  const [locale, setLocale] = useState('uz-UZ');

  const [wakeTime, setWakeTime] = useState('06:30');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [studyStartTime, setStudyStartTime] = useState('19:30');
  const [studyEndTime, setStudyEndTime] = useState('21:30');

  const [taskReminders, setTaskReminders] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [habitReminders, setHabitReminders] = useState(true);
  const [expenseReminders, setExpenseReminders] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (res.ok && data.user) {
        const u = data.user;
        setUser(u);
        setName(u.name || '');
        if (u.settings) {
          setTimezone(u.settings.timezone || 'Asia/Tashkent');
          setCurrency(u.settings.currency || 'UZS');
          setLocale(u.settings.locale || 'uz-UZ');
          setTaskReminders(u.settings.taskReminders ?? true);
          setStudyReminders(u.settings.studyReminders ?? true);
          setHabitReminders(u.settings.habitReminders ?? true);
          setExpenseReminders(u.settings.expenseReminders ?? true);
        }
        if (u.timeSchedule) {
          setWakeTime(u.timeSchedule.wakeTime || '06:30');
          setSleepTime(u.timeSchedule.sleepTime || '23:00');
          setWorkStartTime(u.timeSchedule.workStartTime || '09:00');
          setWorkEndTime(u.timeSchedule.workEndTime || '18:00');
          setStudyStartTime(u.timeSchedule.studyStartTime || '19:30');
          setStudyEndTime(u.timeSchedule.studyEndTime || '21:30');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          password: password || undefined,
          settings: {
            timezone,
            currency,
            locale,
            taskReminders,
            studyReminders,
            habitReminders,
            expenseReminders,
          },
          timeSchedule: {
            wakeTime,
            sleepTime,
            workStartTime,
            workEndTime,
            studyStartTime,
            studyEndTime,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Sozlamalar muvaffaqiyatli saqlandi!');
        setPassword('');
        fetchProfile();
      } else {
        setErrorMessage(data.error || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '840px', margin: '0 auto' }}>
        {/* Header */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <UserIcon size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Profil & Tizim Sozlamalari</h1>
              <p style={{ fontSize: '0.85rem' }}>Shaxsiy ma’lumotlar, vaqt hududi va eslatmalar konfiguratsiyasi</p>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="animate-fade-in" style={{ padding: '0.85rem 1.25rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-md)', color: 'var(--accent-success)', fontWeight: 600 }}>
            ✓ {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="animate-fade-in" style={{ padding: '0.85rem 1.25rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-danger)', borderRadius: 'var(--radius-md)', color: '#f87171' }}>
            ✕ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Personal Info */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Asosiy Ma’lumotlar</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">To‘liq Ismingiz</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Manzili (O‘zgarmas)</label>
                <input
                  type="email"
                  className="input"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Yangi Parol (Agar o‘zgartirmoqchi bo‘lsangiz)</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
              />
            </div>
          </div>

          {/* Time & Schedule */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Clock size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.15rem' }}>Kun Tartibi va Tiklanish Soatlari</h3>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Uyg‘onish Vaqti</label>
                <input
                  type="time"
                  className="input"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Uyquga Yotish Vaqti</label>
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
                <label className="form-label">Asosiy Ish Boshlanishi</label>
                <input
                  type="time"
                  className="input"
                  value={workStartTime}
                  onChange={(e) => setWorkStartTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Asosiy Ish Tugashi</label>
                <input
                  type="time"
                  className="input"
                  value={workEndTime}
                  onChange={(e) => setWorkEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">TOPIK Dars Boshlanishi</label>
                <input
                  type="time"
                  className="input"
                  value={studyStartTime}
                  onChange={(e) => setStudyStartTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">TOPIK Dars Tugashi</label>
                <input
                  type="time"
                  className="input"
                  value={studyEndTime}
                  onChange={(e) => setStudyEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Regional & Currency */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Globe size={18} color="var(--accent-topik)" />
              <h3 style={{ fontSize: '1.15rem' }}>Hudud va Valyuta</h3>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Vaqt Hududi (Timezone)</label>
                <select className="select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
                  <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Valyuta</label>
                <select className="select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="UZS">UZS (So‘m)</option>
                  <option value="USD">USD ($)</option>
                  <option value="KRW">KRW (₩)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Interfeys Tili</label>
                <select className="select" value={locale} onChange={(e) => setLocale(e.target.value)}>
                  <option value="uz-UZ">O‘zbekcha</option>
                  <option value="ko-KR">한국어</option>
                  <option value="en-US">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Bell size={18} color="var(--accent-warning)" />
              <h3 style={{ fontSize: '1.15rem' }}>Bildirishnoma va Eslatmalar</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={taskReminders}
                  onChange={(e) => setTaskReminders(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
                <span style={{ fontSize: '0.9rem' }}>Vazifalar boshlanishidan oldin eslatish</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={studyReminders}
                  onChange={(e) => setStudyReminders(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
                <span style={{ fontSize: '0.9rem' }}>TOPIK o‘rganish va dars vaqti eslatmasi</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={habitReminders}
                  onChange={(e) => setHabitReminders(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
                <span style={{ fontSize: '0.9rem' }}>Kundalik odatlarni bajarish eslatmalari</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={expenseReminders}
                  onChange={(e) => setExpenseReminders(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
                <span style={{ fontSize: '0.9rem' }}>Kechki xarajatlarni qayd etish eslatmasi</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              <Save size={18} /> {saving ? 'Saqlanmoqda...' : 'Barcha O‘zgarishlarni Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
