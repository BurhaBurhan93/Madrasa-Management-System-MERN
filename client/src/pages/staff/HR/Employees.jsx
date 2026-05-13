import React, { useEffect, useMemo, useState } from 'react';
import ListPage from '../shared/ListPage';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { BarChartComponent, PieChartComponent } from '../../../components/UIHelper/ECharts';
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';
import { formatCurrency, getLastMonths, groupCountBy } from '../shared/staffInsights';
import { FiBriefcase, FiCheckCircle, FiClock, FiUsers, FiXCircle } from 'react-icons/fi';
import { staffApi } from '../../../api/staffApi';

export const employeesConfig = {
  title: 'Employees',
  subtitle: 'Manage employee records with the same polished table and form experience.',
  endpoint: staffApi.hr.employees,
  columns: [
    { key: 'employeeCode', header: 'Code' },
    { key: 'fullName', header: 'Full Name' },
    { key: 'department', header: 'Department', render: (value) => value?.departmentName || '-' },
    { key: 'designation', header: 'Designation', render: (value) => value?.designationTitle || '-' },
    { key: 'phoneNumber', header: 'Phone Number' },
    { key: 'employeeType', header: 'Employee Type' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'user', label: 'User Account', type: 'relation', relationEndpoint: '/users', relationLabel: (row) => `${row.name || row.fullName} (${row.email || 'No Email'})` },
    { name: 'fullName', label: 'Full Name' },
    { name: 'fullNameArabic', label: 'Full Name Arabic' },
    { name: 'fatherName', label: 'Father Name' },
    { name: 'dateOfBirth', label: 'Date Of Birth', type: 'date' },
    { name: 'gender', label: 'Gender', type: 'select', options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' }
    ] },
    { name: 'cnic', label: 'CNIC' },
    { name: 'phoneNumber', label: 'Phone Number' },
    { name: 'email', label: 'Email' },
    { name: 'currentAddress', label: 'Current Address' },
    { name: 'emergencyContactName', label: 'Emergency Contact Name' },
    { name: 'emergencyContactPhone', label: 'Emergency Contact Phone' },
    { name: 'employeeType', label: 'Employee Type', type: 'select', options: [
      { value: 'teacher', label: 'Teacher' },
      { value: 'admin', label: 'Admin' },
      { value: 'support', label: 'Support' },
      { value: 'kitchen', label: 'Kitchen' },
      { value: 'security', label: 'Security' }
    ] },
    { name: 'department', label: 'Department', type: 'relation', relationEndpoint: '/hr/departments', relationLabel: (row) => `${row.departmentName} (${row.departmentCode})` },
    { name: 'designation', label: 'Designation', type: 'relation', relationEndpoint: '/hr/designations', relationLabel: (row) => row.designationTitle },
    { name: 'joiningDate', label: 'Joining Date', type: 'date' },
    { name: 'employmentType', label: 'Employment Type', type: 'select', options: [
      { value: 'permanent', label: 'Permanent' },
      { value: 'contract', label: 'Contract' },
      { value: 'part-time', label: 'Part Time' }
    ] },
    { name: 'baseSalary', label: 'Base Salary', type: 'number' },
    { name: 'houseAllowance', label: 'House Allowance', type: 'number' },
    { name: 'transportAllowance', label: 'Transport Allowance', type: 'number' },
    { name: 'medicalAllowance', label: 'Medical Allowance', type: 'number' },
    { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: [
      { value: 'cash', label: 'Cash' },
      { value: 'bank', label: 'Bank Transfer' }
    ] },
    { name: 'bankName', label: 'Bank Name' },
    { name: 'accountNumber', label: 'Account Number' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ] }
  ],
  initialForm: {
    user: '',
    fullName: '',
    fullNameArabic: '',
    fatherName: '',
    dateOfBirth: '',
    gender: 'male',
    cnic: '',
    phoneNumber: '',
    email: '',
    currentAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    employeeType: 'support',
    department: '',
    designation: '',
    joiningDate: '',
    employmentType: 'permanent',
    baseSalary: 0,
    houseAllowance: 0,
    transportAllowance: 0,
    medicalAllowance: 0,
    paymentMethod: 'cash',
    bankName: '',
    accountNumber: '',
    status: 'active'
  },
  mapFormToPayload: (form) => ({
    ...form,
    baseSalary: Number(form.baseSalary || 0),
    houseAllowance: Number(form.houseAllowance || 0),
    transportAllowance: Number(form.transportAllowance || 0),
    medicalAllowance: Number(form.medicalAllowance || 0)
  }),
  mapRowToForm: (row) => ({
    user: row.user?._id || row.user || '',
    fullName: row.fullName || '',
    fullNameArabic: row.fullNameArabic || '',
    fatherName: row.fatherName || '',
    dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth).toISOString().slice(0, 10) : '',
    gender: row.gender || 'male',
    cnic: row.cnic || '',
    phoneNumber: row.phoneNumber || '',
    email: row.email || '',
    currentAddress: row.currentAddress || '',
    emergencyContactName: row.emergencyContactName || '',
    emergencyContactPhone: row.emergencyContactPhone || '',
    employeeType: row.employeeType || 'support',
    department: row.department?._id || row.department || '',
    designation: row.designation?._id || row.designation || '',
    joiningDate: row.joiningDate ? new Date(row.joiningDate).toISOString().slice(0, 10) : '',
    employmentType: row.employmentType || 'permanent',
    baseSalary: row.baseSalary ?? 0,
    houseAllowance: row.houseAllowance ?? 0,
    transportAllowance: row.transportAllowance ?? 0,
    medicalAllowance: row.medicalAllowance ?? 0,
    paymentMethod: row.paymentMethod || 'cash',
    bankName: row.bankName || '',
    accountNumber: row.accountNumber || '',
    status: row.status || 'active'
  })
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(staffApi.hr.employees);
        const data = await parseJsonSafe(res);
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load employees');
        setEmployees(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Failed to load employee insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const insights = useMemo(() => {
    const activeEmployees = employees.filter((employee) => employee.status === 'active').length;
    const inactiveEmployees = employees.filter((employee) => employee.status === 'inactive').length;
    const averageSalary = employees.length
      ? employees.reduce((sum, employee) => sum + Number(employee.baseSalary || 0), 0) / employees.length
      : 0;
    const recentHires = employees.filter((employee) => {
      const joiningDate = new Date(employee.joiningDate);
      if (Number.isNaN(joiningDate.getTime())) return false;
      const daysSinceJoining = (Date.now() - joiningDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceJoining <= 30;
    }).length;

    const byType = groupCountBy(employees, (employee) => employee.employeeType || 'unknown');
    const byGender = groupCountBy(employees, (employee) => employee.gender || 'unknown');
    const byDepartment = groupCountBy(
      employees,
      (employee) => employee.department?.departmentName || 'Unassigned'
    );
    const monthlyHires = getLastMonths(employees, (employee) => employee.joiningDate);

    return {
      activeEmployees,
      inactiveEmployees,
      averageSalary,
      recentHires,
      byType,
      byGender,
      byDepartment,
      monthlyHires
    };
  }, [employees]);

  if (loading) {
    return (
      <StaffPageLayout eyebrow="HR" title="Employees" subtitle="A richer overview of staffing, departments, and onboarding trends.">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  const headerContent = (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Total Employees', value: employees.length, icon: FiUsers, tone: 'from-sky-50 to-cyan-50', chip: 'bg-sky-100 text-sky-700' },
          { label: 'Active Employees', value: insights.activeEmployees, icon: FiCheckCircle, tone: 'from-emerald-50 to-teal-50', chip: 'bg-emerald-100 text-emerald-700' },
          { label: 'Inactive Employees', value: insights.inactiveEmployees, icon: FiXCircle, tone: 'from-rose-50 to-red-50', chip: 'bg-rose-100 text-rose-700' },
          { label: 'Average Salary', value: formatCurrency(insights.averageSalary), icon: FiBriefcase, tone: 'from-violet-50 to-fuchsia-50', chip: 'bg-violet-100 text-violet-700' },
          { label: 'Recent Hires', value: insights.recentHires, icon: FiClock, tone: 'from-amber-50 to-yellow-50', chip: 'bg-amber-100 text-amber-700' }
        ].map((item) => (
          <Card key={item.label} className={`rounded-[26px] border border-slate-200 bg-gradient-to-br ${item.tone} p-5 shadow-none`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.chip}`}>
                <item.icon size={22} />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <PieChartComponent title="Employees By Type" data={insights.byType} height={320} donut />
        <PieChartComponent title="Gender Distribution" data={insights.byGender} height={320} />
        <BarChartComponent title="Employees By Department" data={insights.byDepartment} dataKey="value" nameKey="name" height={320} horizontal />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
        <BarChartComponent title="Hiring Trend" data={insights.monthlyHires} dataKey="value" nameKey="name" height={300} />
        <Card className="rounded-[26px] border border-slate-200 p-6 shadow-none">
          <h3 className="text-lg font-semibold text-slate-900">Staffing Signals</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Top Department</p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {[...insights.byDepartment].sort((a, b) => b.value - a.value)[0]?.name || 'No department data'}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Coverage Mix</p>
              <p className="mt-2 text-sm text-slate-600">
                {insights.byType.length
                  ? insights.byType.map((entry) => `${entry.name}: ${entry.value}`).join(' | ')
                  : 'No employee types available'}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Directory Readiness</p>
              <p className="mt-2 text-sm text-slate-600">
                {employees.filter((employee) => !employee.email || !employee.phoneNumber).length} employee records still need complete contact details.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );

  return (
    <ListPage
      title={employeesConfig.title}
      subtitle={employeesConfig.subtitle}
      endpoint={employeesConfig.endpoint}
      columns={employeesConfig.columns}
      createPath="/staff/hr/employee-registration"
      editPathForRow={(row) => `/staff/hr/employees/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/hr/employees/view/${row._id}`}
      searchPlaceholder="Search employees..."
      clientSidePagination={true}
      eyebrow="HR"
      headerContent={headerContent}
      enableExport={true}
    />
  );
};

export default Employees;
