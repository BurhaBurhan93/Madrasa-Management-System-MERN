import React, { useEffect, useState } from 'react';
import { FiAlertCircle, FiCalendar, FiCheckCircle, FiCreditCard, FiUsers } from 'react-icons/fi';
import ListPage from '../shared/ListPage';
import StaffAnalyticsContent, { fetchCollectionData, formatCurrency, groupCountByKey } from '../shared/StaffAnalyticsContent';
import { staffApi } from '../../../api/staffApi';

export const studentFeesConfig = {
  title: 'Student Fees',
  subtitle: 'Track fee assignments, outstanding balances, and collection risk by status.',
  endpoint: staffApi.finance.studentFees,
  columns: [
    { key: 'student', header: 'Student ID' },
    { key: 'feeStructure', header: 'Fee Structure ID' },
    { key: 'academicYear', header: 'Academic Year' },
    { key: 'totalAmount', header: 'Total Amount' },
    { key: 'discountAmount', header: 'Discount' },
    { key: 'payableAmount', header: 'Payable' },
    { key: 'paymentStatus', header: 'Status' }
  ],
  formFields: [
    { name: 'student', label: 'Student', type: 'relation', relationEndpoint: '/users?role=student', relationLabel: (r) => `${r.name} (${r.email})` },
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
            { label: 'Students With Fees', value: fees.length, helper: 'Assigned student-fee records', tone: 'blue', icon: FiUsers },
            { label: 'Outstanding Balance', value: formatCurrency(outstandingBalance), helper: 'Uncleared payable amount', tone: 'rose', icon: FiAlertCircle },
            { label: 'Fully Paid', value: paidCount, helper: 'Settled fee accounts', tone: 'emerald', icon: FiCheckCircle },
            { label: 'Partially Paid', value: partialCount, helper: 'Collections in progress', tone: 'amber', icon: FiCreditCard },
            { label: 'Overdue Accounts', value: overdueCount, helper: 'Require immediate follow-up', tone: 'violet', icon: FiCalendar }
          ],
          charts: [
            { title: 'Payment Status Distribution', type: 'pie', data: groupCountByKey(fees, 'paymentStatus') },
            { title: 'Academic Year Assignment Mix', type: 'bar', data: groupCountByKey(fees, 'academicYear') }
          ],
          insight: {
            eyebrow: 'Collections Risk',
            title: 'Outstanding and overdue fee exposure is now visible from the list page',
            description: 'Because the current schema centers on payment status and academic year, the dashboard highlights those dimensions instead of guessing unsupported class-level aggregates.'
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({ loading: false, stats: [], charts: [], insight: { title: 'Student fee analytics could not be loaded', description: error.message || 'The fee assignment table is still available below.' } });
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
      title={studentFeesConfig.title}
      subtitle={studentFeesConfig.subtitle}
      endpoint={studentFeesConfig.endpoint}
      columns={studentFeesConfig.columns}
      createPath="/staff/finance/student-fees/create"
      editPathForRow={(row) => `/staff/finance/student-fees/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/student-fees/view/${row._id}`}
      searchPlaceholder="Search student fees..."
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default StudentFees;
