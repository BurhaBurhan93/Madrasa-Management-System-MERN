import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiPlus, FiMinus, FiAlertTriangle, FiSearch, FiRefreshCw, FiX, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import Card from '../../components/UIHelper/Card';
import StaffPageLayout from '../staff/shared/StaffPageLayout';
import { PageSkeleton } from '../../components/UIHelper/SkeletonLoader';
import { PieChartComponent, BarChartComponent } from '../../components/UIHelper/ECharts';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';

const StaffInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/staff/inventory');
      const data = await parseJsonSafe(res);
      setInventory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!selectedItem || quantity <= 0) return;
    try {
      const res = await apiFetch(`/staff/inventory/${selectedItem.id}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.message || 'Failed to add stock');
      setShowAddModal(false);
      setSelectedItem(null);
      setQuantity(1);
      fetchInventory();
    } catch (error) {
      alert(error.message || 'Failed to add stock');
    }
  };

  const handleRemoveStock = async () => {
    if (!selectedItem || quantity <= 0) return;
    try {
      const res = await apiFetch(`/staff/inventory/${selectedItem.id}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.message || 'Failed to remove stock');
      setShowRemoveModal(false);
      setSelectedItem(null);
      setQuantity(1);
      fetchInventory();
    } catch (error) {
      alert(error.message || 'Failed to remove stock');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inventory item?')) return;
    try {
      const res = await apiFetch(`/staff/inventory/${id}`, { method: 'DELETE' });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.message || 'Failed to delete item');
      fetchInventory();
    } catch (error) {
      alert(error.message || 'Failed to delete item');
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(item => item.quantity <= (item.minLevel || 10));

  const categories = useMemo(() => [...new Set(inventory.map(i => i.category))], [inventory]);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const chartData = useMemo(() => ({
    byCategory: categories.map((cat, idx) => ({ name: cat, value: inventory.filter(i => i.category === cat).length, color: colors[idx % colors.length] })),
    stockStatus: [
      { name: 'Normal Stock', value: inventory.filter(i => i.quantity > (i.minLevel || 10)).length },
      { name: 'Low Stock', value: lowStockItems.length },
    ]
  }), [inventory, lowStockItems, categories]);

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Inventory" title="Inventory Management" subtitle="Track and manage school inventory">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  const headerContent = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Items', value: inventory.length, color: 'text-gray-800 dark:text-slate-100' },
          { label: 'Total Quantity', value: inventory.reduce((acc, item) => acc + item.quantity, 0), color: 'text-blue-600' },
          { label: 'Low Stock Items', value: lowStockItems.length, color: 'text-red-600' },
          { label: 'Categories', value: categories.size || categories.length, color: 'text-green-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
            <p className="text-gray-500 dark:text-slate-400 text-sm">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Inventory by Category">
          <PieChartComponent data={chartData.byCategory} dataKey="value" nameKey="name" height={250} />
        </Card>
        <Card title="Stock Status Overview">
          <BarChartComponent data={chartData.stockStatus} dataKey="value" nameKey="name" height={250} />
        </Card>
      </div>
    </>
  );

  const isLowStock = (item) => item.quantity <= item.minLevel;

  return (
    <StaffPageLayout
      eyebrow="Inventory"
      title="Inventory Management"
      subtitle="Track and manage school inventory"
      actions={
        <div className="flex gap-2">
          <button onClick={fetchInventory} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
            <FiRefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => navigate('/staff/inventory/create')} className="px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-md flex items-center gap-2">
            <FiPlus size={16} /> Add Item
          </button>
        </div>
      }
    >
      {headerContent}

      {lowStockItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
            <FiAlertTriangle />
            <span className="font-semibold">Low Stock Alert</span>
          </div>
          <p className="text-red-600 dark:text-red-300 text-sm">{lowStockItems.length} items are running low on stock.</p>
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, category or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Cards view */}
      {filteredInventory.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-slate-500">No inventory items found. Click "Add Item" to create one.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredInventory.map((item) => (
            <div key={item.id} className={`bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border p-5 ${isLowStock(item) ? 'border-red-200 dark:border-red-800' : 'border-gray-100 dark:border-slate-700'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${isLowStock(item) ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600'}`}>
                  <FiPackage size={24} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => navigate(`/staff/inventory/view/${item.id}`)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-blue-600" title="View"><FiEye size={15} /></button>
                  <button onClick={() => navigate(`/staff/inventory/edit/${item.id}`)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-blue-600" title="Edit"><FiEdit2 size={15} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-red-600" title="Delete"><FiTrash2 size={15} /></button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-slate-200 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{item.category}</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Quantity</p>
                  <p className={`text-2xl font-bold ${isLowStock(item) ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-slate-100'}`}>{item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 dark:text-slate-500">Min Level</p>
                  <p className="text-lg font-medium text-gray-600 dark:text-slate-300">{item.minLevel}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Location: {item.location}</p>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedItem(item); setShowAddModal(true); }} className="flex-1 py-2 bg-sky-50 dark:bg-sky-900/30 text-sky-600 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/50 flex items-center justify-center gap-1">
                  <FiPlus size={16} /> Add
                </button>
                <button onClick={() => { setSelectedItem(item); setShowRemoveModal(true); }} className="flex-1 py-2 bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center justify-center gap-1">
                  <FiMinus size={16} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data Table */}
      <Card title="Inventory Records" subtitle="Complete list of all inventory items">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3 text-right">Available</th>
                <th className="p-3 text-right">Min Level</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-400 dark:text-slate-500">No items found</td></tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="border-t dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-medium text-gray-800 dark:text-slate-200">{item.name}</td>
                    <td className="p-3 text-gray-500 dark:text-slate-400">{item.category}</td>
                    <td className="p-3 text-right font-medium">{item.quantity}</td>
                    <td className="p-3 text-right">{item.available ?? item.quantity}</td>
                    <td className="p-3 text-right text-gray-500">{item.minLevel}</td>
                    <td className="p-3 text-gray-500 dark:text-slate-400">{item.location}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${isLowStock(item) ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                        {isLowStock(item) ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => navigate(`/staff/inventory/view/${item.id}`)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-blue-600" title="View"><FiEye size={15} /></button>
                        <button onClick={() => navigate(`/staff/inventory/edit/${item.id}`)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-blue-600" title="Edit"><FiEdit2 size={15} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-red-600" title="Delete"><FiTrash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Stock Modal */}
      {showAddModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Add Stock</h3>
              <button onClick={() => { setShowAddModal(false); setQuantity(1); }} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"><FiX size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 dark:text-slate-300">Adding stock for: <span className="font-semibold">{selectedItem.name}</span></p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Quantity to Add</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddStock} className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">Add Stock</button>
                <button onClick={() => { setShowAddModal(false); setQuantity(1); }} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Stock Modal */}
      {showRemoveModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Remove Stock</h3>
              <button onClick={() => { setShowRemoveModal(false); setQuantity(1); }} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"><FiX size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 dark:text-slate-300">Removing stock for: <span className="font-semibold">{selectedItem.name}</span></p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Current quantity: {selectedItem.quantity}</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Quantity to Remove</label>
                <input type="number" min="1" max={selectedItem.quantity} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleRemoveStock} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Remove Stock</button>
                <button onClick={() => { setShowRemoveModal(false); setQuantity(1); }} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StaffPageLayout>
  );
};

export default StaffInventory;
