import React, { useState, useEffect } from 'react';
import Card from '../UIHelper/Card';
import Badge from '../UIHelper/Badge';
import Button from '../UIHelper/Button';
import Progress from '../UIHelper/Progress';
import axios from 'axios';

const Finance = () => {
  console.log('[Finance] Component initializing...');
  const [feeStructure, setFeeStructure] = useState({
    tuition: 0,
    accommodation: 0,
    meals: 0,
    library: 0,
    sports: 0,
    miscellaneous: 0
  });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[Finance] Token exists:', !!token);
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    console.log('[Finance] useEffect triggered - fetching data from API...');
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Finance] Fetching finance data from API...');
      
      const config = getConfig();
      
      // Fetch fee payments
      const paymentsResponse = await axios.get('http://localhost:5000/api/student/fee-payments', config);
      console.log('[Finance] Payments API response:', paymentsResponse.data);
      setPayments(paymentsResponse.data || []);
      
      // Fetch fee structure (if available)
      try {
        const feeStructureResponse = await axios.get('http://localhost:5000/api/student/fee-structure', config);
        console.log('[Finance] Fee structure API response:', feeStructureResponse.data);
        if (feeStructureResponse.data) {
          setFeeStructure(feeStructureResponse.data);
        }
      } catch (feeErr) {
        console.log('[Finance] Fee structure not available, using calculated values');
      }
    } catch (err) {
      console.error('[Finance] Error fetching finance data:', err);
      setError('Failed to fetch finance data. Please try again.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    completed: 'success',
    pending: 'warning',
    failed: 'danger'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotal = () => {
    return Object.values(feeStructure).reduce((sum, value) => sum + value, 0);
  };

  const calculatePaid = () => {
    return payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const calculateBalance = () => {
    return calculateTotal() - calculatePaid();
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fees & Payments</h1>
        <p className="text-gray-600">Manage your fee payments and view payment history</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading finance data...</p>
        </div>
      ) : (
      <div>
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Amount</h3>
          <p className="text-2xl font-bold text-gray-900">${calculateTotal().toLocaleString()}</p>
        </Card>
        
        <Card className="text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Paid Amount</h3>
          <p className="text-2xl font-bold text-green-600">${calculatePaid().toLocaleString()}</p>
        </Card>
        
        <Card className="text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Balance Due</h3>
          <p className="text-2xl font-bold text-red-600">${calculateBalance().toLocaleString()}</p>
        </Card>
        
        <Card className="text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Payment Progress</h3>
          <div className="mt-2">
            <Progress 
              value={Math.round((calculatePaid() / calculateTotal()) * 100)} 
              max={100} 
              className="mb-2" 
            />
            <p className="text-sm text-gray-600">
              {Math.round((calculatePaid() / calculateTotal()) * 100)}%
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Structure */}
        <div>
          <Card>
            <h2 className="text-xl font-semibold mb-4">Fee Structure</h2>
            <div className="space-y-3">
              {Object.entries(feeStructure).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="capitalize text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-medium">${value.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg">${calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-sm text-gray-600">Direct bank to bank transfer</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Cash Payment</p>
                    <p className="text-sm text-gray-600">Pay at cashier desk</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment History */}
        <div>
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Payment History</h2>
              <Button variant="primary">
                Make Payment
              </Button>
            </div>
            
            <div className="space-y-4">
              {payments.map(payment => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{payment.description}</h3>
                      <p className="text-sm text-gray-600">Receipt: {payment.receiptNo}</p>
                    </div>
                    <Badge variant={statusColors[payment.status]}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{formatDate(payment.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium text-lg font-bold text-gray-900">${payment.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Method</p>
                      <p className="font-medium">{payment.method}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Outstanding Balance */}
          {calculateBalance() > 0 && (
            <Card className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Outstanding Balance</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-red-800">Amount Due</p>
                    <p className="text-2xl font-bold text-red-900">${calculateBalance().toLocaleString()}</p>
                  </div>
                  <Button variant="danger">
                    Pay Now
                  </Button>
                </div>
                <p className="text-sm text-red-700 mt-2">
                  Payment due by March 15, 2024 to avoid late fees.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Fee Policies */}
      <div className="mt-8">
        <Card>
          <h3 className="text-xl font-semibold mb-4">Fee Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">Late Payment Policy</h4>
              <p className="text-sm text-blue-700 mt-1">A late fee of 5% will be charged on outstanding balances after due date.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Refund Policy</h4>
              <p className="text-sm text-green-700 mt-1">Full refunds available within 30 days of enrollment, partial refunds after 30 days.</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800">Payment Plan</h4>
              <p className="text-sm text-yellow-700 mt-1">Installment plans available upon request for students facing financial difficulties.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800">Scholarships</h4>
              <p className="text-sm text-purple-700 mt-1">Merit-based scholarships available for students with excellent academic performance.</p>
            </div>
          </div>
        </Card>
      </div>
      </div>
      )}
    </div>
  );
};

export default Finance;
