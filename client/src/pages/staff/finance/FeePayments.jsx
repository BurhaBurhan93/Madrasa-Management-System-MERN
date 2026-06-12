import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import ListPage from '../shared/ListPage';
import StaffAnalyticsContent, { fetchCollectionData, formatCurrency, groupAmountByMonth, groupCountByKey } from '../shared/StaffAnalyticsContent';
import { staffApi } from '../../../api/staffApi';

export const feePaymentsConfig = {
  title: 'Fee Payments',
  subtitle: 'Manage collection activity, verification queues, and payment channels.',
  endpoint: staffApi.finance.feePayments,
  columns: [
    { key: 'studentFee', header: 'Student Fee ID' },
    { key: 'receiptNo', header: 'Receipt No' },
    { key: 'paymentDate', header: 'Payment Date' },
    { key: 'paidAmount', header: 'Paid Amount' },
    { key: 'paymentMethod', header: 'Method' },
    { key: 'paymentStatus', header: 'Status' },
    { key: 'verificationStatus', header: 'Verification' }
  ],
  formFields: [
    { name: 'studentFee', label: 'Student Fee', type: 'relation', relationEndpoint: '/finance/student-fees', relationLabel: (r) => `${r.student?.name || r.student} - ${r.academicYear}` },
    { name: 'receiptNo', label: 'Receipt No' },
    { name: 'paymentDate', label: 'Payment Date', type: 'date' },
    { name: 'paidAmount', label: 'Paid Amount', type: 'number' },
    { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: [{ value: 'cash', label: 'Cash' }, { value: 'card', label: 'Card' }] },
    { name: 'transactionReference', label: 'Transaction Reference' },
    { name: 'paymentStatus', label: 'Payment Status', type: 'select', options: [{ value: 'completed', label: 'Completed' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }] },
    { name: 'verificationStatus', label: 'Verification Status', type: 'select', options: [{ value: 'verified', label: 'Verified' }, { value: 'pending', label: 'Pending' }, { value: 'rejected', label: 'Rejected' }] },
    { name: 'paymentChannel', label: 'Payment Channel' },
    { name: 'remarks', label: 'Remarks' }
  ],
  initialForm: {
    studentFee: '',
    receiptNo: '',
    paymentDate: '',
    paidAmount: 0,
    paymentMethod: 'cash',
    transactionReference: '',
    paymentStatus: 'completed',
    verificationStatus: 'verified',
    paymentChannel: '',
    remarks: ''
  },
  mapFormToPayload: (form) => ({ ...form, paidAmount: Number(form.paidAmount) })
};

const FeePayments = () => {
  const [analytics, setAnalytics] = useState({ loading: true, stats: [], charts: [], insight: null });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const payments = await fetchCollectionData(staffApi.finance.feePayments);
        if (!active) return;

        const totalCollected = payments.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);
        const pendingCount = payments.filter((item) => item.paymentStatus === 'pending').length;
        const failedCount = payments.filter((item) => item.paymentStatus === 'failed').length;
        const verificationQueue = payments.filter((item) => item.verificationStatus === 'pending').length;

        setAnalytics({
          loading: false,
          stats: [
            { label: 'Total Payments', value: payments.length, helper: 'All submitted payment records', tone: 'blue', icon: FiCreditCard },
            { label: 'Total Collected', value: formatCurrency(totalCollected), helper: 'Sum of paid amounts', tone: 'emerald', icon: FiDollarSign },
            { label: 'Pending Payments', value: pendingCount, helper: 'Awaiting completion', tone: 'amber', icon: FiClock },
            { label: 'Failed Payments', value: failedCount, helper: 'Need follow-up or retry', tone: 'rose', icon: FiAlertTriangle },
            { label: 'Verification Queue', value: verificationQueue, helper: 'Pending manual review', tone: 'violet', icon: FiCheckCircle }
          ],
          charts: [
            { title: 'Payment Method Distribution', type: 'pie', data: groupCountByKey(payments, 'paymentMethod') },
            { title: 'Payment Status Breakdown', type: 'bar', data: groupCountByKey(payments, 'paymentStatus') },
            { title: 'Monthly Collections', type: 'line', data: groupAmountByMonth(payments, 'paymentDate', 'paidAmount') }
          ],
          insight: {
            eyebrow: 'Collections',
            title: 'Receipts, status, and verification are now visible at a glance',
            description: 'The page now mirrors the student-facing richness with collection totals, channel mix, and monthly trend signals backed directly by the fee payment schema.'
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({ loading: false, stats: [], charts: [], insight: { title: 'Fee payment analytics could not be loaded', description: error.message || 'The payment table is still available below.' } });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <ListPage
      eyebrow="Finance"
      title={feePaymentsConfig.title}
      subtitle={feePaymentsConfig.subtitle}
      endpoint={feePaymentsConfig.endpoint}
      columns={feePaymentsConfig.columns}
      createPath="/staff/finance/fee-payments/create"
      editPathForRow={(row) => `/staff/finance/fee-payments/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/fee-payments/view/${row._id}`}
      searchPlaceholder="Search fee payments..."
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default FeePayments;
