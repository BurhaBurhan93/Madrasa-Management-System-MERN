import { useState } from 'react';

const Library = () => {
  const [books, setBooks] = useState([
    {
      id: 1,
      title: 'Introduction to Islamic Jurisprudence',
      author: 'Dr. Ahmed Hassan',
      isbn: '978-1-23456-78-9',
      category: 'Islamic Studies',
      copies: 5,
      available: 3,
      location: 'Section A, Shelf 3',
      description: 'Comprehensive guide to the fundamentals of Islamic jurisprudence.',
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      dueDate: '2024-03-15'
    },
    {
      id: 2,
      title: 'Advanced Calculus',
      author: 'Prof. Sarah Johnson',
      isbn: '978-0-98765-43-2',
      category: 'Mathematics',
      copies: 8,
      available: 2,
      location: 'Section B, Shelf 1',
      description: 'Covers advanced topics in calculus including multivariable calculus and differential equations.',
      coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e23d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 3,
      title: 'Modern Physics Principles',
      author: 'Dr. Muhammad Khan',
      isbn: '978-1-12345-67-8',
      category: 'Physics',
      copies: 6,
      available: 6,
      location: 'Section C, Shelf 2',
      description: 'Exploration of modern physics concepts including quantum mechanics and relativity.',
      coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e23d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 4,
      title: 'Classical Arabic Literature',
      author: 'Prof. Fatima Ahmed',
      isbn: '978-0-54321-09-7',
      category: 'Arabic',
      copies: 4,
      available: 1,
      location: 'Section D, Shelf 5',
      description: 'Collection of classical Arabic literary works with analysis and commentary.',
      coverImage: 'https://images.unsplash.com/photo-1629992101753-56d196c8aabb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 5,
      title: 'English Composition and Grammar',
      author: 'Dr. Robert Smith',
      isbn: '978-1-98765-43-1',
      category: 'English',
      copies: 10,
      available: 7,
      location: 'Section E, Shelf 4',
      description: 'Essential guide to English composition, grammar, and writing skills.',
      coverImage: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
    }
  ]);

  const [borrowedBooks, setBorrowedBooks] = useState([
    {
      id: 1,
      bookId: 1,
      title: 'Introduction to Islamic Jurisprudence',
      author: 'Dr. Ahmed Hassan',
      borrowDate: '2024-02-01',
      dueDate: '2024-03-01',
      returnDate: null,
      status: 'borrowed'
    }
  ]);

  const [learningResources, setLearningResources] = useState([
    {
      id: 1,
      title: 'Video Lectures: Quantum Physics',
      type: 'video',
      subject: 'Physics',
      duration: '45 mins',
      level: 'advanced',
      url: '#'
    },
    {
      id: 2,
      title: 'Arabic Calligraphy Tutorial',
      type: 'tutorial',
      subject: 'Arabic',
      duration: '30 mins',
      level: 'beginner',
      url: '#'
    },
    {
      id: 3,
      title: 'Islamic Ethics Case Studies',
      type: 'document',
      subject: 'Islamic Studies',
      duration: 'N/A',
      level: 'intermediate',
      url: '#'
    },
    {
      id: 4,
      title: 'Calculus Practice Problems',
      type: 'worksheet',
      subject: 'Mathematics',
      duration: 'N/A',
      level: 'intermediate',
      url: '#'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('books');
  const [showBookDetails, setShowBookDetails] = useState(null);

  const categories = ['all', 'Islamic Studies', 'Mathematics', 'Physics', 'Arabic', 'English'];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBorrowBook = (bookId) => {
    // In a real app, this would make an API call to borrow the book
    const book = books.find(b => b.id === bookId);
    if (book && book.available > 0) {
      const newBorrowedBook = {
        id: borrowedBooks.length + 1,
        bookId: book.id,
        title: book.title,
        author: book.author,
        borrowDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        returnDate: null,
        status: 'borrowed'
      };
      
      setBorrowedBooks(prev => [...prev, newBorrowedBook]);
      
      // Update book availability
      setBooks(prev => prev.map(b => 
        b.id === bookId ? { ...b, available: b.available - 1 } : b
      ));
      
      alert(`Successfully borrowed: ${book.title}`);
    } else {
      alert('Book is not available for borrowing.');
    }
  };

  const handleReturnBook = (bookId) => {
    // In a real app, this would make an API call to return the book
    setBorrowedBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, returnDate: new Date().toISOString().split('T')[0], status: 'returned' } : book
    ));
    
    // Update book availability
    const borrowedBook = borrowedBooks.find(b => b.id === bookId);
    if (borrowedBook) {
      setBooks(prev => prev.map(book => 
        book.id === borrowedBook.bookId ? { ...book, available: book.available + 1 } : book
      ));
    }
    
    alert('Book returned successfully!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return '🎬';
      case 'tutorial':
        return '🎓';
      case 'document':
        return '📄';
      case 'worksheet':
        return '📝';
      default:
        return '📚';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'tutorial':
        return 'bg-blue-100 text-blue-800';
      case 'document':
        return 'bg-green-100 text-green-800';
      case 'worksheet':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Library & Learning Resources</h2>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Request New Book
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('books')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'books'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Books Collection
            </button>
            <button
              onClick={() => setActiveTab('borrowed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'borrowed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Borrowed Books
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resources'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Learning Resources
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'books' && (
            <div>
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search books by title, author, or ISBN..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Books Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map(book => (
                  <div key={book.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex">
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-16 h-24 object-cover rounded border border-gray-200 mr-4"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{book.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                          <div className="flex items-center justify-between">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {book.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              book.available > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {book.available > 0 ? `${book.available} available` : 'Not available'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-600">
                        <p><strong>ISBN:</strong> {book.isbn}</p>
                        <p><strong>Location:</strong> {book.location}</p>
                        <p className="mt-2 line-clamp-2">{book.description}</p>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {book.available}/{book.copies} copies
                        </span>
                        <button
                          onClick={() => handleBorrowBook(book.id)}
                          disabled={book.available === 0}
                          className={`px-3 py-1 rounded text-sm ${
                            book.available > 0
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {book.available > 0 ? 'Borrow' : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredBooks.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Books Found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'borrowed' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">My Borrowed Books</h3>
              
              {borrowedBooks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrow Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {borrowedBooks.map(book => (
                        <tr key={book.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{book.title}</div>
                            <div className="text-sm text-gray-500">by {book.author}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(book.borrowDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(book.dueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              new Date(book.dueDate) < new Date() && !book.returnDate
                                ? 'bg-red-100 text-red-800'
                                : book.returnDate
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {book.returnDate ? 'Returned' : new Date(book.dueDate) < new Date() ? 'Overdue' : 'Borrowed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {!book.returnDate && (
                              <button
                                onClick={() => handleReturnBook(book.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Return
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Borrowed Books</h3>
                  <p className="text-gray-600">You haven't borrowed any books yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Resources</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {learningResources.map(resource => (
                  <div key={resource.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <span className="text-2xl mr-4">{getResourceIcon(resource.type)}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">{resource.title}</h4>
                        <div className="flex items-center space-x-4 mb-2">
                          <span className={`text-xs px-2 py-1 rounded ${getTypeColor(resource.type)}`}>
                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                          </span>
                          <span className="text-sm text-gray-600">{resource.subject}</span>
                          <span className="text-sm text-gray-600">{resource.level}</span>
                        </div>
                        <p className="text-sm text-gray-600">Duration: {resource.duration}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        Access Resource
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Due Date Reminders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Book Due Reminders</h3>
        <div className="space-y-3">
          {borrowedBooks
            .filter(book => !book.returnDate && new Date(book.dueDate) >= new Date())
            .map(book => (
              <div key={book.id} className="flex items-center p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">{book.title} is due on {formatDate(book.dueDate)}</p>
                  <p className="text-xs text-yellow-700">Borrowed on {formatDate(book.borrowDate)}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Library;