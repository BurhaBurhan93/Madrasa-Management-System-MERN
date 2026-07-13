import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const IMG_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const calcGrade = (pct) => {
  if (pct >= 90) return 'A+'; if (pct >= 80) return 'A'; if (pct >= 70) return 'B';
  if (pct >= 60) return 'C'; if (pct >= 50) return 'D'; return 'F';
};

const gradeColors = {
  'A+': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'A': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'B': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  'C': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'D': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'F': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const MOCK = {
  exams: [{ _id: 'e1', title: 'Mid-Term Quran Tafsir' }, { _id: 'e2', title: 'Final Hadith Studies' }, { _id: 'e3', title: 'Quiz - Fiqh' }],
  subjects: [{ _id: 's1', name: 'Quran Tafsir' }, { _id: 's2', name: 'Hadith Studies' }, { _id: 's3', name: 'Fiqh' }, { _id: 's4', name: 'Arabic Language' }],
  classes: [{ _id: 'c1', name: 'Class 10', section: 'A' }, { _id: 'c2', name: 'Class 10', section: 'B' }, { _id: 'c3', name: 'Class 9', section: 'A' }],
  students: [
    { _id: 'st1', user: { name: 'Ahmad Khan', email: 'ahmad@madrasa.edu', phone: '+93-700-111-111' }, studentCode: 'STU-001', fatherName: 'Mohammad Khan', grandfatherName: 'Abdul Khan', dob: '2008-03-15', bloodType: 'A+', image: '', admissionDate: '2024-01-10', currentLevel: 'Level 3', status: 'active', guardianName: 'Mohammad Khan', guardianPhone: '+93-700-111-000' },
    { _id: 'st2', user: { name: 'Fatima Al-Hassan', email: 'fatima@madrasa.edu', phone: '+93-700-222-222' }, studentCode: 'STU-002', fatherName: 'Hassan Ali', grandfatherName: 'Ali Hassan', dob: '2009-07-22', bloodType: 'O+', image: '', admissionDate: '2024-01-10', currentLevel: 'Level 2', status: 'active', guardianName: 'Hassan Ali', guardianPhone: '+93-700-222-000' },
    { _id: 'st3', user: { name: 'Yusuf Ibrahim', email: 'yusuf@madrasa.edu', phone: '+93-700-333-333' }, studentCode: 'STU-003', fatherName: 'Ibrahim Khalil', grandfatherName: 'Khalil Ibrahim', dob: '2007-11-05', bloodType: 'B+', image: '', admissionDate: '2023-09-01', currentLevel: 'Level 4', status: 'active', guardianName: 'Ibrahim Khalil', guardianPhone: '+93-700-333-000' },
    { _id: 'st4', user: { name: 'Aisha Omar', email: 'aisha@madrasa.edu', phone: '+93-700-444-444' }, studentCode: 'STU-004', fatherName: 'Omar Abdullah', grandfatherName: 'Abdullah Omar', dob: '2008-01-30', bloodType: 'AB+', image: '', admissionDate: '2024-01-10', currentLevel: 'Level 3', status: 'active', guardianName: 'Omar Abdullah', guardianPhone: '+93-700-444-000' },
    { _id: 'st5', user: { name: 'Bilal Hussain', email: 'bilal@madrasa.edu', phone: '+93-700-555-555' }, studentCode: 'STU-005', fatherName: 'Hussain Ahmed', grandfatherName: 'Ahmed Hussain', dob: '2009-05-18', bloodType: 'A-', image: '', admissionDate: '2024-01-10', currentLevel: 'Level 2', status: 'active', guardianName: 'Hussain Ahmed', guardianPhone: '+93-700-555-000' },
  ],
};

const fieldCls = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/30';
const labelCls = 'mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400';

const StudentAvatar = ({ src, name, size = 'h-9 w-9' }) => {
  if (src) {
    const url = src.startsWith('http') ? src : `${IMG_URL}${src}`;
    return <img src={url} alt={name} className={`${size} rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700`} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />;
  }
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-100 dark:ring-slate-700`}>
      {name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
    </div>
  );
};

const TeacherEnterMarks = () => {
  const { t } = useTranslation();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [totals, setTotals] = useState({});
  const [defaultTotal, setDefaultTotal] = useState(100);
  const [examId, setExamId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    Promise.all([
      apiFetch('/teacher/exams').then(parseJsonSafe),
      apiFetch('/teacher/subjects').then(parseJsonSafe),
      apiFetch('/teacher/classes').then(parseJsonSafe),
    ]).then(([e, s, c]) => {
      setExams(e.success && e.data?.length ? e.data : MOCK.exams);
      setSubjects(s.success && s.data?.length ? s.data : MOCK.subjects);
      setClasses(c.success && c.data?.length ? c.data : MOCK.classes);
    }).catch(() => { setExams(MOCK.exams); setSubjects(MOCK.subjects); setClasses(MOCK.classes); });
  }, []);

  const loadStudents = async () => {
    if (!classId) { alert(t('teacher.enterMarks.selectClassFirst')); return; }
    if (!examId) { alert(t('teacher.enterMarks.selectExamFirst')); return; }
    if (!subjectId) { alert(t('teacher.enterMarks.selectSubjectFirst')); return; }
    setLoading(true);
    try {
      const [studentsRes, resultsRes] = await Promise.all([
        apiFetch('/teacher/students?classId=' + classId).then(parseJsonSafe),
        apiFetch('/teacher/results?examId=' + examId + '&subjectId=' + subjectId + '&classId=' + classId).then(parseJsonSafe),
      ]);
      const list = studentsRes.success && studentsRes.data?.length ? studentsRes.data : MOCK.students;
      setStudents(list);
      const m = {}; const t = {};
      list.forEach(s => { m[s._id] = ''; t[s._id] = defaultTotal; });
      if (resultsRes.success) {
        resultsRes.data.forEach(r => {
          if (r.student?._id) { m[r.student._id] = r.totalScore ?? ''; t[r.student._id] = r.totalMarks || defaultTotal; }
        });
      }
      setMarks(m);
      setTotals(t);
    } catch {
      setStudents(MOCK.students);
      const m = {}; const t = {};
      MOCK.students.forEach(s => { m[s._id] = ''; t[s._id] = defaultTotal; });
      setMarks(m); setTotals(t);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!examId || !subjectId || !classId) { alert(t('teacher.enterMarks.selectExamFirst')); return; }
    if (!students.length) { alert(t('teacher.enterMarks.noStudents')); return; }
    setSaving(true);
    try {
      const marksArr = students.map(s => ({
        student: s._id,
        totalScore: Number(marks[s._id] || 0),
        totalMarks: Number(totals[s._id] || 100),
      }));
      const res = await apiFetch('/teacher/results/save-marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, subjectId, classId, marks: marksArr }),
      });
      const data = await parseJsonSafe(res);
      if (data.success) alert(t('teacher.enterMarks.savedSuccessfully'));
      else alert(data.message || t('teacher.enterMarks.saveFailed'));
    } catch { alert(t('teacher.enterMarks.saveFailed')); } finally { setSaving(false); }
  };

  const summary = useMemo(() => {
    const entered = students.filter(s => marks[s._id] !== '' && marks[s._id] !== undefined);
    const vals = entered.map(s => ({ score: Number(marks[s._id] || 0), total: Number(totals[s._id] || 100) }));
    const avg = vals.length ? (vals.reduce((a, v) => a + v.score, 0) / vals.length).toFixed(1) : 0;
    const pass = vals.filter(v => v.total > 0 && (v.score / v.total) >= 0.5).length;
    return { entered: entered.length, avg, pass, fail: entered.length - pass };
  }, [marks, totals, students]);

  const selectedExamName = exams.find(e => e._id === examId)?.title || '';
  const selectedSubjectName = subjects.find(s => s._id === subjectId)?.name || '';
  const selectedClassName = classes.find(c => c._id === classId) || {};

  const formatDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return d; } };

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('teacher.enterMarks.title')}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('teacher.enterMarks.subtitle')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{today}</p>
            {selectedExamName && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedExamName}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Exam Selection */}
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {t('teacher.enterMarks.examInfo')}
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
              <div>
                <label className={labelCls}>{t('teacher.enterMarks.exam')} *</label>
                <select value={examId} onChange={e => setExamId(e.target.value)} className={fieldCls} required>
                  <option value="">{t('teacher.enterMarks.selectExam')}</option>
                  {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t('teacher.enterMarks.subject')} *</label>
                <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className={fieldCls} required>
                  <option value="">{t('teacher.enterMarks.selectSubject')}</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t('teacher.enterMarks.class')} *</label>
                <select value={classId} onChange={e => setClassId(e.target.value)} className={fieldCls} required>
                  <option value="">{t('teacher.enterMarks.selectClass')}</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name} {t('teacher.enterMarks.section')} {c.section || ''}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t('teacher.enterMarks.defaultTotalMarks')}</label>
                <input type="number" min="1" value={defaultTotal} onChange={e => setDefaultTotal(Math.max(1, Number(e.target.value)))} className={fieldCls} />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {selectedExamName && <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">{t('teacher.enterMarks.examLabel')}{selectedExamName}</span>}
                {selectedSubjectName && <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">{t('teacher.enterMarks.subjectLabel')}{selectedSubjectName}</span>}
                {selectedClassName.name && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{t('teacher.enterMarks.classLabel')}{selectedClassName.name} {selectedClassName.section || ''}</span>}
              </div>
              <button type="button" onClick={loadStudents} disabled={loading} className="rounded-2xl bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-60">
                {loading ? (
                  <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> {t('common.loading')}</span>
                ) : t('teacher.enterMarks.loadStudents')}
              </button>
            </div>
          </div>

          {/* Student Marks */}
          {students.length > 0 && (
            <>
              {/* Summary */}
              <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
                {[
                  { label: t('teacher.enterMarks.totalStudents'), value: students.length, accent: 'bg-cyan-500', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2' },
                  { label: t('teacher.enterMarks.marksEntered'), value: summary.entered, accent: 'bg-blue-500', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
                  { label: t('teacher.enterMarks.classAverage'), value: summary.avg + '%', accent: 'bg-violet-500', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
                  { label: t('teacher.enterMarks.pass'), value: summary.pass, accent: 'bg-emerald-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { label: t('teacher.enterMarks.fail'), value: summary.fail, accent: 'bg-rose-500', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
                ].map(c => (
                  <div key={c.label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                    <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
                    <div className="flex items-center gap-3">
                      <div className={`rounded-xl p-2 ${c.accent}/10`}>
                        <svg className={`h-5 w-5 ${c.accent.replace('bg-', 'text-')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} /></svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
                        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{c.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Table */}
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
                  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    {t('teacher.enterMarks.studentMarksEntry')}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">{students.length} {t('common.records')}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/50">
                        {[t('common.hash'), t('teacher.enterMarks.photo'), t('teacher.enterMarks.studentId'), t('teacher.enterMarks.studentName'), t('teacher.enterMarks.fatherName'), t('teacher.enterMarks.guardian'), t('common.phone'), t('common.class'), t('teacher.enterMarks.level'), t('teacher.enterMarks.dob'), t('teacher.enterMarks.blood'), t('teacher.enterMarks.admission'), t('common.total'), t('teacher.enterMarks.obtained'), t('teacher.enterMarks.percent'), t('common.grade'), t('common.status')].map(h => (
                          <th key={h} className="whitespace-nowrap px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {students.map((s, i) => {
                        const score = Number(marks[s._id] || 0);
                        const t = Number(totals[s._id] || 100);
                        const pct = t > 0 ? ((score / t) * 100).toFixed(1) : '0.0';
                        const hasMark = marks[s._id] !== '' && marks[s._id] !== undefined;
                        const grade = hasMark ? calcGrade(Number(pct)) : '-';
                        const pass = hasMark && Number(pct) >= 50;
                        const studentName = s.user?.name || (s.firstName && s.lastName ? `${s.firstName} ${s.lastName}` : 'Unknown');
                        const cls = s.currentClass;
                        return (
                          <tr key={s._id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                            <td className="px-3 py-3 text-slate-500 dark:text-slate-300">{i + 1}</td>
                            <td className="px-3 py-3">
                              <StudentAvatar src={s.image} name={studentName} />
                            </td>
                            <td className="px-3 py-3 font-mono text-xs font-medium text-cyan-600 dark:text-cyan-400">{s.studentCode || '-'}</td>
                            <td className="px-3 py-3">
                              <div className="font-medium text-slate-900 dark:text-slate-100">{studentName}</div>
                              {s.email && <div className="text-[10px] text-slate-400 dark:text-slate-500">{s.email}</div>}
                            </td>
                            <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{s.fatherName || '-'}</td>
                            <td className="px-3 py-3">
                              <div className="text-xs text-slate-600 dark:text-slate-300">{s.guardianName || '-'}</div>
                              {s.guardianPhone && <div className="text-[10px] text-slate-400 dark:text-slate-500">{s.guardianPhone}</div>}
                            </td>
                            <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">{s.user?.phone || s.phone || '-'}</td>
                            <td className="px-3 py-3">
                              {cls ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">{cls.name || ''} {cls.section || ''}</span> : '-'}
                            </td>
                            <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">{s.currentLevel || '-'}</td>
                            <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">{formatDate(s.dob)}</td>
                            <td className="px-3 py-3">
                              {s.bloodType ? <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">{s.bloodType}</span> : '-'}
                            </td>
                            <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">{formatDate(s.admissionDate)}</td>
                            <td className="px-3 py-3">
                              <input type="number" min="1"
                                value={totals[s._id] ?? defaultTotal}
                                onChange={e => setTotals(prev => ({ ...prev, [s._id]: Math.max(1, Number(e.target.value)) }))}
                                className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-sm text-slate-700 outline-none transition focus:border-cyan-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                            </td>
                            <td className="px-3 py-3">
                              <input type="number" min="0" max={t} value={marks[s._id]}
                                onChange={e => setMarks(prev => ({ ...prev, [s._id]: e.target.value }))}
                                className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-sm text-slate-700 outline-none transition focus:border-cyan-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200" />
                            </td>
                            <td className="px-3 py-3 font-mono text-sm font-medium text-slate-600 dark:text-slate-400">{pct}%</td>
                            <td className="px-3 py-3">
                              {hasMark && <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${gradeColors[grade]}`}>{grade}</span>}
                            </td>
                            <td className="px-3 py-3">
                              {hasMark && (
                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${pass ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                  {pass ? t('teacher.enterMarks.pass') : t('teacher.enterMarks.fail')}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-700">
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    <p className="font-medium text-slate-500 dark:text-slate-400">{t('teacher.enterMarks.gradeScale')}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Object.entries(gradeColors).map(([g, cls]) => (
                        <span key={g} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
                          {g}: {g === 'A+' ? '90+' : g === 'A' ? '80+' : g === 'B' ? '70+' : g === 'C' ? '60+' : g === 'D' ? '50+' : '<50'}%
                        </span>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={saving} className="rounded-2xl bg-cyan-600 px-8 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-60">
                    {saving ? (
                      <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> {t('common.saving')}</span>
                    ) : t('teacher.enterMarks.saveAllMarks')}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {!students.length && !loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 rounded-2xl bg-slate-100 p-5 dark:bg-slate-700/50">
                <svg className="h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-base font-medium text-slate-600 dark:text-slate-300">{t('teacher.enterMarks.noStudents')}</p>
              <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">{t('teacher.enterMarks.noStudentsHint')}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TeacherEnterMarks;
