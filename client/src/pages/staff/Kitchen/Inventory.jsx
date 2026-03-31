import { useState, useEffect } from 'react';

import axios from 'axios';

import Button from '../../../components/UIHelper/Button';

import Card from '../../../components/UIHelper/Card';

import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';

import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';



const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });



const statusColors = { available: 'bg-green-100 text-green-700', low: 'bg-yellow-100 text-yellow-700', out: 'bg-red-100 text-red-700' };

const units = ['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag', 'bottle'];



const Inventory = () => {

  const [items, setItems] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [editItem, setEditItem] = useState(null);

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ itemName: '', category: '', quantity: '', unit: 'kg', minimumStock: 0, unitPrice: 0 });



  useEffect(() => { fetchInventory(); }, []);



  const fetchInventory = async () => {

    setLoading(true);

    try {

      const res = await axios.get('http://localhost:5000/api/kitchen/inventory', api());

      if (res.data.success) setItems(res.data.data);

    } catch (e) { console.error(e); } finally { setLoading(false); }

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      if (editItem) {

        await axios.put(`http://localhost:5000/api/kitchen/inventory/${editItem._id}`, form, api());

      } else {

        await axios.post('http://localhost:5000/api/kitchen/inventory', form, api());

      }

      fetchInventory();

      setShowModal(false);

      setEditItem(null);

      setForm({ itemName: '', category: '', quantity: '', unit: 'kg', minimumStock: 0, unitPrice: 0 });

    } catch (e) { alert(e.response?.data?.message || 'Failed to save'); }

  };



  const handleEdit = (item) => {

    setEditItem(item);

    setForm({ itemName: item.itemName, category: item.category || '', quantity: item.quantity, unit: item.unit, minimumStock: item.minimumStock, unitPrice: item.unitPrice });

    setShowModal(true);

  };



  const handleDelete = async (id) => {

    if (!window.confirm('Delete this item?')) return;

    try {

      await axios.delete(`http://localhost:5000/api/kitchen/inventory/${id}`, api());

      fetchInventory();

    } catch (e) { alert('Failed to delete'); }

  };



  const filtered = items.filter(i => i.itemName.toLowerCase().includes(search.toLowerCase()));

  const stats = { total: items.length, low: items.filter(i => i.status === 'low').length, out: items.filter(i => i.status === 'out').length };



  return (

    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-2xl font-bold text-gray-800">Kitchen Inventory</h1>

          <p className="text-sm text-gray-500">Track and manage kitchen stock</p>

        </div>

        <Button onClick={() => { setEditItem(null); setForm({ itemName: '', category: '', quantity: '', unit: 'kg', minimumStock: 0, unitPrice: 0 }); setShowModal(true); }} className="bg-cyan-500 hover:bg-cyan-600 text-white">

          <FiPlus className="inline mr-1" /> Add Item

        </Button>

      </div>



      {/* Stats */}

      <div className="grid grid-cols-3 gap-4">

        {[{ label: 'Total Items', value: stats.total, color: 'text-gray-700' }, { label: 'Low Stock', value: stats.low, color: 'text-yellow-600' }, { label: 'Out of Stock', value: stats.out, color: 'text-red-600' }].map(c => (

          <div key={c.label} className="bg-white rounded-xl shadow p-4 text-center">

            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>

            <div className="text-sm text-gray-500">{c.label}</div>

          </div>

        ))}

      </div>



      {/* Charts Section */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card title="Stock Status Distribution">

          <PieChartComponent 

            data={[

              { name: 'Available', value: items.filter(i => i.status === 'available').length, color: '#10B981' },

              { name: 'Low Stock', value: items.filter(i => i.status === 'low').length, color: '#F59E0B' },

              { name: 'Out of Stock', value: items.filter(i => i.status === 'out').length, color: '#EF4444' }

            ].filter(d => d.value > 0)}

            dataKey="value"

            nameKey="name"

            height={250}

          />

        </Card>



        <Card title="Items by Category">

          <BarChartComponent 

            data={Array.from(new Set(items.map(i => i.category))).map((cat, idx) => ({

              name: cat || 'Uncategorized',

              value: items.filter(i => i.category === cat).length

            }))}

            dataKey="value"

            nameKey="name"

            height={250}

          />

        </Card>

      </div>



      {/* Search */}

      <div className="bg-white p-4 rounded-xl shadow">

        <input type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />

      </div>



      {/* Table */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (

          <table className="w-full text-left">

            <thead className="bg-gray-50 text-gray-600 text-sm">

              <tr>

                <th className="p-3">Item Name</th>

                <th className="p-3">Category</th>

                <th className="p-3">Quantity</th>

                <th className="p-3">Unit</th>

                <th className="p-3">Min Stock</th>

                <th className="p-3">Status</th>

                <th className="p-3">Actions</th>

              </tr>

            </thead>

            <tbody>

              {filtered.length === 0 ? (

                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No items found</td></tr>

              ) : filtered.map(item => (

                <tr key={item._id} className="border-t hover:bg-gray-50">

                  <td className="p-3 font-medium">{item.itemName}</td>

                  <td className="p-3">{item.category || '-'}</td>

                  <td className="p-3 font-semibold">{item.quantity}</td>

                  <td className="p-3">{item.unit}</td>

                  <td className="p-3">{item.minimumStock}</td>

                  <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[item.status]}`}>{item.status}</span></td>

                  <td className="p-3 space-x-2">

                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800"><FiEdit2 size={16} /></button>

                    <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-800"><FiTrash2 size={16} /></button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>



      {/* Modal */}

      {showModal && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-xl font-bold">{editItem ? 'Edit Item' : 'Add Item'}</h2>

              <button onClick={() => setShowModal(false)}><FiX size={24} /></button>

            </div>

            <form onSubmit={handleSubmit} className="space-y-3">

              <input type="text" placeholder="Item Name *" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />

              <input type="text" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />

              <div className="grid grid-cols-2 gap-3">

                <input type="number" placeholder="Quantity *" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="0" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />

                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">

                  {units.map(u => <option key={u} value={u}>{u}</option>)}

                </select>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <input type="number" placeholder="Min Stock" value={form.minimumStock} onChange={e => setForm({ ...form, minimumStock: e.target.value })} min="0" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />

                <input type="number" placeholder="Unit Price" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} min="0" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />

              </div>

              <div className="flex justify-end gap-3 pt-2">

                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>

                <Button type="submit">{editItem ? 'Update' : 'Add'}</Button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

};



export default Inventory;

