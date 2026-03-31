import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';
import Select from '../../../components/UIHelper/Select';
import ErrorPage from '../../../components/UIHelper/ErrorPage';

const StaffLibraryBooks = () => {
  console.log('[StaffLibraryBooks] Component initializing...');
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [form, setForm] = useState({ id: '', title: '', author: '', category: '', stock: 0, isbn: '' });

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[StaffLibraryBooks] Token exists:', !!token);
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    console.log('[StaffLibraryBooks] useEffect triggered - fetching data from API...');
    fetchBooksData();
    fetchCategories();
  }, []);

  const fetchBooksData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StaffLibraryBooks] Fetching books from API...');
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/staff/library/books', config);
      
      console.log('[StaffLibraryBooks] Books API response:', response.data);
      setBooks(response.data || []);
    } catch (err) {
      console.error('[StaffLibraryBooks] Error fetching books:', err);
      setError('Failed to fetch books. Please try again.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('[StaffLibraryBooks] Fetching categories from API...');
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/staff/library/categories', config);
      
      console.log('[StaffLibraryBooks] Categories API response:', response.data);
      const formattedCategories = (response.data || []).map(c => ({
        id: c._id,
        name: c.name
      }));
      setCategories(formattedCategories);
      
      // Set default category if available
      if (formattedCategories.length > 0 && !form.category) {
        setForm(prev => ({ ...prev, category: formattedCategories[0].id }));
      }
    } catch (err) {
      console.error('[StaffLibraryBooks] Error fetching categories:', err);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author) return;
    
    console.log('[StaffLibraryBooks] Submitting book form:', form);
    try {
      const config = getConfig();
      const bookData = {
        title: form.title,
        author: form.author,
        category: form.category,
        stock: Number(form.stock),
        isbn: form.isbn,
        available: Number(form.stock)
      };
      
      if (form.id) {
        await axios.put(`http://localhost:5000/api/staff/library/books/${form.id}`, bookData, config);
        console.log('[StaffLibraryBooks] Book updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/staff/library/books', bookData, config);
        console.log('[StaffLibraryBooks] Book created successfully');
      }
      
      setForm({ id: '', title: '', author: '', category: categories[0]?.id || '', stock: 0, isbn: '' });
      fetchBooksData();
    } catch (err) {
      console.error('[StaffLibraryBooks] Error saving book:', err);
      alert('Failed to save book. Please try again.');
    }
  };

  const onEdit = (b) => {
    console.log('[StaffLibraryBooks] Editing book:', b);
    setForm({
      id: b.id,
      title: b.title,
      author: b.author,
      category: b.category,
      stock: b.stock,
      isbn: b.isbn
    });
  };

  const onDelete = async (id) => {
    console.log('[StaffLibraryBooks] Deleting book:', id);
    try {
      const config = getConfig();
      await axios.delete(`http://localhost:5000/api/staff/library/books/${id}`, config);
      console.log('[StaffLibraryBooks] Book deleted successfully');
      fetchBooksData();
    } catch (err) {
      console.error('[StaffLibraryBooks] Error deleting book:', err);
      alert('Failed to delete book. Please try again.');
    }
  };

  const filtered = useMemo(() => {
    return books.filter(b => {
      const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'all' || b.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [books, search, filterCat]);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Books</h1>
        <p className="text-gray-600">Add, edit and manage books and stock</p>
      </div>

      {error && !loading && (
        <ErrorPage 
          type="server" 
          title="Library Books Unavailable"
          message={error}
          onRetry={fetchBooksData}
          onHome={() => window.location.href = '/staff/dashboard'}
          showBackButton={false}
        />
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading books...</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default StaffLibraryBooks;
