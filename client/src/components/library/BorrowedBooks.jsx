import React, { useState } from 'react';
import Card from '../../components/UIHelper/Card';
import Badge from '../../components/UIHelper/Badge';
import Button from '../../components/UIHelper/Button';

const BorrowedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([
    {
      id: 2,
      title: 'Advanced Mathematics',
      author: 'Dr. Ahmed Hassan',
      isbn: '978-0987654321',
      category: 'Mathematics',
      borrowDate: '2024-02-15',
      dueDate: '2024-03-15',
      renewals: 1,
      status: 'due_soon',
      image: 'https://via.placeholder.com/120x160/ef4444/ffffff?text=MATH'
    },
    {
      id: 5,
      title: 'Computer Algorithms',
      author: 'Jane Doe',
      isbn: '978-1122334456',
      category: 'Computer Science',
      borrowDate: '2024-02-10',
      dueDate: '2024-03-10',
      renewals: 0,
      status: 'borrowed',
      image: 'https://via.placeholder.com/120x160/8b5cf6/ffffff?text=ALGO'
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

  const handleReturn = (bookId) => {
    setBorrowedBooks(borrowedBooks.filter(book => book.id !== bookId));
  };

  const handleRenew = (bookId) => {
    setBorrowedBooks(borrowedBooks.map(book => 
      book.id === bookId ? { ...book, dueDate: new Date(new Date(book.dueDate).setDate(new Date(book.dueDate).getDate() + 14)).toISOString().split('T')[0], renewals: book.renewals + 1 } : book
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Borrowed Books</h1>
        <p className="text-gray-600">Manage your borrowed books and renewal requests</p>
      </div>

      {/* Borrowed Books Section */}
      <div className="mb-8">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Currently Borrowed Books</h2>
          {borrowedBooks.length > 0 ? (
            <div className="space-y-6">
              {borrowedBooks.map(book => (
                <div key={book.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <img 
                      src={book.image} 
                      alt={book.title} 
                      className="w-24 h-32 object-cover rounded-lg mr-4 mb-4 md:mb-0"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{book.title}</h3>
                          <p className="text-sm text-gray-600 mb-1">by {book.author}</p>
                          <p className="text-xs text-gray-500 mb-2">ISBN: {book.isbn}</p>
                          <p className="text-xs text-gray-500 mb-2">{book.category}</p>
                        </div>
                        <Badge variant={getStatusColor(book.status)}>
                          {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 my-4">
                        <div>
                          <p className="text-xs text-gray-600">Borrowed Date</p>
                          <p className="text-sm font-medium">{formatDate(book.borrowDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Due Date</p>
                          <p className={`text-sm font-medium ${new Date(book.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatDate(book.dueDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No borrowed books at the moment.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Reservation Section */}
      <div>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Book Reservations</h2>
          {reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.map(reservation => (
                <div key={reservation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{reservation.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">by {reservation.author}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Reservation Date</p>
                          <p className="text-sm font-medium">{formatDate(reservation.reservationDate)}</p>
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No book reservations at the moment.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Borrowing Policies */}
      <div className="mt-8">
        <Card>
          <h3 className="text-xl font-semibold mb-4">Borrowing Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">Loan Period</h4>
              <p className="text-sm text-blue-700 mt-1">Standard loan period is 30 days for regular books.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Renewal Limit</h4>
              <p className="text-sm text-green-700 mt-1">Maximum 3 renewals per book if no one is waiting.</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800">Late Fees</h4>
              <p className="text-sm text-yellow-700 mt-1">$1 per day for overdue books.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800">Reservation</h4>
              <p className="text-sm text-purple-700 mt-1">Reserve books up to 10 days in advance.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BorrowedBooks;
