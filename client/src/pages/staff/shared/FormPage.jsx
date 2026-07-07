import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';
import Select from '../../../components/UIHelper/Select';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";
import StaffPageLayout from './StaffPageLayout';
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';
import { useTheme } from '../../../contexts/ThemeContext.jsx';
import { getStaffToneStyles } from './staffTheme';
import { localizeAdminText } from '../../../lib/adminLocalization';
import { readStoredLanguage } from '../../../lib/languageStorage';

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

const chunkFields = (fields, stepCount) => {
  const safeStepCount = Math.max(1, stepCount);
  const chunkSize = Math.ceil(fields.length / safeStepCount) || 1;
  const steps = Array.from({ length: safeStepCount }, (_, index) => fields.slice(index * chunkSize, (index + 1) * chunkSize));
  return steps.filter((step, index) => step.length > 0 || index === safeStepCount - 1);
};

const RelationSelect = ({ field, value, onChange, isDark }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await apiFetch(field.relationEndpoint);
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
  }, [field.relationEndpoint, field.relationLabel, field.relationValue]);

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{field.label}</label>
      <select
        value={value ?? ''}
        onChange={onChange}
        disabled={loading}
        className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
          isDark
            ? 'border-slate-700 bg-slate-900/70 text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
            : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100'
        }`}
      >
        <option value="">{loading ? 'Loading...' : `Select ${field.label}`}</option>
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {field.helperText && <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{field.helperText}</p>}
    </div>
  );
};

const loadRecordByMode = async ({ endpoint, id, readMode, readEndpoint }) => {
  const targetEndpoint = readEndpoint || endpoint;
  if (readMode === 'collection') {
    const res = await apiFetch(targetEndpoint);
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error(data?.message || 'Failed to load');
    const rows = Array.isArray(data) ? data : (data?.data || []);
    const match = rows.find((row) => String(row._id) === String(id));
    if (!match) throw new Error('Record not found');
    return match;
  }

  const res = await apiFetch(`${targetEndpoint}/${id}`);
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || 'Failed to load');
  return data?.data || data;
};

const FormPage = ({ titleCreate, titleEdit, endpoint, formFields, initialForm, mapRowToForm, mapFormToPayload, mode, id, onSavedPath, readMode = 'single', readEndpoint }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const adminLang = readStoredLanguage('adminLang', 'en');
  const toneStyles = getStaffToneStyles(endpoint || titleCreate || titleEdit);

  const stepCount = formFields.length > 16 ? 5 : 4;
  const steps = useMemo(() => chunkFields(formFields, stepCount), [formFields, stepCount]);
  const activeStep = Math.min(currentStep, Math.max(steps.length - 1, 0));
  const progressPercent = steps.length > 1 ? ((activeStep + 1) / steps.length) * 100 : 100;
  const stepLabels = steps.length === 5
    ? ['Basics', 'Identity', 'Relations', 'Details', 'Review']
    : ['Basics', 'Details', 'Relations', 'Review'].slice(0, steps.length);

  useEffect(() => {
    setCurrentStep(0);
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
        if (val !== '' && val !== null && val !== undefined && Number.isNaN(Number(val))) {
          newFieldErrors[name] = 'Only numbers are allowed';
        }
      });
      formFields.forEach(({ name, required }) => {
        if (required && (!form[name] || form[name] === '')) {
          newFieldErrors[name] = 'This field is required';
        }
      });
      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        throw new Error(localizeAdminText('Please correct the highlighted fields.', adminLang));
      }

      const payload = mapFormToPayload ? mapFormToPayload(form) : form;
      const res = await apiFetch(`${endpoint}${mode === 'edit' ? `/${id}` : ''}`, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed');
      if (onSavedPath) navigate(onSavedPath);
    } catch (err) {
      setError(err.message || localizeAdminText('Save error', adminLang));
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  const goBack = () => setCurrentStep((step) => Math.max(step - 1, 0));

  const renderField = (field) => {
    const helperText = field.helperText || getDefaultHelperText(field, endpoint);
    if (field.type === 'relation') {
      return (
        <RelationSelect
          key={field.name}
          field={{ ...field, helperText }}
          value={form[field.name]}
          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
          isDark={isDark}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <Select
          key={field.name}
          label={field.label}
          id={field.name}
          value={form[field.name] ?? ''}
          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
          options={field.options}
          helperText={helperText}
          error={fieldErrors[field.name]}
          placeholder={`Select ${field.label}`}
        />
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className={`space-y-2 ${field.fullWidth !== false ? 'md:col-span-2' : ''}`}>
          <label htmlFor={field.name} className={`block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{field.label}</label>
          <textarea
            id={field.name}
            rows={field.rows || 4}
            value={form[field.name] ?? ''}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
            className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
              isDark
                ? 'border-slate-700 bg-slate-900/70 text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100'
            }`}
          />
          {!fieldErrors[field.name] && helperText && <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{helperText}</p>}
          {fieldErrors[field.name] && <p className="text-sm text-red-600">{fieldErrors[field.name]}</p>}
        </div>
      );
    }

    if (field.type === 'date') {
      return (
        <div key={field.name} className="space-y-2">
          <label htmlFor={field.name} className={`block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{field.label}</label>
          <CalendarDatePicker
            value={form[field.name]}
            onChange={(date) => setForm({ ...form, [field.name]: date })}
            placeholder={`Select ${field.label}`}
          />
          {!fieldErrors[field.name] && helperText && <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{helperText}</p>}
          {fieldErrors[field.name] && <p className="text-sm text-red-600">{fieldErrors[field.name]}</p>}
        </div>
      );
    }

    if (field.type === 'file') {
      const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          // Check file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
          }

          // Compress image before upload
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let { width, height } = img;

              // Resize if too large
              const maxDim = 800;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height / width) * maxDim);
                  width = maxDim;
                } else {
                  width = Math.round((width / height) * maxDim);
                  height = maxDim;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL(file.type, 0.7); // 70% quality
              setForm({ ...form, [field.name]: compressedDataUrl });
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      };

      return (
        <div key={field.name} className="space-y-2">
          <label htmlFor={field.name} className={`block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{field.label}</label>
          <div className="flex items-center gap-4">
            {form[field.name] && (
              <img
                src={form[field.name]}
                alt="Preview"
                className="h-20 w-20 rounded-lg object-cover border border-slate-200"
              />
            )}
            <input
              type="file"
              accept="image/*"
              id={field.name}
              onChange={handleImageChange}
              className={`flex-1 rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
                isDark
                  ? 'border-slate-700 bg-slate-900/70 text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100'
              }`}
            />
          </div>
          {!fieldErrors[field.name] && helperText && <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{helperText}</p>}
          {fieldErrors[field.name] && <p className="text-sm text-red-600">{fieldErrors[field.name]}</p>}
        </div>
      );
    }

    return (
      <Input
        key={field.name}
        label={field.label}
        id={field.name}
        type={field.type || 'text'}
        value={form[field.name] ?? ''}
        onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
        helperText={helperText}
        error={fieldErrors[field.name]}
        className="rounded-2xl px-4 py-3 text-sm"
      />
    );
  };

  const currentFields = steps[activeStep] || [];
  const canGoBack = activeStep > 0;
  const canGoNext = activeStep < steps.length - 1;

  return (
    <StaffPageLayout
      eyebrow={mode === 'edit' ? 'Edit Flow' : 'Create Flow'}
      title={mode === 'edit' ? titleEdit : titleCreate}
      subtitle="A phased entry flow keeps create and edit tasks easier to complete without overwhelming the form."
      tone={endpoint || titleCreate || titleEdit}
      actions={<Button variant="outline" onClick={() => navigate(-1)}>{localizeAdminText('Back', adminLang)}</Button>}
    >
      <Card className="rounded-[28px] shadow-sm">
        {loading ? (
          <div className={`p-6 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{localizeAdminText('Loading data...', adminLang)}</div>
        ) : (
          <div className="space-y-6">
            <div className={`rounded-[24px] border p-5 ${isDark ? 'border-slate-700 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-[0.24em] ${toneStyles.badge.split(' ')[1] || 'text-cyan-700'}`}>
                    {`${localizeAdminText('Step', adminLang)} ${activeStep + 1} of ${steps.length}`}
                  </p>
                  <h3 className={`mt-2 text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {localizeAdminText(stepLabels[activeStep] || `Step ${activeStep + 1}`, adminLang)}
                  </h3>
                </div>
                <div className={`h-2 w-full max-w-xs overflow-hidden rounded-full ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                  <div className={`h-full rounded-full bg-gradient-to-r ${toneStyles.accent}`} style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {steps.map((_, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      index === activeStep
                        ? toneStyles.chip
                        : isDark
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {currentFields.map((field) => renderField(field))}
              </div>
            </div>

            {error && !loading && (
              <div className={`rounded-2xl border p-6 ${isDark ? 'border-rose-500/30 bg-rose-950/30' : 'border-rose-200 bg-rose-50'}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${isDark ? 'text-rose-200' : 'text-rose-900'}`}>{localizeAdminText('Form Error', adminLang)}</h3>
                    <p className={`mt-1 text-sm ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>{error}</p>
                    <button
                      onClick={() => setError('')}
                      className="mt-3 inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                    >
                      {localizeAdminText('Retry', adminLang)}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className={`flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(-1)}>{localizeAdminText('Cancel', adminLang)}</Button>
              </div>
              <div className="flex gap-3">
                {canGoBack && <Button variant="outline" onClick={goBack}>{localizeAdminText('Back', adminLang)}</Button>}
                {canGoNext ? (
                  <Button variant="primary" onClick={goNext}>{localizeAdminText('Next Step', adminLang)}</Button>
                ) : (
                  <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? localizeAdminText('Loading...', adminLang) : localizeAdminText('Save Record', adminLang)}</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </StaffPageLayout>
  );
};

export default FormPage;
