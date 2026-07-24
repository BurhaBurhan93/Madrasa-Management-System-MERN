import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const monthNames = ['month1','month2','month3','month4','month5','month6','month7','month8','month9','month10','month11','month12'];

const paymentStatusColors = {
 paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
 pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
 failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const paymentMethodLabels = {};

const MOCK = [
 { _id: '1', salaryMonth: 6, salaryYear: 2026, grossSalary: 30000, totalAllowance: 5000, totalDeduction: 3000, netSalary: 32000, paymentDate: '2026-06-28T10:00:00Z', paymentMethod: 'bank', paymentStatus: 'paid', transactionReference: 'TXN-2026-06-001', deductionDetails: [{ deductionType: 'Tax', deductionReason: 'Income tax', deductionAmount: 2000 }, { deductionType: 'Social Security', deductionReason: 'SS contribution', deductionAmount: 1000 }], approvedBy: { name: 'Admin User' }, paidBy: { name: 'Finance Manager' } },
 { _id: '2', salaryMonth: 5, salaryYear: 2026, grossSalary: 30000, totalAllowance: 5000, totalDeduction: 2500, netSalary: 32500, paymentDate: '2026-05-28T10:00:00Z', paymentMethod: 'bank', paymentStatus: 'paid', transactionReference: 'TXN-2026-05-001', deductionDetails: [{ deductionType: 'Tax', deductionReason: 'Income tax', deductionAmount: 1800 }, { deductionType: 'Advance', deductionReason: 'Salary advance', deductionAmount: 700 }], approvedBy: { name: 'Admin User' }, paidBy: { name: 'Finance Manager' } },
 { _id: '3', salaryMonth: 4, salaryYear: 2026, grossSalary: 30000, totalAllowance: 4500, totalDeduction: 2800, netSalary: 31700, paymentDate: '2026-04-28T10:00:00Z', paymentMethod: 'bank', paymentStatus: 'paid', transactionReference: 'TXN-2026-04-001', deductionDetails: [{ deductionType: 'Tax', deductionReason: 'Income tax', deductionAmount: 2000 }, { deductionType: 'Loan', deductionReason: 'Staff loan repayment', deductionAmount: 800 }], approvedBy: { name: 'Admin User' } },
 { _id: '4', salaryMonth: 3, salaryYear: 2026, grossSalary: 28000, totalAllowance: 4500, totalDeduction: 2500, netSalary: 30000, paymentDate: '2026-03-28T10:00:00Z', paymentMethod: 'cash', paymentStatus: 'paid', deductionDetails: [] },
 { _id: '5', salaryMonth: 2, salaryYear: 2026, grossSalary: 28000, totalAllowance: 4000, totalDeduction: 2200, netSalary: 29800, paymentDate: '2026-02-26T10:00:00Z', paymentMethod: 'bank', paymentStatus: 'paid', transactionReference: 'TXN-2026-02-001', deductionDetails: [], approvedBy: { name: 'Admin User' } },
 { _id: '6', salaryMonth: 1, salaryYear: 2026, grossSalary: 28000, totalAllowance: 4000, totalDeduction: 2000, netSalary: 30000, paymentDate: '2026-01-28T10:00:00Z', paymentMethod: 'cash', paymentStatus: 'paid', deductionDetails: [] },
];

const TeacherPayslips = () => {
 const { t } = useTranslation(['teacher', 'common', 'nav', 'app']);
 const [payslips, setPayslips] = useState([]);
 const [loading, setLoading] = useState(false);
 const [selected, setSelected] = useState(null);

 const normalizePayslip = (p) => ({
 ...p,
 grossSalary: p.grossSalary ?? p.basicSalary ?? 0,
 totalAllowance: p.totalAllowance ?? p.allowances ?? 0,
 totalDeduction: p.totalDeduction ?? p.deductions ?? 0,
 netSalary: p.netSalary ?? ((Number(p.grossSalary || p.basicSalary || 0)) + (Number(p.totalAllowance || p.allowances || 0)) - (Number(p.totalDeduction || p.deductions || 0))),
 paymentMethod: p.paymentMethod || '-',
 paymentStatus: p.paymentStatus || p.status || 'pending',
 paymentDate: p.paymentDate || null,
 transactionReference: p.transactionReference || '',
 });

 const fetchPayslips = async () => {
 setLoading(true);
 try {
 const res = await apiFetch('/teacher/payslips');
 const data = await parseJsonSafe(res);
 if (data.success && data.data?.length > 0) setPayslips(data.data.map(normalizePayslip));
 else setPayslips(MOCK.map(normalizePayslip));
 } catch (e) {
 console.error(e);
 setPayslips(MOCK.map(normalizePayslip));
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchPayslips();
 }, []);

 const fmt = (n) => {
 if (n == null) return '-';
 return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
 };

 const fmtDate = (d) => {
 if (!d) return '-';
 return new Date(d).toLocaleDateString('en-GB');
 };

 const totalGross = payslips.reduce((s, p) => s + (p.grossSalary || 0), 0);
 const totalAllowances = payslips.reduce((s, p) => s + (p.totalAllowance || 0), 0);
 const totalDeductions = payslips.reduce((s, p) => s + (p.totalDeduction || 0), 0);
 const totalNet = payslips.reduce((s, p) => s + (p.netSalary || 0), 0);

 const statCards = [
 { label: t('payslips.totalPayments'), value: payslips.length, accent: 'bg-cyan-500' },
 { label: t('payslips.totalGross'), value: fmt(totalGross), accent: 'bg-blue-500' },
 { label: t('payslips.totalAllowances'), value: fmt(totalAllowances), accent: 'bg-emerald-500' },
 { label: t('payslips.totalNetPaid'), value: fmt(totalNet), accent: 'bg-violet-500' },
 ];

 const renderLoading = () => (
 <div className="flex items-center justify-center py-20">
 <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" />
 <span className="ml-3 text-sm text-slate-500 dark:text-slate-400">{t('common.loading')}</span>
 </div>
 );

 const renderEmpty = () => (
 <div className="flex flex-col items-center justify-center py-20">
 <div className="mb-4 text-5xl">💰</div>
 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('payslips.noPayslips')}</p>
 </div>
 );

 const renderTable = () => (
  <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 ">
  <div className="overflow-x-auto">
  <table className="w-full text-left text-xs sm:text-sm">
  <thead>
  <tr className="border-b border-slate-200 dark:border-slate-700">
  <th className="px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('payslips.month')}</th>
  <th className="px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('payslips.grossSalary')}</th>
  <th className="hidden sm:table-cell px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('payslips.allowances')}</th>
  <th className="hidden sm:table-cell px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('payslips.deductions')}</th>
  <th className="px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('payslips.netSalary')}</th>
  <th className="hidden md:table-cell px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('payslips.method')}</th>
  <th className="hidden md:table-cell px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('payslips.paymentDate')}</th>
  <th className="px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('common.status')}</th>
  <th className="px-3 sm:px-5 py-3 sm:py-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('common.actions')}</th>
  </tr>
  </thead>
  <tbody>
  {payslips.map((p) => (
  <tr
  key={p._id}
  className="border-b border-slate-100 transition last:border-0 dark:border-slate-700/50 dark:"
  >
  <td className="px-3 sm:px-5 py-3 sm:py-4">
  <div className="flex items-center gap-2 sm:gap-3">
  <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
  {t('payslips.' + monthNames[p.salaryMonth - 1])?.slice(0, 3) || t('common.na')}
  </div>
  <div>
  <div className="font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{t('payslips.' + monthNames[p.salaryMonth - 1]) || p.salaryMonth}</div>
  <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{p.salaryYear}</div>
  </div>
  </div>
  </td>
  <td className="px-3 sm:px-5 py-3 sm:py-4 text-slate-600 dark:text-slate-300">{fmt(p.grossSalary)}</td>
  <td className="hidden sm:table-cell px-3 sm:px-5 py-3 sm:py-4 text-emerald-600 dark:text-emerald-400">+{fmt(p.totalAllowance)}</td>
  <td className="hidden sm:table-cell px-3 sm:px-5 py-3 sm:py-4 text-rose-600 dark:text-rose-400">-{fmt(p.totalDeduction)}</td>
  <td className="px-3 sm:px-5 py-3 sm:py-4 font-semibold text-emerald-600 dark:text-emerald-400">{fmt(p.netSalary)}</td>
  <td className="hidden md:table-cell px-3 sm:px-5 py-3 sm:py-4 text-slate-600 dark:text-slate-300">{t('payslips.' + p.paymentMethod) || p.paymentMethod || t('common.na')}</td>
  <td className="hidden md:table-cell px-3 sm:px-5 py-3 sm:py-4 text-slate-600 dark:text-slate-300">{fmtDate(p.paymentDate)}</td>
  <td className="px-3 sm:px-5 py-3 sm:py-4">
  <span className={`inline-block rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold capitalize ${paymentStatusColors[p.paymentStatus] || ''}`}>
  {t('payslips.' + (p.paymentStatus || 'paid')) || p.paymentStatus || t('common.paid')}
  </span>
  </td>
  <td className="px-3 sm:px-5 py-3 sm:py-4">
  <button
  onClick={() => setSelected(p)}
  className="rounded-lg sm:rounded-xl border border-cyan-200 bg-cyan-50 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 dark:hover:bg-cyan-900/50"
  >
  {t('common.viewDetails')}
  </button>
  </td>
  </tr>
  ))}
  </tbody>
  </table>
  </div>
  </div>
 );

 return (
 <div className={PANEL_PAGE_BG}>
  <div className="px-3 py-4 sm:px-6 lg:px-8">
  <div className="mb-6 sm:mb-8">
  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{t('payslips.title')}</h1>
  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('payslips.subtitle')}</p>
  </div>

  <section className="mb-6 sm:mb-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
 {statCards.map((c) => (
  <div key={c.label} className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm dark:border-slate-700 ">
  <div className={`absolute inset-x-0 top-0 h-1 ${c.accent}`} />
  <p className="text-[10px] sm:text-sm font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
  <p className="mt-2 sm:mt-3 text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{c.value}</p>
  </div>
 ))}
 </section>

 {loading ? renderLoading() : payslips.length === 0 ? renderEmpty() : renderTable()}
 </div>

 {selected && (
 <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setSelected(null)}>
 <div className="mx-4 w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 " onClick={(e) => e.stopPropagation()}>
 <div className="mb-6 flex items-center justify-between">
 <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
 {t('payslips.payslip')} — {t('payslips.' + monthNames[selected.salaryMonth - 1])} {selected.salaryYear}
 </h2>
 <button onClick={() => setSelected(null)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition dark:border-slate-600 dark:text-slate-200 dark:">
 {t('common.close')}
 </button>
 </div>

 <div className="grid gap-6 sm:grid-cols-2">
 <div className="space-y-4">
 <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('payslips.salaryBreakdown')}</h3>
 <div className="flex justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
 <span className="text-sm text-slate-500 dark:text-slate-400">{t('payslips.grossSalary')}</span>
 <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{fmt(selected.grossSalary)}</span>
 </div>
 <div className="flex justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
 <span className="text-sm text-slate-500 dark:text-slate-400">{t('payslips.allowances')}</span>
 <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">+{fmt(selected.totalAllowance)}</span>
 </div>
 <div className="flex justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
 <span className="text-sm text-slate-500 dark:text-slate-400">{t('payslips.deductions')}</span>
 <span className="text-sm font-medium text-rose-600 dark:text-rose-400">-{fmt(selected.totalDeduction)}</span>
 </div>
 <div className="flex justify-between pt-2">
 <span className="text-base font-semibold text-slate-700 dark:text-slate-300">{t('payslips.netSalary')}</span>
 <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{fmt(selected.netSalary)}</span>
 </div>
 </div>

 <div className="space-y-4">
 <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('payslips.paymentInfo')}</h3>
 <div className="flex justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
 <span className="text-sm text-slate-500 dark:text-slate-400">{t('payslips.paymentMethod')}</span>
 <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{t('payslips.' + selected.paymentMethod) || selected.paymentMethod || t('common.na')}</span>
 </div>
 <div className="flex justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
 <span className="text-sm text-slate-500 dark:text-slate-400">{t('common.status')}</span>
 <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${paymentStatusColors[selected.paymentStatus] || ''}`}>{t('payslips.' + (selected.paymentStatus || 'paid')) || selected.paymentStatus || t('common.paid')}</span>
 </div>
 <div className="flex justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
 <span className="text-sm text-slate-500 dark:text-slate-400">{t('payslips.paymentDate')}</span>
 <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{fmtDate(selected.paymentDate)}</span>
 </div>
 {selected.transactionReference && (
 <div className="flex justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
 <span className="text-sm text-slate-500 dark:text-slate-400">{t('payslips.transactionRef')}</span>
 <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">{selected.transactionReference}</span>
 </div>
 )}
 {selected.approvedBy && (
 <div className="flex justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
 <span className="text-sm text-slate-500 dark:text-slate-400">{t('payslips.approvedBy')}</span>
 <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{selected.approvedBy.name || t('common.na')}</span>
 </div>
 )}
 {selected.paidBy && (
 <div className="flex justify-between">
 <span className="text-sm text-slate-500 dark:text-slate-400">{t('payslips.paidBy')}</span>
 <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{selected.paidBy.name || t('common.na')}</span>
 </div>
 )}
 </div>
 </div>

 {selected.deductionDetails && selected.deductionDetails.length > 0 && (
 <div className="mt-6">
 <h3 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('payslips.deductionBreakdown')}</h3>
 <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
 <table className="w-full text-left text-sm">
 <thead>
 <tr className="border-b border-slate-200 dark:border-slate-700 ">
 <th className="px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-300">{t('payslips.type')}</th>
 <th className="px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-300">{t('payslips.reason')}</th>
 <th className="px-4 py-2.5 text-right font-semibold text-slate-600 dark:text-slate-300">{t('payslips.amount')}</th>
 </tr>
 </thead>
 <tbody>
 {selected.deductionDetails.map((d, i) => (
 <tr key={i} className="border-b border-slate-100 last:border-0 dark:border-slate-700/50">
 <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">{d.deductionType}</td>
 <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{d.deductionReason || '-'}</td>
 <td className="px-4 py-2.5 text-right font-medium text-rose-600 dark:text-rose-400">-{fmt(d.deductionAmount)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 );
};

export default TeacherPayslips;
