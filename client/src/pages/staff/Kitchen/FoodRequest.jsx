import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';
import { FiDollarSign, FiCheckCircle, FiFileText } from 'react-icons/fi';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const statusColors = { pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };

const FoodRequest = () => {
  const { t } = useTranslation(['staff', 'common']);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), allocatedAmount: '', remarks: '' });

  useEffect(() => { fetchBudgets(); }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/kitchen/budgets');
      const data = await parseJsonSafe(res);
      if (data.success) setBudgets(data.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch('/kitchen/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, month: Number(form.month), year: Number(form.year), allocatedAmount: Number(form.allocatedAmount || 0) })
      });
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) throw new Error(data.message || t('kitchen.foodRequest.failedToSubmit', 'Failed to submit request'));
      await fetchBudgets();
      setForm({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), allocatedAmount: '', remarks: '' });
    } catch (e) {
      alert(e.message);
    } finally { setSubmitting(false); }
  };

  const totalRequested = budgets.reduce((s, b) => s + (b.allocatedAmount || 0), 0);
  const totalApproved = budgets.filter(b => b.budgetStatus === 'approved').reduce((s, b) => s + (b.approvedAmount || 0), 0);

  return (
    <StaffPageLayout eyebrow={t('kitchen.foodRequest.eyebrow', 'Kitchen')} title={t('kitchen.foodRequest.title', 'Budget Requests')} subtitle={t('kitchen.foodRequest.subtitle', 'Submit and track monthly kitchen budget requests.')}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('kitchen.foodRequest.totalRequests', 'Total Requests')}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{budgets.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('kitchen.foodRequest.totalRequested', 'Total Requested')}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalRequested.toLocaleString()} AFN</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:border-slate-700 dark:bg-none dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('kitchen.foodRequest.totalApproved', 'Total Approved')}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalApproved.toLocaleString()} AFN</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700 dark:bg-slate-800/50">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4">{t('kitchen.foodRequest.newBudgetRequest', 'New Budget Request')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20">
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <input type="number" placeholder={t('common.year', 'Year')} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20" />
              <input type="number" placeholder={t('kitchen.foodRequest.requestedAmount', 'Requested Amount (AFN) *')} value={form.allocatedAmount} onChange={e => setForm({ ...form, allocatedAmount: e.target.value })} required min="0" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20" />
              <textarea placeholder={t('kitchen.foodRequest.remarksReason', 'Remarks / Reason')} value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20" />
              <Button type="submit" disabled={submitting} className="w-full">{submitting ? t('kitchen.foodRequest.submitting', 'Submitting...') : t('kitchen.foodRequest.submitRequest', 'Submit Request')}</Button>
            </form>
          </Card>

          <div className="lg:col-span-2">
            {loading ? (
              <Card className="rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">{t('common.loading', 'Loading...')}</Card>
            ) : budgets.length === 0 ? (
              <Card className="rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">{t('kitchen.foodRequest.noBudgetRequests', 'No budget requests found')}</Card>
            ) : (
              <Card className="rounded-2xl border border-slate-200 overflow-hidden dark:border-slate-700 dark:bg-slate-800/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300">{t('kitchen.foodRequest.monthYear', 'Month/Year')}</th>
                        <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300">{t('kitchen.foodRequest.requested', 'Requested')}</th>
                        <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300">{t('kitchen.foodRequest.approved', 'Approved')}</th>
                        <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300">{t('kitchen.foodRequest.spent', 'Spent')}</th>
                        <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300">{t('kitchen.foodRequest.remaining', 'Remaining')}</th>
                        <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300">{t('common.remarks', 'Remarks')}</th>
                        <th className="p-4 text-left font-semibold text-slate-600 dark:text-slate-300">{t('common.status', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgets.map(b => (
                        <tr key={b._id} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/30">
                          <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{months[b.month - 1]} {b.year}</td>
                          <td className="p-4 text-slate-700 dark:text-slate-200">{b.allocatedAmount.toLocaleString()} AFN</td>
                          <td className="p-4 text-slate-700 dark:text-slate-200">{b.approvedAmount.toLocaleString()} AFN</td>
                          <td className="p-4 text-red-600 dark:text-red-400">{b.spentAmount.toLocaleString()} AFN</td>
                          <td className="p-4 text-green-600 dark:text-green-400">{b.remainingAmount.toLocaleString()} AFN</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 max-w-[150px] truncate" title={b.remarks || '-'}>{b.remarks || '-'}</td>
                          <td className="p-4"><span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColors[b.budgetStatus] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'}`}>{b.budgetStatus}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </StaffPageLayout>
  );
};

export default FoodRequest;
