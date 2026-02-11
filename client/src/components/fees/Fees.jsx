import { useState } from 'react';

const Fees = () => {
  const [feeStructure, setFeeStructure] = useState([
    { id: 1, item: 'Tuition Fee', amount: 2500, semester: 'Spring 2024', dueDate: '2024-02-28', status: 'pending' },
    { id: 2, item: 'Library Fee', amount: 150, semester: 'Spring 2024', dueDate: '2024-02-28', status: 'paid' },
    { id: 3, item: 'Laboratory Fee', amount: 300, semester: 'Spring 2024', dueDate: '2024-02-28', status: 'pending' },
    { id: 4, item: 'Sports Fee', amount: 100, semester: 'Spring 2024', dueDate: '2024-02-28', status: 'pending' },
    { id: 5, item: 'Technology Fee', amount: 200, semester: 'Spring 2024', dueDate: '2024-02-28', status: 'pending' }
  ]);

  const [paymentHistory, setPaymentHistory] = useState([
    { id: 1, date: '2024-01-15', amount: 150, method: 'Credit Card', transactionId: 'TXN001', status: 'completed' },
    { id: 2, date: '2023-12-10', amount: 2500, method: 'Bank Transfer', transactionId: 'TXN002', status: 'completed' },
    { id: 3, date: '2023-09-05', amount: 300, method: 'Cash', transactionId: 'TXN003', status: 'completed' }
  ]);

  const [scholarships, setScholarships] = useState([
    { id: 1, name: 'Merit Scholarship', amount: 500, percentage: 20, status: 'active', expiry: '2024-05-31' },
    { id: 2, name: 'Need-based Grant', amount: 300, percentage: 12, status: 'active', expiry: '2024-06-30' }
  ]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  const calculateTotals = () => {
    const totalAmount = feeStructure.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = feeStructure.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
    const pendingAmount = totalAmount - paidAmount;
    const discountAmount = scholarships.reduce((sum, scholarship) => sum + scholarship.amount, 0);
    
    return { totalAmount, paidAmount, pendingAmount, discountAmount };
  };

  const totals = calculateTotals();

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePayFee = (fee) => {
    setSelectedFee(fee);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would process the payment
    console.log('Processing payment for:', selectedFee, 'using method:', selectedPaymentMethod);
    
    // Update fee status
    setFeeStructure(prev => prev.map(fee => 
      fee.id === selectedFee.id ? { ...fee, status: 'paid' } : fee
    ));
    
    // Add to payment history
    const newPayment = {
      id: paymentHistory.length + 1,
      date: new Date().toISOString().split('T')[0],
      amount: selectedFee.amount,
      method: selectedPaymentMethod,
      transactionId: `TXN${String(paymentHistory.length + 1).padStart(3, '0')}`,
      status: 'completed'
    };
    
    setPaymentHistory(prev => [newPayment, ...prev]);
    
    setShowPaymentModal(false);
    setSelectedPaymentMethod('');
    setSelectedFee(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Fees & Payments</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Download Fee Statement
        </button>
      </div>

      {/* Fee Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">💸</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${totals.totalAmount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-gray-900">${totals.paidAmount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">💳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">${totals.pendingAmount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">奖学</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Discount Amount</p>
              <p className="text-2xl font-bold text-gray-900">${totals.discountAmount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Structure */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Fee Structure</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feeStructure.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{fee.item}</div>
                        <div className="text-sm text-gray-500">{fee.semester}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${fee.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(fee.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                          {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {fee.status === 'pending' && (
                          <button
                            onClick={() => handlePayFee(fee)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total Due:</span>
                <span className="text-xl font-bold text-gray-900">${totals.pendingAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">${payment.amount}</div>
                    <div className="text-sm text-gray-600">{formatDate(payment.date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800">{payment.method}</div>
                    <div className="text-xs text-gray-500">ID: {payment.transactionId}</div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
            
            {paymentHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No payment history available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scholarships & Discounts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Scholarships & Discounts</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scholarships.map((scholarship) => (
              <div key={scholarship.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{scholarship.name}</h4>
                    <p className="text-sm text-gray-600">Amount: ${scholarship.amount} ({scholarship.percentage}%)</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scholarship.status)}`}>
                    {scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}
                  </span>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  Valid until: {formatDate(scholarship.expiry)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fee Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Pay Fee</h3>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-800">{selectedFee.item}</span>
                    <span className="font-bold text-gray-800">${selectedFee.amount}</span>
                  </div>
                  <div className="text-sm text-gray-600">Due Date: {formatDate(selectedFee.dueDate)}</div>
                </div>
              </div>
              
              <form onSubmit={handlePaymentSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Payment Method</option>
                    <option value="credit-card">Credit Card</option>
                    <option value="debit-card">Debit Card</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="mobile-payment">Mobile Payment</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Process Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Fee Due Alert */}
      {totals.pendingAmount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Fee Payment Reminder</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You have ${totals.pendingAmount} in pending fees. Please make the payment before the due date to avoid late fees.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;