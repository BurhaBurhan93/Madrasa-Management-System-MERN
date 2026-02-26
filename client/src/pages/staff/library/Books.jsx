import React, { useMemo, useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';
import Select from '../../../components/UIHelper/Select';

const StaffLibraryBooks = () => {
  const [categories] = useState([
    { id: 'ISL', name: 'Islamic Studies' },
    { id: 'QUR', name: 'Quran' },
    { id: 'ARB', name: 'Arabic Language' },
  ]);
  const [books, setBooks] = useState([
    { id: 'b1', title: 'Fiqh Essentials', author: 'Ibn Rushd', category: 'ISL', stock: 12, isbn: '9780000001' },
    { id: 'b2', title: 'Tajweed Rules', author: 'H Al-Qari', category: 'QUR', stock: 8, isbn: '9780000002' },
  ]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [form, setForm] = useState({ id: '', title: '', author: '', category: 'ISL', stock: 0, isbn: '' });

  const filtered = useMemo(() => {
    return books.filter(b => {
      const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'all' || b.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [books, search, filterCat]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.author) return;
    if (form.id) {
      setBooks(prev => prev.map(b => (b.id === form.id ? { ...form, stock: Number(form.stock) } : b)));
    } else {
      setBooks(prev => [...prev, { ...form, id: Date.now().toString(), stock: Number(form.stock) }]);
    }
    setForm({ id: '', title: '', author: '', category: 'ISL', stock: 0, isbn: '' });
  };

  const onEdit = (b) => setForm(b);
  const onDelete = (id) => setBooks(prev => prev.filter(b => b.id !== id));

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Books</h1>
        <p className="text-gray-600">Add, edit and manage books and stock</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">{form.id ? 'Edit Book' : 'Add Book'}</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input label="Title" id="title" name="title" type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input label="Author" id="author" name="author" type="text" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
            <Input label="ISBN" id="isbn" name="isbn" type="text" value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} />
            <Select
              label="Category"
              id="category"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              options={categories.map(c => ({ value: c.id, label: c.name }))}
            />
            <Input label="Stock" id="stock" name="stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            <Button type="submit">{form.id ? 'Update' : 'Create'}</Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="px-3 py-2 border rounded" />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2 border rounded">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Author</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Stock</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td className="px-4 py-2">{b.title}</td>
                    <td className="px-4 py-2">{b.author}</td>
                    <td className="px-4 py-2">{categories.find(c => c.id === b.category)?.name || b.category}</td>
                    <td className="px-4 py-2">{b.stock}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => onEdit(b)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => onDelete(b.id)}>Delete</Button>
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

export default StaffLibraryBooks;
