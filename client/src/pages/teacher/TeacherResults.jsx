import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiBarChart2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const TeacherResults = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      title: t('teacher.teacherResults.enterMarksTitle'),
      description: t('teacher.teacherResults.enterMarksDescription'),
      icon: FiEdit,
      accent: 'bg-cyan-500',
      tone: 'from-cyan-500 to-sky-600',
      action: () => navigate('enter-marks'),
      label: t('teacher.teacherResults.enterMarksButton')
    },
    {
      title: t('teacher.teacherResults.viewResultsTitle'),
      description: t('teacher.teacherResults.viewResultsDescription'),
      icon: FiBarChart2,
      accent: 'bg-violet-500',
      tone: 'from-violet-500 to-purple-600',
      action: () => navigate('view-results'),
      label: t('teacher.teacherResults.viewResultsButton'),
    },
  ];

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{t('teacher.teacherResults.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('teacher.teacherResults.subtitle')}</p>
        </div>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className={`absolute inset-x-0 top-0 h-1 ${card.accent}`} />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{card.description}</p>
                    <button
                      onClick={card.action}
                      className="mt-5 rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md"
                    >
                      {card.label}
                    </button>
                  </div>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-md`}>
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

      </div>
    </div>
  );
};

export default TeacherResults;
