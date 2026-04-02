import React from 'react';
import ListPage from '../shared/ListPage';

export const studentFeesConfig = {
  title: 'Student Fees',
  subtitle: 'Manage student fee assignments',
  endpoint: '/finance/student-fees',
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
    { name: 'paymentStatus', label: 'Payment Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'paid', label: 'Paid' },
      { value: 'partial', label: 'Partial' },
      { value: 'overdue', label: 'Overdue' }
    ]},
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
  mapFormToPayload: (form) => ({
    ...form,
    totalAmount: Number(form.totalAmount),
    discountAmount: Number(form.discountAmount),
    payableAmount: Number(form.payableAmount)
  })
};

const StudentFees = () => (
  <ListPage
    title={studentFeesConfig.title}
    subtitle={studentFeesConfig.subtitle}
    endpoint={studentFeesConfig.endpoint}
    columns={studentFeesConfig.columns}
    createPath="/staff/finance/student-fees/create"
    editPathForRow={(row) => `/staff/finance/student-fees/edit/${row._id}`}
    viewPathForRow={(row) => '/staff/finance/student-fees/view/' + row._id}
    searchPlaceholder="Search student fees..."
  />
);

export default StudentFees;

