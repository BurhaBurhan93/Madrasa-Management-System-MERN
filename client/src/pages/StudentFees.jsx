import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiCreditCard,
  FiDollarSign,
  FiActivity,
  FiCheckCircle,
  FiTrendingUp,
  FiCalendar,
  FiDownload,
  FiPrinter,
  FiAlertCircle,
  FiArrowRight
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Badge from '../components/UIHelper/Badge';
import Progress from '../components/UIHelper/Progress';
import { BarChartComponent } from '../components/UIHelper/ECharts';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { formatDate } from '../lib/utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentFees = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [feeSummary, setFeeSummary] = useState({
    totalFees: 0,
    paidAmount: 0,
    pendingAmount: 0,
    discountAmount: 0,
    nextDueDate: null,
    lastPaymentDate: null
  });

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch fee payments
      const paymentsRes = await axios.get(`${API_BASE}/student/fees`, config);
      const paymentsData = paymentsRes.data || [];
      setPayments(paymentsData);

      // Calculate fee summary
      const paidAmount = paymentsData
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const pendingAmount = paymentsData
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const completedPayments = paymentsData.filter(p => p.status === 'completed');
      const lastPayment = completedPayments.length > 0
        ? completedPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : null;

      setFeeSummary({
        totalFees: paidAmount + pendingAmount,
        paidAmount,
        pendingAmount,
        discountAmount: 0,
        nextDueDate: pendingAmount > 0 ? '2025-05-01' : null,
        lastPaymentDate: lastPayment?.createdAt || null
      });

    } catch (err) {
      console.error('Error fetching fee data:', err);
      setError('Failed to fetch fee information. Please try again.');
      setPayments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (paymentId) => {
    // Download receipt for payment
  };

  const paymentStatusColors = {
    completed: 'success',
    pending: 'warning',
    failed: 'danger',
    refunded: 'secondary'
  };

  const chartData = [
    { name: 'Paid', value: feeSummary.paidAmount, color: '#10B981' },
    { name: 'Pending', value: feeSummary.pendingAmount, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Finance</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Fees & Payments</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Manage your financial obligations and payment history</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.print()}
          >
            <FiPrinter className="w-4 h-4" />
            Print Statement
          </Button>
          <div className={`h-12 px-6 rounded-2xl border flex items-center gap-3 ${
            feeSummary.pendingAmount === 0
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
              : 'bg-amber-50 border-amber-100 text-amber-600'
          }`}>
            <FiCheckCircle className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">
              {feeSummary.pendingAmount === 0 ? 'Account Clear' : 'Payment Due'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                <FiDollarSign className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Fees</span>
            </div>
            <p className="text-3xl font-black text-slate-900">
              ${feeSummary.totalFees.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 mt-1">Academic Year 2024-25</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Paid Amount</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">
              ${feeSummary.paidAmount.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {feeSummary.lastPaymentDate
                ? `Last paid ${formatDate(feeSummary.lastPaymentDate)}`
                : 'No payments yet'}
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <FiAlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending</span>
            </div>
            <p className="text-3xl font-black text-amber-600">
              ${feeSummary.pendingAmount.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {feeSummary.nextDueDate
                ? `Due by ${formatDate(feeSummary.nextDueDate)}`
                : 'No pending payments'}
            </p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Payment Progress</span>
            </div>
            <p className="text-3xl font-black text-purple-600">
              {feeSummary.totalFees > 0
                ? Math.round((feeSummary.paidAmount / feeSummary.totalFees) * 100)
                : 0}%
            </p>
            <div className="mt-2">
              <Progress
                value={feeSummary.totalFees > 0 ? (feeSummary.paidAmount / feeSummary.totalFees) * 100 : 0}
                className="h-2"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Chart & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Distribution Chart */}
        <Card className="lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Distribution</h3>
          {chartData.length > 0 ? (
            <BarChartComponent
              data={chartData}
              height={250}
              showLegend={true}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              No payment data available
            </div>
          )}
        </Card>

        {/* Recent Payments */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Recent Payments</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/student/payments')}>
              View All <FiArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="space-y-3">
            {payments.slice(0, 5).map((payment, index) => (
              <div
                key={payment._id || index}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    payment.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                    payment.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <FiCreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Payment #{payment.paymentId || index + 1}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(payment.createdAt || payment.paymentDate)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">${(payment.amount || 0).toLocaleString()}</p>
                  <Badge
                    variant={paymentStatusColors[payment.status] || 'default'}
                    className="font-black uppercase tracking-widest text-[10px]"
                  >
                    {payment.status}
                  </Badge>
                </div>
                {payment.status === 'completed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadReceipt(payment._id)}
                  >
                    <FiDownload className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            {payments.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <FiActivity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No payments found</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="justify-start gap-3 h-auto py-4"
            onClick={() => navigate('/student/payments/new')}
            disabled={feeSummary.pendingAmount === 0}
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
              <FiCreditCard className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900">Make Payment</p>
              <p className="text-sm text-slate-500">Pay pending fees online</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-3 h-auto py-4"
            onClick={() => navigate('/student/fee-structure')}
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900">Fee Structure</p>
              <p className="text-sm text-slate-500">View detailed fee breakdown</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-3 h-auto py-4"
            onClick={() => navigate('/student/fee-history')}
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <FiDownload className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900">Download Statement</p>
              <p className="text-sm text-slate-500">Get complete payment history</p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StudentFees;
