import React from 'react';
import ListPage from '../shared/ListPage';

export const feeStructuresConfig = {
  title: 'Fee Structure',
  subtitle: 'Manage fee structure records',
  endpoint: '/finance/fee-structures',
  columns: [
    { key: 'feeCode', header: 'Fee Code' },
    { key: 'feeName', header: 'Fee Name' },
    { key: 'feeType', header: 'Fee Type' },
    { key: 'amount', header: 'Amount' },
    { key: 'frequency', header: 'Frequency' },
    { key: 'isMandatory', header: 'Mandatory' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'feeCode', label: 'Fee Code' },
    { name: 'feeName', label: 'Fee Name' },
    { name: 'class', label: 'Class', type: 'relation', relationEndpoint: '/academic/classes', relationLabel: (r) => `${r.name} - ${r.section || ''}` },
    { name: 'feeType', label: 'Fee Type', type: 'select', options: [
      { value: 'tuition', label: 'Tuition' },
      { value: 'admission', label: 'Admission' },
      { value: 'other', label: 'Other' }
    ]},
    { name: 'amount', label: 'Amount', type: 'number' },
    { name: 'frequency', label: 'Frequency', type: 'select', options: [
      { value: 'one-time', label: 'One-Time' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' }
    ]},
    { name: 'applicableFrom', label: 'Applicable From', type: 'date' },
    { name: 'applicableTo', label: 'Applicable To', type: 'date' },
    { name: 'isMandatory', label: 'Mandatory', type: 'select', options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]},
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ],
  initialForm: {
    feeCode: '',
    feeName: '',
    class: '',
    feeType: 'tuition',
    amount: 0,
    frequency: 'one-time',
    applicableFrom: '',
    applicableTo: '',
    isMandatory: true,
    status: 'active'
  },
  mapFormToPayload: (form) => ({
    ...form,
    amount: Number(form.amount),
    isMandatory: String(form.isMandatory) === 'true' || form.isMandatory === true
  })
};

const FeeStructures = () => (
  <ListPage
    title={feeStructuresConfig.title}
    subtitle={feeStructuresConfig.subtitle}
    endpoint={feeStructuresConfig.endpoint}
    columns={feeStructuresConfig.columns}
    createPath="/staff/finance/fee-structures/create"
    editPathForRow={(row) => `/staff/finance/fee-structures/edit/${row._id}`}
    searchPlaceholder="Search fee structures..."
  />
);

export default FeeStructures;
