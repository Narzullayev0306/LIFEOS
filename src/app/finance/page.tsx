'use client';

import React, { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Plus,
  Calendar,
  AlertCircle,
  PiggyBank,
  CheckCircle,
  Trash2,
  PieChart,
  Tag,
  DollarSign,
  X,
} from 'lucide-react';

export default function FinancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes' | 'savings'>('expenses');

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // Expense form
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCatId, setExpenseCatId] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');

  // Income form
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeDesc, setIncomeDesc] = useState('');

  // Budget form
  const [budgetAmount, setBudgetAmount] = useState('');

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/finance/overview');
      const d = await res.json();
      if (res.ok) {
        setData(d);
        if (d.categories && d.categories.length > 0 && !expenseCatId) {
          setExpenseCatId(d.categories[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: expenseAmount,
          categoryId: expenseCatId,
          description: expenseDesc,
        }),
      });
      if (res.ok) {
        setShowExpenseModal(false);
        setExpenseAmount('');
        setExpenseDesc('');
        fetchFinance();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: incomeAmount,
          source: incomeSource,
          description: incomeDesc,
        }),
      });
      if (res.ok) {
        setShowIncomeModal(false);
        setIncomeAmount('');
        setIncomeSource('');
        setIncomeDesc('');
        fetchFinance();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: budgetAmount }),
      });
      if (res.ok) {
        setShowBudgetModal(false);
        fetchFinance();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Ushbu xarajatni o‘chirishga ishonchingiz komilmi?')) return;
    try {
      await fetch(`/api/finance/expense/${id}`, { method: 'DELETE' });
      fetchFinance();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Ushbu daromadni o‘chirishga ishonchingiz komilmi?')) return;
    try {
      await fetch(`/api/finance/income/${id}`, { method: 'DELETE' });
      fetchFinance();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Shell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Quick Action Buttons */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Wallet size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Moliyaviy Boshqaruv & Byudjet</h1>
                <p style={{ fontSize: '0.85rem' }}>Dinamik kunlik limit, daromadlar va xarajatlar monitoringi</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  setBudgetAmount(data?.monthlyBudget || '');
                  setShowBudgetModal(true);
                }}
                className="btn btn-secondary btn-sm"
              >
                Byudjetni o‘zgartirish
              </button>
              <button onClick={() => setShowIncomeModal(true)} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Daromad kiritish
              </button>
              <button onClick={() => setShowExpenseModal(true)} className="btn btn-primary btn-sm">
                <Plus size={14} /> Xarajat kiritish
              </button>
            </div>
          </div>
        </div>

        {/* 4-Column KPI Cards Grid */}
        <div className="grid-4">
          {/* Monthly Budget & Remaining */}
          <div className="glass-card interactive">
            <span className="metric-label">Oylik Rejali Byudjet</span>
            <div className="metric-value" style={{ margin: '0.25rem 0' }}>
              {data?.monthlyBudget?.toLocaleString() ?? 0} <span style={{ fontSize: '0.85rem' }}>UZS</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Qolgan qoldiq: <strong>{data?.dailyLimitData?.remainingBudget?.toLocaleString() ?? 0} UZS</strong>
            </div>
          </div>

          {/* Dynamic Daily Spending Limit */}
          <div className="glass-card interactive">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-label">Kunlik Dinamik Limit</span>
              <span className="badge badge-emerald">Dinamik</span>
            </div>
            <div
              className="metric-value"
              style={{
                margin: '0.25rem 0',
                color: data?.dailyLimitData?.isOverBudget ? 'var(--accent-danger)' : 'var(--accent-success)',
              }}
            >
              {data?.dailyLimitData?.dailyLimit?.toLocaleString() ?? 0} <span style={{ fontSize: '0.85rem' }}>UZS</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {data?.dailyLimitData?.daysRemaining} kun qoldi ({data?.currentMonth})
            </div>
          </div>

          {/* Today's Spend */}
          <div className="glass-card interactive">
            <span className="metric-label">Bugungi Xarajat</span>
            <div className="metric-value" style={{ margin: '0.25rem 0' }}>
              {data?.todayExpensesTotal?.toLocaleString() ?? 0} <span style={{ fontSize: '0.85rem' }}>UZS</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Jami oylik xarajat: <strong>{data?.monthlyExpensesTotal?.toLocaleString() ?? 0} UZS</strong>
            </div>
          </div>

          {/* Monthly Income Target */}
          <div className="glass-card interactive">
            <span className="metric-label">Oylik Daromad Maqsadi</span>
            <div className="metric-value" style={{ margin: '0.25rem 0', color: 'var(--accent-primary)' }}>
              {data?.monthlyIncomeTotal?.toLocaleString() ?? 0} <span style={{ fontSize: '0.85rem' }}>UZS</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Bajarilishi: <strong>{data?.incomeProgressData?.percentAchieved ?? 0}%</strong>
            </div>
          </div>
        </div>

        {/* Category Breakdown & Dynamic Limit Explanation */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
          {/* Category Breakdown */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Xarajatlar Kategoriyasi Tahlili</h3>
            {data?.categoryBreakdown?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                Ushbu oyda hali xarajatlar mavjud emas.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {data?.categoryBreakdown?.map((cat: any, idx: number) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                      <span>
                        {cat.amount.toLocaleString()} UZS ({cat.percent}%)
                      </span>
                    </div>
                    <div className="progress-container" style={{ height: '6px' }}>
                      <div
                        className="progress-bar"
                        style={{ width: `${cat.percent}%`, backgroundColor: cat.color || 'var(--accent-primary)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formula & Rule Box */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Dinamik Limit Formulassi</h3>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Limit = (Byudjet - Sarflangan) / Qolgan Kunlar
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Agar bugun tejab sarflasangiz, ertangi kunlik limitingiz avtomatik ravishda oshadi!
              Ortiqcha xarajat esa keyingi kunlar limitini kamaytiradi.
            </p>
          </div>
        </div>

        {/* Transactions Ledger Tabs */}
        <div className="glass-card">
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              Xarajatlar Ro‘yxati ({data?.expenses?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('incomes')}
              className={`btn ${activeTab === 'incomes' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              Daromadlar Tarixi ({data?.incomes?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('savings')}
              className={`btn ${activeTab === 'savings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              Jamg‘arma Maqsadlari ({data?.savingsGoals?.length || 0})
            </button>
          </div>

          {/* Expenses Table */}
          {activeTab === 'expenses' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Sana</th>
                    <th style={{ padding: '0.75rem' }}>Tavsif</th>
                    <th style={{ padding: '0.75rem' }}>Kategoriya</th>
                    <th style={{ padding: '0.75rem' }}>Miqdor</th>
                    <th style={{ padding: '0.75rem' }}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.expenses?.map((exp: any) => (
                    <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{exp.date}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{exp.description || 'Xarajat'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="badge badge-indigo">{exp.category?.name || 'Boshqa'}</span>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--accent-danger)' }}>
                        -{exp.amount.toLocaleString()} UZS
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Incomes Table */}
          {activeTab === 'incomes' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Sana</th>
                    <th style={{ padding: '0.75rem' }}>Manba</th>
                    <th style={{ padding: '0.75rem' }}>Tavsif</th>
                    <th style={{ padding: '0.75rem' }}>Miqdor</th>
                    <th style={{ padding: '0.75rem' }}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.incomes?.map((inc: any) => (
                    <tr key={inc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{inc.date}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>{inc.source}</td>
                      <td style={{ padding: '0.75rem' }}>{inc.description || '—'}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                        +{inc.amount.toLocaleString()} UZS
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          onClick={() => handleDeleteIncome(inc.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Savings Goals */}
          {activeTab === 'savings' && (
            <div className="grid-3">
              {data?.savingsGoals?.map((goal: any) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div key={goal.id} style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <PiggyBank size={18} color="var(--accent-primary)" />
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{goal.title}</h4>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span>{goal.currentAmount.toLocaleString()} UZS</span>
                      <strong>{goal.targetAmount.toLocaleString()} UZS</strong>
                    </div>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${percent}%` }} />
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      {percent}% to‘plandi
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal: Add Expense */}
        {showExpenseModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Xarajat Qo‘shish</h3>
                <button onClick={() => setShowExpenseModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddExpense}>
                <div className="form-group">
                  <label className="form-label">Miqdor (UZS) *</label>
                  <input
                    type="number"
                    className="input"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    required
                    placeholder="Masalan: 45000"
                    step="1000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategoriya *</label>
                  <select
                    className="select"
                    value={expenseCatId}
                    onChange={(e) => setExpenseCatId(e.target.value)}
                    required
                  >
                    {data?.categories?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tavsif (ixtiyoriy)</label>
                  <input
                    type="text"
                    className="input"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    placeholder="Masalan: Tushlik va qahva"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowExpenseModal(false)} className="btn btn-secondary">
                    Bekor qilish
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Income */}
        {showIncomeModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Daromad Kiritish</h3>
                <button onClick={() => setShowIncomeModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddIncome}>
                <div className="form-group">
                  <label className="form-label">Daromad Manbasi *</label>
                  <input
                    type="text"
                    className="input"
                    value={incomeSource}
                    onChange={(e) => setIncomeSource(e.target.value)}
                    required
                    placeholder="Masalan: Frilans loyihasi"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Miqdor (UZS) *</label>
                  <input
                    type="number"
                    className="input"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    required
                    placeholder="Masalan: 1500000"
                    step="10000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tavsif (ixtiyoriy)</label>
                  <input
                    type="text"
                    className="input"
                    value={incomeDesc}
                    onChange={(e) => setIncomeDesc(e.target.value)}
                    placeholder="Qo‘shimcha tafsilotlar..."
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowIncomeModal(false)} className="btn btn-secondary">
                    Bekor qilish
                  </button>
                  <button type="submit" className="btn btn-success">
                    Daromadni Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Set Budget */}
        {showBudgetModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Oylik Byudjetni Belgilash</h3>
                <button onClick={() => setShowBudgetModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSetBudget}>
                <div className="form-group">
                  <label className="form-label">Yangi Oylik Byudjet (UZS)</label>
                  <input
                    type="number"
                    className="input"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    required
                    step="100000"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setShowBudgetModal(false)} className="btn btn-secondary">
                    Bekor qilish
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Saqlash
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
