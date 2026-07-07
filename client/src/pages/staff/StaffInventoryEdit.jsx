import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import StaffPageLayout from '../staff/shared/StaffPageLayout';
import Card from '../../components/UIHelper/Card';

const StaffInventoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', category: '', quantity: 0, available: 0, minLevel: 0, location: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await apiFetch('/staff/inventory');
        const data = await parseJsonSafe(res);
        const items = Array.isArray(data) ? data : [];
        const item = items.find((i) => String(i.id) === String(id));
        if (!item) throw new Error('Item not found');
        setForm({
          name: item.name || '',
          category: item.category || 'General',
          quantity: item.quantity ?? 0,
          available: item.available ?? item.quantity ?? 0,
          minLevel: item.minLevel ?? 5,
          location: item.location || 'Main Store',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return setError('Name is required');
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        category: form.category,
        quantity: Number(form.quantity),
        minLevel: Number(form.minLevel),
        location: form.location,
      };
      const res = await apiFetch(`/staff/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.message || 'Failed to update item');
      navigate('/staff/inventory');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'quantity', label: 'Quantity', type: 'number', min: 0 },
    { key: 'available', label: 'Available', type: 'number', min: 0, readOnly: true, note: 'Auto-calculated from quantity' },
    { key: 'minLevel', label: 'Min Level', type: 'number', min: 0 },
    { key: 'location', label: 'Location', type: 'text' },
  ];

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Inventory" title="Edit Inventory Item" subtitle="Loading item data...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
        </div>
      </StaffPageLayout>
    );
  }

  return (
    <StaffPageLayout
      eyebrow="Inventory"
      title="Edit Inventory Item"
      subtitle={`Editing: ${form.name}`}
    >
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div key={field.key} className={field.key === 'name' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  {field.label}{field.required ? ' *' : ''}
                </label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                  required={field.required}
                  min={field.min}
                  readOnly={field.readOnly}
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${
                    field.readOnly
                      ? 'bg-gray-100 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-600 cursor-not-allowed'
                      : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500'
                  }`}
                />
                {field.note && <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{field.note}</p>}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
            <button type="submit" disabled={saving} className="px-6 py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl font-medium hover:shadow-md disabled:opacity-50 flex items-center gap-2">
              <FiSave size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/staff/inventory')} className="px-6 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2">
              <FiArrowLeft size={18} /> Cancel
            </button>
          </div>
        </form>
      </Card>
    </StaffPageLayout>
  );
};

export default StaffInventoryEdit;
