import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiPackage } from 'react-icons/fi';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import StaffPageLayout from '../staff/shared/StaffPageLayout';
import Card from '../../components/UIHelper/Card';

const StaffInventoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await apiFetch('/staff/inventory');
        const data = await parseJsonSafe(res);
        const items = Array.isArray(data) ? data : [];
        const found = items.find((i) => String(i.id) === String(id));
        if (!found) throw new Error('Item not found');
        setItem(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Inventory" title="Inventory Item Details" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
        </div>
      </StaffPageLayout>
    );
  }

  if (error) {
    return (
      <StaffPageLayout eyebrow="Inventory" title="Inventory Item Details" subtitle="Error">
        <div className="p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">{error}</div>
      </StaffPageLayout>
    );
  }

  const isLowStock = item.quantity <= item.minLevel;

  const fields = [
    { label: 'Name', value: item.name },
    { label: 'Category', value: item.category },
    { label: 'Quantity', value: item.quantity },
    { label: 'Available', value: item.available ?? item.quantity },
    { label: 'Min Level', value: item.minLevel },
    { label: 'Location', value: item.location },
    { label: 'Status', value: isLowStock ? 'Low Stock' : 'In Stock', highlight: isLowStock ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-green-600 dark:text-green-400 font-semibold' },
  ];

  return (
    <StaffPageLayout
      eyebrow="Inventory"
      title={item.name}
      subtitle="Inventory item details and stock information"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="space-y-0 divide-y divide-gray-100 dark:divide-slate-700">
              {fields.map((f) => (
                <div key={f.label} className="flex justify-between py-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-slate-400">{f.label}</span>
                  <span className={`text-sm text-gray-800 dark:text-slate-200 ${f.highlight || ''}`}>{f.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-2xl ${isLowStock ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600'}`}>
                <FiPackage size={48} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Stock Status</p>
                <p className={`text-xl font-bold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {isLowStock ? 'Low Stock' : 'In Stock'}
                </p>
              </div>
              {isLowStock && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-700 dark:text-red-400 w-full">
                  Quantity ({item.quantity}) is at or below minimum level ({item.minLevel}). Consider restocking.
                </div>
              )}
              <button onClick={() => navigate(`/staff/inventory/edit/${item.id}`)} className="w-full px-4 py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl font-medium hover:shadow-md flex items-center justify-center gap-2">
                <FiEdit2 size={18} /> Edit Item
              </button>
              <button onClick={() => navigate('/staff/inventory')} className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center justify-center gap-2">
                <FiArrowLeft size={18} /> Back to List
              </button>
            </div>
          </Card>
        </div>
      </div>
    </StaffPageLayout>
  );
};

export default StaffInventoryView;
