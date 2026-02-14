import React, { useState } from 'react';
import Card from '../UIHelper/Card';
import Badge from '../UIHelper/Badge';
import Button from '../UIHelper/Button';
import Input from '../UIHelper/Input';

const Library = () => {
  const [books, setBooks] = useState([
    {
      id: 1,
      title: 'Introduction to Computer Science',
      author: 'John Smith',
      isbn: '978-0123456789',
      category: 'Computer Science',
      status: 'available',
      dueDate: null,
      borrowDate: null,
      image: 'https://via.placeholder.com/120x160/4f46e5/ffffff?text=CS'
    },
    {
      id: 2,
      title: 'Advanced Mathematics',
      author: 'Dr. Ahmed Hassan',
      isbn: '978-0987654321',
      category: 'Mathematics',
      status: 'borrowed',
      dueDate: '2024-03-15',
      borrowDate: '2024-02-15',
      image: 'https://via.placeholder.com/120x160/ef4444/ffffff?text=MATH'
    },
    {
      id: 3,
      title: 'Islamic Jurisprudence',
      author: 'Sheikh Omar Farooq',
      isbn: '978-1122334455',
      category: 'Islamic Studies',
      status: 'reserved',
      dueDate: null,
      borrowDate: null,
      image: 'https://via.placeholder.com/120x160/10b981/ffffff?text=ISLAM'
    },
    {
      id: 4,
      title: 'Modern Physics',
      author: 'Prof. Sarah Johnson',
      isbn: '978-5566778899',
      category: 'Physics',
      status: 'available',
      dueDate: null,
      borrowDate: null,
      image: 'https://via.placeholder.com/120x160/f59e0b/ffffff?text=PHYSICS'
    }
  ]);

  const [borrowedBooks, setBorrowedBooks] = useState([
    {
      id: 2,
      title: 'Advanced Mathematics',
      author: 'Dr. Ahmed Hassan',
      borrowDate: '2024-02-15',
      dueDate: '2024-03-15',
      renewals: 1,
      status: 'due_soon'
    }
  ]);

  const [reservations, setReservations] = useState([
    {
      id: 3,
      title: 'Islamic Jurisprudence',
      author: 'Sheikh Omar Farooq',
      reservationDate: '2024-02-10',
      position: 3,
      status: 'reserved'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('catalog');

  const categories = [...new Set(books.map(book => book.category))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'borrowed':
        return 'warning';
      case 'reserved':
        return 'primary';
      case 'due_soon':
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleBorrow = (bookId) => {
    setBooks(books.map(book => 
      book.id === bookId ? { ...book, status: 'borrowed', borrowDate: new Date().toISOString().split('T')[0], dueDate: '2024-03-15' } : book
    ));
    
    const borrowedBook = books.find(book => book.id === bookId);
    setBorrowedBooks([...borrowedBooks, {
      ...borrowedBook,
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: '2024-03-15',
      renewals: 0,
      status: 'borrowed'
    }]);
  };

  const handleReturn = (bookId) => {
    setBooks(books.map(book => 
      book.id === bookId ? { ...book, status: 'available', borrowDate: null, dueDate: null } : book
    ));
    
    setBorrowedBooks(borrowedBooks.filter(book => book.id !== bookId));
  };

  const handleRenew = (bookId) => {
    setBorrowedBooks(borrowedBooks.map(book => 
      book.id === bookId ? { ...book, dueDate: new Date(new Date(book.dueDate).setDate(new Date(book.dueDate).getDate() + 14)).toISOString().split('T')[0], renewals: book.renewals + 1 } : book
    ));
    
    setBooks(books.map(book => 
      book.id === bookId ? { ...book, dueDate: new Date(new Date(book.dueDate).setDate(new Date(book.dueDate).getDate() + 14)).toISOString().split('T')[0] } : book
    ));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Library Services</h1>
        <p className="text-gray-600">Browse books, manage borrowed items, and access learning resources</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'catalog'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Book Catalog
            </button>
            <button
              onClick={() => setActiveTab('borrowed')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'borrowed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Borrowed Books
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reservations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Reservations
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <Input
          label="Search Books"
          placeholder="Search by title, author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <Card key={book.id} className="hover:shadow-md transition-shadow">
              <div className="flex">
                <img 
                  src={book.image} 
                  alt={book.title} 
                  className="w-24 h-32 object-cover rounded-lg mr-4"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                  <p className="text-xs text-gray-500 mb-2">ISBN: {book.isbn}</p>
                  <Badge variant={getStatusColor(book.status)}>
                    {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{book.category}</p>
                  
                  {book.status === 'available' && (
                    <div className="mt-3">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleBorrow(book.id)}
                      >
                        Borrow
                      </Button>
                    </div>
                  )}
                  
                  {book.status === 'borrowed' && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-600">Due: {book.dueDate}</p>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRenew(book.id)}
                        >
                          Renew
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleReturn(book.id)}
                        >
                          Return
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {book.status === 'reserved' && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600">Reserved</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'borrowed' && (
        <div className="space-y-6">
          {borrowedBooks.length > 0 ? (
            borrowedBooks.map(book => (
              <Card key={book.id} className="hover:shadow-md transition-shadow">
                <div className="flex">
                  <img 
                    src={book.image} 
                    alt={book.title} 
                    className="w-24 h-32 object-cover rounded-lg mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-600">Borrowed Date</p>
                        <p className="text-sm font-medium">{book.borrowDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Due Date</p>
                        <p className={`text-sm font-medium ${new Date(book.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                          {book.dueDate}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant={getStatusColor(book.status)}>
                      {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                    </Badge>
                    
                    <div className="mt-3 flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRenew(book.id)}
                      >
                        Renew ({book.renewals}/3)
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleReturn(book.id)}
                      >
                        Return
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-600">No borrowed books at the moment.</p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="space-y-6">
          {reservations.length > 0 ? (
            reservations.map(reservation => (
              <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{reservation.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {reservation.author}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-600">Reservation Date</p>
                        <p className="text-sm font-medium">{reservation.reservationDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Position</p>
                        <p className="text-sm font-medium">#{reservation.position}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Status</p>
                        <Badge variant={getStatusColor(reservation.status)}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600">You are #{reservation.position} in the queue.</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-600">No book reservations at the moment.</p>
            </Card>
          )}
        </div>
      )}

      {/* Library Resources */}
      <div className="mt-8">
        <Card>
          <h3 className="text-xl font-semibold mb-4">Digital Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                E-Books
              </h4>
              <p className="text-sm text-blue-700 mt-1">Access thousands of digital books online anytime.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v3"></path>
                </svg>
                Journals
              </h4>
              <p className="text-sm text-green-700 mt-1">Research papers and academic journals.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Audio Books
              </h4>
              <p className="text-sm text-purple-700 mt-1">Listen to books while studying or commuting.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Library Hours */}
      <div className="mt-6">
        <Card>
          <h3 className="text-xl font-semibold mb-4">Library Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Weekdays</h4>
              <p className="text-gray-600">Monday - Friday: 8:00 AM - 9:00 PM</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Weekends</h4>
              <p className="text-gray-600">Saturday - Sunday: 10:00 AM - 6:00 PM</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Library;