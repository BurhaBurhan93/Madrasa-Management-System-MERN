import React from 'react';
import ListPage from '../shared/ListPage';

export const feePaymentsConfig = {
  title: 'Fee Payments',
  subtitle: 'Manage fee payment records',
  endpoint: '/finance/fee-payments',
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
    { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: [
      { value: 'cash', label: 'Cash' },
      { value: 'card', label: 'Card' }
    ]},
    { name: 'transactionReference', label: 'Transaction Reference' },
    { name: 'paymentStatus', label: 'Payment Status', type: 'select', options: [
      { value: 'completed', label: 'Completed' },
      { value: 'pending', label: 'Pending' },
      { value: 'failed', label: 'Failed' }
    ]},
    { name: 'verificationStatus', label: 'Verification Status', type: 'select', options: [
      { value: 'verified', label: 'Verified' },
      { value: 'pending', label: 'Pending' },
      { value: 'rejected', label: 'Rejected' }
    ]},
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
  mapFormToPayload: (form) => ({
    ...form,
    paidAmount: Number(form.paidAmount)
  })
};

const FeePayments = () => (
  <ListPage
    title={feePaymentsConfig.title}
    subtitle={feePaymentsConfig.subtitle}
    endpoint={feePaymentsConfig.endpoint}
    columns={feePaymentsConfig.columns}
    createPath="/staff/finance/fee-payments/create"
    editPathForRow={(row) => `/staff/finance/fee-payments/edit/${row._id}`}
    searchPlaceholder="Search fee payments..."
  />
);

export default FeePayments;
