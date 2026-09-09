'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Upload,
  Trash2,
  Sparkles,
  FileText,
  Mail,
  Smile,
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: '1', emoji: '👨‍💻', label: 'Dasturchi', c1: '#6366f1', c2: '#a855f7' },
  { id: '2', emoji: '🚀', label: 'Kosmonavt', c1: '#3b82f6', c2: '#06b6d4' },
  { id: '3', emoji: '🎯', label: 'Maqsadli', c1: '#ef4444', c2: '#f97316' },
  { id: '4', emoji: '⚡', label: 'Super', c1: '#eab308', c2: '#f59e0b' },
  { id: '5', emoji: '🎓', label: 'Talaba', c1: '#10b981', c2: '#059669' },
  { id: '6', emoji: '🌟', label: 'Yulduz', c1: '#ec4899', c2: '#8b5cf6' },
  { id: '7', emoji: '🦁', label: 'Lider', c1: '#f59e0b', c2: '#ef4444' },
  { id: '8', emoji: '🥋', label: 'Intizom', c1: '#8b5cf6', c2: '#3b82f6' },
];

export default function ProfilePage() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  // Settings
  const [timezone, setTimezone] = useState('Asia/Tashkent');
  const [currency, setCurrency] = useState('UZS');
  const [locale, setLocale] = useState('uz-UZ');

  // Time Schedule
  const [wakeTime, setWakeTime] = useState('06:30');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [studyStartTime, setStudyStartTime] = useState('19:30');
  const [studyEndTime, setStudyEndTime] = useState('21:30');

  // Reminders
  const [taskReminders, setTaskReminders] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [habitReminders, setHabitReminders] = useState(true);
  const [expenseReminders, setExpenseReminders] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (res.ok && data.user) {
        const u = data.user;
        setUser(u);
        setName(u.name || '');
        setBio(u.bio || '');
        setAvatar(u.avatar || null);

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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Faqat rasm fayllari (JPEG, PNG, WebP) qabul qilinadi');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Rasm hajmi 5MB dan oshmasligi kerak');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 256;
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > MAX_DIM) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          }
        } else {
          if (h > MAX_DIM) {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressedData = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressedData);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input so user can choose the same file again if desired
    e.target.value = '';
  };

  const handleSelectPresetAvatar = (preset: typeof PRESET_AVATARS[0]) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${preset.c1}" />
          <stop offset="100%" stop-color="${preset.c2}" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="64" fill="url(#grad)" />
      <text x="50%" y="54%" font-size="64" text-anchor="middle" dominant-baseline="middle">${preset.emoji}</text>
    </svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setAvatar(dataUrl);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
  };

  const getInitials = (nameStr?: string) => {
    if (!nameStr) return 'OS';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return nameStr.slice(0, 2).toUpperCase();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Ism maydonini to‘ldirish shart');
      return;
    }

    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          avatar,
          bio: bio.trim(),
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
        setSuccessMessage('Profil va barcha sozlamalar muvaffaqiyatli saqlandi!');
        setPassword('');
        // Trigger global update across Shell sidebar and header
        window.dispatchEvent(new Event('lifeos_profile_updated'));
        fetchProfile();
      } else {
        setErrorMessage(data.error || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server bilan bog‘lanishda xatolik');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '860px', margin: '0 auto' }}>
        {/* Page Header */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                }}
              >
                <UserIcon size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Profil va Sozlamalar</h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Ismingiz, rasmingiz, kun tartibingiz va tizim konfiguratsiyasini to‘liq boshqaring
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={18} /> {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>

        {/* Feedback messages */}
        {successMessage && (
          <div
            className="animate-fade-in"
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--accent-success)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-success)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            className="animate-fade-in"
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--accent-danger)',
              borderRadius: 'var(--radius-md)',
              color: '#f87171',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card 1: Avatar and Identity */}
          <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--accent-primary)" /> Shaxsiy Profil va Rasm
            </h3>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageFileChange}
            />

            <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Avatar Preview & Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '108px',
                    height: '108px',
                    borderRadius: '50%',
                    padding: '3px',
                    background: 'linear-gradient(135deg, var(--accent-primary), #a855f7)',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                    cursor: 'pointer',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  title="Rasmni almashtirish uchun bosing"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name || 'Avatar'}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        backgroundColor: 'var(--bg-secondary)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '2rem',
                      }}
                    >
                      {getInitials(name)}
                    </div>
                  )}

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--bg-primary)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Camera size={16} />
                  </div>
                </div>

                {/* Upload & Delete Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Upload size={14} /> Rasm yuklash
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      title="Rasmni o‘chirish"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: 'var(--accent-danger)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0 0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Name, Email & Bio Inputs */}
              <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      To‘liq Ismingiz <span style={{ color: 'var(--accent-danger)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masalan: Azizbek Narzullayev"
                      required
                      style={{ fontSize: '0.95rem', fontWeight: 600 }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email Manzili (Login)</label>
                    <input
                      type="email"
                      className="input"
                      value={user?.email || ''}
                      disabled
                      style={{ opacity: 0.65, cursor: 'not-allowed', backgroundColor: 'rgba(255,255,255,0.03)' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Shaxsiy Shior yoki Maqsad (Bio)
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Masalan: TOPIK II 6-daraja va Senior AI Muhandisi"
                  />
                </div>
              </div>
            </div>

            {/* Preset Avatars Selection */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Smile size={15} /> Tayyor Dizayndagi Avatarlar (Bir marta bosish orqali tanlang):
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(preset)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-full, 9999px)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ fontSize: '1.15rem' }}>{preset.emoji}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Security / Change Password */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Lock size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Xavfsizlik va Parol</h3>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Yangi Parol (Agar o‘zgartirmoqchi bo‘lsangiz kiritiladi)</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi (o‘zgartirmaslik uchun bo‘sh qoldiring)"
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Card 3: Time & Schedule */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Clock size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Kun Tartibi va Tiklanish Soatlari</h3>
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

          {/* Card 4: Regional & Currency */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Globe size={18} color="var(--accent-topik)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Hudud va Valyuta</h3>
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

          {/* Card 5: Notifications */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Bell size={18} color="var(--accent-warning)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Bildirishnoma va Eslatmalar</h3>
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

          {/* Bottom Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              <Save size={18} /> {saving ? 'Saqlanmoqda...' : 'Barcha O‘zgarishlarni Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
