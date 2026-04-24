import React, { useEffect, useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import DataTable from '../../../components/UIHelper/DataTable';
import Modal from '../../../components/UIHelper/Modal';
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

const CrudPage = ({
  title,
  subtitle,
  endpoint,
  columns,
  formFields,
  initialForm,
  mapRowToForm,
  mapFormToPayload
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (query.trim()) params.set('search', query.trim());

      const res = await fetch(`${API_BASE}${endpoint}?${params.toString()}`);
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Request failed (status ${res.status})`);
      }
      setItems(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query]);

  const openCreate = () => {
    setIsEdit(false);
    setActiveId(null);
    setForm(initialForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (row) => {
    setIsEdit(true);
    setActiveId(row._id);
    setForm(mapRowToForm ? mapRowToForm(row) : row);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    const ok = window.confirm('Are you sure you want to delete this record?');
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}${endpoint}/${row._id}`, { method: 'DELETE' });
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) throw new Error(data.message || 'Delete failed');
      fetchItems();
    } catch (err) {
      setError(err.message || 'Delete error');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError('');
    try {
      const payload = mapFormToPayload ? mapFormToPayload(form) : form;
      const res = await fetch(`${API_BASE}${endpoint}${isEdit ? `/${activeId}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) throw new Error(data.message || 'Save failed');
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      setFormError(err.message || 'Save error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Search..."
            />
          </div>
          <div className="md:ml-auto">
            <Button variant="primary" onClick={openCreate}>Add New</Button>
          </div>
        </div>
      </Card>

      {error && !loading && (
        <Card className="rounded-[28px] border border-rose-200 bg-rose-50 mb-6">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-rose-900">Unable to Load Data</h3>
                <p className="mt-1 text-sm text-rose-700">{error}</p>
                <button onClick={fetchItems} className="mt-3 inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Records</h2>
          <div className="text-sm text-gray-500">Showing {items.length} of {total}</div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          {loading ? (
            <div className="text-sm text-gray-500 p-4">Loading data...</div>
          ) : (
            <DataTable
              columns={columns}
              data={items}
              rowClassName="odd:bg-white even:bg-gray-50"
              headerClassName="bg-gray-100 text-gray-700"
            />
          )}
        </div>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">Page {page}</div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button variant="outline" disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? 'Edit Record' : 'Create Record'} size="2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.map((field) => (
              field.type === 'select' ? (
                <Select
                  key={field.name}
                  label={field.label}
                  id={field.name}
                  value={form[field.name] ?? ''}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  options={field.options}
                />
              ) : (
                <Input
                  key={field.name}
                  label={field.label}
                  id={field.name}
                  type={field.type || 'text'}
                  value={form[field.name] ?? ''}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                />
              )
            ))}
          </div>

          {formError && <div className="text-sm text-red-600">{formError}</div>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CrudPage;
