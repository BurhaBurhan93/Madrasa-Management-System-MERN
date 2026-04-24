import React, { useEffect, useState } from 'react';
import Button from '../../../components/UIHelper/Button';
import Card from '../../../components/UIHelper/Card';
import StaffPageLayout from './StaffPageLayout';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const parseJsonSafe = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    const preview = text.slice(0, 200).replace(/\s+/g, ' ');
    throw new Error(`API returned non-JSON (status ${res.status}). Response: ${preview}`);
  }
};

const formatDisplayValue = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '-';
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

const loadRecordByMode = async ({ endpoint, id, readMode, readEndpoint }) => {
  const targetEndpoint = readEndpoint || endpoint;
  if (readMode === 'collection') {
    const res = await fetch(`${API_BASE}${targetEndpoint}`);
    const data = await parseJsonSafe(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load record');
    const rows = data.data || [];
    const match = rows.find((row) => String(row._id) === String(id));
    if (!match) throw new Error('Record not found');
    return match;
  }

  const res = await fetch(`${API_BASE}${targetEndpoint}/${id}`);
  const data = await parseJsonSafe(res);
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load record');
  return data.data;
};

const RecordViewPage = ({ title, subtitle, endpoint, id, fields = [], editPath, listPath, readMode = 'single', readEndpoint }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const record = await loadRecordByMode({ endpoint, id, readMode, readEndpoint });
        setItem(record);
      } catch (err) {
        setError(err.message || 'Load error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [endpoint, id, readMode, readEndpoint]);

  if (loading) return <StaffPageLayout eyebrow="Record View" title={title} subtitle={subtitle}><div className="rounded-[26px] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Loading record...</div></StaffPageLayout>;
  if (error) return (
    <StaffPageLayout eyebrow="Record View" title={title} subtitle={subtitle}>
      <Card className="rounded-[28px] border border-rose-200 bg-rose-50">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-rose-900">Unable to Load Record</h3>
              <p className="mt-1 text-sm text-rose-700">{error}</p>
              <div className="mt-3 flex gap-3">
                <button onClick={() => window.location.reload()} className="inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors">
                  Retry
                </button>
                <button onClick={() => window.history.back()} className="inline-flex items-center rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors">
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </StaffPageLayout>
  );

  return (
    <StaffPageLayout eyebrow="Record View" title={title} subtitle={subtitle} actions={<>{listPath && <Button variant="outline" onClick={() => (window.location.href = listPath)}>Back To List</Button>}{editPath && <Button variant="primary" onClick={() => (window.location.href = editPath)}>Update Record</Button>}</>}>
      <Card className="rounded-[28px] border border-slate-200 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fields.map((field) => (
            <div key={field.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{field.label}</p>
              <p className="mt-3 break-words text-sm font-medium leading-6 text-slate-900">{field.renderView ? field.renderView(item?.[field.name], item) : formatDisplayValue(item?.[field.name])}</p>
            </div>
          ))}
        </div>
      </Card>
    </StaffPageLayout>
  );
};

export default RecordViewPage;
