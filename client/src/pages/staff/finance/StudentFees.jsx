import React, { useEffect, useState } from 'react';
import { FiAlertCircle, FiCalendar, FiCheckCircle, FiCreditCard, FiUsers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
import StaffAnalyticsContent, { fetchCollectionData, formatCurrency, groupCountByKey } from '../shared/StaffAnalyticsContent';
import { staffApi } from '../../../api/staffApi';

export const studentFeesConfig = {
  title: 'Student Fees',
  subtitle: 'Track fee assignments, outstanding balances, and collection risk by status.',
  endpoint: staffApi.finance.studentFees,
  columns: [
    {
      key: 'student',
      header: 'Student',
      render: (value, row) => {
        const student = (typeof value === 'object' && value) ? value : (row.studentId ? { name: row.studentId } : null);
        if (!student) return <span>{String(value || '-')}</span>;
        const name = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email || student.studentCode || student._id || '-';
        const photo = student.photo || student.image;
        return (
          <div className="flex items-center gap-3">
            {photo ? (
              <img src={photo} alt={name} className="h-8 w-8 rounded-full object-cover" loading="lazy" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-xs font-semibold text-cyan-700">
                {name ? name.charAt(0).toUpperCase() : '?'}
              </span>
            )}
            <span className="font-medium text-slate-800">{name}</span>
          </div>
        );
      }
    },
    { key: 'feeStructure', header: 'Fee Structure ID' },
    { key: 'academicYear', header: 'Academic Year' },
    { key: 'totalAmount', header: 'Total Amount' },
    { key: 'discountAmount', header: 'Discount' },
    { key: 'payableAmount', header: 'Payable' },
    { key: 'paymentStatus', header: 'Status' }
  ],
  formFields: [
    {
      name: 'student',
      label: 'Student',
      type: 'relation',
      relationEndpoint: '/users?role=student',
      relationLabel: (r) => `${r.name} (${r.email})`,
      renderView: (value) => {
        if (!value) return <span>-</span>;
        if (typeof value !== 'object') return <span>{String(value)}</span>;
        const name = value.name || `${value.firstName || ''} ${value.lastName || ''}`.trim() || value.email || value.studentCode || '-';
        const photo = value.photo || value.image;
        return (
          <div className="flex items-center gap-3">
            {photo ? (
              <img src={photo} alt={name} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-sm font-semibold text-cyan-700">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="font-medium">{name}</span>
          </div>
        );
      }
    },
    { name: 'feeStructure', label: 'Fee Structure', type: 'relation', relationEndpoint: '/finance/fee-structures', relationLabel: (r) => `${r.feeName} - ${r.feeCode}` },
    { name: 'academicYear', label: 'Academic Year' },
    { name: 'totalAmount', label: 'Total Amount', type: 'number' },
    { name: 'discountAmount', label: 'Discount Amount', type: 'number' },
    { name: 'payableAmount', label: 'Payable Amount', type: 'number' },
    { name: 'dueDate', label: 'Due Date', type: 'date' },
    { name: 'paymentStatus', label: 'Payment Status', type: 'select', options: [{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }, { value: 'partial', label: 'Partial' }, { value: 'overdue', label: 'Overdue' }] },
    { name: 'remarks', label: 'Remarks' }
  ],
  initialForm: {
    student: '',
    feeStructure: '',
    academicYear: '2024-2025',
    totalAmount: 0,
    discountAmount: 0,
    payableAmount: 0,
    dueDate: '',
    paymentStatus: 'pending',
    remarks: ''
  },
  mapFormToPayload: (form) => ({ ...form, totalAmount: Number(form.totalAmount), discountAmount: Number(form.discountAmount), payableAmount: Number(form.payableAmount) })
};

const StudentFees = () => {
  const { t } = useTranslation(['staff', 'common']);
  const [analytics, setAnalytics] = useState({ loading: true, stats: [], charts: [], insight: null });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const fees = await fetchCollectionData(staffApi.finance.studentFees);
        if (!active) return;

        const outstandingBalance = fees
          .filter((item) => item.paymentStatus !== 'paid')
          .reduce((sum, item) => sum + Number(item.payableAmount || 0), 0);
        const paidCount = fees.filter((item) => item.paymentStatus === 'paid').length;
        const partialCount = fees.filter((item) => item.paymentStatus === 'partial').length;
        const overdueCount = fees.filter((item) => item.paymentStatus === 'overdue').length;

        setAnalytics({
          loading: false,
          stats: [
            { label: t('staff.finance.studentFees.statStudentsWithFees'), value: fees.length, helper: t('staff.finance.studentFees.statStudentsWithFeesHelper'), tone: 'blue', icon: FiUsers },
            { label: t('staff.finance.studentFees.statOutstandingBalance'), value: formatCurrency(outstandingBalance), helper: t('staff.finance.studentFees.statOutstandingBalanceHelper'), tone: 'rose', icon: FiAlertCircle },
            { label: t('staff.finance.studentFees.statFullyPaid'), value: paidCount, helper: t('staff.finance.studentFees.statFullyPaidHelper'), tone: 'emerald', icon: FiCheckCircle },
            { label: t('staff.finance.studentFees.statPartiallyPaid'), value: partialCount, helper: t('staff.finance.studentFees.statPartiallyPaidHelper'), tone: 'amber', icon: FiCreditCard },
            { label: t('staff.finance.studentFees.statOverdueAccounts'), value: overdueCount, helper: t('staff.finance.studentFees.statOverdueAccountsHelper'), tone: 'violet', icon: FiCalendar }
          ],
          charts: [
            { title: t('staff.finance.studentFees.chartPaymentStatusDistribution'), type: 'pie', data: groupCountByKey(fees, 'paymentStatus') },
            { title: t('staff.finance.studentFees.chartAcademicYearMix'), type: 'bar', data: groupCountByKey(fees, 'academicYear') }
          ],
          insight: {
            eyebrow: t('staff.finance.studentFees.insightEyebrow'),
            title: t('staff.finance.studentFees.insightTitle'),
            description: t('staff.finance.studentFees.insightDescription')
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({ loading: false, stats: [], charts: [], insight: { title: t('staff.finance.studentFees.errorTitle'), description: error.message || t('staff.finance.studentFees.errorDescription') } });
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
      title={studentFeesConfig.title}
      subtitle={studentFeesConfig.subtitle}
      endpoint={studentFeesConfig.endpoint}
      columns={studentFeesConfig.columns}
      createPath="/staff/finance/student-fees/create"
      editPathForRow={(row) => `/staff/finance/student-fees/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/student-fees/view/${row._id}`}
      searchPlaceholder={t('staff.finance.studentFees.searchPlaceholder')}
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default StudentFees;
