const classManagementConfig = {
  title: 'Class Management',
  subtitle: 'Create and manage classes for student assignment',
  endpoint: '/academic/classes',
  createPath: '/staff/registrar/classes/create',
  editPathForRow: (row) => `/staff/registrar/classes/edit/${row._id}`,
  viewPathForRow: (row) => `/staff/registrar/classes/view/${row._id}`,
  columns: [
    { key: 'name', header: 'Class Name' },
    { key: 'code', header: 'Code' },
    { key: 'type', header: 'Type' },
    { key: 'maxStudents', header: 'Max Students' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'name', label: 'Class Name', required: true, placeholder: 'e.g. Grade 1, Class A' },
    { name: 'code', label: 'Class Code', placeholder: 'e.g. GR1-A' },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'boys', label: 'Boys' },
        { value: 'girls', label: 'Girls' },
        { value: 'mixed', label: 'Mixed' }
      ]
    },
    { name: 'maxStudents', label: 'Max Students', type: 'number', placeholder: '30' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ],
  initialForm: {
    name: '',
    code: '',
    type: 'mixed',
    maxStudents: '',
    status: 'active'
  },
  mapRowToForm: (row) => ({
    name: row.name || '',
    code: row.code || '',
    type: row.type || 'mixed',
    maxStudents: row.maxStudents || '',
    status: row.status || 'active'
  }),
  mapFormToPayload: (form) => ({
    ...form,
    maxStudents: form.maxStudents ? Number(form.maxStudents) : undefined
  })
};

export default classManagementConfig;
