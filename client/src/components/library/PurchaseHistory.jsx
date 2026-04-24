import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiShoppingBag, 
  FiShoppingCart, 
  FiDownload, 
  FiArrowRight, 
  FiSearch, 
  FiTrash2, 
  FiCheckCircle, 
  FiClock, 
  FiInfo,
  FiFileText,
  FiTag
} from 'react-icons/fi';
import Card from '../../components/UIHelper/Card';
import Badge from '../../components/UIHelper/Badge';
import Button from '../../components/UIHelper/Button';
import { PageSkeleton } from '../../components/UIHelper/SkeletonLoader';
import { formatDate } from '../../lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // Try to fetch from API, fallback to empty array if endpoint doesn't exist
      try {
        const response = await axios.get(`${API_BASE}/student/purchases`, config);
        setPurchases(response.data || []);
      } catch (apiError) {
        // Endpoint might not exist yet
        console.log('[PurchaseHistory] API endpoint not available, using empty data');
        setPurchases([]);
      }
    } catch (err) {
      console.error('[PurchaseHistory] Error:', err);
      setError('Failed to fetch purchase history.');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDownloadReceipt = (purchase) => {
    console.log('Download receipt for purchase:', purchase);
  };

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Library Store</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Purchase History</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Manage your acquisitions and digital purchases</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search receipts..." 
            className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none w-full sm:w-64 font-medium text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Purchase History List */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Order History" className="rounded-[32px] p-8">
            <div className="space-y-6">
              {purchases.length > 0 ? (
                purchases.map(purchase => (
                  <div key={purchase.id} className="group p-6 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-cyan-200 hover:bg-white transition-all duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl text-cyan-600 group-hover:scale-110 transition-transform">
                          <FiShoppingBag />
                        </div>
                        <div>
                          <Badge className="bg-white border-none font-black text-[10px] uppercase tracking-widest mb-2">{purchase.category}</Badge>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{purchase.bookTitle}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">by {purchase.author}</p>
                        </div>
                      </div>
                      <Badge variant={statusColors[purchase.status]} className="font-black px-4 py-1.5 uppercase tracking-widest text-[10px]">
                        {purchase.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white/50 rounded-2xl border border-white">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                        <p className="text-sm font-black text-slate-700">{formatDate(purchase.purchaseDate)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                        <p className="text-lg font-black text-slate-900">${purchase.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Receipt</p>
                        <p className="text-sm font-black text-cyan-600">#{purchase.receiptNo}</p>
                      </div>
                      <div className="flex items-end justify-end">
                        <button className="p-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all" title="Download Invoice">
                          <FiDownload />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <FiShoppingBag className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No purchase records found</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar - Quick Actions & Policies */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card title="Quick Actions" className="rounded-[32px] p-8 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <FiDownload className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Export Records</p>
                  <p className="text-sm text-slate-500">Download purchase history</p>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <FiFileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">View Invoices</p>
                  <p className="text-sm text-slate-500">All receipts and invoices</p>
                </div>
              </Button>
            </div>
            <FiShoppingCart className="absolute -right-4 -top-4 w-24 h-24 text-slate-50 transform rotate-12 -z-0" />
          </Card>

          {/* Policies */}
          <Card title="Store Policies" className="rounded-[32px] p-8 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/20">
            <div className="space-y-4">
              {[
                { icon: <FiRefreshCw />, title: 'Returns', text: '30-day return policy for printed books.' },
                { icon: <FiClock />, title: 'Delivery', text: 'Free campus delivery on orders over $50.' },
                { icon: <FiCheckCircle />, title: 'Digital', text: 'Instant access to e-books after payment.' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-cyan-400 text-lg mt-0.5">{item.icon}</div>
                  <div>
                    <h5 className="text-xs font-black uppercase tracking-widest mb-1">{item.title}</h5>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const FiRefreshCw = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
);

export default PurchaseHistory;
