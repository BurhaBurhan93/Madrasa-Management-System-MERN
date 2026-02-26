import React, { useMemo, useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';

const StaffLibraryCategories = () => {
  const [categories, setCategories] = useState([
    { id: '1', name: 'Islamic Studies', code: 'ISL', status: 'active' },
    { id: '2', name: 'Quran', code: 'QUR', status: 'active' },
    { id: '3', name: 'Arabic Language', code: 'ARB', status: 'active' },
  ]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ id: '', name: '', code: '' });
  const filtered = useMemo(
    () =>
      categories.filter(
        c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      ),
    [categories, search]
  );

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.code) return;
    if (form.id) {
      setCategories(prev => prev.map(c => (c.id === form.id ? { ...c, name: form.name, code: form.code } : c)));
    } else {
      setCategories(prev => [...prev, { id: Date.now().toString(), name: form.name, code: form.code, status: 'active' }]);
    }
    setForm({ id: '', name: '', code: '' });
  };

  const onEdit = (cat) => setForm(cat);
  const onDelete = (id) => setCategories(prev => prev.filter(c => c.id !== id));

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Library Categories</h1>
        <p className="text-gray-600">Add, edit and manage book categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">{form.id ? 'Edit Category' : 'Add Category'}</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input label="Name" id="name" name="name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input label="Code" id="code" name="code" type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            <Button type="submit">{form.id ? 'Update' : 'Create'}</Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Categories</h2>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="px-3 py-2 border rounded"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 tracking-wider">Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(cat => (
                  <tr key={cat.id}>
                    <td className="px-4 py-2">{cat.name}</td>
                    <td className="px-4 py-2">{cat.code}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => onEdit(cat)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => onDelete(cat.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StaffLibraryCategories;
