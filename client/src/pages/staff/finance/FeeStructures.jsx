import React, { useEffect, useState } from 'react';
import { FiBarChart2, FiCheckSquare, FiLayers, FiPercent, FiTag } from 'react-icons/fi';
import ListPage from '../shared/ListPage';
import StaffAnalyticsContent, { fetchCollectionData, formatCurrency, groupCountByKey } from '../shared/StaffAnalyticsContent';
import { staffApi } from '../../../api/staffApi';

export const feeStructuresConfig = {
  title: 'Fee Structure',
  subtitle: 'Manage fee categories, frequencies, and active pricing structure.',
  endpoint: staffApi.finance.feeStructures,
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
    { name: 'feeType', label: 'Fee Type', type: 'select', options: [{ value: 'tuition', label: 'Tuition' }, { value: 'admission', label: 'Admission' }, { value: 'other', label: 'Other' }] },
    { name: 'amount', label: 'Amount', type: 'number' },
    { name: 'frequency', label: 'Frequency', type: 'select', options: [{ value: 'one-time', label: 'One-Time' }, { value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }] },
    { name: 'applicableFrom', label: 'Applicable From', type: 'date' },
    { name: 'applicableTo', label: 'Applicable To', type: 'date' },
    { name: 'isMandatory', label: 'Mandatory', type: 'select', options: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }] },
    { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] }
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
  mapFormToPayload: (form) => ({ ...form, amount: Number(form.amount), isMandatory: String(form.isMandatory) === 'true' || form.isMandatory === true })
};

const FeeStructures = () => {
  const [analytics, setAnalytics] = useState({ loading: true, stats: [], charts: [], insight: null });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const structures = await fetchCollectionData(staffApi.finance.feeStructures);
        if (!active) return;

        const activeCount = structures.filter((item) => item.status === 'active').length;
        const totalAmount = structures.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const averageAmount = structures.length ? totalAmount / structures.length : 0;
        const mandatoryCount = structures.filter((item) => item.isMandatory).length;

        setAnalytics({
          loading: false,
          stats: [
            { label: 'Total Structures', value: structures.length, helper: 'All defined fee rows', tone: 'blue', icon: FiLayers },
            { label: 'Active Structures', value: activeCount, helper: 'Currently assignable fee rules', tone: 'emerald', icon: FiCheckSquare },
            { label: 'Average Fee', value: formatCurrency(averageAmount), helper: 'Mean amount across structures', tone: 'violet', icon: FiPercent },
            { label: 'Mandatory Fees', value: mandatoryCount, helper: 'Core fees required for students', tone: 'amber', icon: FiTag },
            { label: 'Fee Types', value: groupCountByKey(structures, 'feeType').length, helper: 'Distinct fee categories in use', tone: 'rose', icon: FiBarChart2 }
          ],
          charts: [
            { title: 'Fee Type Distribution', type: 'pie', data: groupCountByKey(structures, 'feeType') },
            { title: 'Frequency Breakdown', type: 'bar', data: groupCountByKey(structures, 'frequency') }
          ],
          insight: {
            eyebrow: 'Structure Matrix',
            title: 'Fee design details now surface before table browsing',
            description: 'Staff can quickly see how many structures are active, how much they average, and how fee types are distributed without opening each record.'
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({ loading: false, stats: [], charts: [], insight: { title: 'Fee structure analytics could not be loaded', description: error.message || 'The structure table is still available below.' } });
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
      title={feeStructuresConfig.title}
      subtitle={feeStructuresConfig.subtitle}
      endpoint={feeStructuresConfig.endpoint}
      columns={feeStructuresConfig.columns}
      createPath="/staff/finance/fee-structures/create"
      editPathForRow={(row) => `/staff/finance/fee-structures/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/fee-structures/view/${row._id}`}
      searchPlaceholder="Search fee structures..."
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default FeeStructures;
