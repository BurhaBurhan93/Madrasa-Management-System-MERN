import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const statusColors = {
  draft: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
  finished: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-rose-100 text-rose-700',
};

const TeacherExamsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        'http://localhost:5000/api/teacher/exams',
        api()
      );

      if (res.data.success) setExams(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('teacher.examsList.deleteExamConfirm'))) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/teacher/exams/${id}`,
        api()
      );

      fetchExams();
    } catch (e) {
      alert(t('teacher.examsList.failedToDelete'));
    }
  };

  const handlePublish = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/teacher/exams/${id}/publish`,
        {},
        api()
      );

      if (res.data.success) {
        alert(t('teacher.examsList.examPublished'));
        fetchExams();
      }
    } catch (e) {
      alert(e.response?.data?.message || t('teacher.examsList.failedToPublish'));
    }
  };

  const handleClose = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/teacher/exams/${id}/close`,
        {},
        api()
      );

      alert(t('examsList.examClosed'));
      fetchExams();
    } catch (e) {
      alert(t('teacher.examsList.failedToClose'));
    }
  };

  const filtered = exams.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === '' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: exams.length,
    published: exams.filter((e) => e.status === 'published').length,
    draft: exams.filter((e) => e.status === 'draft').length,
    finished: exams.filter((e) => e.status === 'finished').length,
  };

  const statCards = [
    {
      label: t('teacher.examsList.total'),
      value: stats.total,
      accent: 'bg-cyan-500',
    },
    {
      label: t('teacher.examsList.draft'),
      value: stats.draft,
      accent: 'bg-amber-500',
    },
    {
      label: t('teacher.examsList.published'),
      value: stats.published,
      accent: 'bg-emerald-500',
    },
    {
      label: t('teacher.examsList.finished'),
      value: stats.finished,
      accent: 'bg-sky-500',
    },
  ];

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t('teacher.examsList.title')}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {t('teacher.examsList.subtitle')}
            </p>
          </div>

          <button
            onClick={() => navigate('/teacher/exams/create')}
            className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md"
          >
            + {t('teacher.examsList.createExam')}
          </button>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
          {statCards.map((c) => (
            <div
              key={c.label}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                {c.value}
              </p>
            </div>
          ))}
        </section>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder={t('teacher.examsList.searchExam')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="">{t('teacher.examsList.allStatus')}</option>
              <option value="draft">{t('teacher.examsList.draft')}</option>
              <option value="published">{t('teacher.examsList.published')}</option>
              <option value="finished">{t('teacher.examsList.finished')}</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherExamsList;
