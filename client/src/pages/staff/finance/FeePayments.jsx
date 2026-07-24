import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
import StaffAnalyticsContent, { fetchCollectionData, formatCurrency, groupAmountByMonth, groupCountByKey } from '../shared/StaffAnalyticsContent';
import { staffApi } from '../../../api/staffApi';

export const feePaymentsConfig = {
  title: 'finance.feePayments.title',
  subtitle: 'finance.feePayments.subtitle',
  endpoint: staffApi.finance.feePayments,
  columns: [
    { key: 'studentFee', header: 'finance.feePayments.column.studentFee' },
    { key: 'receiptNo', header: 'finance.feePayments.column.receiptNo' },
    { key: 'paymentDate', header: 'finance.feePayments.column.paymentDate' },
    { key: 'paidAmount', header: 'finance.feePayments.column.paidAmount' },
    { key: 'paymentMethod', header: 'finance.feePayments.column.paymentMethod' },
    { key: 'paymentStatus', header: 'finance.feePayments.column.paymentStatus' },
    { key: 'verificationStatus', header: 'finance.feePayments.column.verificationStatus' }
  ],
  formFields: [
    { name: 'studentFee', label: 'finance.feePayments.formField.studentFee', type: 'relation', relationEndpoint: '/finance/student-fees', relationLabel: (r) => `${r.student?.name || r.student} - ${r.academicYear}` },
    { name: 'receiptNo', label: 'finance.feePayments.formField.receiptNo' },
    { name: 'paymentDate', label: 'finance.feePayments.formField.paymentDate', type: 'date' },
    { name: 'paidAmount', label: 'finance.feePayments.formField.paidAmount', type: 'number' },
    { name: 'paymentMethod', label: 'finance.feePayments.formField.paymentMethod', type: 'select', options: [{ value: 'cash', label: 'finance.feePayments.formField.paymentMethod.cash' }, { value: 'card', label: 'finance.feePayments.formField.paymentMethod.card' }] },
    { name: 'transactionReference', label: 'finance.feePayments.formField.transactionReference' },
    { name: 'paymentStatus', label: 'finance.feePayments.formField.paymentStatus', type: 'select', options: [{ value: 'completed', label: 'finance.feePayments.formField.paymentStatus.completed' }, { value: 'pending', label: 'finance.feePayments.formField.paymentStatus.pending' }, { value: 'failed', label: 'finance.feePayments.formField.paymentStatus.failed' }] },
    { name: 'verificationStatus', label: 'finance.feePayments.formField.verificationStatus', type: 'select', options: [{ value: 'verified', label: 'finance.feePayments.formField.verificationStatus.verified' }, { value: 'pending', label: 'finance.feePayments.formField.verificationStatus.pending' }, { value: 'rejected', label: 'finance.feePayments.formField.verificationStatus.rejected' }] },
    { name: 'paymentChannel', label: 'finance.feePayments.formField.paymentChannel' },
    { name: 'remarks', label: 'finance.feePayments.formField.remarks' }
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
            { label: t('finance.feePayments.statTotalPayments'), value: payments.length, helper: t('finance.feePayments.statTotalPaymentsHelper'), tone: 'blue', icon: FiCreditCard },
            { label: t('finance.feePayments.statTotalCollected'), value: formatCurrency(totalCollected), helper: t('finance.feePayments.statTotalCollectedHelper'), tone: 'emerald', icon: FiDollarSign },
            { label: t('finance.feePayments.statPendingPayments'), value: pendingCount, helper: t('finance.feePayments.statPendingPaymentsHelper'), tone: 'amber', icon: FiClock },
            { label: t('finance.feePayments.statFailedPayments'), value: failedCount, helper: t('finance.feePayments.statFailedPaymentsHelper'), tone: 'rose', icon: FiAlertTriangle },
            { label: t('finance.feePayments.statVerificationQueue'), value: verificationQueue, helper: t('finance.feePayments.statVerificationQueueHelper'), tone: 'violet', icon: FiCheckCircle }
          ],
          charts: [
            { title: t('finance.feePayments.chart.paymentMethodDistribution'), type: 'pie', data: groupCountByKey(payments, 'paymentMethod') },
            { title: t('finance.feePayments.chart.paymentStatusBreakdown'), type: 'bar', data: groupCountByKey(payments, 'paymentStatus') },
            { title: t('finance.feePayments.chart.monthlyCollections'), type: 'line', data: groupAmountByMonth(payments, 'paymentDate', 'paidAmount') }
          ],
          insight: {
            eyebrow: t('finance.feePayments.insight.eyebrow'),
            title: t('finance.feePayments.insight.title'),
            description: t('finance.feePayments.insight.description')
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({ loading: false, stats: [], charts: [], insight: { title: t('finance.feePayments.errorTitle'), description: error.message || t('finance.feePayments.errorDescription') } });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <ListPage
      eyebrow={t('finance.eyebrow')}
      title={feePaymentsConfig.title}
      subtitle={feePaymentsConfig.subtitle}
      endpoint={feePaymentsConfig.endpoint}
      columns={feePaymentsConfig.columns}
      createPath="/staff/finance/fee-payments/create"
      editPathForRow={(row) => `/staff/finance/fee-payments/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/fee-payments/view/${row._id}`}
      searchPlaceholder={t('finance.feePayments.searchPlaceholder')}
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default FeePayments;
