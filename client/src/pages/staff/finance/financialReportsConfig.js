const financialReportsConfig = {
  title: 'finance.financialReports.title',
  subtitle: 'finance.financialReports.subtitle',
  endpoint: '/finance/reports',
  columns: [
    { key: 'reportType', header: 'finance.financialReports.column.reportType' },
    { key: 'reportPeriod', header: 'finance.financialReports.column.reportPeriod' },
    { key: 'totalIncome', header: 'finance.financialReports.column.totalIncome' },
    { key: 'totalExpense', header: 'finance.financialReports.column.totalExpense' },
    { key: 'netBalance', header: 'finance.financialReports.column.netBalance' },
    { key: 'approvalStatus', header: 'finance.financialReports.column.approvalStatus' }
  ],
  formFields: [
    { name: 'reportType', label: 'finance.financialReports.formField.reportType' },
    { name: 'reportPeriod', label: 'finance.financialReports.formField.reportPeriod' },
    { name: 'totalIncome', label: 'finance.financialReports.formField.totalIncome', type: 'number' },
    { name: 'totalExpense', label: 'finance.financialReports.formField.totalExpense', type: 'number' },
    { name: 'netBalance', label: 'finance.financialReports.formField.netBalance', type: 'number' },
    { name: 'generatedAt', label: 'finance.financialReports.formField.generatedAt', type: 'date' },
    { name: 'approvalStatus', label: 'finance.financialReports.formField.approvalStatus', type: 'select', options: [
      { value: 'pending', label: 'finance.financialReports.formField.approvalStatus.pending' },
      { value: 'approved', label: 'finance.financialReports.formField.approvalStatus.approved' },
      { value: 'rejected', label: 'finance.financialReports.formField.approvalStatus.rejected' }
    ]},
    { name: 'remarks', label: 'finance.financialReports.formField.remarks' }
  ],
  initialForm: {
    reportType: '',
    reportPeriod: '',
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    generatedAt: '',
    approvalStatus: 'pending',
    remarks: ''
  },
  mapRowToForm: (row) => ({
    reportType: row.reportType || '',
    reportPeriod: row.reportPeriod || '',
    totalIncome: row.totalIncome ?? 0,
    totalExpense: row.totalExpense ?? 0,
    netBalance: row.netBalance ?? 0,
    generatedAt: row.generatedAt ? new Date(row.generatedAt).toISOString().slice(0, 10) : '',
    approvalStatus: row.approvalStatus || 'pending',
    remarks: row.remarks || ''
  }),
  mapFormToPayload: (form) => ({
    ...form,
    totalIncome: Number(form.totalIncome),
    totalExpense: Number(form.totalExpense),
    netBalance: Number(form.netBalance)
  })
};

export default financialReportsConfig;
