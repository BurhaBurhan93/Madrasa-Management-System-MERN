import React, { useEffect, useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';
import Select from '../../../components/UIHelper/Select';

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

const RelationSelect = ({ field, value, onChange }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`${API_BASE}${field.relationEndpoint}`);
        const data = await parseJsonSafe(res);
        const rows = data.data || data;
        setOptions(rows.map((row) => ({ value: row._id, label: field.relationLabel(row) })));
      } catch (err) {
        console.error('RelationSelect fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [field.relationEndpoint]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
      <select
        value={value ?? ''}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        disabled={loading}
      >
        <option value="">{loading ? 'Loading...' : `-- Select ${field.label} --`}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

const FormPage = ({
  titleCreate,
  titleEdit,
  endpoint,
  formFields,
  initialForm,
  mapRowToForm,
  mapFormToPayload,
  mode,
  id,
  onSavedPath
}) => {
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
        const res = await fetch(`${API_BASE}${endpoint}/${id}`);
        const data = await parseJsonSafe(res);
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load');
        setForm(mapRowToForm ? mapRowToForm(data.data) : data.data);
      } catch (err) {
        setError(err.message || 'Load error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mode, id]);

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
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{mode === 'edit' ? titleEdit : titleCreate}</h1>
        <p className="text-gray-600">Fill the form and save.</p>
      </div>

      <Card>
        {loading ? (
          <div className="text-sm text-gray-500">Loading data...</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formFields.map((field) => (
                <div key={field.name} className="space-y-1">
                  {field.type === 'relation' ? (
                    <RelationSelect
                      field={field}
                      value={form[field.name]}
                      onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                    />
                  ) : field.type === 'select' ? (
                    <Select
                      label={field.label}
                      id={field.name}
                      value={form[field.name] ?? ''}
                      onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                      options={field.options}
                      error={fieldErrors[field.name]}
                    />
                  ) : (
                    <Input
                      label={field.label}
                      id={field.name}
                      type={field.type || 'text'}
                      value={form[field.name] ?? ''}
                      onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                      error={fieldErrors[field.name]}
                    />
                  )}
                </div>
              ))}
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FormPage;
