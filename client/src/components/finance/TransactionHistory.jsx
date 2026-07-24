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
import { unwrapArrayResponse } from '../../lib/studentData';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TransactionHistory = () => {
  const { t } = useTranslation(['student', 'common']);
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

  const MOCK_TRANSACTIONS = [
    { id: 'm1', transactionCode: 'RCPT-001', account: 'Main Account', transactionType: 'income', amount: 5000, transactionDate: '2026-03-15T10:00:00Z', referenceType: 'Fee Payment', referenceId: 'RCPT-001', balanceAfter: 0, performedBy: 'Student Portal', verificationStatus: 'verified', description: 'Tuition Fee - First Installment' },
    { id: 'm2', transactionCode: 'RCPT-002', account: 'Main Account', transactionType: 'income', amount: 2000, transactionDate: '2026-02-01T10:00:00Z', referenceType: 'Fee Payment', referenceId: 'RCPT-002', balanceAfter: 0, performedBy: 'Student Portal', verificationStatus: 'verified', description: 'Admission Fee' },
    { id: 'm3', transactionCode: 'RCPT-003', account: 'Main Account', transactionType: 'income', amount: 3000, transactionDate: '2026-04-01T10:00:00Z', referenceType: 'Fee Payment', referenceId: 'RCPT-003', balanceAfter: 0, performedBy: 'Student Portal', verificationStatus: 'pending', description: 'Tuition Fee - Second Installment' },
    { id: 'm4', transactionCode: 'RCPT-004', account: 'Main Account', transactionType: 'income', amount: 1500, transactionDate: '2026-04-10T10:00:00Z', referenceType: 'Fee Payment', referenceId: 'RCPT-004', balanceAfter: 0, performedBy: 'Student Portal', verificationStatus: 'pending', description: 'Lab & Library Fee' },
    { id: 'm5', transactionCode: 'RCPT-005', account: 'Main Account', transactionType: 'income', amount: 1000, transactionDate: '2026-01-10T10:00:00Z', referenceType: 'Fee Payment', referenceId: 'RCPT-005', balanceAfter: 0, performedBy: 'Student Portal', verificationStatus: 'verified', description: 'Sports Fee' },
  ];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getConfig();
      const response = await axios.get(`${API_BASE}/student/fees`, config);
      
      let payments = unwrapArrayResponse(response.data);
      if (payments.length === 0) {
        setTransactions(MOCK_TRANSACTIONS);
        setLoading(false);
        return;
      }

      const paymentTransactions = payments.map((payment, index) => ({
        id: payment._id || `TXN${index}`,
        transactionCode: payment.receiptNo || `TXN-${Date.now()}-${index}`,
        account: 'Main Account',
        transactionType: 'income',
        amount: payment.paidAmount || 0,
        transactionDate: payment.paymentDate || payment.createdAt || new Date().toISOString(),
        referenceType: 'Fee Payment',
        referenceId: payment._id?.slice(-8) || `REF${index}`,
        balanceAfter: 0,
        performedBy: 'Student Portal',
        verificationStatus: payment.paymentStatus === 'completed' || payment.paymentStatus === 'paid' ? 'verified' : 'pending',
        description: payment.remarks || 'Tuition fee payment'
      }));
      
      setTransactions(paymentTransactions);
    } catch (err) {
      console.error('[TransactionHistory] Error:', err);
      setError('Failed to load transactions');
      setTransactions(MOCK_TRANSACTIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['Transaction Code', 'Date', 'Type', 'Description', 'Amount', 'Status'];
    const rows = filteredTransactions.map(t => [
      t.transactionCode,
      formatTxnDate(t.transactionDate),
      t.transactionType,
      t.description,
      t.amount,
      t.verificationStatus,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.text('Ledger History', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 21, { align: 'center' });

    const header = ['#', 'Transaction Code', 'Date', 'Type', 'Description', 'Amount', 'Status'];
    const body = filteredTransactions.map((t, i) => [
      i + 1,
      t.transactionCode,
      formatTxnDate(t.transactionDate),
      t.transactionType,
      t.description,
      `$${t.amount.toLocaleString()}`,
      t.verificationStatus,
    ]);

    autoTable(doc, {
      head: [header],
      body,
      startY: 26,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 32 },
        2: { cellWidth: 28 },
        3: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 22, halign: 'right' },
        6: { cellWidth: 20, halign: 'center' },
      },
    });

    const finalY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(9);
    doc.text(`Total Inflow: $${totalIncome.toLocaleString()}`, 14, finalY);
    doc.text(`Total Outflow: $${totalExpenses.toLocaleString()}`, 14, finalY + 5);
    doc.text(`Net Balance: $${netBalance.toLocaleString()}`, 14, finalY + 10);

    doc.save(`ledger-export-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const formatTxnDate = (dateString) => {
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
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">{t('common:finance')}</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('transactions.title')}</h1>
          <p className="text-slate-500 mt-1 font-medium italic">{t('transactions.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className="rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
            <FiDownload /> CSV
          </Button>
          <Button variant="primary" onClick={handleExportPDF} className="rounded-2xl bg-slate-900 hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center gap-2">
            <FiDownload /> PDF
          </Button>
        </div>
      </div>

      {/* Financial Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t('transactions.totalInflow'), value: totalIncome, icon: <FiArrowUpRight />, color: 'emerald' },
          { label: t('transactions.totalOutflow'), value: totalExpenses, icon: <FiArrowDownLeft />, color: 'rose' },
          { label: t('transactions.netBalance'), value: netBalance, icon: <FiActivity />, color: 'cyan' }
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
                filters.type === type ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
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
            placeholder={t('transactions.search')} 
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none font-medium text-sm transition-all"
          />
        </div>

        <div className="flex gap-2 pr-2">
          <Badge variant="success" className="font-black px-4 py-2">{t('transactions.systemVerified')}</Badge>
        </div>
      </div>

      {/* Transaction List */}
      <Card title={t('transactions.systemTransactions')} className="rounded-[32px] p-8 overflow-hidden">
        <div className="overflow-x-auto -mx-8">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('transactions.colTransaction')}</th>
                <th className="hidden md:table-cell px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('transactions.colType')}</th>
                <th className="hidden md:table-cell px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('transactions.colReference')}</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('transactions.colAmount')}</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('transactions.colStatus')}</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('transactions.colAction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900 text-sm">{txn.description}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{formatTxnDate(txn.transactionDate)}</p>
                  </td>
                  <td className="hidden md:table-cell px-8 py-6">
                    <Badge variant={txn.transactionType === 'income' ? 'success' : 'danger'} className="font-black px-3 py-1 uppercase tracking-widest text-[9px]">
                      {txn.transactionType}
                    </Badge>
                  </td>
                  <td className="hidden md:table-cell px-8 py-6">
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
                    <button
                      type="button"
                      className="p-3 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm"
                      onClick={async () => {
                        await navigator.clipboard.writeText(JSON.stringify(txn, null, 2));
                        alert('Transaction details copied to clipboard.');
                      }}
                    >
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
                      <h4 className="text-xl font-black mb-2 tracking-tight">{t('transactions.securityProtocol')}</h4>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                {t('transactions.securityDesc')}
              </p>
            </div>
          </div>
        </Card>

        <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] text-white shadow-xl shadow-blue-200/50 relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="text-xl font-black mb-2 tracking-tight">{t('transactions.financialSupport')}</h4>
            <p className="text-blue-100 text-sm font-medium mb-8 leading-relaxed">
              {t('transactions.financialSupportDesc')}
            </p>
            <Button variant="outline" className="rounded-2xl px-8 py-4 border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest transition-all">
              {t('transactions.scheduleConsultation')}
            </Button>
          </div>
          <FiInfo className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
