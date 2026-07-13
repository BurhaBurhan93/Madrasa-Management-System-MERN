import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import StaffPageLayout from '../staff/shared/StaffPageLayout';
import Card from '../../components/UIHelper/Card';

const StaffInventoryCreate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['staff', 'common']);
  const [form, setForm] = useState({ name: '', category: 'General', quantity: 0, minLevel: 5, location: 'Main Store' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return setError(t('staff.inventoryCreate.nameRequired'));
    setSaving(true);
    setError('');
    try {
      const res = await apiFetch('/staff/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.message || t('staff.inventoryCreate.failedCreate'));
      navigate('/staff/inventory');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'name', label: t('staff.inventoryCreate.name'), type: 'text', required: true, placeholder: t('staff.inventoryCreate.namePlaceholder') },
    { key: 'category', label: t('staff.inventoryCreate.category'), type: 'text', placeholder: t('staff.inventoryCreate.categoryPlaceholder') },
    { key: 'quantity', label: t('staff.inventoryCreate.quantity'), type: 'number', min: 0 },
    { key: 'available', label: t('staff.inventoryCreate.available'), type: 'number', min: 0, note: t('staff.inventoryCreate.availableNote') },
    { key: 'minLevel', label: t('staff.inventoryCreate.minLevel'), type: 'number', min: 0, note: t('staff.inventoryCreate.minLevelNote') },
    { key: 'location', label: t('staff.inventoryCreate.location'), type: 'text', placeholder: t('staff.inventoryCreate.locationPlaceholder') },
  ];

  return (
    <StaffPageLayout
      eyebrow={t('staff.inventoryCreate.eyebrow')}
      title={t('staff.inventoryCreate.title')}
      subtitle={t('staff.inventoryCreate.subtitle')}
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
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                />
                {field.note && <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{field.note}</p>}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
            <button type="submit" disabled={saving} className="px-6 py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl font-medium hover:shadow-md disabled:opacity-50 flex items-center gap-2">
              <FiSave size={18} /> {saving ? t('staff.inventoryCreate.creating') : t('staff.inventoryCreate.createItem')}
            </button>
            <button type="button" onClick={() => navigate('/staff/inventory')} className="px-6 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2">
              <FiArrowLeft size={18} /> {t('staff.inventoryCreate.cancel')}
            </button>
          </div>
        </form>
      </Card>
    </StaffPageLayout>
  );
};

export default StaffInventoryCreate;
