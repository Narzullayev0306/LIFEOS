'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Shell from '@/components/layout/Shell';
import {
  User as UserIcon,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Shield,
  Palette,
  LayoutDashboard,
  Eye,
  Clock,
  Key,
  Download,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Copy,
  Check,
  Moon,
  Sun,
  Monitor,
  X,
  Flame,
  BookOpen,
  Wallet,
  CheckSquare,
  SlidersHorizontal,
} from 'lucide-react';
import { validateUsername } from '@/lib/usernameValidator';
import { calculateProfileCompletion, ProfileCompletionResult } from '@/lib/profileCompletion';
import { DEFAULT_DASHBOARD_WIDGETS, WidgetConfig, parseDashboardWidgets } from '@/lib/dashboardWidgets';

const COVER_PRESETS = [
  { id: 'midnight', label: 'Midnight', className: 'cover-preset-midnight', previewColor: '#1e1b4b' },
  { id: 'aurora', label: 'Aurora', className: 'cover-preset-aurora', previewColor: '#064e3b' },
  { id: 'minimal', label: 'Minimal', className: 'cover-preset-minimal', previewColor: '#1e293b' },
  { id: 'abstract', label: 'Abstract', className: 'cover-preset-abstract', previewColor: '#701a75' },
  { id: 'productivity', label: 'Productivity', className: 'cover-preset-productivity', previewColor: '#1e3a8a' },
  { id: 'study', label: 'Study', className: 'cover-preset-study', previewColor: '#4c1d95' },
  { id: 'calm', label: 'Calm', className: 'cover-preset-calm', previewColor: '#134e4a' },
];

const ACCENT_COLORS = [
  { id: 'indigo', label: 'Indigo', hex: '#6366f1' },
  { id: 'violet', label: 'Violet', hex: '#8b5cf6' },
  { id: 'emerald', label: 'Emerald', hex: '#10b981' },
  { id: 'amber', label: 'Amber', hex: '#f59e0b' },
  { id: 'rose', label: 'Rose', hex: '#f43f5e' },
  { id: 'cyan', label: 'Cyan', hex: '#06b6d4' },
];

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

type TabType = 'overview' | 'profile' | 'appearance' | 'privacy' | 'dashboard' | 'schedule' | 'security';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Raw user state from DB
  const [user, setUser] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);

  // Profile fields
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverPreset, setCoverPreset] = useState('midnight');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [location, setLocation] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');

  // Appearance
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [accentColor, setAccentColor] = useState('indigo');
  const [uiDensity, setUiDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Privacy toggles
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showBirthday: false,
    showOccupation: true,
    showEducation: true,
    showStatistics: true,
    showGoals: true,
    showTopik: true,
    showDiscipline: true,
    showActivity: true,
  });

  // Dashboard widgets configuration
  const [dashboardWidgets, setDashboardWidgets] = useState<WidgetConfig[]>(DEFAULT_DASHBOARD_WIDGETS);

  // Schedule & Timezone
  const [timezone, setTimezone] = useState('Asia/Tashkent');
  const [currency, setCurrency] = useState('UZS');
  const [locale, setLocale] = useState('uz-UZ');
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

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Modals
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Track initial load from URL query params (e.g. ?tab=dashboard)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as TabType | null;
      if (tabParam && ['overview', 'profile', 'appearance', 'privacy', 'dashboard', 'schedule', 'security'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [resProfile, resStats] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/profile/statistics'),
      ]);

      if (resProfile.ok) {
        const data = await resProfile.json();
        const u = data.user;
        setUser(u);
        setName(u.name || '');
        setDisplayName(u.displayName || '');
        setUsername(u.username || '');
        setBio(u.bio || '');
        setAvatar(u.avatar || null);
        setCoverImage(u.coverImage || null);
        setCoverPreset(u.coverPreset || 'midnight');
        setOccupation(u.occupation || '');
        setEducation(u.education || '');
        setLocation(u.location || '');
        setBirthday(u.birthday || '');
        setPhone(u.phone || '');

        if (u.privacy) {
          setPrivacy({
            showEmail: u.privacy.showEmail ?? false,
            showPhone: u.privacy.showPhone ?? false,
            showLocation: u.privacy.showLocation ?? true,
            showBirthday: u.privacy.showBirthday ?? false,
            showOccupation: u.privacy.showOccupation ?? true,
            showEducation: u.privacy.showEducation ?? true,
            showStatistics: u.privacy.showStatistics ?? true,
            showGoals: u.privacy.showGoals ?? true,
            showTopik: u.privacy.showTopik ?? true,
            showDiscipline: u.privacy.showDiscipline ?? true,
            showActivity: u.privacy.showActivity ?? true,
          });
        }

        if (u.settings) {
          setTheme((u.settings.theme as any) || 'dark');
          setAccentColor(u.settings.accentColor || 'indigo');
          setUiDensity((u.settings.uiDensity as any) || 'comfortable');
          setReducedMotion(Boolean(u.settings.reducedMotion));
          setTimezone(u.settings.timezone || 'Asia/Tashkent');
          setCurrency(u.settings.currency || 'UZS');
          setLocale(u.settings.locale || 'uz-UZ');
          setTaskReminders(u.settings.taskReminders ?? true);
          setStudyReminders(u.settings.studyReminders ?? true);
          setHabitReminders(u.settings.habitReminders ?? true);
          setExpenseReminders(u.settings.expenseReminders ?? true);

          setDashboardWidgets(parseDashboardWidgets(u.settings.dashboardWidgetsJson));
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

      if (resStats.ok) {
        const statsData = await resStats.json();
        setStatistics(statsData);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Profil ma’lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
      setHasUnsavedChanges(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Compute profile completion dynamically
  const completion: ProfileCompletionResult = useMemo(() => {
    return calculateProfileCompletion({
      name,
      displayName,
      username,
      avatar,
      bio,
      occupation,
      education,
      location,
      birthday,
      hasTopikGoal: Boolean(user?.topikGoal),
    });
  }, [name, displayName, username, avatar, bio, occupation, education, location, birthday, user]);

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setHasUnsavedChanges(true);
    if (!val.trim()) {
      setUsernameError(null);
      return;
    }
    const check = validateUsername(val);
    if (!check.isValid) {
      setUsernameError(check.error || 'Noto‘g‘ri username');
    } else {
      setUsernameError(null);
    }
  };

  // Avatar upload handler
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Faqat rasm fayllari (JPEG, PNG, WebP) qabul qilinadi');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Avatar hajmi 5MB dan oshmasligi kerak');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatar');

    try {
      const res = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setAvatar(data.url);
        setSuccessMessage('Avatar yangilandi!');
        window.dispatchEvent(new Event('lifeos_profile_updated'));
      } else {
        setErrorMessage(data.error || 'Rasm yuklashda xatolik');
      }
    } catch {
      setErrorMessage('Rasm yuklashda xatolik yuz berdi');
    }
    e.target.value = '';
  };

  // Cover upload handler
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Faqat rasm fayllari qabul qilinadi');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Muqova hajmi 8MB dan oshmasligi kerak');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'cover');

    try {
      const res = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
        setSuccessMessage('Muqova rasmi yuklandi!');
      } else {
        setErrorMessage(data.error || 'Muqova yuklashda xatolik');
      }
    } catch {
      setErrorMessage('Muqova yuklashda server xatoligi');
    }
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
    setHasUnsavedChanges(true);
    setShowAvatarModal(false);
  };

  const handleCopyProfileLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = username ? `${origin}/api/profile/${username}` : `${origin}/profile`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= dashboardWidgets.length) return;

    const list = [...dashboardWidgets];
    const temp = list[index];
    list[index] = list[newIdx];
    list[newIdx] = temp;

    // update order numbers
    const updated = list.map((w, idx) => ({ ...w, order: idx }));
    setDashboardWidgets(updated);
    setHasUnsavedChanges(true);
  };

  const toggleWidget = (id: string) => {
    const updated = dashboardWidgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w));
    setDashboardWidgets(updated);
    setHasUnsavedChanges(true);
  };

  const getInitials = (nameStr?: string) => {
    if (!nameStr) return 'OS';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return nameStr.slice(0, 2).toUpperCase();
  };

  // Main Save
  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMessage('Ism maydonini to‘ldirish shart');
      setActiveTab('profile');
      return;
    }

    if (username && username.trim()) {
      const check = validateUsername(username);
      if (!check.isValid) {
        setErrorMessage(check.error || 'Username noto‘g‘ri');
        setActiveTab('profile');
        return;
      }
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMessage('Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak');
        setActiveTab('security');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Parollar bir-biriga mos kelmadi');
        setActiveTab('security');
        return;
      }
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
          displayName: displayName.trim() || null,
          username: username.trim() || null,
          avatar,
          coverImage,
          coverPreset,
          bio: bio.trim() || null,
          occupation: occupation.trim() || null,
          education: education.trim() || null,
          location: location.trim() || null,
          birthday: birthday.trim() || null,
          phone: phone.trim() || null,
          password: newPassword || undefined,
          currentPassword: currentPassword || undefined,
          privacy,
          settings: {
            theme,
            accentColor,
            uiDensity,
            reducedMotion,
            timezone,
            currency,
            locale,
            dashboardWidgetsJson: JSON.stringify(dashboardWidgets),
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
        setSuccessMessage('Profil va barcha shaxsiy sozlamalar muvaffaqiyatli saqlandi!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setHasUnsavedChanges(false);

        // Notify Shell for header/sidebar updates
        window.dispatchEvent(new Event('lifeos_profile_updated'));

        // Apply theme/accent/density locally immediately
        const effTheme = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
        document.documentElement.setAttribute('data-theme', effTheme);
        document.documentElement.setAttribute('data-accent', accentColor);
        document.documentElement.setAttribute('data-density', uiDensity);
        document.documentElement.setAttribute('data-reduced-motion', reducedMotion ? 'true' : 'false');
      } else {
        setErrorMessage(data.error || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server bilan aloqada xatolik');
    } finally {
      setSaving(false);
    }
  };

  // Account Deletion
  const handleDeleteAccount = async () => {
    if (!deleteConfirmPassword) {
      setErrorMessage('Hisobni o‘chirish uchun parolingizni kiriting');
      return;
    }
    if (deleteConfirmationText !== 'DELETE') {
      setErrorMessage('Iltimos tasdiqlash uchun "DELETE" so‘zini kiriting');
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch('/api/profile/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: deleteConfirmPassword,
          confirmationText: deleteConfirmationText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        window.location.href = '/login';
      } else {
        setErrorMessage(data.error || 'Hisobni o‘chirishda xatolik');
      }
    } catch {
      setErrorMessage('Server xatosi');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="pulse-glow" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
            <p>Profil ma’lumotlari yuklanmoqda...</p>
          </div>
        </div>
      </Shell>
    );
  }

  // Determine cover class or style
  const activeCoverPreset = COVER_PRESETS.find((p) => p.id === coverPreset) || COVER_PRESETS[0];

  return (
    <Shell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        {/* Hidden inputs for uploading images */}
        <input type="file" ref={avatarInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarFileChange} />
        <input type="file" ref={coverInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleCoverFileChange} />

        {/* FEEDBACK BANNERS */}
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
              justifyContent: 'space-between',
              gap: '0.6rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={20} />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
              <X size={16} />
            </button>
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
              justifyContent: 'space-between',
              gap: '0.6rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertCircle size={20} />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PROFILE HERO CARD */}
        {/* ========================================================================= */}
        <div
          className="glass-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid var(--border-medium)',
          }}
        >
          {/* Cover Area */}
          <div
            className={coverImage ? '' : activeCoverPreset.className}
            style={{
              height: '180px',
              width: '100%',
              position: 'relative',
              backgroundImage: coverImage ? `url(${coverImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Scrim layer for readability */}
            <div
              className="cover-scrim"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  title="Muqovani almashtirish"
                >
                  <Camera size={14} /> Muqova yuklash
                </button>
                {coverImage && (
                  <button
                    onClick={() => {
                      setCoverImage(null);
                      setHasUnsavedChanges(true);
                    }}
                    className="btn btn-sm"
                    style={{
                      background: 'rgba(239, 68, 68, 0.65)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                    title="Muqovani olib tashlash"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Hero Content Area */}
          <div
            style={{
              padding: '1.25rem 1.75rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: '-54px',
            }}
          >
            {/* Top row: Avatar + Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
              {/* Avatar with edit overlay */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '108px',
                    height: '108px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '4px solid var(--bg-card)',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, var(--accent-primary) 0%, #3b82f6 100%)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '2rem',
                      }}
                    >
                      {getInitials(displayName || name)}
                    </div>
                  )}
                </div>

                {/* Avatar Action Trigger */}
                <button
                  onClick={() => setShowAvatarModal(true)}
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#fff',
                    border: '2px solid var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                  title="Avatarni o‘zgartirish"
                >
                  <Camera size={16} />
                </button>
              </div>

              {/* Quick Profile Actions */}
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCopyProfileLink}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {copiedLink ? <Check size={16} color="var(--accent-success)" /> : <Copy size={16} />}
                  <span>{copiedLink ? 'Nusxalandi!' : 'Havolani olish'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <UserIcon size={16} />
                  <span>Profilni tahrirlash</span>
                </button>

                <button
                  onClick={handleSave}
                  className="btn btn-primary btn-sm"
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Save size={16} />
                  <span>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                </button>
              </div>
            </div>

            {/* Name, Handle & Tags */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                  {displayName || name || 'LIFEOS Foydalanuvchisi'}
                </h1>
                {username && (
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--accent-primary)',
                      background: 'var(--accent-primary-light)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    @{username}
                  </span>
                )}
                {statistics?.discipline && (
                  <span className="badge badge-emerald" title="Bugungi intizom bali">
                    Intizom: {statistics.discipline.score}/100
                  </span>
                )}
                {statistics?.streak && (
                  <span className="badge badge-amber" title="Uzluksiz odatlar seriyasi">
                    🔥 {statistics.streak.current} kun streak
                  </span>
                )}
                {user?.topikGoal && (
                  <span className="badge badge-violet" title="TOPIK maqsadi">
                    🇰🇷 TOPIK {user.topikGoal.targetLevel}-Daraja
                  </span>
                )}
              </div>

              {bio && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '780px' }}>
                  {bio}
                </p>
              )}

              {/* Meta tags strip */}
              <div
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  marginTop: '0.85rem',
                  flexWrap: 'wrap',
                  fontSize: '0.825rem',
                  color: 'var(--text-muted)',
                }}
              >
                {occupation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Briefcase size={14} color="var(--accent-primary)" />
                    <span>{occupation}</span>
                  </div>
                )}
                {education && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <GraduationCap size={14} color="var(--accent-topik)" />
                    <span>{education}</span>
                  </div>
                )}
                {location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="var(--accent-danger)" />
                    <span>{location}</span>
                  </div>
                )}
                {user?.createdAt && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} />
                    <span>A’zo bo‘lgan: {new Date(user.createdAt).toLocaleDateString('uz-UZ', { month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PROFILE COMPLETION WIDGET */}
        {/* ========================================================================= */}
        <div
          className="glass-card"
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--accent-primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Profil to‘liqligi: {completion.score}%</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: completion.score >= 80 ? 'var(--accent-success-light)' : 'var(--accent-warning-light)',
                  color: completion.score >= 80 ? 'var(--accent-success)' : 'var(--accent-warning)',
                  fontWeight: 600,
                }}
              >
                {completion.level}
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {completion.completedCount} / {completion.totalItemsCount} qadam bajarildi
            </span>
          </div>

          <div className="progress-container" style={{ height: '8px', marginBottom: '0.75rem' }}>
            <div
              className="progress-bar"
              style={{
                width: `${completion.score}%`,
                background: completion.score >= 80 ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' : 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
              }}
            />
          </div>

          {/* Actionable suggestions checklist */}
          {completion.missingItems.length > 0 && (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {completion.missingItems.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.actionTab)}
                  className="interactive"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.785rem',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>+{item.points}%</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TABS NAVIGATION */}
        {/* ========================================================================= */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {[
            { id: 'overview', label: 'Umumiy Ko‘rinish', icon: LayoutDashboard },
            { id: 'profile', label: 'Shaxsiy Ma’lumotlar', icon: UserIcon },
            { id: 'appearance', label: 'Ko‘rinish & Muqova', icon: Palette },
            { id: 'privacy', label: 'Maxfiylik', icon: Eye },
            { id: 'dashboard', label: 'Dashboard Vidjetlari', icon: SlidersHorizontal },
            { id: 'schedule', label: 'Kun Tartibi & Eslatmalar', icon: Clock },
            { id: 'security', label: 'Xavfsizlik & Ma’lumotlar', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isActive ? 'var(--accent-primary)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Unsaved Changes Banner */}
        {hasUnsavedChanges && (
          <div
            className="animate-fade-in"
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid var(--accent-warning)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-warning)', fontSize: '0.875rem', fontWeight: 600 }}>
              <AlertTriangle size={18} />
              <span>Saqlanmagan o‘zgarishlar bor. Saqlashni unutmang.</span>
            </div>
            <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
              <Save size={14} /> {saving ? 'Saqlanmoqda...' : 'Hozir Saqlash'}
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & REAL STATISTICS */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
            {/* Real Stats Grid */}
            <div className="grid-4">
              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-warning)', marginBottom: '0.5rem' }}>
                  <Flame size={20} />
                  <span className="metric-label">Odatlar Streaki</span>
                </div>
                <div className="metric-value">{statistics?.streak?.current || 0} <span style={{ fontSize: '1rem' }}>kun</span></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Eng yaxshi natija: {statistics?.streak?.best || 0} kun
                </div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-success)', marginBottom: '0.5rem' }}>
                  <CheckSquare size={20} />
                  <span className="metric-label">Bajarilgan Vazifalar</span>
                </div>
                <div className="metric-value">{statistics?.tasks?.completed || 0} / {statistics?.tasks?.total || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Muvaffaqiyat ko‘rsatkichi: {statistics?.tasks?.completionRate || 0}%
                </div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-topik)', marginBottom: '0.5rem' }}>
                  <BookOpen size={20} />
                  <span className="metric-label">TOPIK Dars Soatlari</span>
                </div>
                <div className="metric-value">
                  {Math.round(((statistics?.topik?.totalStudyMinutes || 0) / 60) * 10) / 10} <span style={{ fontSize: '1rem' }}>soat</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {statistics?.topik?.totalVocabReviews || 0} ta lug‘at takrorlandi
                </div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                  <Wallet size={20} />
                  <span className="metric-label">Qolgan Byudjet</span>
                </div>
                <div className="metric-value" style={{ fontSize: '1.35rem' }}>
                  {(statistics?.finance?.remainingBudget || 0).toLocaleString()} <span style={{ fontSize: '0.8rem' }}>UZS</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: statistics?.finance?.isOverBudget ? 'var(--accent-danger)' : 'var(--accent-success)', marginTop: '0.25rem' }}>
                  {statistics?.finance?.isOverBudget ? 'Limit oshirilgan' : 'Byudjet me’yorida'}
                </div>
              </div>
            </div>

            {/* Discipline Breakdown & Recent Activity */}
            <div className="grid-2">
              {/* Discipline Breakdown Card */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Bugungi Intizom Tahlili</h3>
                  <span className="badge badge-emerald">
                    {statistics?.discipline?.score || 0} / 100 ball
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {statistics?.discipline?.breakdown?.explanation || 'Intizom balli har kuni reja, odatlar, o‘qish va byudjet asosida deterministik hisoblanadi.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>Rejalashtirilgan vazifalar</span>
                      <strong>{statistics?.discipline?.breakdown?.tasksScore || 0} / 35 ball</strong>
                    </div>
                    <div className="progress-container" style={{ height: '6px' }}>
                      <div className="progress-bar" style={{ width: `${((statistics?.discipline?.breakdown?.tasksScore || 0) / 35) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>Kunlik odatlar</span>
                      <strong>{statistics?.discipline?.breakdown?.habitsScore || 0} / 30 ball</strong>
                    </div>
                    <div className="progress-container" style={{ height: '6px' }}>
                      <div className="progress-bar" style={{ width: `${((statistics?.discipline?.breakdown?.habitsScore || 0) / 30) * 100}%`, background: 'var(--accent-success)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>TOPIK o‘rganish</span>
                      <strong>{statistics?.discipline?.breakdown?.studyScore || 0} / 25 ball</strong>
                    </div>
                    <div className="progress-container" style={{ height: '6px' }}>
                      <div className="progress-bar" style={{ width: `${((statistics?.discipline?.breakdown?.studyScore || 0) / 25) * 100}%`, background: 'var(--accent-topik)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>Moliyaviy limit</span>
                      <strong>{statistics?.discipline?.breakdown?.financeScore || 0} / 10 ball</strong>
                    </div>
                    <div className="progress-container" style={{ height: '6px' }}>
                      <div className="progress-bar" style={{ width: `${((statistics?.discipline?.breakdown?.financeScore || 0) / 10) * 100}%`, background: 'var(--accent-warning)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Real Activity Feed */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>So‘nggi Faoliyatlar</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real vaqt rejimi</span>
                </div>

                {statistics?.recentActivities && statistics.recentActivities.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {statistics.recentActivities.map((act: any) => (
                      <div
                        key={act.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor:
                                act.type === 'TASK' ? 'var(--accent-primary)' : act.type === 'STUDY' ? 'var(--accent-topik)' : 'var(--accent-success)',
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{act.title}</div>
                            {act.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{act.description}</div>}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(act.timestamp).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                    <p>Hozircha qayd etilgan faoliyat mavjud emas.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PERSONAL INFORMATION */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="glass-card animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserIcon size={20} color="var(--accent-primary)" /> Shaxsiy Ma’lumotlar
            </h3>

            <div className="grid-2" style={{ gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">To‘liq Ism va Familiya *</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Azizbek Narzullayev"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ko‘rsatiladigan Ism (Display Name)</label>
                <input
                  type="text"
                  className="input"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Azizbek (LIFEOS sizga shunday murojaat qiladi)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Foydalanuvchi Nomi (@username)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="azizbek (faqat harflar, raqamlar, tire)"
                    style={{ borderColor: usernameError ? 'var(--accent-danger)' : undefined }}
                  />
                </div>
                {usernameError && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', marginTop: '0.2rem' }}>
                    {usernameError}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Kasb yoki Mutaxassislik</label>
                <input
                  type="text"
                  className="input"
                  value={occupation}
                  onChange={(e) => {
                    setOccupation(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Dasturchi / Talaba / Tadbirkor"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ta’lim Muassasasi</label>
                <input
                  type="text"
                  className="input"
                  value={education}
                  onChange={(e) => {
                    setEducation(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Toshkent Axborot Texnologiyalari Universiteti"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Yashash Joyi</label>
                <input
                  type="text"
                  className="input"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Toshkent, O‘zbekiston"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tug‘ilgan Sana</label>
                <input
                  type="date"
                  className="input"
                  value={birthday}
                  onChange={(e) => {
                    setBirthday(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefon Raqam</label>
                <input
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="+998 90 123 45 67"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Bio / O‘zingiz haqingizda</label>
              <textarea
                className="textarea"
                rows={3}
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Shioringiz, qiziqishlaringiz yoki maqsadlaringiz haqida qisqacha..."
              />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Saqlanmoqda...' : 'O‘zgarishlarni Saqlash'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: APPEARANCE & COVER */}
        {/* ========================================================================= */}
        {activeTab === 'appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
            {/* Theme & Density Card */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Palette size={20} color="var(--accent-primary)" /> Tizim Ko‘rinishi & Mavzusi
              </h3>

              {/* Theme Mode */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.65rem' }}>Rejim (Theme Mode)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[
                    { id: 'dark', label: 'Dark Mode', icon: Moon },
                    { id: 'light', label: 'Light Mode', icon: Sun },
                    { id: 'system', label: 'Tizim Avto', icon: Monitor },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = theme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setTheme(item.id as any);
                          setHasUnsavedChanges(true);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '1rem',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'var(--accent-primary-light)' : 'var(--bg-secondary)',
                          border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        <Icon size={22} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.65rem' }}>Asosiy Rang (Accent Color)</label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {ACCENT_COLORS.map((col) => {
                    const isSelected = accentColor === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          setAccentColor(col.id);
                          setHasUnsavedChanges(true);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.6rem 1rem',
                          borderRadius: 'var(--radius-full)',
                          background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                          border: `2px solid ${isSelected ? col.hex : 'var(--border-subtle)'}`,
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.85rem',
                        }}
                      >
                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: col.hex }} />
                        <span>{col.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* UI Density & Reduced Motion */}
              <div className="grid-2" style={{ gap: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <label className="form-label">Interfeys Zichligi (UI Density)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setUiDensity('comfortable');
                        setHasUnsavedChanges(true);
                      }}
                      className={`btn btn-sm ${uiDensity === 'comfortable' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Qulay (Comfortable)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUiDensity('compact');
                        setHasUnsavedChanges(true);
                      }}
                      className={`btn btn-sm ${uiDensity === 'compact' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Kompakt (Compact)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">Animatsiyalarni kamaytirish</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="reducedMotion"
                      checked={reducedMotion}
                      onChange={(e) => {
                        setReducedMotion(e.target.checked);
                        setHasUnsavedChanges(true);
                      }}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                    <label htmlFor="reducedMotion" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                      Tezkor navigatsiya uchun animatsiyalarni o‘chirish
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Cover Presets Card */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Profil Muqovasi (Cover Background)</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    7 xil professional gradient presetlaridan birini tanlang yoki o‘z rasmingizni yuklang
                  </p>
                </div>
                <button onClick={() => coverInputRef.current?.click()} className="btn btn-primary btn-sm">
                  <Upload size={14} /> Maxsus rasm yuklash
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {COVER_PRESETS.map((p) => {
                  const isSelected = coverPreset === p.id && !coverImage;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setCoverPreset(p.id);
                        setCoverImage(null);
                        setHasUnsavedChanges(true);
                      }}
                      className="interactive"
                      style={{
                        height: '74px',
                        borderRadius: 'var(--radius-md)',
                        position: 'relative',
                        cursor: 'pointer',
                        border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                        overflow: 'hidden',
                        boxShadow: isSelected ? '0 0 12px var(--accent-primary)' : undefined,
                      }}
                    >
                      <div className={p.className} style={{ width: '100%', height: '100%' }} />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          left: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#fff',
                          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        }}
                      >
                        {p.label}
                      </div>
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            backgroundColor: 'var(--accent-primary)',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? 'Saqlanmoqda...' : 'Ko‘rinishni Saqlash'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PRIVACY SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === 'privacy' && (
          <div className="glass-card animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={20} color="var(--accent-primary)" /> Maxfiylik Sozlamalari (Privacy)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Profildan qaysi ma’lumotlar boshqalarga yoki umumiy havolangiz orqali ko‘rinishini boshqaring.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { key: 'showEmail', label: 'Elektron pochtani ko‘rsatish', desc: 'Email manzilingiz profilda ochiq ko‘rinadi' },
                { key: 'showPhone', label: 'Telefon raqamni ko‘rsatish', desc: 'Telefon raqamingiz profilda aks etadi' },
                { key: 'showLocation', label: 'Yashash joyini ko‘rsatish', desc: 'Shahar va mamlakat profilda ko‘rinadi' },
                { key: 'showBirthday', label: 'Tug‘ilgan sanani ko‘rsatish', desc: 'Tug‘ilgan kuningiz ochiq ko‘rinadi' },
                { key: 'showOccupation', label: 'Kasb va ta’limni ko‘rsatish', desc: 'Ish joyi va universitet profilda aks etadi' },
                { key: 'showStatistics', label: 'LIFEOS statistikasini ko‘rsatish', desc: 'Vazifalar soni va umumiy bajarish foizi' },
                { key: 'showGoals', label: 'Maqsadlar va marralarni ko‘rsatish', desc: 'Faol maqsadlaringiz ro‘yxati' },
                { key: 'showTopik', label: 'TOPIK progressini ko‘rsatish', desc: 'TOPIK maqsadi va joriy o‘rganish natijasi' },
                { key: 'showDiscipline', label: 'Kunlik intizom balini ko‘rsatish', desc: '100 ballik intizom reytingingiz' },
                { key: 'showActivity', label: 'So‘nggi faoliyatlarni ko‘rsatish', desc: 'Yakunlangan darslar va vazifalar lentasi' },
              ].map((item) => {
                const isChecked = (privacy as any)[item.key];
                return (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          setPrivacy({ ...privacy, [item.key]: e.target.checked });
                          setHasUnsavedChanges(true);
                        }}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          inset: 0,
                          backgroundColor: isChecked ? 'var(--accent-primary)' : 'var(--border-strong)',
                          borderRadius: '24px',
                          transition: '0.2s ease',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            height: '18px',
                            width: '18px',
                            left: isChecked ? '22px' : '3px',
                            bottom: '3px',
                            backgroundColor: '#fff',
                            borderRadius: '50%',
                            transition: '0.2s ease',
                          }}
                        />
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Saqlanmoqda...' : 'Maxfiylikni Saqlash'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DASHBOARD PERSONALIZATION */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="glass-card animate-fade-in">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={20} color="var(--accent-primary)" /> Dashboard Vidjetlarini Moslash
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Bosh sahifangizda qaysi bo‘limlar ko‘rinishi va ularning ketma-ketligini xohlaganingizcha boshqaring.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dashboardWidgets.map((widget, index) => (
                <div
                  key={widget.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${widget.enabled ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
                    opacity: widget.enabled ? 1 : 0.6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        onClick={() => moveWidget(index, 'up')}
                        disabled={index === 0}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: index === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                          cursor: index === 0 ? 'default' : 'pointer',
                          padding: '2px',
                        }}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => moveWidget(index, 'down')}
                        disabled={index === dashboardWidgets.length - 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: index === dashboardWidgets.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                          cursor: index === dashboardWidgets.length - 1 ? 'default' : 'pointer',
                          padding: '2px',
                        }}
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{widget.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{widget.description}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className={`btn btn-sm ${widget.enabled ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {widget.enabled ? 'Ko‘rinsin' : 'Yashirin'}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Saqlanmoqda...' : 'Vidjet Tartibini Saqlash'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SCHEDULE & REMINDERS */}
        {/* ========================================================================= */}
        {activeTab === 'schedule' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
            {/* Time Schedule Card */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="var(--accent-primary)" /> Kun Tartibi & Qulay Vaqtlar
              </h3>

              <div className="grid-2" style={{ gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Uyg‘onish Vaqti</label>
                  <input
                    type="time"
                    className="input"
                    value={wakeTime}
                    onChange={(e) => {
                      setWakeTime(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Uxlash Vaqti (Tiklanish oynasi)</label>
                  <input
                    type="time"
                    className="input"
                    value={sleepTime}
                    onChange={(e) => {
                      setSleepTime(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ish Boshlanishi</label>
                  <input
                    type="time"
                    className="input"
                    value={workStartTime}
                    onChange={(e) => {
                      setWorkStartTime(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ish Tugashi</label>
                  <input
                    type="time"
                    className="input"
                    value={workEndTime}
                    onChange={(e) => {
                      setWorkEndTime(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">TOPIK / O‘qish Boshlanishi</label>
                  <input
                    type="time"
                    className="input"
                    value={studyStartTime}
                    onChange={(e) => {
                      setStudyStartTime(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">TOPIK / O‘qish Tugashi</label>
                  <input
                    type="time"
                    className="input"
                    value={studyEndTime}
                    onChange={(e) => {
                      setStudyEndTime(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Timezone & Currency Card */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>Hudud & Eslatmalar</h3>

              <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Vaqt Mintaqasi (Timezone)</label>
                  <select
                    className="select"
                    value={timezone}
                    onChange={(e) => {
                      setTimezone(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
                    <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
                    <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Asosiy Valyuta</label>
                  <select
                    className="select"
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <option value="UZS">UZS (So‘m)</option>
                    <option value="KRW">KRW (Won)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* Reminders Switches */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { state: taskReminders, setter: setTaskReminders, label: 'Vazifalar eslatmasi', desc: 'Rejalashtirilgan vazifa boshlanishidan oldin eslatish' },
                  { state: studyReminders, setter: setStudyReminders, label: 'TOPIK dars eslatmasi', desc: 'Kunlik dars va lug‘at takrori vaqti bo‘lganda xabar berish' },
                  { state: habitReminders, setter: setHabitReminders, label: 'Odatlar eslatmasi', desc: 'Kunlik odatlarni o‘z vaqtida bajarish eslatmasi' },
                  { state: expenseReminders, setter: setExpenseReminders, label: 'Xarajatlar eslatmasi', desc: 'Kun yakunida xarajatlarni yozib borishni eslatish' },
                ].map((rem, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{rem.label}</div>
                      <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>{rem.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={rem.state}
                      onChange={(e) => {
                        rem.setter(e.target.checked);
                        setHasUnsavedChanges(true);
                      }}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? 'Saqlanmoqda...' : 'Tartibni Saqlash'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SECURITY & DATA MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
            {/* Password Change Card */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={20} color="var(--accent-primary)" /> Parolni O‘zgartirish
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
                <div className="form-group">
                  <label className="form-label">Joriy Parol</label>
                  <input
                    type="password"
                    className="input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Yangi Parol (kamida 6 ta belgi)</label>
                  <input
                    type="password"
                    className="input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Yangi Parolni Qayta Kiriting</label>
                  <input
                    type="password"
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                  disabled={saving || !newPassword}
                  style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                >
                  <Save size={16} /> Parolni Yangilash
                </button>
              </div>
            </div>

            {/* Data Export & Backup */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={20} color="var(--accent-success)" /> Ma’lumotlar Eksporti
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Barcha vazifalar, odatlar, TOPIK lug‘atlari, moliya va profilingizni to‘liq JSON formatida yuklab oling.
                  </p>
                </div>
                <a
                  href="/api/profile/export"
                  download
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Download size={16} /> JSON Yuklab Olish
                </a>
              </div>
            </div>

            {/* Danger Zone: Account Deletion */}
            <div
              className="glass-card"
              style={{
                borderColor: 'var(--accent-danger)',
                background: 'rgba(239, 68, 68, 0.04)',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} /> Xavfli Hudud (Danger Zone)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Hisobni o‘chirish barcha profilingiz, rejalaringiz, odatlaringiz va tarixni butunlay o‘chirib tashlaydi. Bu amalni ortga qaytarib bo‘lmaydi.
              </p>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-danger btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Trash2 size={16} /> Hisobni Butunlay O‘chirish
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* AVATAR SELECTOR MODAL */}
        {/* ========================================================================= */}
        {showAvatarModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              className="glass-card animate-fade-in"
              style={{
                maxWidth: '480px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Avatar Tanlash</h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Upload custom option */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button
                  onClick={() => {
                    avatarInputRef.current?.click();
                    setShowAvatarModal(false);
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  <Upload size={16} /> Rasm Yuklash (5MB)
                </button>
                {avatar && (
                  <button
                    onClick={() => {
                      setAvatar(null);
                      setHasUnsavedChanges(true);
                      setShowAvatarModal(false);
                    }}
                    className="btn btn-danger"
                  >
                    <Trash2 size={16} /> O‘chirish
                  </button>
                )}
              </div>

              {/* Preset SVG Avatars */}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
                Tayyor Emotsional Avatarlar:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {PRESET_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPresetAvatar(p)}
                    className="interactive"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.75rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '1.75rem' }}>{p.emoji}</span>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DELETE ACCOUNT CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        {showDeleteModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              className="glass-card animate-fade-in"
              style={{
                maxWidth: '460px',
                width: '100%',
                padding: '1.75rem',
                borderColor: 'var(--accent-danger)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-danger)', marginBottom: '1rem' }}>
                <AlertTriangle size={28} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Hisobni Butunlay O‘chirish</h3>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Ushbu amal butun ma’lumotlar bazasidagi barcha vazifalar, odatlar, TOPIK yutuqlari va moliya tarixini butunlay yo‘q qiladi.
              </p>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Parolingizni tasdiqlang:</label>
                <input
                  type="password"
                  className="input"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  placeholder="Joriy parol"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Tasdiqlash uchun <strong>DELETE</strong> deb yozing:</label>
                <input
                  type="text"
                  className="input"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-secondary"
                  disabled={deleteLoading}
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-danger"
                  disabled={deleteLoading || deleteConfirmationText !== 'DELETE' || !deleteConfirmPassword}
                >
                  {deleteLoading ? 'O‘chirilmoqda...' : 'Hisobni O‘chirish'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
