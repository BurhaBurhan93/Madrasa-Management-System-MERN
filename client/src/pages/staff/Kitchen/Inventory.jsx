import React, { useEffect, useMemo, useState } from 'react';
import ListPage from '../shared/ListPage';
import Card from '../../../components/UIHelper/Card';
import StaffPageLayout from '../shared/StaffPageLayout';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { BarChartComponent, PieChartComponent } from '../../../components/UIHelper/ECharts';
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';
import { formatCurrency, groupCountBy, groupSumBy } from '../shared/staffInsights';
import { FiAlertTriangle, FiArchive, FiPackage, FiRefreshCcw, FiTrendingUp } from 'react-icons/fi';
import { staffApi } from '../../../api/staffApi';

const unitOptions = ['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag', 'bottle'].map((unit) => ({ value: unit, label: unit }));

export const inventoryConfig = {
  title: 'Kitchen Inventory',
  subtitle: 'Track stock levels with the same refined list and form design used across staff modules.',
  endpoint: staffApi.kitchen.inventory,
  columns: [
    { key: 'itemName', header: 'Item Name' },
    { key: 'category', header: 'Category' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unit', header: 'Unit' },
    { key: 'minimumStock', header: 'Minimum Stock' },
    { key: 'status', header: 'Status' }
  ],
  formFields: [
    { name: 'itemName', label: 'Item Name' },
    { name: 'category', label: 'Category' },
    { name: 'quantity', label: 'Quantity', type: 'number' },
    { name: 'unit', label: 'Unit', type: 'select', options: unitOptions },
    { name: 'minimumStock', label: 'Minimum Stock', type: 'number' },
    { name: 'unitPrice', label: 'Unit Price', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'available', label: 'Available' },
      { value: 'low', label: 'Low Stock' },
      { value: 'out', label: 'Out Of Stock' }
    ] },
    { name: 'remarks', label: 'Remarks', type: 'textarea', rows: 4 }
  ],
  initialForm: { itemName: '', category: '', quantity: 0, unit: 'kg', minimumStock: 0, unitPrice: 0, status: 'available', remarks: '' },
  mapFormToPayload: (form) => ({ ...form, quantity: Number(form.quantity || 0), minimumStock: Number(form.minimumStock || 0), unitPrice: Number(form.unitPrice || 0) }),
  mapRowToForm: (row) => ({ itemName: row.itemName || '', category: row.category || '', quantity: row.quantity ?? 0, unit: row.unit || 'kg', minimumStock: row.minimumStock ?? 0, unitPrice: row.unitPrice ?? 0, status: row.status || 'available', remarks: row.remarks || '' })
};

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(staffApi.kitchen.inventory);
        const data = await parseJsonSafe(res);
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load inventory');
        setItems(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error('Failed to load kitchen inventory insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  const insights = useMemo(() => {
    const lowStock = items.filter((item) => item.status === 'low').length;
    const outOfStock = items.filter((item) => item.status === 'out').length;
    const totalValue = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
      0
    );
    const reorderCount = items.filter(
      (item) => Number(item.quantity || 0) <= Number(item.minimumStock || 0)
    ).length;

    return {
      lowStock,
      outOfStock,
      totalValue,
      reorderCount,
      byCategory: groupCountBy(items, (item) => item.category || 'Uncategorized'),
      byStatus: groupCountBy(items, (item) => item.status || 'unknown'),
      byQuantity: groupSumBy(items, (item) => item.itemName || 'Unnamed', (item) => item.quantity).sort((a, b) => b.value - a.value).slice(0, 8)
    };
  }, [items]);

  if (loading) {
    return (
      <StaffPageLayout eyebrow="Kitchen" title="Kitchen Inventory" subtitle="Stock health, inventory value, and reorder visibility for daily kitchen operations.">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  const headerContent = (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Items In Stock', value: items.length, icon: FiPackage, tone: 'from-sky-50 to-cyan-50', chip: 'bg-sky-100 text-sky-700' },
          { label: 'Low Stock Alerts', value: insights.lowStock, icon: FiAlertTriangle, tone: 'from-amber-50 to-yellow-50', chip: 'bg-amber-100 text-amber-700' },
          { label: 'Out Of Stock', value: insights.outOfStock, icon: FiArchive, tone: 'from-rose-50 to-red-50', chip: 'bg-rose-100 text-rose-700' },
          { label: 'Inventory Value', value: formatCurrency(insights.totalValue), icon: FiTrendingUp, tone: 'from-emerald-50 to-teal-50', chip: 'bg-emerald-100 text-emerald-700' },
          { label: 'Items To Reorder', value: insights.reorderCount, icon: FiRefreshCcw, tone: 'from-violet-50 to-fuchsia-50', chip: 'bg-violet-100 text-violet-700' }
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
        <PieChartComponent title="Items By Category" data={insights.byCategory} height={320} donut />
        <PieChartComponent title="Stock Status" data={insights.byStatus} height={320} />
        <BarChartComponent title="Top Items By Quantity" data={insights.byQuantity} dataKey="value" nameKey="name" height={320} horizontal />
      </div>
    </>
  );

  return (
    <ListPage
      title={inventoryConfig.title}
      subtitle={inventoryConfig.subtitle}
      endpoint={inventoryConfig.endpoint}
      columns={inventoryConfig.columns}
      createPath="/staff/kitchen/inventory/create"
      editPathForRow={(row) => `/staff/kitchen/inventory/edit/${row._id}`}
      viewPathForRow={(row) => `/staff/kitchen/inventory/view/${row._id}`}
      searchPlaceholder="Search kitchen inventory..."
      clientSidePagination={true}
      eyebrow="Kitchen"
      headerContent={headerContent}
      enableExport={true}
    />
  );
};

export default Inventory;
