import React, { useState } from 'react';
import { FiPackage, FiPlus, FiMinus, FiAlertTriangle, FiCheckCircle, FiSearch } from 'react-icons/fi';

const StaffInventory = () => {
  const [inventory] = useState([
    { id: 1, name: 'Quran - Standard Edition', category: 'Religious', quantity: 150, minLevel: 20, location: 'Shelf A1' },
    { id: 2, name: 'Arabic Grammar Book', category: 'Educational', quantity: 45, minLevel: 15, location: 'Shelf B2' },
    { id: 3, name: 'Islamic History Vol. 1', category: 'Educational', quantity: 12, minLevel: 10, location: 'Shelf B3' },
    { id: 4, name: 'Prayer Mats', category: 'Supplies', quantity: 200, minLevel: 50, location: 'Storage C1' },
    { id: 5, name: 'Whiteboard Markers', category: 'Supplies', quantity: 8, minLevel: 20, location: 'Storage C2' },
    { id: 6, name: 'Notebooks', category: 'Supplies', quantity: 500, minLevel: 100, location: 'Storage C3' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(item => item.quantity <= item.minLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-gray-500 mt-1">Track and manage school inventory</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-md transition-shadow flex items-center gap-2">
          <FiPlus size={16} />
          Add Item
        </button>
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
                <button className="flex-1 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors flex items-center justify-center gap-1">
                  <FiPlus size={16} />
                  Add
                </button>
                <button className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1">
                  <FiMinus size={16} />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaffInventory;
