'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  CheckCircle2,
  Wallet,
  Target,
  Sparkles,
  User,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Flame,
} from 'lucide-react';

interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('lifeos_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('lifeos_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const navItems = [
    { name: 'Bosh sahifa', href: '/', icon: LayoutDashboard },
    { name: 'Kunlik Reja', href: '/planner', icon: Calendar },
    { name: 'TOPIK II', href: '/topik', icon: BookOpen },
    { name: 'Odatlar & Intizom', href: '/habits', icon: CheckCircle2 },
    { name: 'Moliya', href: '/finance', icon: Wallet },
    { name: 'Maqsadlar', href: '/goals', icon: Target },
    { name: 'AI Maslahatchi', href: '/ai', icon: Sparkles },
    { name: 'Profil & Sozlamalar', href: '/profile', icon: User },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40,
        }}
        className="desktop-sidebar"
      >
        {/* Logo & Brand */}
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Flame size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              LIFE<span style={{ color: 'var(--accent-primary)' }}>OS</span>
            </span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1 }}>Shaxsiy Tizim</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.7rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.925rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon size={18} color={isActive ? '#ffffff' : 'currentColor'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Quick Info & Logout */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary-light)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              AN
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Azizbek
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-success)' }}>● Faol</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Chiqish"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
        className="main-wrapper"
      >
        {/* Top Navbar */}
        <header
          style={{
            height: 'var(--header-height)',
            backgroundColor: 'var(--bg-glass-strong)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Mobile hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-hamburger-btn"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'none',
              }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {new Date().toLocaleDateString('uz-UZ', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={toggleTheme}
              title="Mavzuni o‘zgartirish"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotificationModal(!showNotificationModal)}
                title="Bildirishnomalar"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-danger)',
                    }}
                  />
                )}
              </button>

              {showNotificationModal && (
                <div
                  className="glass-card animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '320px',
                    zIndex: 50,
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Bildirishnomalar</div>
                    <button
                      onClick={() => setUnreadNotifications(0)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      O‘qilgan deb belgilash
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--accent-topik)' }}>TOPIK II Vazifasi</div>
                      <div>Bugungi 25 ta yangi lug‘atni takrorlash vaqti keldi!</div>
                    </div>
                    <div style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--accent-success)' }}>Intizom Ko‘rsatkichi</div>
                      <div>Kecha 90/100 intizom natijasiga erishdingiz. Shunday davom eting!</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Inner Container */}
        <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>

        {/* Mobile Navigation Bar */}
        <nav className="mobile-nav-bar">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.7rem',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  textDecoration: 'none',
                }}
              >
                <Icon size={20} />
                <span>{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <style jsx global>{`
        .desktop-sidebar {
          display: flex;
        }
        .main-wrapper {
          margin-left: var(--sidebar-width);
        }
        .mobile-nav-bar {
          display: none;
        }
        @media (max-width: 900px) {
          .desktop-sidebar {
            display: ${isMobileMenuOpen ? 'flex' : 'none'};
            width: 260px;
          }
          .main-wrapper {
            margin-left: 0;
            padding-bottom: var(--mobile-nav-height);
          }
          .mobile-hamburger-btn {
            display: block !important;
          }
          .mobile-nav-bar {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: var(--mobile-nav-height);
            background: var(--bg-glass-strong);
            backdrop-filter: blur(16px);
            border-top: 1px solid var(--border-subtle);
            justify-content: space-around;
            align-items: center;
            z-index: 40;
          }
        }
      `}</style>
    </div>
  );
}
