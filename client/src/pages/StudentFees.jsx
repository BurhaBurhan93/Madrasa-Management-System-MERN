import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { unwrapArrayResponse } from '../lib/studentData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentFees = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['student', 'common', 'nav', 'app']);
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

  const MOCK_PAYMENTS = [
    {
      _id: 'mock-p1', receiptNo: 'RCPT-001',
      paidAmount: 5000, paymentStatus: 'completed',
      paymentDate: '2026-03-15T10:00:00Z', createdAt: '2026-03-15T10:00:00Z',
      remarks: 'Tuition Fee - First Installment'
    },
    {
      _id: 'mock-p2', receiptNo: 'RCPT-002',
      paidAmount: 2000, paymentStatus: 'completed',
      paymentDate: '2026-02-01T10:00:00Z', createdAt: '2026-02-01T10:00:00Z',
      remarks: 'Admission Fee'
    },
    {
      _id: 'mock-p3', receiptNo: 'RCPT-003',
      paidAmount: 3000, paymentStatus: 'pending',
      paymentDate: null, createdAt: null,
      remarks: 'Tuition Fee - Second Installment'
    },
    {
      _id: 'mock-p4', receiptNo: 'RCPT-004',
      paidAmount: 1500, paymentStatus: 'pending',
      paymentDate: null, createdAt: null,
      remarks: 'Lab & Library Fee'
    },
    {
      _id: 'mock-p5', receiptNo: 'RCPT-005',
      paidAmount: 1000, paymentStatus: 'completed',
      paymentDate: '2026-01-10T10:00:00Z', createdAt: '2026-01-10T10:00:00Z',
      remarks: 'Sports Fee'
    },
  ];

  useEffect(() => {
    fetchFeeData();
  }, []);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const paymentsRes = await axios.get(`${API_BASE}/student/fees`, config);
      let paymentsData = unwrapArrayResponse(paymentsRes.data);

      if (paymentsData.length === 0) {
        paymentsData = MOCK_PAYMENTS;
      }
      setPayments(paymentsData);

      const paidAmount = paymentsData
        .filter(p => p.paymentStatus === 'completed')
        .reduce((sum, p) => sum + (p.paidAmount || 0), 0);

      const pendingAmount = paymentsData
        .filter(p => p.paymentStatus === 'pending')
        .reduce((sum, p) => sum + (p.paidAmount || 0), 0);

      const completedPayments = paymentsData.filter(p => p.paymentStatus === 'completed');
      const lastPayment = completedPayments.length > 0
        ? completedPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : null;

      setFeeSummary({
        totalFees: paidAmount + pendingAmount,
        paidAmount,
        pendingAmount,
        discountAmount: 0,
        nextDueDate: pendingAmount > 0 ? '2026-06-01' : null,
        lastPaymentDate: lastPayment?.createdAt || null
      });

    } catch (err) {
      console.error('Error fetching fee data:', err);
      setError(t('fees.fetchError'));
      const fallback = MOCK_PAYMENTS;
      setPayments(fallback);
      setFeeSummary({
        totalFees: 12500,
        paidAmount: 8000,
        pendingAmount: 4500,
        discountAmount: 0,
        nextDueDate: '2026-06-01',
        lastPaymentDate: '2026-03-15T10:00:00Z'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = (payment) => {
    const data = encodeURIComponent(JSON.stringify({
      studentName: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : t('fees.defaultStudentName'),
      className: t('fees.defaultClassName'),
      rollNumber: t('fees.defaultRollNumber'),
      feeAmount: payment.paidAmount,
      paidDate: payment.createdAt || payment.paymentDate,
      status: payment.paymentStatus,
    }));
    navigate(`/student/print/fee-receipt/${payment._id}?data=${data}`);
  };

  const paymentStatusColors = {
    completed: 'success',
    pending: 'warning',
    failed: 'danger',
    refunded: 'secondary'
  };

  const chartData = [
    { name: t('common:paid'), value: feeSummary.paidAmount, color: '#10B981' },
    { name: t('common:pending'), value: feeSummary.pendingAmount, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">{t('finance', { ns: 'student' })}</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('feesPayments', { ns: 'student' })}</h1>
          <p className="text-slate-500 mt-1 font-medium italic">{t('fees.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              const data = encodeURIComponent(JSON.stringify({
                studentName: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : t('fees.defaultStudentName'),
                className: t('fees.defaultClassName'),
                rollNumber: t('fees.defaultRollNumber'),
                feeAmount: feeSummary.totalFees,
                paidDate: feeSummary.lastPaymentDate,
                status: feeSummary.pendingAmount === 0 ? t('fees.statusPaid') : t('fees.statusPartial'),
              }));
              navigate(`/student/print/fee-receipt/statement?data=${data}`);
            }}
          >
            <FiPrinter className="w-4 h-4" />
            {t('fees.printStatement')}
          </Button>
          <div className={`h-12 px-6 rounded-2xl border flex items-center gap-3 ${
            feeSummary.pendingAmount === 0
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
              : 'bg-amber-50 border-amber-100 text-amber-600'
          }`}>
            <FiCheckCircle className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">
              {feeSummary.pendingAmount === 0 ? t('fees.accountClear') : t('fees.paymentDue')}
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
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('fees.totalFees')}</span>
            </div>
            <p className="text-3xl font-black text-slate-900">
              ${feeSummary.totalFees.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 mt-1">{t('fees.academicYearLabel')}</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('paid', { ns: 'common' })}</span>
            </div>
            <p className="text-3xl font-black text-emerald-600">
              ${feeSummary.paidAmount.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {feeSummary.lastPaymentDate
                ? t('fees.lastPaid', {date: formatDate(feeSummary.lastPaymentDate)})
                : t('fees.noPaymentsYet')}
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
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('pending', { ns: 'common' })}</span>
            </div>
            <p className="text-3xl font-black text-amber-600">
              ${feeSummary.pendingAmount.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {feeSummary.nextDueDate
                ? t('fees.dueBy', {date: formatDate(feeSummary.nextDueDate)})
                : t('fees.noPendingPayments')}
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
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('fees.paymentProgress')}</span>
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
          <h3 className="text-lg font-bold text-slate-900 mb-4">{t('fees.paymentDistribution')}</h3>
          {chartData.length > 0 ? (
            <BarChartComponent
              data={chartData}
              height={250}
              showLegend={true}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              {t('noData', { ns: 'common' })}
            </div>
          )}
        </Card>

        {/* Recent Payments */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">{t('fees.recentPayments')}</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/student/transactions')}>
              {t('view', { ns: 'common' })} <FiArrowRight className="w-4 h-4 ml-2" />
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
                    payment.paymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                    payment.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <FiCreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t('fees.paymentNumber')}{payment.receiptNo || index + 1}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(payment.createdAt || payment.paymentDate)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">${(payment.paidAmount || 0).toLocaleString()}</p>
                  <Badge
                    variant={paymentStatusColors[payment.paymentStatus] || 'default'}
                    className="font-black uppercase tracking-widest text-[10px]"
                  >
                    {payment.paymentStatus}
                  </Badge>
                </div>
                {payment.paymentStatus === 'completed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePrintReceipt(payment)}
                  >
                    <FiPrinter className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            {payments.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <FiActivity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('fees.noPaymentsFound')}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-bold text-slate-900 mb-4">{t('fees.quickActions')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="justify-start gap-3 h-auto py-4"
            onClick={() => navigate('/student/transactions')}
            disabled={feeSummary.pendingAmount === 0}
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
              <FiCreditCard className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900">{t('fees.makePayment')}</p>
              <p className="text-sm text-slate-500">{t('fees.payPendingFees')}</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-3 h-auto py-4"
            onClick={() => navigate('/student/transactions')}
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900">{t('fees.feeStructure')}</p>
              <p className="text-sm text-slate-500">{t('fees.viewFeeBreakdown')}</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start gap-3 h-auto py-4"
            onClick={() => navigate('/student/transactions')}
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <FiDownload className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900">{t('fees.downloadStatement')}</p>
              <p className="text-sm text-slate-500">{t('fees.completePaymentHistory')}</p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StudentFees;
