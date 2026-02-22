import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import * as api from '../services/api';
import Footer from '../components/Footer';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    Tooltip as RechartsTooltip, PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
    const [habits, setHabits] = useState([]);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [notification, setNotification] = useState('');
    const [loading, setLoading] = useState(true);
    const [inputError, setInputError] = useState(false);
    const navigate = useNavigate();

    const [editingHabitId, setEditingHabitId] = useState(null);
    const [editTitle, setEditTitle] = useState('');

    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonthName = monthNames[currentMonthIdx];
    const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
    const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const loadHabits = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await api.fetchHabits();
            setHabits(data.filter(h => !h.isArchived && !h.isDeleted));
        } catch (err) {
            console.error("Dashboard failed to load habits", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHabits(habits.length > 0);
    }, [loadHabits]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleAddHabit = async () => {
        if (!newHabitTitle.trim()) {
            setInputError(true);
            setTimeout(() => setInputError(false), 2000); // Remove glow after 2 seconds
            return;
        }

        setInputError(false);
        try {
            const habit = await api.createHabit({ title: newHabitTitle, target: 10 });
            setHabits(prev => [...prev, habit]);
            setNewHabitTitle('');
            setNotification(`"${habit.title}" added to your list!`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleDate = async (habitId, day) => {
        const targetDate = new Date(currentYear, currentMonthIdx, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = today - targetDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays < 0) {
            setNotification("Cannot mark future dates!");
            return;
        }
        if (diffDays > 2) {
            setNotification("Logging window closed (Max 2 days back)");
            return;
        }

        const dateStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        try {
            const updated = await api.toggleHabit(habitId, dateStr);
            setHabits(prev => prev.map(h => h._id === habitId ? updated : h));
        } catch (err) {
            console.error("Toggle failed", err);
        }
    };

    const handleArchive = async (id, title) => {
        try {
            await api.archiveHabit(id, true);
            setHabits(prev => prev.filter(h => h._id !== id));
            setNotification(`"${title}" archived successfully`);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Move "${title}" to Recycle Bin? It will be stored for 30 days.`)) return;
        try {
            await api.deleteHabit(id);
            setHabits(prev => prev.filter(h => h._id !== id));
            setNotification(`"${title}" moved to Recycle Bin`);
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdateTitle = async (id) => {
        if (!editTitle.trim()) return;
        try {
            const updated = await api.updateHabit(id, { title: editTitle });
            setHabits(prev => prev.map(h => h._id === id ? updated : h));
            setEditingHabitId(null);
            setNotification("Title updated");
        } catch (e) {
            console.error(e);
        }
    };

    if (loading && habits.length === 0) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid #00ccff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                    <h2 style={{ color: '#00ccff', fontWeight: '800' }}>Synchronizing...</h2>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem' }}>
                <div className="animate-fade-in">
                    {notification && (
                        <div style={{
                            position: 'fixed', top: '5.5rem', left: '50%', transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)', color: '#000',
                            padding: '0.8rem 1.5rem', borderRadius: '50px', fontWeight: '900', zIndex: 3000,
                            fontSize: '0.85rem', boxShadow: '0 10px 40px rgba(0, 114, 255, 0.4)',
                            width: 'max-content', maxWidth: '90%', textAlign: 'center'
                        }}>✨ {notification}</div>
                    )}

                    <div style={{ background: 'rgba(13, 13, 15, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2rem' }}>
                        <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div className="mobile-text-center">
                                <h1 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>{currentMonthName} <span style={{ color: '#00ccff' }}>{currentYear}</span></h1>
                                <p style={{ color: '#555', fontWeight: '700', marginTop: '4px', fontSize: '0.8rem', letterSpacing: '1px' }}>DISCIPLINE OVER MOTIVATION</p>
                            </div>
                        </div>

                        <div className="mobile-stack" style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <input
                                type="text"
                                placeholder="What's your next win?"
                                value={newHabitTitle}
                                className="mobile-full-width"
                                onChange={(e) => {
                                    setNewHabitTitle(e.target.value);
                                    if (e.target.value.trim()) setInputError(false);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
                                style={{
                                    flex: 1,
                                    background: '#0a0a0c',
                                    border: inputError ? '1px solid #ff4d4d' : '1px solid rgba(255,255,255,0.05)',
                                    padding: '0.9rem 1.2rem',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxShadow: inputError ? '0 0 15px rgba(255, 77, 77, 0.15)' : 'none'
                                }}
                            />
                            <button
                                onClick={handleAddHabit}
                                className="mobile-full-width initiate-btn"
                                style={{
                                    background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                                    color: '#000',
                                    padding: '0 2rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: '900',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 25px rgba(0,210,255,0.15)'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Initiate Habit
                            </button>
                        </div>

                        <div style={{ overflowX: 'auto', borderRadius: '2rem', border: '1px solid rgba(255, 255, 255, 0.05)', background: '#080809', marginBottom: '2rem', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                            <div style={{ minWidth: 'fit-content' }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '280px repeat(' + daysInMonth + ', 36px) 140px',
                                    padding: '1.2rem 0',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    background: 'rgba(255,255,255,0.01)',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ paddingLeft: '1.5rem', fontSize: '0.75rem', fontWeight: '900', color: '#333', letterSpacing: '2px' }}>CORE HABIT</div>
                                    {dayNumbers.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: '900', color: '#333' }}>{d}</div>)}
                                    <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: '900', color: '#333', letterSpacing: '2px' }}>STATUS</div>
                                </div>

                                {habits.length > 0 ? (
                                    habits.map(habit => {
                                        const mPre = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;
                                        const comp = (habit.completedDates || []).filter(d => d.startsWith(mPre)).length;
                                        const prog = Math.min(100, Math.round((comp / daysInMonth) * 100));
                                        return (
                                            <div key={habit._id} style={{
                                                display: 'grid',
                                                gridTemplateColumns: '280px repeat(' + daysInMonth + ', 36px) 140px',
                                                padding: '1.2rem 0',
                                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ paddingLeft: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        {editingHabitId === habit._id ? (
                                                            <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={() => handleUpdateTitle(habit._id)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle(habit._id)} style={{ background: '#000', border: '1px solid #00ccff', color: '#fff', padding: '6px 12px', borderRadius: '10px', width: '90%', outline: 'none', fontSize: '0.9rem' }} />
                                                        ) : (
                                                            <div style={{ overflow: 'hidden' }}>
                                                                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{habit.title}</div>
                                                                <div style={{ fontSize: '0.7rem', color: '#ff8a00', marginTop: '4px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <span style={{ filter: 'grayscale(0)' }}>🔥</span> Streak {habit.streak || 0}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.4rem', paddingRight: '1rem', flexShrink: 0 }}>
                                                        <ActionButton icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>} onClick={() => { setEditingHabitId(habit._id); setEditTitle(habit.title); }} />
                                                        <ActionButton icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>} onClick={() => handleArchive(habit._id, habit.title)} />
                                                        <ActionButton icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>} onClick={() => handleDelete(habit._id, habit.title)} isDanger />
                                                    </div>
                                                </div>
                                                {dayNumbers.map(day => {
                                                    const dStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                    const isC = (habit.completedDates || []).includes(dStr);

                                                    const tDate = new Date(currentYear, currentMonthIdx, day);
                                                    tDate.setHours(0, 0, 0, 0);
                                                    const tDay = new Date();
                                                    tDay.setHours(0, 0, 0, 0);
                                                    const diff = (tDay - tDate) / (1000 * 3600 * 24);
                                                    const isLocked = diff < 0 || diff > 2;

                                                    return (
                                                        <div key={day} style={{ display: 'flex', justifyContent: 'center' }}>
                                                            <div
                                                                onClick={() => handleToggleDate(habit._id, day)}
                                                                style={{
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderRadius: '6px',
                                                                    cursor: isLocked ? 'not-allowed' : 'pointer',
                                                                    background: isC ? 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)' : 'rgba(255,255,255,0.02)',
                                                                    border: isC ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: '900',
                                                                    color: isC ? '#000' : (isLocked ? '#222' : '#444'),
                                                                    transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    boxShadow: isC ? '0 0 15px rgba(0, 204, 255, 0.2)' : 'none',
                                                                    opacity: isLocked ? 0.2 : 1,
                                                                    filter: isLocked ? 'grayscale(1)' : 'none'
                                                                }}
                                                            >
                                                                {day}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', margin: '0 auto 8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                        <div style={{ width: `${prog}%`, height: '100%', background: 'linear-gradient(90deg, #00d2ff, #3a7bd5)', borderRadius: '10px' }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '1rem', fontWeight: '900', color: '#00ccff', letterSpacing: '-0.5px' }}>{prog}%</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{
                                        padding: '5rem 0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0.5
                                    }}>
                                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem' }}>
                                            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                                            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                                            <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"></path>
                                            <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"></path>
                                        </svg>
                                        <div style={{ fontWeight: '700', color: '#555', fontSize: '1.1rem' }}>No habits yet. Start by adding one above!</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <PerformanceInsights habits={habits} currentMonthIdx={currentMonthIdx} currentYear={currentYear} />
                </div>
            </main>
            <Footer />
        </div>
    );
};

const PerformanceInsights = React.memo(({ habits, currentMonthIdx, currentYear }) => {
    // 1. Monthly Progress Data
    const monthlyProgressData = React.useMemo(() => habits.map(h => {
        const mPre = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;
        const compCount = (h.completedDates || []).filter(d => d.startsWith(mPre)).length;
        const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
        return {
            name: h.title.length > 5 ? h.title.slice(0, 5) + '..' : h.title,
            fullName: h.title,
            progress: Math.round((compCount / daysInMonth) * 100)
        };
    }), [habits, currentMonthIdx, currentYear]);

    // 2. Weekly Progress Calculation (current month)
    const weeklyProgressData = React.useMemo(() => {
        const weeks = [1, 2, 3, 4];
        return weeks.map(w => {
            let totalComp = 0;
            habits.forEach(h => {
                const mPre = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;
                const weekComp = (h.completedDates || []).filter(d => {
                    if (!d.startsWith(mPre)) return false;
                    const day = parseInt(d.split('-')[2]);
                    return day > (w - 1) * 7 && day <= w * 7;
                }).length;
                totalComp += weekComp;
            });
            const totalPossible = habits.length * 7 || 1;
            return {
                name: `W${w}`,
                progress: Math.round((totalComp / totalPossible) * 100)
            };
        });
    }, [habits, currentMonthIdx, currentYear]);

    // 3. Most Missed (Current Month)
    const mostMissedData = React.useMemo(() => habits.map(h => {
        const mPre = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;
        let misses = 0;
        const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();

        for (let d = 1; d <= daysInMonth; d++) {
            const dStr = `${mPre}-${String(d).padStart(2, '0')}`;
            const targetDate = new Date(currentYear, currentMonthIdx, d);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Only count as missed if the date is in the past or today and not completed
            if (targetDate <= today && !(h.completedDates || []).includes(dStr)) {
                misses++;
            }
        }
        return {
            name: h.title.length > 4 ? h.title.slice(0, 3) + '..' : h.title,
            fullName: h.title,
            misses
        };
    }).sort((a, b) => b.misses - a.misses).slice(0, 5), [habits, currentMonthIdx, currentYear]);

    // 4. Consistency Pie (Current Month)
    const consistencyData = React.useMemo(() => {
        let totalCompletions = 0;
        const mPre = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;
        habits.forEach(h => {
            (h.completedDates || []).forEach(d => {
                if (d.startsWith(mPre)) totalCompletions++;
            });
        });

        const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
        const today = new Date();
        const currentDay = today.getMonth() === currentMonthIdx ? today.getDate() : daysInMonth;
        const totalPossibleOverall = habits.length * currentDay || 1;

        return [
            { name: 'Consistent', value: totalCompletions },
            { name: 'Missed', value: Math.max(0, totalPossibleOverall - totalCompletions) }
        ];
    }, [habits, currentMonthIdx, currentYear]);

    // Helper: Recommended Action
    const recAction = React.useMemo(() => {
        const leastConsistent = [...monthlyProgressData].sort((a, b) => a.progress - b.progress)[0];
        return leastConsistent ? `Focus on ${leastConsistent.fullName}. Persistence is the foundation of growth.` : "Excellence achieved! Your consistency is exemplary.";
    }, [monthlyProgressData]);

    return (
        <div style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
                <div style={{ padding: '12px', background: 'rgba(0, 204, 255, 0.1)', borderRadius: '16px', border: '1px solid rgba(0, 204, 255, 0.2)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ccff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20v-4"></path></svg>
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px' }}>Performance <span style={{ color: '#00ccff', textShadow: '0 0 20px rgba(0, 204, 255, 0.3)' }}>Insights</span></h2>
            </div>

            {/* Top Charts Row */}
            <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem', marginBottom: '1.5rem' }}>
                <InsightCard title="MONTHLY PROGRESS">
                    <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={monthlyProgressData} margin={{ left: 0, right: 10 }}>
                            <defs>
                                <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00d2ff" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#3a7bd5" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 9, fontWeight: 700 }} />
                            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 9, fontWeight: 700 }} tickFormatter={(val) => `${val}%`} width={50} />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.01)' }} />
                            <Bar dataKey="progress" fill="url(#barBlue)" radius={[8, 8, 0, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </InsightCard>

                <InsightCard title="WEEKLY PROGRESS">
                    <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={weeklyProgressData} margin={{ left: 0, right: 10 }}>
                            <defs>
                                <linearGradient id="barPurple" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8e2de2" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#4a00e0" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 9, fontWeight: 700 }} />
                            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 9, fontWeight: 700 }} tickFormatter={(val) => `${val}%`} width={50} />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.01)' }} />
                            <Bar dataKey="progress" fill="url(#barPurple)" radius={[8, 8, 0, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </InsightCard>

                <InsightCard title="MOST MISSED">
                    <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={mostMissedData} layout="vertical" margin={{ left: -10, right: 20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="barRed" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#ff416c" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#ff4b2b" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 9, fontWeight: 700 }} domain={[0, new Date(currentYear, currentMonthIdx + 1, 0).getDate()]} />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 9, fontWeight: 700 }} width={40} />
                            <RechartsTooltip content={<CustomTooltip unit=" misses" />} cursor={{ fill: 'rgba(255,255,255,0.01)' }} />
                            <Bar dataKey="misses" fill="url(#barRed)" radius={[0, 8, 8, 0]} barSize={18} />
                        </BarChart>
                    </ResponsiveContainer>
                </InsightCard>

                <InsightCard title="CONSISTENCY">
                    <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                            <defs>
                                <linearGradient id="pieBlue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00d2ff" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#3a7bd5" stopOpacity={1} />
                                </linearGradient>
                                <linearGradient id="pieRed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ff416c" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#ff4b2b" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <Pie
                                data={consistencyData}
                                innerRadius={42}
                                outerRadius={58}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill="url(#pieBlue)" />
                                <Cell fill="url(#pieRed)" />
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip unit=" units" />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#555', fontWeight: 800 }}>
                            <span style={{ width: 7, height: 7, background: '#00ccff', borderRadius: '50%' }}></span> Consistent
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#555', fontWeight: 800 }}>
                            <span style={{ width: 7, height: 7, background: '#ff4d4d', borderRadius: '50%' }}></span> Missed
                        </div>
                    </div>
                </InsightCard>
            </div>

            {/* Bottom Insight Summaries */}
            <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1.2rem' }}>
                <SummaryCard title="⚠️ Missed Most" color="#ff4d4d">
                    {mostMissedData.map((d, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: 800, color: '#aaa' }}>{d.fullName}</span>
                            <span style={{ color: '#ff4d4d', fontWeight: 900 }}>{Math.round((d.misses / 30) * 100)}%</span>
                        </div>
                    ))}
                </SummaryCard>

                <SummaryCard title="💡 Recommended Action" color="#00ccff">
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <p style={{ color: '#fff', fontSize: '1rem', fontWeight: '500', lineHeight: '1.4', margin: 0 }}>{recAction}</p>
                    </div>
                </SummaryCard>

                <SummaryCard title="⭐ Top Consistent" color="#ffd700">
                    {[...monthlyProgressData].sort((a, b) => b.progress - a.progress).slice(0, 5).map((d, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: 800, color: '#aaa' }}>{d.fullName}</span>
                            <span style={{ color: '#00ccff', fontWeight: 900 }}>{d.progress}%</span>
                        </div>
                    ))}
                </SummaryCard>
            </div>
        </div>
    );
});

const InsightCard = ({ title, children }) => (
    <div
        className="insight-card-premium"
        style={{
            background: 'linear-gradient(165deg, rgba(13, 13, 15, 0.8) 0%, rgba(5, 5, 5, 0.9) 100%)',
            backdropFilter: 'blur(30px)',
            borderRadius: '2rem',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.02), 0 20px 40px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <div style={{ width: '4px', height: '14px', background: '#00ccff', borderRadius: '4px', boxShadow: '0 0 10px rgba(0, 204, 255, 0.5)' }}></div>
            <h3 style={{ fontSize: '0.7rem', fontWeight: '900', color: '#666', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>{title}</h3>
        </div>
        {children}
        <style>{`
            .insight-card-premium:hover {
                transform: translateY(-8px) scale(1.02);
                border-color: rgba(0, 204, 255, 0.3);
                background: linear-gradient(165deg, rgba(13, 13, 15, 0.95) 0%, rgba(5, 5, 5, 1) 100%);
                box-shadow: inset 0 0 20px rgba(0, 204, 255, 0.05), 0 30px 60px rgba(0, 0, 0, 0.6);
            }
        `}</style>
    </div>
);

const SummaryCard = ({ title, color, children }) => (
    <div
        className="summary-card-lux"
        style={{
            background: 'rgba(10, 10, 12, 0.7)',
            backdropFilter: 'blur(40px)',
            borderRadius: '2rem',
            padding: '2rem',
            border: `1px solid rgba(255, 255, 255, 0.05)`,
            borderTop: `2px solid ${color}`,
            transition: 'all 0.4s ease',
            minHeight: '180px',
            position: 'relative',
            boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column'
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <div style={{ width: '10px', height: '10px', background: color, borderRadius: '50%', boxShadow: `0 0 15px ${color}` }}></div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '900', color: color, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h3>
        </div>
        <div style={{ flex: 1 }}>
            {children}
        </div>
        <style>{`
            .summary-card-lux:hover {
                background: rgba(10, 10, 12, 0.95);
                border-color: ${color}66;
                transform: translateY(-5px);
                box-shadow: 0 20px 45px rgba(0,0,0,0.5), inset 0 0 15px ${color}11;
            }
        `}</style>
    </div>
);

const CustomTooltip = ({ active, payload, unit = '%' }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: '#0a0a0c',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '8px 12px',
                borderRadius: '12px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 10000
            }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, color: '#fff', marginBottom: '2px' }}>{payload[0].payload.fullName || payload[0].payload.name}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: '#00ccff' }}>{payload[0].value}{unit}</p>
            </div>
        );
    }
    return null;
};

const ActionButton = ({ icon, onClick, isDanger }) => (
    <button onClick={onClick} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', color: '#444', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={(e) => { e.currentTarget.style.color = isDanger ? '#ff4d4d' : '#fff'; e.currentTarget.style.background = isDanger ? 'rgba(255,77,77,0.1)' : 'rgba(255,255,255,0.05)'; }} onMouseOut={(e) => { e.currentTarget.style.color = '#444'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>{icon}</button>
);

export default Dashboard;

