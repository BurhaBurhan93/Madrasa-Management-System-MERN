import { useState, useEffect } from 'react';

import axios from 'axios';

import Button from '../../../components/UIHelper/Button';

import Card from '../../../components/UIHelper/Card';

import { PieChartComponent } from '../../../components/UIHelper/ECharts';

import { FiPlus, FiEdit2, FiTrash2, FiX, FiEye } from 'react-icons/fi';



const api = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });



const Suppliers = () => {

  const [suppliers, setSuppliers] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [editItem, setEditItem] = useState(null);

  const [historyModal, setHistoryModal] = useState(null);

  const [history, setHistory] = useState(null);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', address: '', itemsSupplied: '', status: 'active', notes: '' });



  useEffect(() => { fetchSuppliers(); }, []);



  const fetchSuppliers = async () => {

    setLoading(true);

    try {

      const res = await axios.get('http://localhost:5000/api/kitchen/suppliers', api());

      if (res.data.success) setSuppliers(res.data.data);

    } catch (e) { console.error(e); } finally { setLoading(false); }

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const payload = { ...form, itemsSupplied: form.itemsSupplied.split(',').map(i => i.trim()).filter(Boolean) };

      if (editItem) {

        await axios.put(`http://localhost:5000/api/kitchen/suppliers/${editItem._id}`, payload, api());

      } else {

        await axios.post('http://localhost:5000/api/kitchen/suppliers', payload, api());

      }

      fetchSuppliers();

      setShowModal(false);

      setEditItem(null);

      setForm({ name: '', phone: '', address: '', itemsSupplied: '', status: 'active', notes: '' });

    } catch (e) { alert(e.response?.data?.message || 'Failed to save'); }

  };



  const handleEdit = (s) => {

    setEditItem(s);

    setForm({ name: s.name, phone: s.phone || '', address: s.address || '', itemsSupplied: s.itemsSupplied?.join(', ') || '', status: s.status, notes: s.notes || '' });

    setShowModal(true);

  };



  const handleDelete = async (id) => {

    if (!window.confirm('Delete this supplier?')) return;

    try { await axios.delete(`http://localhost:5000/api/kitchen/suppliers/${id}`, api()); fetchSuppliers(); }

    catch (e) { alert('Failed to delete'); }

  };



  const viewHistory = async (supplier) => {

    setHistoryModal(supplier);

    try {

      const res = await axios.get(`http://localhost:5000/api/kitchen/suppliers/${supplier._id}/history`, api());

      if (res.data.success) setHistory(res.data.data);

    } catch (e) { console.error(e); }

  };



  return (

    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>

          <p className="text-sm text-gray-500">Manage kitchen suppliers and purchase history</p>

        </div>

        <Button onClick={() => { setEditItem(null); setForm({ name: '', phone: '', address: '', itemsSupplied: '', status: 'active', notes: '' }); setShowModal(true); }} className="bg-cyan-500 hover:bg-cyan-600 text-white">

          <FiPlus className="inline mr-1" /> Add Supplier

        </Button>

      </div>



      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-white rounded-xl shadow p-4 text-center">

          <div className="text-2xl font-bold text-gray-700">{suppliers.length}</div>

          <div className="text-sm text-gray-500">Total Suppliers</div>

        </div>

        <div className="bg-white rounded-xl shadow p-4 text-center">

          <div className="text-2xl font-bold text-green-600">{suppliers.filter(s => s.status === 'active').length}</div>

          <div className="text-sm text-gray-500">Active</div>

        </div>

      </div>



      {/* Chart Section */}

      <Card title="Supplier Status Distribution">

        <PieChartComponent 

          data={[

            { name: 'Active', value: suppliers.filter(s => s.status === 'active').length, color: '#10B981' },

            { name: 'Inactive', value: suppliers.filter(s => s.status === 'inactive').length, color: '#EF4444' }

          ].filter(d => d.value > 0)}

          dataKey="value"

          nameKey="name"

          height={250}

        />

      </Card>



      {/* Table */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (

          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-600">

              <tr>

                <th className="p-3 text-left">Name</th>

                <th className="p-3 text-left">Phone</th>

                <th className="p-3 text-left">Items Supplied</th>

                <th className="p-3 text-left">Status</th>

                <th className="p-3 text-left">Actions</th>

              </tr>

            </thead>

            <tbody>

              {suppliers.length === 0 ? (

                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No suppliers found</td></tr>

              ) : suppliers.map(s => (

                <tr key={s._id} className="border-t hover:bg-gray-50">

                  <td className="p-3 font-medium">{s.name}</td>

                  <td className="p-3">{s.phone || '-'}</td>

                  <td className="p-3 text-gray-500">{s.itemsSupplied?.join(', ') || '-'}</td>

                  <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full font-medium ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.status}</span></td>

                  <td className="p-3 flex gap-2">

                    <button onClick={() => viewHistory(s)} className="text-purple-600 hover:text-purple-800"><FiEye size={16} /></button>

                    <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800"><FiEdit2 size={16} /></button>

                    <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:text-red-800"><FiTrash2 size={16} /></button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>



      {/* Add/Edit Modal */}

      {showModal && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-xl font-bold">{editItem ? 'Edit Supplier' : 'Add Supplier'}</h2>

              <button onClick={() => setShowModal(false)}><FiX size={24} /></button>

            </div>

            <form onSubmit={handleSubmit} className="space-y-3">

              <input type="text" placeholder="Supplier Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />

              <input type="text" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />

              <input type="text" placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />

              <input type="text" placeholder="Items Supplied (comma separated)" value={form.itemsSupplied} onChange={e => setForm({ ...form, itemsSupplied: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500" />

              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500">

                <option value="active">Active</option>

                <option value="inactive">Inactive</option>

              </select>

              <div className="flex justify-end gap-3 pt-2">

                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>

                <Button type="submit">{editItem ? 'Update' : 'Add'}</Button>

              </div>

            </form>

          </div>

        </div>

      )}



      {/* History Modal */}

      {historyModal && history && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">

            <div className="flex justify-between items-center mb-4">

              <div>

                <h2 className="text-xl font-bold">{historyModal.name} — Purchase History</h2>

                <p className="text-sm text-gray-500">Total Spent: <span className="font-semibold text-red-600">{history.totalSpent?.toLocaleString()} AFN</span></p>

              </div>

              <button onClick={() => { setHistoryModal(null); setHistory(null); }}><FiX size={24} /></button>

            </div>

            <table className="w-full text-sm">

              <thead className="bg-gray-50">

                <tr>

                  <th className="p-3 text-left">Date</th>

                  <th className="p-3 text-left">Item</th>

                  <th className="p-3 text-left">Qty</th>

                  <th className="p-3 text-left">Total</th>

                </tr>

              </thead>

              <tbody>

                {history.purchases?.length === 0 ? (

                  <tr><td colSpan="4" className="p-6 text-center text-gray-500">No purchases yet</td></tr>

                ) : history.purchases?.map(p => (

                  <tr key={p._id} className="border-t">

                    <td className="p-3">{new Date(p.purchaseDate).toLocaleDateString()}</td>

                    <td className="p-3 font-medium">{p.itemName}</td>

                    <td className="p-3">{p.quantity} {p.unit}</td>

                    <td className="p-3 text-red-600">{p.totalPrice?.toLocaleString()} AFN</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>

  );

};



export default Suppliers;

