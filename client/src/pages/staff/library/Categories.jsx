import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';
import ErrorPage from '../../../components/UIHelper/ErrorPage';

const API_BASE = 'http://localhost:5000/api';

const StaffLibraryCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ id: '', name: '', description: '' });

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/staff/library/categories`, getConfig());
      setCategories(response.data || []);
    } catch (err) {
      setError('Failed to fetch categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    fetchCategories();
    const intervalId = window.setInterval(fetchCategories, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  const filtered = useMemo(
    () => categories.filter((category) => category.name?.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, description: form.description };
    if (form.id) {
      await axios.put(`${API_BASE}/staff/library/categories/${form.id}`, payload, getConfig());
    } else {
      await axios.post(`${API_BASE}/staff/library/categories`, payload, getConfig());
    }
    setForm({ id: '', name: '', description: '' });
    await fetchCategories();
  };

  const onEdit = (category) => setForm({ id: category._id, name: category.name || '', description: category.description || '' });

  const onDelete = async (id) => {
    await axios.delete(`${API_BASE}/staff/library/categories/${id}`, getConfig());
    await fetchCategories();
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Library Categories</h1>
        <p className="text-gray-600">Manage book categories with live database records</p>
      </div>

      {error && !loading && (
        <ErrorPage
          type="generic"
          title="Unable to Load Categories"
          message={error}
          onRetry={fetchCategories}
          onHome={() => { window.location.href = '/staff/dashboard'; }}
          showBackButton={false}
        />
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">{form.id ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Button type="submit">{form.id ? 'Update' : 'Create'}</Button>
            </form>
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Categories</h2>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="px-3 py-2 border rounded" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((category) => (
                    <tr key={category._id}>
                      <td className="px-4 py-2">{category.name}</td>
                      <td className="px-4 py-2">{category.description || '-'}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => onEdit(category)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => onDelete(category._id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StaffLibraryCategories;
