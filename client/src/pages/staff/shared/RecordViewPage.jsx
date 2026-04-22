import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffPageLayout from './StaffPageLayout';
import { getAuthHeaders, clearAuth } from '../../../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const parseJsonSafe = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error(`Server error (${res.status}): ${text.slice(0, 120)}`); }
};

const formatValue = (v) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.length ? v.join(', ') : null;
  if (typeof v === 'object') return v.name || v.title || v.fullName || v.accountName || v.departmentName || v.designationTitle || JSON.stringify(v);
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return new Date(s).toLocaleDateString();
  return s;
};

const RecordViewPage = ({ title, subtitle, endpoint, id, fields = [], editPath, listPath, readMode = 'single', readEndpoint }) => {
  const navigate = useNavigate();
  const [item, setItem]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const base = readEndpoint || endpoint;
      let record;
      if (readMode === 'collection') {
        const res  = await fetch(`${API_BASE}${base}`, { headers: getAuthHeaders() });
        if (res.status === 401 || res.status === 403) { clearAuth(); navigate('/login'); return; }
        const data = await parseJsonSafe(res);
        if (!res.ok) throw new Error(data.message || 'Failed to load');
        const list = Array.isArray(data) ? data : (data.data || data.items || []);
        record = list.find((r) => String(r._id) === String(id));
        if (!record) throw new Error('Record not found');
      } else {
        const res  = await fetch(`${API_BASE}${base}/${id}`, { headers: getAuthHeaders() });
        if (res.status === 401 || res.status === 403) { clearAuth(); navigate('/login'); return; }
        const data = await parseJsonSafe(res);
        if (!res.ok) throw new Error(data.message || 'Failed to load');
        record = data.data || data;
      }
      setItem(record);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [endpoint, id, readMode, readEndpoint]);

  return (
    <StaffPageLayout
      title={title}
      subtitle={subtitle}
      actions={
        <div className="flex items-center gap-2">
          {listPath && (
            <button
              onClick={() => navigate(listPath)}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="10 4 6 8 10 12"/></svg>
              Back to List
            </button>
          )}
          {editPath && (
            <button
              onClick={() => navigate(editPath)}
              className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 2.5l2 2-8 8H2.5v-2l8-8z"/></svg>
              Edit Record
            </button>
          )}
        </div>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-sky-500" />

        {loading ? (
          <div className="flex items-center gap-3 p-8 text-slate-400">
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="8" strokeOpacity=".25"/><path d="M10 2a8 8 0 0 1 8 8" strokeLinecap="round"/></svg>
            Loading record...
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-6 text-sm text-rose-700">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="9" r="8"/><line x1="9" y1="5" x2="9" y2="9.5"/><circle cx="9" cy="12.5" r=".8" fill="currentColor"/></svg>
            <span className="flex-1">{error}</span>
            <button onClick={load} className="font-semibold underline">Retry</button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {fields.map((field) => {
                const raw = item?.[field.name];
                const display = field.renderView ? field.renderView(raw, item) : formatValue(raw);
                return (
                  <div key={field.name} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{field.label}</p>
                    <p className="mt-2 break-words text-sm font-medium text-slate-800">
                      {display ?? <span className="text-slate-300">—</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </StaffPageLayout>
  );
};

export default RecordViewPage;
