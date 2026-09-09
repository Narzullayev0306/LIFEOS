'use client';

import React, { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import {
  BookOpen,
  Volume2,
  RotateCw,
  CheckCircle,
  XCircle,
  HelpCircle,
  Award,
  Layers,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Send,
  Eye,
  EyeOff,
  Filter,
  Search,
} from 'lucide-react';

export default function TopikPage() {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz' | 'vocab' | 'grammar' | 'writing' | 'mock'>('flashcards');

  // Flashcards state
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [quizMode, setQuizMode] = useState<'ko_to_uz' | 'uz_to_ko'>('ko_to_uz');
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // Vocab DB state
  const [allVocabs, setAllVocabs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Grammar state
  const [grammars, setGrammars] = useState<any[]>([]);
  const [selectedGrammar, setSelectedGrammar] = useState<any | null>(null);

  // Writing state
  const [writingPrompts, setWritingPrompts] = useState<any[]>([]);
  const [activePrompt, setActivePrompt] = useState<any | null>(null);
  const [userSubmission, setUserSubmission] = useState('');
  const [showSample, setShowSample] = useState(false);
  const [submittingWriting, setSubmittingWriting] = useState(false);

  // Mock test state
  const [mockActive, setMockActive] = useState(false);
  const [mockSeconds, setMockSeconds] = useState(180 * 60);

  // Fetch initial data
  const fetchDueVocab = async () => {
    try {
      const res = await fetch('/api/topik/vocab?mode=due');
      const data = await res.json();
      const cards = [...(data.reviews || []), ...(data.newVocabs || [])];
      setFlashcards(cards);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllVocabs = async () => {
    try {
      const res = await fetch('/api/topik/vocab');
      const data = await res.json();
      setAllVocabs(data.vocabs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGrammars = async () => {
    try {
      const res = await fetch('/api/topik/grammar');
      const data = await res.json();
      setGrammars(data.grammars || []);
      if (data.grammars && data.grammars.length > 0) {
        setSelectedGrammar(data.grammars[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWriting = async () => {
    try {
      const res = await fetch('/api/topik/writing');
      const data = await res.json();
      setWritingPrompts(data.prompts || []);
      if (data.prompts && data.prompts.length > 0) {
        setActivePrompt(data.prompts[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDueVocab(), fetchAllVocabs(), fetchGrammars(), fetchWriting()]);
      setLoading(false);
    };
    init();
  }, []);

  // Pronounce Korean text using Web Speech API
  const speakKorean = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle SM-2 Review response
  const handleReviewGrade = async (quality: number) => {
    const card = flashcards[currentIndex];
    if (!card) return;

    try {
      await fetch('/api/topik/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabId: card.id, quality }),
      });

      setIsFlipped(false);
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        fetchDueVocab();
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quiz setup when card changes or mode switches
  const currentCard = flashcards[currentIndex];

  useEffect(() => {
    if (!currentCard || allVocabs.length < 4) return;

    const correctAnswer = quizMode === 'ko_to_uz' ? currentCard.uzbek : currentCard.korean;
    const others = allVocabs
      .filter((v) => v.id !== currentCard.id)
      .map((v) => (quizMode === 'ko_to_uz' ? v.uzbek : v.korean));

    // Shuffle 3 distractors
    const shuffledDistractors = others.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [correctAnswer, ...shuffledDistractors].sort(() => 0.5 - Math.random());

    setQuizOptions(options);
    setSelectedOption(null);
    setQuizFeedback(null);
  }, [currentIndex, quizMode, currentCard, allVocabs]);

  const handleQuizAnswer = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const correctAnswer = quizMode === 'ko_to_uz' ? currentCard.uzbek : currentCard.korean;

    if (option === correctAnswer) {
      setQuizScore((prev) => prev + 1);
      setQuizFeedback('To‘g‘ri! Barakalla! 🎉');
      handleReviewGrade(5);
    } else {
      setQuizFeedback(`Noto‘g‘ri. To‘g‘ri javob: "${correctAnswer}"`);
      handleReviewGrade(1);
    }
    setQuizTotal((prev) => prev + 1);
  };

  // Writing practice submission
  const handleWritingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePrompt || !userSubmission.trim()) return;

    setSubmittingWriting(true);
    try {
      const res = await fetch('/api/topik/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: activePrompt.id,
          submission: userSubmission,
          selfScore: 8,
          feedback: 'Mustaqil yozildi va tahlil qilindi',
        }),
      });

      if (res.ok) {
        setUserSubmission('');
        fetchWriting();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingWriting(false);
    }
  };

  // Mock Exam Timer
  useEffect(() => {
    let interval: any = null;
    if (mockActive && mockSeconds > 0) {
      interval = setInterval(() => {
        setMockSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mockActive, mockSeconds]);

  const formatMockTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Filtered vocabulary list
  const filteredVocabs = allVocabs.filter((v) => {
    const matchesSearch =
      v.korean.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.uzbek.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || v.level.toString() === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <Shell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header with Navigation Tabs */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <BookOpen size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>TOPIK II O‘quv Markazi</h1>
                <p style={{ fontSize: '0.85rem' }}>Intervalli takrorlash (SM-2), grammatika, testlar va insho amaliyoti</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`btn ${activeTab === 'flashcards' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              >
                <RotateCw size={14} /> Flashcards (SM-2)
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              >
                <HelpCircle size={14} /> Test Mashqi
              </button>
              <button
                onClick={() => setActiveTab('vocab')}
                className={`btn ${activeTab === 'vocab' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              >
                <Layers size={14} /> Lug‘at Bazasi
              </button>
              <button
                onClick={() => setActiveTab('grammar')}
                className={`btn ${activeTab === 'grammar' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              >
                <Award size={14} /> Grammatika
              </button>
              <button
                onClick={() => setActiveTab('writing')}
                className={`btn ${activeTab === 'writing' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              >
                <FileText size={14} /> Insho (Yozish)
              </button>
              <button
                onClick={() => setActiveTab('mock')}
                className={`btn ${activeTab === 'mock' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              >
                <Clock size={14} /> Mock Exam
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: FLASHCARDS (SM-2 SPACED REPETITION) */}
        {activeTab === 'flashcards' && (
          <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
            {flashcards.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <CheckCircle size={48} color="var(--accent-success)" style={{ margin: '0 auto 1rem' }} />
                <h3>Barcha so‘zlar takrorlandi!</h3>
                <p style={{ margin: '0.5rem 0 1.5rem' }}>Bugungi intervalli takrorlash (SM-2) yakunlandi.</p>
                <button onClick={fetchAllVocabs} className="btn btn-primary">
                  Barcha lug‘atni ko‘rish
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Takrorlash: {currentIndex + 1} / {flashcards.length}
                  </span>
                  <span className="badge badge-violet">TOPIK {currentCard?.level}-Daraja</span>
                </div>

                {/* Flip Card Container */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="glass-card interactive pulse-glow"
                  style={{
                    minHeight: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    padding: '2.5rem',
                    position: 'relative',
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakKorean(currentCard?.korean);
                    }}
                    title="Talaffuzni eshitish"
                    style={{
                      position: 'absolute',
                      top: '1.5rem',
                      right: '1.5rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--accent-primary)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Volume2 size={20} />
                  </button>

                  {!isFlipped ? (
                    <div>
                      <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                        {currentCard?.korean}
                      </div>
                      {currentCard?.hanja && (
                        <div style={{ fontSize: '1.1rem', color: 'var(--accent-warning)', marginBottom: '1rem' }}>
                          [{currentCard.hanja}]
                        </div>
                      )}
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Tarjima va misollarni ko‘rish uchun bosing ↻
                      </p>
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--accent-success)', marginBottom: '1rem' }}>
                        {currentCard?.uzbek}
                      </div>
                      <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'left', margin: '1rem 0' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                          {currentCard?.exampleKo}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {currentCard?.exampleUz}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Turkum: {currentCard?.pos} | Soha: {currentCard?.category}
                      </div>
                    </div>
                  )}
                </div>

                {/* SM-2 Quality Grade Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button onClick={() => handleReviewGrade(1)} className="btn btn-danger btn-sm">
                    Qayta (1)
                  </button>
                  <button onClick={() => handleReviewGrade(3)} className="btn btn-secondary btn-sm">
                    Qiyin (3)
                  </button>
                  <button onClick={() => handleReviewGrade(4)} className="btn btn-primary btn-sm">
                    Yaxshi (4)
                  </button>
                  <button onClick={() => handleReviewGrade(5)} className="btn btn-success btn-sm">
                    Oson (5)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERACTIVE QUIZ */}
        {activeTab === 'quiz' && currentCard && (
          <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setQuizMode('ko_to_uz')}
                    className={`btn ${quizMode === 'ko_to_uz' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  >
                    Koreyscha → O‘zbekcha
                  </button>
                  <button
                    onClick={() => setQuizMode('uz_to_ko')}
                    className={`btn ${quizMode === 'uz_to_ko' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  >
                    O‘zbekcha → Koreyscha
                  </button>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  Natija: {quizScore} / {quizTotal}
                </span>
              </div>

              {/* Quiz Question */}
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To‘g‘ri ma’noni tanlang:</span>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.5rem' }}>
                  {quizMode === 'ko_to_uz' ? currentCard.korean : currentCard.uzbek}
                </h2>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {quizOptions.map((opt, i) => {
                  let btnBg = 'var(--bg-secondary)';
                  let btnBorder = 'var(--border-subtle)';
                  const correctAnswer = quizMode === 'ko_to_uz' ? currentCard.uzbek : currentCard.korean;

                  if (selectedOption) {
                    if (opt === correctAnswer) {
                      btnBg = 'rgba(16, 185, 129, 0.2)';
                      btnBorder = 'var(--accent-success)';
                    } else if (opt === selectedOption) {
                      btnBg = 'rgba(239, 68, 68, 0.2)';
                      btnBorder = 'var(--accent-danger)';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(opt)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: btnBg,
                        border: `1px solid ${btnBorder}`,
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: selectedOption ? 'default' : 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {quizFeedback && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, marginBottom: '0.75rem' }}>{quizFeedback}</p>
                  <button
                    onClick={() => {
                      if (currentIndex < flashcards.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                      } else {
                        setCurrentIndex(0);
                      }
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Keyingi savol <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: COMPLETE VOCABULARY DATABASE */}
        {activeTab === 'vocab' && (
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: '2.25rem', width: '260px' }}
                    placeholder="So‘z qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>

                <select
                  className="select"
                  style={{ width: '160px' }}
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <option value="all">Barcha darajalar</option>
                  <option value="3">TOPIK 3</option>
                  <option value="4">TOPIK 4</option>
                  <option value="5">TOPIK 5</option>
                  <option value="6">TOPIK 6</option>
                </select>
              </div>

              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Jami: {filteredVocabs.length} ta so‘z
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Koreyscha</th>
                    <th style={{ padding: '0.75rem' }}>Hanja</th>
                    <th style={{ padding: '0.75rem' }}>O‘zbekcha ma’nosi</th>
                    <th style={{ padding: '0.75rem' }}>Daraja</th>
                    <th style={{ padding: '0.75rem' }}>Misol jumla</th>
                    <th style={{ padding: '0.75rem' }}>Talaffuz</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVocabs.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{v.korean}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--accent-warning)' }}>{v.hanja || '—'}</td>
                      <td style={{ padding: '0.75rem' }}>{v.uzbek}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="badge badge-violet">Level {v.level}</span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div>{v.exampleKo}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{v.exampleUz}</div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          onClick={() => speakKorean(v.korean)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
                        >
                          <Volume2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: GRAMMAR LIBRARY */}
        {activeTab === 'grammar' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            {/* Grammar List */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Grammatika Ro‘yxati</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto' }}>
                {grammars.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGrammar(g)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: selectedGrammar?.id === g.id ? 'var(--accent-primary-light)' : 'var(--bg-secondary)',
                      border: `1px solid ${selectedGrammar?.id === g.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{g.pattern}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{g.meaningUz}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grammar Detail & Practice */}
            {selectedGrammar && (
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedGrammar.pattern}</h2>
                  <span className="badge badge-violet">TOPIK {selectedGrammar.level}-Daraja</span>
                </div>

                <div style={{ fontSize: '1.05rem', color: 'var(--accent-success)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Ma’nosi: {selectedGrammar.meaningUz}
                </div>

                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {selectedGrammar.explanation}
                </p>

                {selectedGrammar.usageNote && (
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-warning)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    <strong>Qo‘llanilishi:</strong> {selectedGrammar.usageNote}
                  </div>
                )}

                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Misollar:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {selectedGrammar.examples?.map((ex: any, idx: number) => (
                    <div key={idx} style={{ padding: '0.6rem 0.85rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>• {ex.ko}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{ex.uz}</div>
                    </div>
                  ))}
                </div>

                {selectedGrammar.practice && selectedGrammar.practice.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Mashq Savoli:</h4>
                    <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{selectedGrammar.practice[0].question}</p>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>
                        To‘g‘ri javob: <strong>{selectedGrammar.practice[0].answer}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {selectedGrammar.practice[0].explanation}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WRITING PROMPTS (51, 52, 53, 54) */}
        {activeTab === 'writing' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            {/* Prompts list */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Yozish Bo‘limlari</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {writingPrompts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActivePrompt(p);
                      setShowSample(false);
                    }}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: activePrompt?.id === p.id ? 'var(--accent-primary-light)' : 'var(--bg-secondary)',
                      border: `1px solid ${activePrompt?.id === p.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {p.promptNumber}-Savol: {p.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Topshiriqlar: {p.practices?.length || 0} ta yozilgan
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt Editor */}
            {activePrompt && (
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {activePrompt.promptNumber}-Savol: {activePrompt.title}
                  </h2>
                  <button
                    onClick={() => setShowSample(!showSample)}
                    className="btn btn-secondary btn-sm"
                  >
                    {showSample ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showSample ? 'Namunani yashirish' : 'Namunaviy javob'}
                  </button>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {activePrompt.description}
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-warning)', marginBottom: '1rem' }}>
                  📌 Ko‘rsatma: {activePrompt.instructions}
                </div>

                {showSample && (
                  <div className="animate-fade-in" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-success)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-success)', marginBottom: '0.25rem' }}>
                      Namunaviy Yuqori Ballik Javob:
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem' }}>
                      {activePrompt.sampleAnswer}
                    </pre>
                  </div>
                )}

                <form onSubmit={handleWritingSubmit}>
                  <div className="form-group">
                    <label className="form-label">Sizning Yozma Javobingiz (Koreys tilida)</label>
                    <textarea
                      className="textarea"
                      style={{ minHeight: '180px', fontSize: '0.95rem' }}
                      value={userSubmission}
                      onChange={(e) => setUserSubmission(e.target.value)}
                      placeholder="Javobingizni shu yerga yozing..."
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Belgilar soni: {userSubmission.length} ta
                    </span>
                    <button type="submit" className="btn btn-primary" disabled={submittingWriting}>
                      <Send size={14} /> {submittingWriting ? 'Saqlanmoqda...' : 'Javobni Topshirish'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: MOCK EXAM & TIMER */}
        {activeTab === 'mock' && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <Clock size={48} color="var(--accent-primary)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>TOPIK II To‘liq Sinov Imtihoni (Mock)</h2>
            <p style={{ maxWidth: '540px', margin: '0.5rem auto 2rem', color: 'var(--text-secondary)' }}>
              180 daqiqalik rasmiy imtihon muhiti: Tinglab tushunish (60 min), Yozish (50 min), O‘qib tushunish (70 min).
            </p>

            <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>
              {formatMockTime(mockSeconds)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={() => setMockActive(!mockActive)}
                className={`btn ${mockActive ? 'btn-danger' : 'btn-primary'} btn-lg`}
              >
                {mockActive ? 'Imtihonni To‘xtatish' : 'Imtihon Taymerini Boshlash'}
              </button>
              <button
                onClick={() => {
                  setMockActive(false);
                  setMockSeconds(180 * 60);
                }}
                className="btn btn-secondary btn-lg"
              >
                Qayta o‘rnatish
              </button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
