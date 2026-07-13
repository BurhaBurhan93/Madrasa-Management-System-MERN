import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/UIHelper/Button';
import Card from '../../../components/UIHelper/Card';
import StaffPageLayout from './StaffPageLayout';
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';
import { useTheme } from '../../../contexts/ThemeContext.jsx';
import { useTranslation } from 'react-i18next';

const formatDisplayValue = (value, t) => {
  if (value === null || value === undefined || value === '') return t('staff.recordView.dash', { defaultValue: '-' });
  if (typeof value === 'boolean') return value ? t('staff.recordView.yes', { defaultValue: 'Yes' }) : t('staff.recordView.no', { defaultValue: 'No' });
  if (Array.isArray(value)) return value.length ? value.join(', ') : t('staff.recordView.dash', { defaultValue: '-' });
  if (typeof value === 'object') {
    if (value.name) return value.name;
    if (value.title) return value.title;
    if (value.fullName) return value.fullName;
    if (value.accountName) return value.accountName;
    if (value.employeeCode) return value.employeeCode;
    if (value.departmentName) return value.departmentName;
    if (value.designationTitle) return value.designationTitle;
    return JSON.stringify(value);
  }
  return String(value);
};

const loadRecordByMode = async ({ endpoint, id, readMode, readEndpoint }, t) => {
  const targetEndpoint = readEndpoint || endpoint;
  if (readMode === 'collection') {
    const res = await apiFetch(targetEndpoint);
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error(data?.message || t('staff.recordView.failedToLoadRecord', { defaultValue: 'Failed to load record' }));
    const rows = Array.isArray(data) ? data : (data?.data || []);
    const match = rows.find((row) => String(row._id) === String(id));
    if (!match) throw new Error(t('staff.recordView.recordNotFound', { defaultValue: 'Record not found' }));
    return match;
  }

  const res = await apiFetch(`${targetEndpoint}/${id}`);
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || t('staff.recordView.failedToLoadRecord', { defaultValue: 'Failed to load record' }));
  return data?.data || data;
};

const RecordViewPage = ({ title, subtitle, endpoint, id, fields = [], editPath, listPath, readMode = 'single', readEndpoint, mapRowToView }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation(['staff', 'common']);
  const isDark = theme === 'dark';

  const loadRecord = useCallback(async () => {
    setLoading(true);
    setError('');
    setItem(null);
    try {
      let record = await loadRecordByMode({ endpoint, id, readMode, readEndpoint }, t);
      if (mapRowToView) record = mapRowToView(record);
      setItem(record);
    } catch (err) {
      setError(err.message || t('staff.recordView.loadError', { defaultValue: 'Load error' }));
    } finally {
      setLoading(false);
    }
  }, [endpoint, id, readMode, readEndpoint, mapRowToView]);

  useEffect(() => { loadRecord(); }, [loadRecord]);

  if (loading) return (
    <StaffPageLayout eyebrow={t('common.recordView', { defaultValue: 'Record View' })} title={t(title, { defaultValue: title })} subtitle={subtitle ? t(subtitle, { defaultValue: subtitle }) : subtitle} tone={endpoint || title}>
      <div className={`rounded-[26px] border p-8 text-sm shadow-sm ${isDark ? 'border-slate-700 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-white text-slate-500'}`}>
        {t('common.loadingRecord', { defaultValue: 'Loading record...' })}
      </div>
    </StaffPageLayout>
  );
  if (error) return (
    <StaffPageLayout eyebrow={t('common.recordView', { defaultValue: 'Record View' })} title={t(title, { defaultValue: title })} subtitle={subtitle ? t(subtitle, { defaultValue: subtitle }) : subtitle} tone={endpoint || title}>
      <Card className="rounded-[28px] shadow-sm">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-semibold ${isDark ? 'text-rose-200' : 'text-rose-900'}`}>{t('common.unableToLoadRecord', { defaultValue: 'Unable to Load Record' })}</h3>
              <p className={`mt-1 text-sm ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>{error}</p>
              <div className="mt-3 flex gap-3">
                <button onClick={() => loadRecord()} className="inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors">
                  {t('common.retry')}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className={`inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${isDark ? 'border-rose-500/30 bg-slate-900 text-rose-200 hover:bg-slate-800' : 'border-rose-300 bg-white text-rose-700 hover:bg-rose-50'}`}
                >
                  {t('common.goBack', { defaultValue: 'Go Back' })}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </StaffPageLayout>
  );

  return (
    <StaffPageLayout eyebrow={t('common.recordView', { defaultValue: 'Record View' })} title={t(title, { defaultValue: title })} subtitle={subtitle ? t(subtitle, { defaultValue: subtitle }) : subtitle} tone={endpoint || title} actions={<>{listPath && <Button variant="outline" onClick={() => navigate(listPath)}>{t('common.backToList', { defaultValue: 'Back To List' })}</Button>}{editPath && <Button variant="primary" onClick={() => navigate(editPath)}>{t('common.updateRecord', { defaultValue: 'Update Record' })}</Button>}</>}>
      <Card className="rounded-[28px] shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fields.map((field) => (
            <div key={field.name} className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-950/60' : 'border-slate-100 bg-slate-50'}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{field.label}</p>
              <p className={`mt-3 break-words text-sm font-medium leading-6 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{field.renderView ? field.renderView(item?.[field.name], item) : formatDisplayValue(item?.[field.name], t)}</p>
            </div>
          ))}
        </div>
      </Card>
    </StaffPageLayout>
  );
};

export default RecordViewPage;
