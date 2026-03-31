import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../../components/UIHelper/Card';
import Button from '../../components/UIHelper/Button';
import Badge from '../../components/UIHelper/Badge';

const API_BASE = 'http://localhost:5000/api';

const BorrowedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/student/borrowed-books`, getConfig());
      setBorrowedBooks(response.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const handleReturn = async (bookId) => {
    await axios.post(`${API_BASE}/student/books/${bookId}/return`, {}, getConfig());
    await fetchBorrowedBooks();
  };

  const handleRenew = async (bookId) => {
    await axios.post(`${API_BASE}/student/books/${bookId}/renew`, {}, getConfig());
    await fetchBorrowedBooks();
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading borrowed books...</div>;
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Borrowed Books</h1>
        <p className="text-gray-600">Live borrowed-book data from the library database</p>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Currently Borrowed Books</h2>
        <div className="space-y-6">
          {borrowedBooks.map((book) => (
            <div key={book._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <img src={book.image} alt={book.title} className="w-24 h-32 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{book.title}</h3>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                      <p className="text-xs text-gray-500">ISBN: {book.isbn || 'N/A'}</p>
                    </div>
                    <Badge variant={book.status === 'due_soon' ? 'danger' : 'warning'}>{book.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 my-4">
                    <div>
                      <p className="text-xs text-gray-600">Borrowed Date</p>
                      <p className="text-sm font-medium">{new Date(book.borrowDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Due Date</p>
                      <p className="text-sm font-medium">{new Date(book.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleRenew(book.id)}>Renew</Button>
                    <Button variant="danger" size="sm" onClick={() => handleReturn(book.id)}>Return</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {borrowedBooks.length === 0 && <p className="text-gray-600">No borrowed books at the moment.</p>}
        </div>
      </Card>
    </div>
  );
};

export default BorrowedBooks;
