import React, { useEffect, useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';
import Select from '../../../components/UIHelper/Select';
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

const formatFieldLabel = (label = '') => label.toLowerCase().replace(/\s+/g, ' ');

const getDefaultHelperText = (field, endpoint) => {
  const context = endpoint.includes('/payroll') ? 'payroll' : endpoint.includes('/finance') ? 'finance' : endpoint.includes('/hr') ? 'HR' : endpoint.includes('/kitchen') ? 'kitchen' : 'record';
  const label = formatFieldLabel(field.label);
  if (field.type === 'relation') return `Choose the related ${label} for this ${context} item.`;
  if (field.type === 'date') return `Select the ${label} for this ${context} item.`;
  if (field.type === 'number') return `Enter the ${label} as a numeric value.`;
  if (field.type === 'select') return `Select the correct ${label} option.`;
  return `Provide the ${label} for this ${context} item.`;
};

const RelationSelect = ({ field, value, onChange }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`${API_BASE}${field.relationEndpoint}`);
        const data = await parseJsonSafe(res);
        const rows = data.data || data;
        setOptions(rows.map((row) => ({ value: field.relationValue ? field.relationValue(row) : (row._id || row.id), label: field.relationLabel(row) })));
      } catch (err) {
        console.error('RelationSelect fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [field.relationEndpoint, field.relationLabel]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{field.label}</label>
      <select value={value ?? ''} onChange={onChange} disabled={loading} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100">
        <option value="">{loading ? 'Loading...' : `Select ${field.label}`}</option>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {field.helperText && <p className="text-xs text-slate-500">{field.helperText}</p>}
    </div>
  );
};

const loadRecordByMode = async ({ endpoint, id, readMode, readEndpoint }) => {
  const targetEndpoint = readEndpoint || endpoint;
  if (readMode === 'collection') {
    const res = await fetch(`${API_BASE}${targetEndpoint}`);
    const data = await parseJsonSafe(res);
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load');
    const rows = data.data || [];
    const match = rows.find((row) => String(row._id) === String(id));
    if (!match) throw new Error('Record not found');
    return match;
  }

  const res = await fetch(`${API_BASE}${targetEndpoint}/${id}`);
  const data = await parseJsonSafe(res);
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load');
  return data.data;
};

const FormPage = ({ titleCreate, titleEdit, endpoint, formFields, initialForm, mapRowToForm, mapFormToPayload, mode, id, onSavedPath, readMode = 'single', readEndpoint }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const load = async () => {
      if (mode !== 'edit' || !id) return;
      setLoading(true);
      setError('');
      try {
        const record = await loadRecordByMode({ endpoint, id, readMode, readEndpoint });
        setForm(mapRowToForm ? mapRowToForm(record) : record);
      } catch (err) {
        setError(err.message || 'Load error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mode, id, endpoint, mapRowToForm, readMode, readEndpoint]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      const newFieldErrors = {};
      formFields.filter((f) => f.type === 'number').forEach(({ name }) => {
        const val = form[name];
        if (val !== '' && val !== null && val !== undefined && Number.isNaN(Number(val))) newFieldErrors[name] = 'Only numbers are allowed';
      });
      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        throw new Error('Please correct the highlighted fields.');
      }
      const payload = mapFormToPayload ? mapFormToPayload(form) : form;
      const res = await fetch(`${API_BASE}${endpoint}${mode === 'edit' ? `/${id}` : ''}`, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed');
      if (onSavedPath) window.location.href = onSavedPath;
    } catch (err) {
      setError(err.message || 'Save error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <StaffPageLayout eyebrow="Reusable Staff Form" title={mode === 'edit' ? titleEdit : titleCreate} subtitle="Consistent form design for create and update pages across staff modules." actions={<Button variant="outline" onClick={() => window.history.back()}>Back</Button>}>
      <Card className="rounded-[28px] border border-slate-200 shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading data...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {formFields.map((field) => {
                const helperText = field.helperText || getDefaultHelperText(field, endpoint);
                if (field.type === 'relation') return <RelationSelect key={field.name} field={{ ...field, helperText }} value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />;
                if (field.type === 'select') return <Select key={field.name} label={field.label} id={field.name} value={form[field.name] ?? ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} options={field.options} helperText={helperText} error={fieldErrors[field.name]} placeholder={`Select ${field.label}`} />;
                if (field.type === 'textarea') {
                  return (
                    <div key={field.name} className={`space-y-2 ${field.fullWidth !== false ? 'md:col-span-2' : ''}`}>
                      <label htmlFor={field.name} className="block text-sm font-medium text-slate-700">{field.label}</label>
                      <textarea id={field.name} rows={field.rows || 4} value={form[field.name] ?? ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-all focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100" />
                      {!fieldErrors[field.name] && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
                      {fieldErrors[field.name] && <p className="text-sm text-red-600">{fieldErrors[field.name]}</p>}
                    </div>
                  );
                }
                return <Input key={field.name} label={field.label} id={field.name} type={field.type || 'text'} value={form[field.name] ?? ''} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} helperText={helperText} error={fieldErrors[field.name]} className="rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-cyan-400 focus:bg-white focus:ring-cyan-100" />;
              })}
            </div>

            {error && !loading && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-rose-900">Form Error</h3>
                    <p className="mt-1 text-sm text-rose-700">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-3 inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors">
                      Reload Page
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Record'}</Button>
            </div>
          </div>
        )}
      </Card>
    </StaffPageLayout>
  );
};

export default FormPage;

