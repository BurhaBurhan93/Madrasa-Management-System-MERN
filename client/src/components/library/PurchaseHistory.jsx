import React, { useState } from 'react';
import Card from '../../components/UIHelper/Card';
import Badge from '../../components/UIHelper/Badge';
import Button from '../../components/UIHelper/Button';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([
    {
      id: 1,
      bookTitle: 'Advanced Mathematics',
      author: 'Dr. Ahmed Hassan',
      purchaseDate: '2024-01-15',
      amount: 45.99,
      status: 'completed',
      receiptNo: 'PUR2024001',
      category: 'Mathematics'
    },
    {
      id: 2,
      bookTitle: 'Computer Science Fundamentals',
      author: 'John Smith',
      purchaseDate: '2024-01-20',
      amount: 39.99,
      status: 'completed',
      receiptNo: 'PUR2024002',
      category: 'Computer Science'
    },
    {
      id: 3,
      bookTitle: 'Islamic Jurisprudence',
      author: 'Sheikh Omar Farooq',
      purchaseDate: '2024-02-01',
      amount: 52.50,
      status: 'processing',
      receiptNo: 'PUR2024003',
      category: 'Islamic Studies'
    },
    {
      id: 4,
      bookTitle: 'Modern Physics',
      author: 'Prof. Sarah Johnson',
      purchaseDate: '2024-02-10',
      amount: 48.75,
      status: 'delivered',
      receiptNo: 'PUR2024004',
      category: 'Physics'
    }
  ]);

  const [cartItems, setCartItems] = useState([
    {
      id: 5,
      title: 'Chemistry Principles',
      author: 'Dr. Maria Garcia',
      price: 42.99,
      quantity: 1,
      category: 'Chemistry'
    }
  ]);

  const statusColors = {
    completed: 'success',
    processing: 'warning',
    delivered: 'info',
    cancelled: 'danger'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Purchase History</h1>
        <p className="text-gray-600">View your book purchase history and manage shopping cart</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase History */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Purchase History</h2>
            {purchases.length > 0 ? (
              <div className="space-y-4">
                {purchases.map(purchase => (
                  <div key={purchase.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{purchase.bookTitle}</h3>
                        <p className="text-sm text-gray-600">by {purchase.author}</p>
                      </div>
                      <Badge variant={statusColors[purchase.status]}>
                        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{formatDate(purchase.purchaseDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-medium text-lg font-bold">${purchase.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Receipt</p>
                        <p className="font-medium">{purchase.receiptNo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium">{purchase.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No purchase history available.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Shopping Cart */}
        <div>
          <Card>
            <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-600">by {item.author}</p>
                        <p className="text-xs text-gray-600">{item.category}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
                      <span className="text-xs">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <Button variant="primary" className="w-full">
                    Checkout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Your cart is empty.</p>
              </div>
            )}
          </Card>

          {/* Book Store Categories */}
          <Card className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Book Categories</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span className="text-gray-700">Academic Books</span>
                <span className="text-sm text-gray-500">245 items</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span className="text-gray-700">Research Papers</span>
                <span className="text-sm text-gray-500">189 items</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span className="text-gray-700">E-books</span>
                <span className="text-sm text-gray-500">567 items</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span className="text-gray-700">Audio Books</span>
                <span className="text-sm text-gray-500">89 items</span>
              </div>
            </div>
          </Card>

          {/* Purchase Policies */}
          <Card className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Purchase Policies</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 text-sm">Returns</h4>
                <p className="text-xs text-blue-700 mt-1">Books can be returned within 30 days of purchase.</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 text-sm">Delivery</h4>
                <p className="text-xs text-green-700 mt-1">Free delivery on orders over $50.</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 text-sm">Digital Access</h4>
                <p className="text-xs text-yellow-700 mt-1">Instant access to purchased digital content.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistory;