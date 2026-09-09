'use client';

import React, { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  AlertTriangle,
  Moon,
  CheckCircle2,
  Play,
  RotateCcw,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  Layers,
  X,
} from 'lucide-react';

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [tasks, setTasks] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [sleepClashes, setSleepClashes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [recalculateMessage, setRecalculateMessage] = useState<string | null>(null);

  // Form State for new task
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('WORK');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [isFixed, setIsFixed] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?date=${selectedDate}`);
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks || []);
        setConflicts(data.conflicts || []);
        setSleepClashes(data.sleepClashes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          category,
          startTime,
          endTime,
          estimatedMinutes,
          isFixed,
          scheduledDate: selectedDate,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Vazifani o‘chirishga ishonchingiz komilmi?')) return;
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    setRecalculateMessage(null);
    try {
      const res = await fetch(`/api/planner/recalculate?date=${selectedDate}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setRecalculateMessage(data.message);
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return <span className="badge badge-rose">Shoshilinch</span>;
      case 'HIGH':
        return <span className="badge badge-amber">Yuqori</span>;
      case 'MEDIUM':
        return <span className="badge badge-indigo">O‘rtacha</span>;
      default:
        return <span className="badge badge-emerald">Past</span>;
    }
  };

  return (
    <Shell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Date Navigation */}
        <div
          className="glass-card"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Clock size={20} color="var(--accent-primary)" />
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Kunlik Reja & Vaqt Bloklari</h1>
            </div>
            <p style={{ fontSize: '0.85rem' }}>To‘qnashuvlarsiz, intizomli vaqt taqsimoti</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                padding: '0.25rem',
              }}
            >
              <button
                onClick={() => changeDate(-1)}
                className="btn btn-sm"
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}
              >
                <ChevronLeft size={16} />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '0.25rem 0.5rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
              <button
                onClick={() => changeDate(1)}
                className="btn btn-sm"
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
              className="btn btn-secondary btn-sm"
            >
              Bugun
            </button>

            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="btn btn-secondary btn-sm"
              title="Qoldirilgan yoki kechikkan vazifalarni qayta taqsimlash"
            >
              <Sparkles size={14} color="var(--accent-warning)" />
              {recalculating ? 'Hisoblanmoqda...' : 'Intellektual Qayta Taqsimlash'}
            </button>

            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> Yangi Vazifa
            </button>
          </div>
        </div>

        {/* Recalculate Feedback Message */}
        {recalculateMessage && (
          <div
            className="animate-fade-in"
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid var(--accent-primary)',
              borderRadius: 'var(--radius-md)',
              color: '#818cf8',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>✨ {recalculateMessage}</span>
            <button
              onClick={() => setRecalculateMessage(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Conflict Alert Banner */}
        {conflicts.length > 0 && (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid var(--accent-danger)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 700 }}>
              <AlertTriangle size={18} />
              <span>Jadval to‘qnashuvi aniqlandi ({conflicts.length} ta holat)</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {conflicts.map((c, idx) => (
                <div key={idx} style={{ marginTop: '0.25rem' }}>
                  • <strong>&quot;{c.slotA.title}&quot;</strong> va <strong>&quot;{c.slotB.title}&quot;</strong>{' '}
                  ({c.overlapMinutes} daqiqa ustma-ust tushdi)
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sleep Conflict Alert */}
        {sleepClashes.length > 0 && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid var(--accent-warning)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Moon size={18} color="var(--accent-warning)" />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <strong>Uyqu rejimiga e’tibor bering:</strong> Bir yoki bir nechta vazifa tungi tiklanish vaqtiga to‘g‘ri kelmoqda.
            </div>
          </div>
        )}

        {/* Main Grid: Tasks List & Visual Timeline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* Tasks List Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Bugungi Vazifalar ({tasks.length})</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {tasks.filter((t) => t.status === 'COMPLETED').length} bajarildi
              </span>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                Vazifalar yuklanmoqda...
              </p>
            ) : tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Layers size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p>Bu kunga hali vazifalar belgilanmagan.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1rem' }}
                >
                  <Plus size={14} /> Birinchi vazifani qo‘shish
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor:
                        task.status === 'COMPLETED'
                          ? 'rgba(16, 185, 129, 0.08)'
                          : task.status === 'IN_PROGRESS'
                          ? 'rgba(99, 102, 241, 0.12)'
                          : 'var(--bg-secondary)',
                      border: `1px solid ${
                        task.status === 'COMPLETED'
                          ? 'rgba(16, 185, 129, 0.25)'
                          : task.status === 'IN_PROGRESS'
                          ? 'var(--accent-primary)'
                          : 'var(--border-subtle)'
                      }`,
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {task.isFixed && (
                          <span title="O‘zgarmas tadbir" style={{ color: 'var(--accent-warning)', display: 'flex' }}>
                            <Shield size={14} />
                          </span>
                        )}
                        <h4
                          style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                            color: task.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--text-primary)',
                          }}
                        >
                          {task.title}
                        </h4>
                      </div>
                      {getPriorityBadge(task.priority)}
                    </div>

                    {task.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        {task.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <span>🕒 {task.startTime || '--:--'} – {task.endTime || '--:--'}</span>
                        <span>⏱️ {task.estimatedMinutes} daq</span>
                        <span>📂 {task.category}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {task.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                            className="btn btn-success btn-sm"
                            title="Bajarildi"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {task.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                            className="btn btn-primary btn-sm"
                            title="Boshlash"
                          >
                            <Play size={14} />
                          </button>
                        )}
                        {task.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'PENDING')}
                            className="btn btn-secondary btn-sm"
                            title="Qayta tiklash"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--accent-danger)' }}
                          title="O‘chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual Timeline Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Kunlik Vaqt O‘qi</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>06:00 — 23:00</span>
            </div>

            <div
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '650px',
                overflowY: 'auto',
                paddingRight: '0.5rem',
              }}
            >
              {Array.from({ length: 18 }).map((_, i) => {
                const hour = i + 6;
                const hourStr = `${String(hour).padStart(2, '0')}:00`;
                const matchedTask = tasks.find((t) => {
                  if (!t.startTime) return false;
                  const h = parseInt(t.startTime.split(':')[0], 10);
                  return h === hour;
                });

                return (
                  <div
                    key={hour}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      minHeight: '36px',
                    }}
                  >
                    <span
                      style={{
                        width: '45px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {hourStr}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: '100%',
                        minHeight: '34px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: matchedTask
                          ? matchedTask.status === 'COMPLETED'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : matchedTask.isFixed
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(99, 102, 241, 0.2)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: matchedTask
                          ? `1px solid ${
                              matchedTask.status === 'COMPLETED'
                                ? 'var(--accent-success)'
                                : matchedTask.isFixed
                                ? 'var(--accent-warning)'
                                : 'var(--accent-primary)'
                            }`
                          : '1px dashed var(--border-subtle)',
                        padding: '0.4rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                      }}
                    >
                      {matchedTask ? (
                        <>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {matchedTask.title}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {matchedTask.startTime} – {matchedTask.endTime}
                          </span>
                        </>
                      ) : (
                        <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '0.75rem' }}>
                          Bo‘sh vaqt oralig‘i
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Create Task Modal */}
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
            <div
              className="glass-card animate-fade-in"
              style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Yangi Vazifa Qo‘shish</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label className="form-label">Vazifa Sarlavhasi *</label>
                  <input
                    type="text"
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Masalan: TOPIK 53-savol diagramma inshosini tahlil qilish"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tavsif (ixtiyoriy)</label>
                  <textarea
                    className="textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Qo‘shimcha eslatmalar va tafsilotlar..."
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Muhimlik Darajasi</label>
                    <select
                      className="select"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="LOW">Past</option>
                      <option value="MEDIUM">O‘rtacha</option>
                      <option value="HIGH">Yuqori</option>
                      <option value="URGENT">Shoshilinch</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kategoriya</label>
                    <select
                      className="select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="WORK">Ish / Loyiha</option>
                      <option value="STUDY">TOPIK / O‘qish</option>
                      <option value="HEALTH">Salomatlik / Sport</option>
                      <option value="FINANCE">Moliya</option>
                      <option value="PERSONAL">Shaxsiy</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Boshlanish Vaqti</label>
                    <input
                      type="time"
                      className="input"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tugash Vaqti</label>
                    <input
                      type="time"
                      className="input"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0 1.5rem' }}>
                  <input
                    type="checkbox"
                    id="isFixed"
                    checked={isFixed}
                    onChange={(e) => setIsFixed(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-warning)' }}
                  />
                  <label htmlFor="isFixed" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                    <strong>O‘zgarmas vaqt bloki:</strong> Qayta rejalashtirishda bu vaqt saqlanadi
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Bekor qilish
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Vazifani Saqlash
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
