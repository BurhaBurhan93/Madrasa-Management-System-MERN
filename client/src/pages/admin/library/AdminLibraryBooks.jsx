import React, { useState, useEffect } from 'react';
import Card from '../../../components/UIHelper/Card';
import { FiBook, FiUser, FiCalendar, FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';

const AdminLibraryBooks = () => {
  const [books, setBooks] = useState([
    { id: 1, title: 'Mathematics Grade 1', author: 'Dr. Ahmed Khan', isbn: '978-1234567890', category: 'Mathematics', copies: 25, available: 18, published: '2022' },
    { id: 2, title: 'English Grammar', author: 'Ms. Fatima Ali', isbn: '978-1234567891', category: 'English', copies: 20, available: 12, published: '2021' },
    { id: 3, title: 'Science Experiments', author: 'Prof. Hassan Raza', isbn: '978-1234567892', category: 'Science', copies: 30, available: 22, published: '2023' },
    { id: 4, title: 'Islamic Studies', author: 'Sheikh Muhammad', isbn: '978-1234567893', category: 'Religion', copies: 40, available: 35, published: '2020' },
    { id: 5, title: 'Computer Basics', author: 'Mr. Ali Ahmed', isbn: '978-1234567894', category: 'Computer', copies: 15, available: 8, published: '2022' },
    { id: 6, title: 'History of Pakistan', author: 'Dr. Sara Khan', isbn: '978-1234567895', category: 'History', copies: 22, available: 15, published: '2021' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Mathematics',
    copies: '',
    published: ''
  });

  const categories = ['All', 'Mathematics', 'English', 'Science', 'Religion', 'Computer', 'History', 'Geography', 'Urdu'];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalBooks = books.reduce((sum, book) => sum + book.copies, 0);
  const totalAvailable = books.reduce((sum, book) => sum + book.available, 0);
  const totalBorrowed = totalBooks - totalAvailable;

  const handleAddBook = () => {
    if (!newBook.title || !newBook.author || !newBook.isbn || !newBook.copies) {
      alert('Please fill all required fields');
      return;
    }

    const newBookObj = {
      id: books.length + 1,
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn,
      category: newBook.category,
      copies: parseInt(newBook.copies),
      available: parseInt(newBook.copies),
      published: newBook.published || '2023'
    };

    setBooks([...books, newBookObj]);
    setNewBook({ title: '', author: '', isbn: '', category: 'Mathematics', copies: '', published: '' });
    setShowAddModal(false);
    alert('Book added successfully');
  };

  const handleDeleteBook = (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      setBooks(books.filter(book => book.id !== id));
      alert('Book deleted successfully');
    }
  };

  const BookCard = ({ book }) => {
    const availabilityPercentage = Math.round((book.available / book.copies) * 100);
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{book.title}</h3>
            <p className="text-gray-600">by {book.author}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
              <FiEdit2 size={18} />
            </button>
            <button 
              onClick={() => handleDeleteBook(book.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">ISBN:</span>
            <span className="font-mono text-gray-900">{book.isbn}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Category:</span>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {book.category}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Published:</span>
            <span className="font-medium text-gray-900">{book.published}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Availability</span>
            <span className="text-sm font-medium text-gray-900">
              {book.available}/{book.copies} copies
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                availabilityPercentage > 50 ? 'bg-green-500' : 
                availabilityPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${availabilityPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium text-sm">
            View Details
          </button>
          <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
            Borrow History
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📚 Library Books Management</h1>
          <p className="text-gray-600 mt-1">Manage all library books and inventory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg"
        >
          <FiPlus size={18} /> Add New Book
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Books</p>
              <p className="text-2xl font-bold">{books.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiBook size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Copies</p>
              <p className="text-2xl font-bold">{totalBooks}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiBook size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Available Copies</p>
              <p className="text-2xl font-bold">{totalAvailable}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiBook size={24} />
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Borrowed Copies</p>
              <p className="text-2xl font-bold">{totalBorrowed}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <FiUser size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search books by title, author, or ISBN..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
              <option>Sort by Title</option>
              <option>Sort by Author</option>
              <option>Sort by Availability</option>
              <option>Sort by Category</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {/* Category Distribution */}
      <Card className="mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Books by Category</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Books</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Copies</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available Copies</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrowed Copies</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.filter(cat => cat !== 'All').map(category => {
                const categoryBooks = books.filter(book => book.category === category);
                const totalCopies = categoryBooks.reduce((sum, book) => sum + book.copies, 0);
                const availableCopies = categoryBooks.reduce((sum, book) => sum + book.available, 0);
                const borrowedCopies = totalCopies - availableCopies;
                const availabilityPercentage = totalCopies > 0 ? Math.round((availableCopies / totalCopies) * 100) : 0;

                return (
                  <tr key={category}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{categoryBooks.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{totalCopies}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{availableCopies}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{borrowedCopies}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              availabilityPercentage > 50 ? 'bg-green-500' : 
                              availabilityPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${availabilityPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{availabilityPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Book</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newBook.title}
                  onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                  placeholder="Enter book title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newBook.author}
                  onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                  placeholder="Enter author name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                  placeholder="Enter ISBN number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newBook.category}
                  onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                >
                  {categories.filter(cat => cat !== 'All').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Copies *</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newBook.copies}
                  onChange={(e) => setNewBook({...newBook, copies: e.target.value})}
                  placeholder="Enter number of copies"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={newBook.published}
                  onChange={(e) => setNewBook({...newBook, published: e.target.value})}
                  placeholder="e.g., 2023"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddBook}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Add Book
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLibraryBooks;