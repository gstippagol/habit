import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import * as api from '../services/api';
import Footer from '../components/Footer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Link } from 'react-router-dom';

const History = () => {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    const now = new Date();
    const [inputMonth, setInputMonth] = useState(now.getMonth());
    const [inputYear, setInputYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i);

    const quotes = [
        "First we make our habits, then our habits make us.",
        "Success is the sum of small efforts, repeated day in and day out.",
        "Motivation is what gets you started. Habit is what keeps you going.",
        "Your future is found in your daily routine.",
        "Small steps in the right direction can turn out to be the biggest step of your life.",
        "The secret of your future is hidden in your daily routine.",
        "Discipline is choosing between what you want now and what you want most."
    ];

    const activeHabitsForPeriod = habits.filter(h => {
        if (h.isDeleted) return false; // Hide all deleted/bin habits from history

        const createDate = new Date(h.createdAt);
        const periodEnd = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

        // Created before or during this month OR has completions in this month
        const mPre = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
        const hasCompletions = (h.completedDates || []).some(d => d.startsWith(mPre));

        return (createDate <= periodEnd) || hasCompletions;
    });

    const handleShowActivity = () => {
        setSelectedMonth(inputMonth);
        setSelectedYear(inputYear);
    };

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF('l', 'mm', 'a4');
            doc.setFontSize(22);
            doc.setTextColor(0, 204, 255);
            doc.text('HABIT TRACKER - ACTIVITY REPORT', 14, 20);
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(`Period: ${monthNames[selectedMonth]} ${selectedYear}`, 14, 28);

            const headers = [['Date', ...activeHabitsForPeriod.map(h => h.title)]];
            const data = dayNumbers.map(day => {
                const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                return [
                    String(day).padStart(2, '0'),
                    ...activeHabitsForPeriod.map(h => {
                        const createDateOnly = new Date(h.createdAt).toISOString().split('T')[0];
                        if (dateStr < createDateOnly) return '-';
                        const isComp = (h.completedDates || []).includes(dateStr);
                        return isComp ? 'YES' : 'NO';
                    })
                ];
            });

            const totalsRow = ['TOTAL', ...activeHabitsForPeriod.map(h => {
                const mPre = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
                const count = (h.completedDates || []).filter(d => d.startsWith(mPre)).length;
                const pct = Math.round((count / daysInMonth) * 100);
                return `${count}/${daysInMonth} (${pct}%)`;
            })];
            data.push(totalsRow);

            autoTable(doc, {
                head: headers,
                body: data,
                startY: 35,
                theme: 'grid',
                headStyles: { fillColor: [10, 10, 12], textColor: [0, 204, 255], fontSize: 8, fontStyle: 'bold' },
                bodyStyles: { fontSize: 7, textColor: [50, 50, 50] },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                columnStyles: { 0: { fontStyle: 'bold', textColor: [0, 0, 0] } },
                didParseCell: (data) => {
                    if (data.row.index === dayNumbers.length) {
                        data.cell.styles.fillColor = [230, 247, 255];
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.textColor = [0, 102, 128];
                    }
                    if (data.cell.text[0] === 'YES') {
                        data.cell.styles.textColor = [0, 153, 51];
                        data.cell.styles.fontStyle = 'bold';
                    } else if (data.cell.text[0] === 'NO') {
                        data.cell.styles.textColor = [204, 0, 0];
                    }
                }
            });

            const finalY = (doc).lastAutoTable.finalY || 150;
            const drawChart = (doc, startY) => {
                const chartWidth = 250;
                const barSpacing = 8;
                const barHeight = 8;
                activeHabitsForPeriod.forEach((habit, index) => {
                    const mPre = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
                    const count = (habit.completedDates || []).filter(d => d.startsWith(mPre)).length;
                    const pct = Math.round((count / daysInMonth) * 100);
                    const currentY = startY + (index * (barHeight + barSpacing));
                    doc.setFontSize(8); doc.setTextColor(80);
                    doc.text(habit.title.toUpperCase(), 14, currentY + 6);
                    doc.setFillColor(240, 240, 240); doc.rect(50, currentY, chartWidth * 0.8, barHeight, 'F');
                    doc.setFillColor(0, 204, 255); doc.rect(50, currentY, (chartWidth * 0.8) * (pct / 100), barHeight, 'F');
                    doc.setTextColor(0, 102, 128); doc.setFontSize(7);
                    doc.text(`${pct}%`, 50 + (chartWidth * 0.8) + 5, currentY + 6);
                });
            };

            if (finalY + 15 + 80 > doc.internal.pageSize.getHeight()) {
                doc.addPage();
                doc.setFontSize(14); doc.setTextColor(10, 10, 12);
                doc.text('MONTHLY PERFORMANCE CHART', 14, 20);
                drawChart(doc, 30);
            } else {
                doc.setDrawColor(220); doc.line(14, finalY + 5, 280, finalY + 5);
                doc.setFontSize(14); doc.setTextColor(10, 10, 12);
                doc.text('MONTHLY PERFORMANCE CHART', 14, finalY + 15);
                drawChart(doc, finalY + 25);
            }

            doc.save(`Habit_Ledger_${monthNames[selectedMonth]}_${selectedYear}.pdf`);
        } catch (error) {
            console.error("PDF Export failed:", error);
            alert("Failed to export PDF. Please check your habit data.");
        }
    };

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await api.fetchHabits();
            setHabits(data);
        } catch (err) {
            console.error("Failed to load history data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(habits.length > 0);
    }, [loadData]);

    if (loading && habits.length === 0) {
        return (
            <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid #00ccff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                    <h2 style={{ color: '#00ccff', fontWeight: '800' }}>Loading History...</h2>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem' }}>
                <div style={{ background: 'rgba(13, 13, 15, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '2rem', padding: '2rem' }}>
                    <header className="mobile-stack" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div className="mobile-text-center">
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0 }}>
                                Habit <span style={{ color: '#00ccff' }}>Ledger</span>
                            </h1>
                            <p style={{ color: '#555', fontWeight: '700', marginTop: '5px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                Interactive Historical Analytics
                                <span className="mobile-hide" style={{ color: '#aaa', marginLeft: '10px', textTransform: 'none', letterSpacing: '0' }}>
                                    Viewing: {monthNames[selectedMonth]} {selectedYear}
                                </span>
                            </p>
                        </div>
                        <div className="mobile-stack" style={{ display: 'flex', gap: '30px', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.65rem', fontWeight: '900', color: '#444', letterSpacing: '1.5px' }}>PERIOD</label>
                                    <select
                                        value={inputMonth}
                                        onChange={(e) => setInputMonth(parseInt(e.target.value))}
                                        style={{ background: '#0a0a0c', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', outline: 'none', cursor: 'pointer', minWidth: '130px' }}
                                    >
                                        {monthNames.map((name, i) => <option key={name} value={i}>{name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.65rem', fontWeight: '900', color: '#444', letterSpacing: '1.5px' }}>YEAR</label>
                                    <select
                                        value={inputYear}
                                        onChange={(e) => setInputYear(parseInt(e.target.value))}
                                        style={{ background: '#0a0a0c', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', outline: 'none', cursor: 'pointer', minWidth: '100px' }}
                                    >
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="mobile-stack" style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                <button onClick={handleShowActivity} style={{ background: '#00ccff', color: '#000', border: 'none', padding: '10px 25px', borderRadius: '12px', fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', height: '43px' }}>Show Activity</button>
                                <button onClick={handleExportPDF} style={{ background: 'transparent', color: '#00ccff', border: '1px solid rgba(0, 204, 255, 0.3)', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', height: '43px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                    Export PDF
                                </button>
                            </div>
                        </div>
                    </header>
                    {activeHabitsForPeriod.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '8rem 2rem', background: 'rgba(255,255,255,0.01)', borderRadius: '2rem', border: '1px dashed rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '2rem', filter: 'grayscale(1)', opacity: 0.3 }}>🏛️</div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '1.2rem', color: '#333', letterSpacing: '-1px' }}>No Records for {monthNames[selectedMonth]}</h2>
                            <p style={{ maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: '1.8', color: '#00ccff', fontSize: '1.1rem', fontStyle: 'italic', fontWeight: '600' }}>"{quotes[Math.floor(Math.random() * quotes.length)]}"</p>
                            <Link to="/dashboard" style={{ textDecoration: 'none', background: '#00ccff', color: '#000', padding: '1rem 2.5rem', borderRadius: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Begin New Journey</Link>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto', borderRadius: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.05)', background: '#080809' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <th style={{ padding: '1.5rem 2.5rem', color: '#333', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px' }}>DATE</th>
                                        {activeHabitsForPeriod.map(habit => (
                                            <th key={habit._id} style={{ padding: '1.5rem 1.5rem', color: '#00ccff', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                                {habit.title}
                                                {habit.isDeleted && <span style={{ display: 'block', fontSize: '0.6rem', color: '#ff4d4d', marginTop: '4px' }}>(DELETED)</span>}
                                                {habit.isArchived && <span style={{ display: 'block', fontSize: '0.6rem', color: '#888', marginTop: '4px' }}>(ARCHIVED)</span>}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dayNumbers.map(day => {
                                        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        return (
                                            <tr key={day} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: '0.2s' }}>
                                                <td style={{ padding: '1.2rem 2.5rem', fontWeight: '800', color: '#444' }}>{String(day).padStart(2, '0')}</td>
                                                {activeHabitsForPeriod.map(habit => {
                                                    const creationDateOnly = new Date(habit.createdAt).toISOString().split('T')[0];
                                                    const isBeforeCreation = dateStr < creationDateOnly;
                                                    const isCompleted = (habit.completedDates || []).includes(dateStr);
                                                    return (
                                                        <td key={habit._id} style={{ padding: '1.2rem 1.5rem' }}>
                                                            {isBeforeCreation ? <span style={{ color: '#222', fontWeight: '900', fontSize: '1rem' }}>-</span> : (
                                                                <span style={{ padding: '6px 16px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', background: isCompleted ? 'rgba(0, 204, 255, 0.1)' : 'rgba(239, 68, 68, 0.05)', color: isCompleted ? '#00ccff' : '#444', border: isCompleted ? '1px solid rgba(0, 204, 255, 0.2)' : '1px solid rgba(239, 68, 68, 0.1)' }}>
                                                                    {isCompleted ? 'YES' : 'NO'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr style={{ background: 'rgba(0, 204, 255, 0.03)', borderTop: '2px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1.5rem 2.5rem', fontWeight: '900', color: '#00ccff', fontSize: '0.8rem', letterSpacing: '1px' }}>TOTAL</td>
                                        {activeHabitsForPeriod.map(habit => {
                                            const mPre = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
                                            const compCount = (habit.completedDates || []).filter(d => d.startsWith(mPre)).length;
                                            const percentage = Math.round((compCount / daysInMonth) * 100);
                                            return (
                                                <td key={habit._id} style={{ padding: '1.5rem 1.5rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{ color: '#fff', fontWeight: '900', fontSize: '1rem' }}>{compCount}/{daysInMonth}</span>
                                                        <span style={{ color: '#00ccff', fontWeight: '800', fontSize: '0.7rem', opacity: 0.8 }}>({percentage}%)</span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default History;
