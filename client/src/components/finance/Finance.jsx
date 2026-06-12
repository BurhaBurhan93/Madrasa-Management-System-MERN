import React, { useState, useEffect } from 'react';
import Card from '../UIHelper/Card';
import Badge from '../UIHelper/Badge';
import Button from '../UIHelper/Button';
import Progress from '../UIHelper/Progress';
import { formatDate } from '../../lib/utils';
import { PageSkeleton } from '../UIHelper/SkeletonLoader';
import axios from 'axios';
import { FiCreditCard, FiDollarSign, FiCheckCircle, FiActivity, FiTrendingUp } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Finance = () => {
  const [feeStructure, setFeeStructure] = useState({
    tuition: 0,
    accommodation: 0,
    meals: 0,
    library: 0,
    sports: 0,
    miscellaneous: 0
  });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getConfig();
      
      // Fetch fee payments from student API
      const paymentsResponse = await axios.get(`${API_BASE}/student/fees`, config);
      setPayments(paymentsResponse.data || []);
      
      // Try to fetch fee structure, fallback to calculating from payments
      try {
        const feeStructureResponse = await axios.get(`${API_BASE}/student/fee-structure`, config);
        if (feeStructureResponse.data) {
          setFeeStructure(feeStructureResponse.data);
        }
      } catch (feeErr) {
        // If fee structure endpoint doesn't exist, calculate from payments
        console.log('[Finance] Fee structure not available, using calculated values');
        const totalFromPayments = (paymentsResponse.data || []).reduce((sum, p) => sum + (p.amount || 0), 0);
        // Estimate fee structure based on payment history
        setFeeStructure({
          tuition: Math.round(totalFromPayments * 0.6),
          accommodation: Math.round(totalFromPayments * 0.2),
          meals: Math.round(totalFromPayments * 0.1),
          library: Math.round(totalFromPayments * 0.05),
          sports: Math.round(totalFromPayments * 0.03),
          miscellaneous: Math.round(totalFromPayments * 0.02)
        });
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
    failed: 'danger',
    paid: 'success'
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
      .filter(payment => payment.status === 'completed' || payment.status === 'paid')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  };

  const calculateBalance = () => {
    return Math.max(0, calculateTotal() - calculatePaid());
  };

  return (
    <div className="w-full space-y-8">
      {error && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
          <p className="text-rose-700 font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <PageSkeleton variant="dashboard" />
      ) : (
        <div className="space-y-8">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-4">
                <FiDollarSign />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-3xl font-black text-slate-900">${calculateTotal().toLocaleString()}</p>
            </div>
            
            <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4">
                <FiCheckCircle />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Paid Amount</p>
              <p className="text-3xl font-black text-emerald-600">${calculatePaid().toLocaleString()}</p>
            </div>
            
            <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mb-4">
                <FiTrendingUp />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Balance Due</p>
              <p className="text-3xl font-black text-rose-600">${calculateBalance().toLocaleString()}</p>
            </div>
            
            <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-2xl mb-4">
                <FiActivity />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Progress</p>
              <div className="mt-2">
                <Progress 
                  value={Math.round((calculatePaid() / Math.max(calculateTotal(), 1)) * 100)} 
                  max={100} 
                  className="mb-2 h-2" 
                />
                <p className="text-sm font-black text-slate-900">
                  {Math.round((calculatePaid() / Math.max(calculateTotal(), 1)) * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Fee Structure */}
            <Card className="rounded-[32px] p-8 border-none shadow-xl shadow-slate-200/50">
              <h2 className="text-xl font-black text-slate-900 mb-6">Fee Structure</h2>
              <div className="space-y-4">
                {Object.entries(feeStructure).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-b-0">
                    <span className="capitalize text-slate-600 font-medium">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-black text-slate-900">${value.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t-2 border-slate-200">
                  <span className="font-black text-slate-900">Total</span>
                  <span className="font-black text-xl text-cyan-600">${calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* Payment History */}
            <Card className="rounded-[32px] p-8 border-none shadow-xl shadow-slate-200/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900">Payment History</h2>
                <Button 
                  variant="primary" 
                  className="rounded-2xl bg-cyan-600 hover:bg-cyan-700 font-black text-xs uppercase tracking-widest"
                >
                  Make Payment
                </Button>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {payments.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-3xl">
                    <FiCreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No payments recorded yet</p>
                  </div>
                ) : (
                  payments.map(payment => (
                    <div key={payment._id || payment.id} className="border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-black text-slate-900 text-sm">{payment.description || 'Fee Payment'}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Receipt: {payment.receiptNo || payment._id?.slice(-8) || 'N/A'}
                          </p>
                        </div>
                        <Badge variant={statusColors[payment.status] || 'default'} className="font-black text-[10px] uppercase tracking-widest">
                          {payment.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                          <p className="font-medium text-slate-900 text-sm">{formatDate(payment.paymentDate || payment.date || payment.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</p>
                          <p className="font-black text-lg text-slate-900">${(payment.amount || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Outstanding Balance Alert */}
          {calculateBalance() > 0 && (
            <div className="p-8 bg-gradient-to-r from-rose-500 to-rose-600 rounded-[32px] text-white shadow-xl shadow-rose-200/50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                    <FiTrendingUp />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Outstanding Balance</h3>
                    <p className="text-rose-100 font-medium text-sm mt-1">${calculateBalance().toLocaleString()} due for current semester</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="rounded-2xl px-8 py-4 bg-white text-rose-600 hover:bg-rose-50 font-black text-xs uppercase tracking-widest border-white transition-all"
                >
                  Pay Now
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Finance;
