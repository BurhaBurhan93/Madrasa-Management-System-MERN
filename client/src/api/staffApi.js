import api from '../lib/api';
import { apiFetch, parseJsonSafe } from '../lib/apiFetch';

export const staffApi = {
  dashboard: {
    summary: '/staff/dashboard',
    activities: '/staff/activities'
  },
  finance: {
    transactions: '/finance/transactions',
    accounts: '/finance/accounts',
    feeStructures: '/finance/fee-structures',
    studentFees: '/finance/student-fees',
    feePayments: '/finance/fee-payments',
    expenses: '/finance/expenses',
    reports: '/finance/reports'
  },
  payroll: {
    employees: '/payroll/employees',
    salaryStructures: '/payroll/salary-structures',
    salaryPayments: '/payroll/salary-payments',
    salaryDeductions: '/payroll/salary-deductions',
    salaryAdvances: '/payroll/salary-advances'
  },
  hr: {
    departments: '/hr/departments',
    designations: '/hr/designations',
    leaveTypes: '/hr/leave-types',
    employees: '/hr/employees',
    attendance: '/hr/attendance',
    leaves: '/hr/leaves',
    reports: '/hr/reports'
  },
  kitchen: {
    inventory: '/kitchen/inventory',
    purchases: '/kitchen/purchases',
    consumption: '/kitchen/consumption',
    budgets: '/kitchen/budgets',
    menu: '/kitchen/menu',
    suppliers: '/kitchen/suppliers',
    waste: '/kitchen/waste',
    reports: '/kitchen/reports'
  },
  complaints: {
    list: '/staff/complaints',
    stats: '/staff/complaints/stats',
    actions: '/staff/complaint-actions',
    feedback: '/staff/complaint-feedbacks'
  },
  library: {
    books: '/staff/library/books',
    categories: '/staff/library/categories',
    borrowed: '/staff/library/borrowed',
    purchases: '/staff/library/purchases',
    sales: '/staff/library/sales',
    stats: '/staff/library/stats'
  },
  registrar: {
    admissions: '/student/admissions',
    students: '/student/all',
    guardians: '/student/guardians',
    educationHistory: '/student/education-history',
    documents: '/student/documents',
    reports: '/student/reports'
  },
  hostel: {
    rooms: '/hostel/rooms',
    allocations: '/hostel/allocations',
    meals: '/hostel/meals'
  }
};

const appendParams = (endpoint, params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  if (!query.toString()) return endpoint;
  return `${endpoint}${endpoint.includes('?') ? '&' : '?'}${query.toString()}`;
};

export const staffApiClient = {
  async list(endpoint, params = {}) {
    const res = await apiFetch(appendParams(endpoint, params));
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error(data.message || `Failed to load ${endpoint}`);
    return Array.isArray(data.data) ? data.data : [];
  },
  async get(endpoint, id) {
    const res = await apiFetch(`${endpoint}/${id}`);
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error(data.message || `Failed to load ${endpoint}/${id}`);
    return data.data || data;
  },
  async create(endpoint, payload) {
    const res = await api.post(endpoint, payload);
    return res.data;
  },
  async update(endpoint, id, payload) {
    const res = await api.put(`${endpoint}/${id}`, payload);
    return res.data;
  },
  async remove(endpoint, id) {
    const res = await api.delete(`${endpoint}/${id}`);
    return res.data;
  }
};

export default staffApi;
