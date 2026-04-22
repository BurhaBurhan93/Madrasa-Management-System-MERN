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

const loadRecord = async (endpoint, id, readMode, readEndpoint, navigate) => {
  const base = readEndpoint || endpoint;
  if (readMode === 'collection') {
    const res  = await fetch(`${API_BASE}${base}`, { headers: getAuthHeaders() });
    if (res.status === 401 || res.status === 403) { clearAuth(); navigate('/login'); return null; }
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error(data.message || 'Failed to load');
    const list = Array.isArray(data) ? data : (data.data || data.items || []);
    const match = list.find((r) => String(r._id) === String(id));
    if (!match) throw new Error('Record not found');
    return match;
  }
  const res  = await fetch(`${API_BASE}${base}/${id}`, { headers: getAuthHeaders() });
  if (res.status === 401 || res.status === 403) { clearAuth(); navigate('/login'); return null; }
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.message || 'Failed to load');
  return data.data || data;
};

/* ── Relation dropdown ── */
const RelationSelect = ({ field, value, onChange }) => {
  const [opts, setOpts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}${field.relationEndpoint}`, { headers: getAuthHeaders() })
      .then((r) => {
        if (r.status === 401 || r.status === 403) { clearAuth(); window.location.href = '/login'; return null; }
        return parseJsonSafe(r);
      })
      .then((d) => {
        if (!d) return;
        const rows = d.data || d;
        setOpts(Array.isArray(rows) ? rows.map((r) => ({
          value: field.relationValue ? field.relationValue(r) : (r._id || r.id),
          label: field.relationLabel(r),
        })) : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [field.relationEndpoint]);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{field.label}</label>
      <select
        value={value ?? ''}
        onChange={onChange}
        disabled={loading}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:opacity-60"
      >
        <option value="">{loading ? 'Loading...' : `Select ${field.label}`}</option>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
};

/* ── Main FormPage ── */
const FormPage = ({
  titleCreate, titleEdit, endpoint, formFields, initialForm,
  mapRowToForm, mapFormToPayload, mode, id, onSavedPath,
  readMode = 'single', readEndpoint,
}) => {
  const navigate = useNavigate();
  const [form, setForm]           = useState(initialForm);
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess]     = useState(false);

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    setLoading(true);
    loadRecord(endpoint, id, readMode, readEndpoint, navigate)
      .then((rec) => { if (rec) setForm(mapRowToForm ? mapRowToForm(rec) : rec); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [mode, id, endpoint, readMode, readEndpoint]);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      const errs = {};
      formFields.filter((f) => f.type === 'number').forEach(({ name }) => {
        const v = form[name];
        if (v !== '' && v !== null && v !== undefined && Number.isNaN(Number(v)))
          errs[name] = 'Must be a number';
      });
      if (Object.keys(errs).length) { setFieldErrors(errs); throw new Error('Fix highlighted fields.'); }

      const payload = mapFormToPayload ? mapFormToPayload(form) : form;
      const res  = await fetch(`${API_BASE}${endpoint}${mode === 'edit' ? `/${id}` : ''}`, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      if (res.status === 401 || res.status === 403) { clearAuth(); navigate('/login'); return; }
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.message || 'Save failed');
      setSuccess(true);
      setTimeout(() => { if (onSavedPath) navigate(onSavedPath); }, 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const title = mode === 'edit' ? titleEdit : titleCreate;

  return (
    <StaffPageLayout
      title={title}
      subtitle={mode === 'edit' ? 'Update the record details below.' : 'Fill in the details to create a new record.'}
      actions={
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="10 4 6 8 10 12"/>
          </svg>
          Back
        </button>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header stripe */}
        <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-cyan-500 to-sky-500" />

        <div className="p-6">
          {loading ? (
            <div className="flex items-center gap-3 py-8 text-slate-400">
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="8" strokeOpacity=".25"/><path d="M10 2a8 8 0 0 1 8 8" strokeLinecap="round"/></svg>
              Loading record...
            </div>
          ) : (
            <>
              {/* Success banner */}
              {success && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="8"/><polyline points="5.5 9 8 11.5 12.5 6.5"/></svg>
                  Saved successfully! Redirecting...
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="9" r="8"/><line x1="9" y1="5" x2="9" y2="9.5"/><circle cx="9" cy="12.5" r=".8" fill="currentColor"/></svg>
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-600">✕</button>
                </div>
              )}

              {/* Fields grid */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {formFields.map((field) => {
                  const err = fieldErrors[field.name];

                  if (field.type === 'relation') {
                    return (
                      <RelationSelect
                        key={field.name}
                        field={field}
                        value={form[field.name]}
                        onChange={(e) => set(field.name, e.target.value)}
                      />
                    );
                  }

                  if (field.type === 'select') {
                    return (
                      <div key={field.name} className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{field.label}</label>
                        <select
                          value={form[field.name] ?? ''}
                          onChange={(e) => set(field.name, e.target.value)}
                          className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-cyan-100 ${err ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 focus:border-cyan-400'}`}
                        >
                          <option value="">Select {field.label}</option>
                          {(field.options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        {err && <p className="text-xs text-rose-600">{err}</p>}
                      </div>
                    );
                  }

                  if (field.type === 'textarea') {
                    return (
                      <div key={field.name} className={`space-y-1.5 ${field.fullWidth !== false ? 'md:col-span-2' : ''}`}>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{field.label}</label>
                        <textarea
                          rows={field.rows || 4}
                          value={form[field.name] ?? ''}
                          onChange={(e) => set(field.name, e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100 resize-none"
                        />
                        {err && <p className="text-xs text-rose-600">{err}</p>}
                      </div>
                    );
                  }

                  return (
                    <div key={field.name} className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{field.label}</label>
                      <input
                        type={field.type || 'text'}
                        value={form[field.name] ?? ''}
                        onChange={(e) => set(field.name, e.target.value)}
                        className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-cyan-100 ${err ? 'border-rose-400 focus:border-rose-400' : 'border-slate-200 focus:border-cyan-400'}`}
                      />
                      {err && <p className="text-xs text-rose-600">{err}</p>}
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  onClick={() => navigate(-1)}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || success}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-60"
                >
                  {saving && <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6" strokeOpacity=".25"/><path d="M8 2a6 6 0 0 1 6 6" strokeLinecap="round"/></svg>}
                  {saving ? 'Saving...' : success ? 'Saved ✓' : mode === 'edit' ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </StaffPageLayout>
  );
};

export default FormPage;
