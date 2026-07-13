import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['staff', 'common']);
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
            { label: t('staff.finance.feePayments.statTotalPayments'), value: payments.length, helper: t('staff.finance.feePayments.statTotalPaymentsHelper'), tone: 'blue', icon: FiCreditCard },
            { label: t('staff.finance.feePayments.statTotalCollected'), value: formatCurrency(totalCollected), helper: t('staff.finance.feePayments.statTotalCollectedHelper'), tone: 'emerald', icon: FiDollarSign },
            { label: t('staff.finance.feePayments.statPendingPayments'), value: pendingCount, helper: t('staff.finance.feePayments.statPendingPaymentsHelper'), tone: 'amber', icon: FiClock },
            { label: t('staff.finance.feePayments.statFailedPayments'), value: failedCount, helper: t('staff.finance.feePayments.statFailedPaymentsHelper'), tone: 'rose', icon: FiAlertTriangle },
            { label: t('staff.finance.feePayments.statVerificationQueue'), value: verificationQueue, helper: t('staff.finance.feePayments.statVerificationQueueHelper'), tone: 'violet', icon: FiCheckCircle }
          ],
          charts: [
            { title: t('staff.finance.feePayments.chartPaymentMethodDistribution'), type: 'pie', data: groupCountByKey(payments, 'paymentMethod') },
            { title: t('staff.finance.feePayments.chartPaymentStatusBreakdown'), type: 'bar', data: groupCountByKey(payments, 'paymentStatus') },
            { title: t('staff.finance.feePayments.chartMonthlyCollections'), type: 'line', data: groupAmountByMonth(payments, 'paymentDate', 'paidAmount') }
          ],
          insight: {
            eyebrow: t('staff.finance.feePayments.insightEyebrow'),
            title: t('staff.finance.feePayments.insightTitle'),
            description: t('staff.finance.feePayments.insightDescription')
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({ loading: false, stats: [], charts: [], insight: { title: t('staff.finance.feePayments.errorTitle'), description: error.message || t('staff.finance.feePayments.errorDescription') } });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <ListPage
      eyebrow={t('staff.finance.eyebrow')}
      title={feePaymentsConfig.title}
      subtitle={feePaymentsConfig.subtitle}
      endpoint={feePaymentsConfig.endpoint}
      columns={feePaymentsConfig.columns}
      createPath="/staff/finance/fee-payments/create"
      editPathForRow={(row) => `/staff/finance/fee-payments/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/fee-payments/view/${row._id}`}
      searchPlaceholder={t('staff.finance.feePayments.searchPlaceholder')}
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default FeePayments;
