import React, { useEffect, useState } from 'react';
import { FiBarChart2, FiCheckSquare, FiLayers, FiPercent, FiTag } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ListPage from '../shared/ListPage';
import StaffAnalyticsContent, { fetchCollectionData, formatCurrency, groupCountByKey } from '../shared/StaffAnalyticsContent';
import { staffApi } from '../../../api/staffApi';

export const feeStructuresConfig = {
  title: 'finance.feeStructures.title',
  subtitle: 'finance.feeStructures.subtitle',
  endpoint: staffApi.finance.feeStructures,
  columns: [
    { key: 'feeCode', header: 'finance.feeStructures.column.feeCode' },
    { key: 'feeName', header: 'finance.feeStructures.column.feeName' },
    { key: 'feeType', header: 'finance.feeStructures.column.feeType' },
    { key: 'amount', header: 'finance.feeStructures.column.amount' },
    { key: 'frequency', header: 'finance.feeStructures.column.frequency' },
    { key: 'isMandatory', header: 'finance.feeStructures.column.isMandatory' },
    { key: 'status', header: 'finance.feeStructures.column.status' }
  ],
  formFields: [
    { name: 'feeCode', label: 'finance.feeStructures.formField.feeCode' },
    { name: 'feeName', label: 'finance.feeStructures.formField.feeName' },
    { name: 'class', label: 'finance.feeStructures.formField.class', type: 'relation', relationEndpoint: '/academic/classes', relationLabel: (r) => `${r.name} - ${r.section || ''}` },
    { name: 'feeType', label: 'finance.feeStructures.formField.feeType', type: 'select', options: [{ value: 'tuition', label: 'finance.feeStructures.formField.feeType.tuition' }, { value: 'admission', label: 'finance.feeStructures.formField.feeType.admission' }, { value: 'other', label: 'finance.feeStructures.formField.feeType.other' }] },
    { name: 'amount', label: 'finance.feeStructures.formField.amount', type: 'number' },
    { name: 'frequency', label: 'finance.feeStructures.formField.frequency', type: 'select', options: [{ value: 'one-time', label: 'finance.feeStructures.formField.frequency.one-time' }, { value: 'monthly', label: 'finance.feeStructures.formField.frequency.monthly' }, { value: 'yearly', label: 'finance.feeStructures.formField.frequency.yearly' }] },
    { name: 'applicableFrom', label: 'finance.feeStructures.formField.applicableFrom', type: 'date' },
    { name: 'applicableTo', label: 'finance.feeStructures.formField.applicableTo', type: 'date' },
    { name: 'isMandatory', label: 'finance.feeStructures.formField.isMandatory', type: 'select', options: [{ value: true, label: 'finance.feeStructures.formField.isMandatory.yes' }, { value: false, label: 'finance.feeStructures.formField.isMandatory.no' }] },
    { name: 'status', label: 'finance.feeStructures.formField.status', type: 'select', options: [{ value: 'active', label: 'finance.feeStructures.formField.status.active' }, { value: 'inactive', label: 'finance.feeStructures.formField.status.inactive' }] }
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
  const { t } = useTranslation(['staff', 'common']);
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
            { label: t('finance.feeStructures.statTotalStructures'), value: structures.length, helper: t('finance.feeStructures.statTotalStructuresHelper'), tone: 'blue', icon: FiLayers },
            { label: t('finance.feeStructures.statActiveStructures'), value: activeCount, helper: t('finance.feeStructures.statActiveStructuresHelper'), tone: 'emerald', icon: FiCheckSquare },
            { label: t('finance.feeStructures.statAverageFee'), value: formatCurrency(averageAmount), helper: t('finance.feeStructures.statAverageFeeHelper'), tone: 'violet', icon: FiPercent },
            { label: t('finance.feeStructures.statMandatoryFees'), value: mandatoryCount, helper: t('finance.feeStructures.statMandatoryFeesHelper'), tone: 'amber', icon: FiTag },
            { label: t('finance.feeStructures.statFeeTypes'), value: groupCountByKey(structures, 'feeType').length, helper: t('finance.feeStructures.statFeeTypesHelper'), tone: 'rose', icon: FiBarChart2 }
          ],
          charts: [
            { title: t('finance.feeStructures.chart.feeTypeDistribution'), type: 'pie', data: groupCountByKey(structures, 'feeType') },
            { title: t('finance.feeStructures.chart.frequencyBreakdown'), type: 'bar', data: groupCountByKey(structures, 'frequency') }
          ],
          insight: {
            eyebrow: t('finance.feeStructures.insight.eyebrow'),
            title: t('finance.feeStructures.insight.title'),
            description: t('finance.feeStructures.insight.description')
          }
        });
      } catch (error) {
        if (!active) return;
        setAnalytics({ loading: false, stats: [], charts: [], insight: { title: t('finance.feeStructures.errorTitle'), description: error.message || t('finance.feeStructures.errorDescription') } });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <ListPage
      eyebrow={t('finance.eyebrow')}
      title={feeStructuresConfig.title}
      subtitle={feeStructuresConfig.subtitle}
      endpoint={feeStructuresConfig.endpoint}
      columns={feeStructuresConfig.columns}
      createPath="/staff/finance/fee-structures/create"
      editPathForRow={(row) => `/staff/finance/fee-structures/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/finance/fee-structures/view/${row._id}`}
      searchPlaceholder={t('finance.feeStructures.searchPlaceholder')}
      enableExport={true}
      headerContent={!analytics.loading ? <StaffAnalyticsContent stats={analytics.stats} charts={analytics.charts} insight={analytics.insight} /> : null}
    />
  );
};

export default FeeStructures;
