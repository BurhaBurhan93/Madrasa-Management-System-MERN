import React, { useState, useEffect } from 'react';
import { 
  FiCreditCard, 
  FiArrowUpRight, 
  FiArrowDownLeft, 
  FiDownload, 
  FiFilter, 
  FiSearch, 
  FiCheckCircle, 
  FiClock, 
  FiActivity,
  FiFileText,
  FiInfo,
  FiShield
} from 'react-icons/fi';
import Card from '../../components/UIHelper/Card';
import Badge from '../../components/UIHelper/Badge';
import Button from '../../components/UIHelper/Button';
import { formatDate } from '../../lib/utils';
import { PageSkeleton } from '../../components/UIHelper/SkeletonLoader';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all'
  });

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch fee payments and convert to transaction format
      const config = getConfig();
      const response = await axios.get(`${API_BASE}/student/fees`, config);
      
      // Convert fee payments to transaction format
      const paymentTransactions = (response.data || []).map((payment, index) => ({
        id: payment._id || `TXN${index}`,
        transactionCode: payment.receiptNo || `TXN-${Date.now()}-${index}`,
        account: 'Main Account',
        transactionType: 'income',
        amount: payment.amount || 0,
        transactionDate: payment.paymentDate || payment.date || payment.createdAt || new Date().toISOString(),
        referenceType: payment.description || 'Fee Payment',
        referenceId: payment._id?.slice(-8) || `REF${index}`,
        balanceAfter: 0, // Will be calculated
        performedBy: 'Student Portal',
        verificationStatus: payment.status === 'completed' || payment.status === 'paid' ? 'verified' : 'pending',
        description: payment.description || 'Tuition fee payment'
      }));
      
      setTransactions(paymentTransactions);
    } catch (err) {
      console.error('[TransactionHistory] Error:', err);
      setError('Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    return (
      (filters.type === 'all' || transaction.transactionType === filters.type) &&
      (filters.status === 'all' || transaction.verificationStatus === filters.status)
    );
  });

  const totalIncome = transactions
    .filter(t => t.transactionType === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.transactionType === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netBalance = totalIncome - totalExpenses;

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Finance</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ledger History</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Detailed audit trail of all financial interactions</p>
        </div>
        <Button variant="primary" className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2">
          <FiDownload /> Export Statement
        </Button>
      </div>

      {/* Financial Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Inflow', value: totalIncome, icon: <FiArrowUpRight />, color: 'emerald' },
          { label: 'Total Outflow', value: totalExpenses, icon: <FiArrowDownLeft />, color: 'rose' },
          { label: 'Net Balance', value: netBalance, icon: <FiActivity />, color: 'cyan' }
        ].map((stat, i) => (
          <div key={i} className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-2xl shadow-sm`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900">${stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 p-2 bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex p-1 bg-slate-50 rounded-2xl">
          {['all', 'income', 'expense'].map((type) => (
            <button
              key={type}
              onClick={() => setFilters({...filters, type})}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filters.type === type ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search reference ID or description..." 
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none font-medium text-sm transition-all"
          />
        </div>

        <div className="flex gap-2 pr-2">
          <Badge variant="success" className="font-black px-4 py-2">System Verified</Badge>
        </div>
      </div>

      {/* Transaction List */}
      <Card title="System Transactions" className="rounded-[32px] p-8 overflow-hidden">
        <div className="overflow-x-auto -mx-8">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900 text-sm">{txn.description}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{formatDate(txn.transactionDate)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={txn.transactionType === 'income' ? 'success' : 'danger'} className="font-black px-3 py-1 uppercase tracking-widest text-[9px]">
                      {txn.transactionType}
                    </Badge>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-700">{txn.referenceType}</p>
                    <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mt-1">#{txn.referenceId}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className={`font-black text-lg ${txn.transactionType === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {txn.transactionType === 'income' ? '+' : '-'}${txn.amount.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${txn.verificationStatus === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{txn.verificationStatus}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button className="p-3 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                      <FiFileText size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[32px] p-8 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/20">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl text-cyan-400 shrink-0">
              <FiShield />
            </div>
            <div>
              <h4 className="text-xl font-black mb-2 tracking-tight">Security Protocol</h4>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Every transaction is cryptographically signed and verified. If you notice any unauthorized activity, 
                please lock your account immediately and contact the bursar's office.
              </p>
            </div>
          </div>
        </Card>

        <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white shadow-xl shadow-blue-200/50 relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="text-xl font-black mb-2 tracking-tight">Financial Support</h4>
            <p className="text-blue-100 text-sm font-medium mb-8 leading-relaxed">
              Questions regarding your balance or payment schedule? Our financial advisors are here to help.
            </p>
            <Button variant="outline" className="rounded-2xl px-8 py-4 border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all">
              Schedule Consultation
            </Button>
          </div>
          <FiInfo className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
