import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from "../../../lib/api";

const AdminAcademicSettings = () => {
  const { t } = useTranslation('admin');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const syncLang = () => { const lang = readStoredLanguage('adminLang', 'en'); if (i18n.language !== lang) i18n.changeLanguage(lang); };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/settings/academic");
      const d = res.data?.data || {};
      setSettings({
        enableAcademicYear: d.enableAcademicYear ?? true,
        academicYearLabel: d.academicYearLabel || 'Academic Year 2024-2025',
        termStructure: d.termStructure || 'semester',
        termsPerYear: d.termsPerYear || 2,
        enableGrading: d.enableGrading ?? true,
        gradingSystem: d.gradingSystem || 'letter',
        passPercentage: d.passPercentage || 40,
        maxGradePoints: d.maxGradePoints || 4.0,
        enablePromotion: d.enablePromotion ?? true,
        minPromotionAverage: d.minPromotionAverage || 50,
        maxFailSubjects: d.maxFailSubjects || 2,
        enableAttendanceTracking: d.enableAttendanceTracking ?? true,
        minAttendancePercent: d.minAttendancePercent || 75,
        classDurationMinutes: d.classDurationMinutes || 45,
        maxStudentsPerClass: d.maxStudentsPerClass || 30,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put("/admin/settings/academic", settings);
      setMessage('success');
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, name, type = 'text', placeholder, options, note }) => (
    <div className="mb-3">
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {type === 'select' ? (
        <select name={name} value={settings?.[name] || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">{options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      ) : type === 'checkbox' ? (
        <label className="flex items-center gap-3"><input type="checkbox" name={name} checked={!!settings?.[name]} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-cyan-600" /><span className="text-sm text-slate-700">{note || label}</span></label>
      ) : (
        <input type={type} name={name} value={settings?.[name] || ''} onChange={handleChange} placeholder={placeholder} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      )}
    </div>
  );

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-slate-400">{t('common.loading')}</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">{t('settings.academicSettings')}</h1><p className="mt-1 text-sm text-slate-500">{t('settings.configureAcademic')}</p></div>
        <div className="flex items-center gap-3">
          {message === 'success' && <span className="text-sm font-medium text-emerald-600">{t('common.saved')}</span>}
          {message === 'error' && <span className="text-sm font-medium text-red-600">{t('common.error')}</span>}
          <button onClick={handleSave} disabled={saving} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700 disabled:opacity-50">{saving ? t('common.saving') : t('common.saveSettings')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.academicYear')}</h2>
          <Field label={t('settings.enableAcademicYear')} name="enableAcademicYear" type="checkbox" />
          <Field label={t('settings.academicYearLabel')} name="academicYearLabel" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.termStructure')}</h2>
          <Field label={t('settings.termStructure')} name="termStructure" type="select" options={[{ value: 'semester', label: 'Semester' }, { value: 'trimester', label: 'Trimester' }, { value: 'quarter', label: 'Quarter' }]} />
          <Field label={t('settings.termsPerYear')} name="termsPerYear" type="number" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.gradingPolicy')}</h2>
          <Field label={t('settings.enableGradingPolicy')} name="enableGrading" type="checkbox" />
          <Field label={t('settings.gradingSystem')} name="gradingSystem" type="select" options={[{ value: 'letter', label: 'Letter (A, B, C, D, F)' }, { value: 'percentage', label: 'Percentage' }, { value: 'gpa', label: 'GPA (4.0 Scale)' }]} />
          <Field label={t('settings.passPercentage')} name="passPercentage" type="number" />
          {settings?.gradingSystem === 'gpa' && <Field label={t('settings.maxGradePoints')} name="maxGradePoints" type="number" step="0.1" />}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.promotionRules')}</h2>
          <Field label={t('settings.enablePromotionRules')} name="enablePromotion" type="checkbox" />
          <Field label={t('settings.minPromotionAverage')} name="minPromotionAverage" type="number" />
          <Field label={t('settings.maxFailSubjects')} name="maxFailSubjects" type="number" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.attendanceConfig')}</h2>
          <Field label={t('settings.enableAttendanceTracking')} name="enableAttendanceTracking" type="checkbox" />
          <Field label={t('settings.minAttendancePercent')} name="minAttendancePercent" type="number" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">{t('settings.classConfig')}</h2>
          <Field label={t('settings.classDuration')} name="classDurationMinutes" type="number" />
          <Field label={t('settings.maxStudentsPerClass')} name="maxStudentsPerClass" type="number" />
        </div>
      </div>
    </div>
  );
};

export default AdminAcademicSettings;
