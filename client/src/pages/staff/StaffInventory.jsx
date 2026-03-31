import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPackage, FiPlus, FiMinus, FiAlertTriangle, FiCheckCircle, FiSearch, FiRefreshCw, FiX } from 'react-icons/fi';
import Card from '../../components/UIHelper/Card';
import { PieChartComponent, BarChartComponent } from '../../components/UIHelper/ECharts';

const StaffInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:5000/api/staff/inventory', config);
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!selectedItem || quantity <= 0) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`http://localhost:5000/api/staff/inventory/${selectedItem.id}/add`, { quantity }, config);
      setShowAddModal(false);
      setSelectedItem(null);
      setQuantity(1);
      fetchInventory();
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Failed to add stock. Please try again.');
    }
  };

  const handleRemoveStock = async () => {
    if (!selectedItem || quantity <= 0) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`http://localhost:5000/api/staff/inventory/${selectedItem.id}/remove`, { quantity }, config);
      setShowRemoveModal(false);
      setSelectedItem(null);
      setQuantity(1);
      fetchInventory();
    } catch (error) {
      console.error('Error removing stock:', error);
      alert('Failed to remove stock. Please try again.');
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(item => item.quantity <= (item.minLevel || 10));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-gray-500 mt-1">Track and manage school inventory</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchInventory}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-shadow flex items-center gap-2"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-md transition-shadow flex items-center gap-2">
            <FiPlus size={16} />
            Add Item
          </button>
        </div>
      </div>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <FiAlertTriangle />
            <span className="font-semibold">Low Stock Alert</span>
          </div>
          <p className="text-red-600 text-sm">
            {lowStockItems.length} items are running low on stock and need to be restocked.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-500 text-sm">Total Items</p>
          <p className="text-2xl font-bold text-gray-800">{inventory.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-500 text-sm">Total Quantity</p>
          <p className="text-2xl font-bold text-blue-600">
            {inventory.reduce((acc, item) => acc + item.quantity, 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-500 text-sm">Low Stock Items</p>
          <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-500 text-sm">Categories</p>
          <p className="text-2xl font-bold text-green-600">
            {new Set(inventory.map(i => i.category)).size}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Inventory by Category">
          <PieChartComponent 
            data={Array.from(new Set(inventory.map(i => i.category))).map((cat, idx) => ({
              name: cat,
              value: inventory.filter(i => i.category === cat).length,
              color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][idx % 6]
            }))}
            dataKey="value"
            nameKey="name"
            height={250}
          />
        </Card>

        <Card title="Stock Status Overview">
          <BarChartComponent 
            data={[
              { name: 'Normal Stock', value: inventory.filter(i => i.quantity > (i.minLevel || 10)).length },
              { name: 'Low Stock', value: lowStockItems.length }
            ]}
            dataKey="value"
            nameKey="name"
            height={250}
          />
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map((item) => {
          const isLowStock = item.quantity <= item.minLevel;
          return (
            <div key={item.id} className={`bg-white rounded-2xl shadow-sm border p-5 ${
              isLowStock ? 'border-red-200' : 'border-gray-100'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${isLowStock ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-sky-600'}`}>
                  <FiPackage size={24} />
                </div>
                {isLowStock && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium">
                    Low Stock
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{item.category}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400">Quantity</p>
                  <p className={`text-2xl font-bold ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
                    {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Min Level</p>
                  <p className="text-lg font-medium text-gray-600">{item.minLevel}</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-3">
                <span className="text-gray-400">Location:</span> {item.location}
              </p>

              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedItem(item); setShowAddModal(true); }}
                  className="flex-1 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors flex items-center justify-center gap-1"
                >
                  <FiPlus size={16} />
                  Add
                </button>
                <button 
                  onClick={() => { setSelectedItem(item); setShowRemoveModal(true); }}
                  className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                >
                  <FiMinus size={16} />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Stock Modal */}
      {showAddModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Add Stock</h3>
              <button 
                onClick={() => { setShowAddModal(false); setQuantity(1); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">Adding stock for: <span className="font-semibold">{selectedItem.name}</span></p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleAddStock}
                  className="flex-1 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  Add Stock
                </button>
                <button 
                  onClick={() => { setShowAddModal(false); setQuantity(1); }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Stock Modal */}
      {showRemoveModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Remove Stock</h3>
              <button 
                onClick={() => { setShowRemoveModal(false); setQuantity(1); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">Removing stock for: <span className="font-semibold">{selectedItem.name}</span></p>
              <p className="text-sm text-gray-500">Current quantity: {selectedItem.quantity}</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Remove</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleRemoveStock}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Remove Stock
                </button>
                <button 
                  onClick={() => { setShowRemoveModal(false); setQuantity(1); }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffInventory;
