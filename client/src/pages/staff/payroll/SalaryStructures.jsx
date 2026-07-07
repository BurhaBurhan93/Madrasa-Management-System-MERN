import React, { useEffect, useMemo, useState } from 'react';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import StaffPageLayout from '../shared/StaffPageLayout';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { BarChartComponent, PieChartComponent } from '../../../components/UIHelper/ECharts';
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';
import { formatCurrency, groupCountBy, groupSumBy } from '../shared/staffInsights';
import { FiActivity, FiCheckCircle, FiDollarSign, FiLayers, FiTrendingUp } from 'react-icons/fi';
import { staffApi } from '../../../api/staffApi';

export const salaryStructuresConfig = {
  title: 'Salary Structures',
  subtitle: 'Define salary structures by employee type',
  endpoint: staffApi.payroll.salaryStructures,
  columns: [
    { key: 'employeeType', header: 'Employee Type' },
    { key: 'basicSalary', header: 'Basic Salary' },
    { key: 'allowanceAmount', header: 'Allowance' },
    { key: 'overtimeRate', header: 'Overtime Rate' },
    { key: 'taxPercentage', header: 'Tax %' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'employeeType', label: 'Employee Type', type: 'relation', relationEndpoint: '/payroll/employee-types', relationValue: (r) => r.value, relationLabel: (r) => r.label },
    { name: 'basicSalary', label: 'Basic Salary', type: 'number' },
    { name: 'allowanceAmount', label: 'Allowance Amount', type: 'number' },
    { name: 'housingAllowance', label: 'Housing Allowance', type: 'number' },
    { name: 'foodAllowance', label: 'Food Allowance', type: 'number' },
    { name: 'transportAllowance', label: 'Transport Allowance', type: 'number' },
    { name: 'overtimeRate', label: 'Overtime Rate', type: 'number' },
    { name: 'deductionType', label: 'Deduction Type' },
    { name: 'taxPercentage', label: 'Tax Percentage', type: 'number' },
    { name: 'effectiveFrom', label: 'Effective From', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ],
  initialForm: {
    employeeType: 'teacher',
    basicSalary: 0,
    allowanceAmount: 0,
    housingAllowance: 0,
    foodAllowance: 0,
    transportAllowance: 0,
    overtimeRate: 0,
    deductionType: '',
    taxPercentage: 0,
    effectiveFrom: '',
    status: 'active'
  },
  mapFormToPayload: (form) => ({
    ...form,
    basicSalary: Number(form.basicSalary),
    allowanceAmount: Number(form.allowanceAmount),
    housingAllowance: Number(form.housingAllowance),
    foodAllowance: Number(form.foodAllowance),
    transportAllowance: Number(form.transportAllowance),
    overtimeRate: Number(form.overtimeRate),
    taxPercentage: Number(form.taxPercentage)
  })
};

const SalaryStructures = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStructures = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`${staffApi.payroll.salaryStructures}?limit=200`);
        const data = await parseJsonSafe(res);
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load salary structures');
        setStructures(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Failed to load salary structure insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStructures();
  }, []);

  const insights = useMemo(() => {
    const activeStructures = structures.filter((structure) => structure.status === 'active').length;
    const basicSalaries = structures.map((structure) => Number(structure.basicSalary || 0));
    const averageBasicSalary = basicSalaries.length
      ? basicSalaries.reduce((sum, amount) => sum + amount, 0) / basicSalaries.length
      : 0;
    const salaryRange = basicSalaries.length
      ? `${formatCurrency(Math.min(...basicSalaries))} - ${formatCurrency(Math.max(...basicSalaries))}`
      : formatCurrency(0);

    return {
      activeStructures,
      averageBasicSalary,
      salaryRange,
      typeCoverage: new Set(structures.map((structure) => structure.employeeType)).size,
      byEmployeeType: groupSumBy(structures, (structure) => structure.employeeType || 'unknown', (structure) => structure.basicSalary),
      byStatus: groupCountBy(structures, (structure) => structure.status || 'unknown'),
      allowanceMix: [
        { name: 'Standard', value: structures.reduce((sum, structure) => sum + Number(structure.allowanceAmount || 0), 0) },
        { name: 'Housing', value: structures.reduce((sum, structure) => sum + Number(structure.housingAllowance || 0), 0) },
        { name: 'Food', value: structures.reduce((sum, structure) => sum + Number(structure.foodAllowance || 0), 0) },
        { name: 'Transport', value: structures.reduce((sum, structure) => sum + Number(structure.transportAllowance || 0), 0) }
      ].filter((entry) => entry.value > 0)
    };
  }, [structures]);

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Payroll" title="Salary Structures" subtitle="Compare structure coverage, salary bands, and allowance composition across employee types.">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  const headerContent = (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Total Structures', value: structures.length, icon: FiLayers, tone: 'from-sky-50 to-cyan-50', chip: 'bg-sky-100 text-sky-700' },
          { label: 'Active Structures', value: insights.activeStructures, icon: FiCheckCircle, tone: 'from-emerald-50 to-teal-50', chip: 'bg-emerald-100 text-emerald-700' },
          { label: 'Average Basic Salary', value: formatCurrency(insights.averageBasicSalary), icon: FiDollarSign, tone: 'from-violet-50 to-fuchsia-50', chip: 'bg-violet-100 text-violet-700' },
          { label: 'Salary Range', value: insights.salaryRange, icon: FiTrendingUp, tone: 'from-amber-50 to-yellow-50', chip: 'bg-amber-100 text-amber-700' },
          { label: 'Employee Types Covered', value: insights.typeCoverage, icon: FiActivity, tone: 'from-rose-50 to-red-50', chip: 'bg-rose-100 text-rose-700' }
        ].map((item) => (
          <Card key={item.label} className={`rounded-[26px] border border-slate-200 bg-gradient-to-br ${item.tone} p-5 shadow-none dark:border-slate-700 dark:bg-none dark:bg-slate-800/50`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{item.label}</p>
                <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
              </div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.chip} dark:bg-slate-700 dark:text-slate-200`}>
                <item.icon size={22} />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <BarChartComponent title="Salary By Employee Type" data={insights.byEmployeeType} dataKey="value" nameKey="name" height={320} />
        <PieChartComponent title="Structure Status" data={insights.byStatus} height={320} />
        <PieChartComponent title="Allowance Distribution" data={insights.allowanceMix} height={320} donut />
      </div>
    </>
  );

  return (
    <ListPage
      title={salaryStructuresConfig.title}
      subtitle={salaryStructuresConfig.subtitle}
      endpoint={salaryStructuresConfig.endpoint}
      columns={salaryStructuresConfig.columns}
      createPath="/staff/payroll/salary-structures/create"
      editPathForRow={(row) => `/staff/payroll/salary-structures/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/payroll/salary-structures/view/${row._id}`}
      searchPlaceholder="Search salary structures..."
      eyebrow="Payroll"
      headerContent={headerContent}
      enableExport={true}
    />
  );
};

export default SalaryStructures;

