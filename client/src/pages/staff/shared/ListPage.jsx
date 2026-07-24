import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Card from "../../../components/UIHelper/Card";
import Button from "../../../components/UIHelper/Button";
import Badge from "../../../components/UIHelper/Badge";
import DataTable from "../../../components/UIHelper/DataTable";
import StaffPageLayout from "./StaffPageLayout";
import RecordActionButtons from "./RecordActionButtons";
import StaffPagination from "./StaffPagination";
import { apiFetch, parseJsonSafe } from "../../../lib/apiFetch";
import { FiDownload, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext.jsx";
import { getStaffToneStyles } from "./staffTheme";
import { useTranslation } from 'react-i18next';

const getCellValue = (row, key) => {
  const value = row?.[key];
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    return (
      value.name ||
      value.title ||
      value.fullName ||
      value.accountName ||
      value.employeeCode ||
      value.departmentName ||
      value.designationTitle ||
      value.subject ||
      value.complaintCode ||
      value.student?.name ||
      value.receiptNo ||
      value.code ||
      JSON.stringify(value)
    );
  }
  return String(value);
};

const getRowValue = (row, key, column) => {
  if (column?.render) {
    try {
      const rendered = column.render(row[key], row);
      if (typeof rendered === "string") return rendered;
      if (typeof rendered === "number" || typeof rendered === "boolean")
        return String(rendered);
    } catch {}
  }
  return getCellValue(row, key);
};

const formatStatusLabel = (value) =>
  String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusVariant = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (
    [
      "paid",
      "approved",
      "verified",
      "active",
      "completed",
      "success",
      "resolved",
      "available",
      "in stock",
      "present",
      "open",
    ].includes(normalized)
  )
    return "success";
  if (
    [
      "pending",
      "processing",
      "awaiting",
      "scheduled",
      "draft",
      "partial",
      "low",
      "borrowed",
      "in progress",
      "in-progress",
    ].includes(normalized)
  )
    return "warning";
  if (
    [
      "failed",
      "rejected",
      "cancelled",
      "canceled",
      "overdue",
      "inactive",
      "closed",
      "unpaid",
      "absent",
      "out of stock",
      "out",
    ].includes(normalized)
  )
    return "danger";
  if (["refunded", "returned", "on leave", "archived"].includes(normalized))
    return "secondary";
  return "info";
};

const renderStatusBadge = (value, t) => (
  <Badge
    variant={getStatusVariant(value)}
    className="px-3 py-1 text-[11px] font-semibold tracking-[0.04em]"
  >
    {t(`status.${String(value || "").trim().toLowerCase().replace(/[\s-_]+/g, '_')}`, { defaultValue: formatStatusLabel(value) })}
  </Badge>
);

const ListPage = ({
  title,
  subtitle,
  endpoint,
  columns,
  createPath,
  editPathForRow,
  viewPathForRow,
  deleteEnabled = true,
              searchPlaceholder,
  clientSidePagination = false,
  extraActionItemsForRow,
  eyebrow = "Reusable Staff Table",
  headerContent = null,
  extraActions = null,
  enableExport = false,
  embedded = false,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [filterColumn, setFilterColumn] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [sortKey, setSortKey] = useState(columns[0]?.key || "");
  const [sortDirection, setSortDirection] = useState("desc");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { t } = useTranslation(['staff', 'common']);
  const toneStyles = getStaffToneStyles(eyebrow || title || endpoint);

  const cardShellClass = isDark
    ? "border-slate-700 bg-slate-900/80"
    : "border-slate-200 bg-transparent";
  const panelShellClass = isDark
    ? "border-slate-700 bg-slate-950/70"
    : "border-slate-200 bg-transparent";
  const controlClass = isDark
    ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-500/20"
    : "border-slate-200 bg-transparent text-slate-700 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-100";

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (!clientSidePagination) {
        params.set("page", String(page));
        params.set("limit", String(limit));
      }
      if (query.trim()) params.set("search", query.trim());

      const res = await apiFetch(`${endpoint}?${params.toString()}`);
      const data = await parseJsonSafe(res);
      if (!res.ok)
        throw new Error(
          data.message || `Request failed (status ${res.status})`,
        );
      const records = data.data || data || [];
      setItems(Array.isArray(records) ? records : []);
      setTotal(
        data.total ||
          data.count ||
          (Array.isArray(records) ? records.length : 0),
      );
    } catch (err) {
      setError(err.message || t('list.unknownError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, limit, query, clientSidePagination]);

  const handleDelete = async (row) => {
    const ok = window.confirm(
      t('list.confirmDelete'),
    );
    if (!ok) return;

    setDeletingId(row?._id);
    try {
      const res = await apiFetch(`${endpoint}/${row._id}`, {
        method: "DELETE",
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.message || t('list.deleteFailed'));
      await fetchItems();
    } catch (err) {
      setError(err.message || t('list.deleteError'));
    } finally {
      setDeletingId(null);
    }
  };

  const filterableColumns = useMemo(
    () =>
      columns.filter(
        (column) => column.key && !String(column.key).startsWith("__"),
      ).map((column) => ({
        ...column,
        header: column.header ? t(column.header, { defaultValue: column.header }) : column.header,
      })),
    [columns, t],
  );

  const filteredSortedItems = useMemo(() => {
    let nextItems = [...items];
    const searchTerm = filterValue.trim().toLowerCase();
    const queryTerm = query.trim().toLowerCase();

    const matchesFilter = (row, term) => {
      if (filterColumn === "all")
        return filterableColumns.some((col) =>
          getRowValue(row, col.key, col).toLowerCase().includes(term),
        );
      const col = filterableColumns.find((c) => c.key === filterColumn);
      return getRowValue(row, filterColumn, col).toLowerCase().includes(term);
    };

    if (searchTerm) {
      nextItems = nextItems.filter((row) => matchesFilter(row, searchTerm));
    }
    if (queryTerm && queryTerm !== searchTerm) {
      nextItems = nextItems.filter((row) =>
        filterableColumns.some((col) =>
          getRowValue(row, col.key, col).toLowerCase().includes(queryTerm),
        ),
      );
    }
    if (sortKey) {
      const sortCol = filterableColumns.find((c) => c.key === sortKey);
      nextItems.sort((a, b) => {
        const aValue = getRowValue(a, sortKey, sortCol).toLowerCase();
        const bValue = getRowValue(b, sortKey, sortCol).toLowerCase();
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return nextItems;
  }, [
    items,
    filterColumn,
    filterValue,
    query,
    filterableColumns,
    sortDirection,
    sortKey,
  ]);

  const visibleItems = useMemo(() => {
    if (!clientSidePagination) return filteredSortedItems;
    const start = (page - 1) * limit;
    return filteredSortedItems.slice(start, start + limit);
  }, [clientSidePagination, filteredSortedItems, page, limit]);

  const handleSort = (key) => {
    if (key === "__index" || key === "__actions") return;
    if (sortKey === key) {
      setSortDirection((currentDirection) =>
        currentDirection === "asc" ? "desc" : "asc",
      );
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const columnsWithActions = useMemo(() => {
    const enhancedColumns = columns.map((column) => {
      const isStatusColumn =
        String(column.key || "")
          .toLowerCase()
          .includes("status") ||
        String(column.header || "")
          .toLowerCase()
          .includes("status");
      const translatedHeader = column.header ? t(column.header, { defaultValue: column.header }) : column.header;
      if (column.render) return { ...column, header: translatedHeader };
      if (isStatusColumn) return { ...column, header: translatedHeader, render: (value) => renderStatusBadge(value, t) };
      return { ...column, header: translatedHeader, render: (value) => getCellValue({ [column.key]: value }, column.key) };
    });

    return [
      {
        key: "__index",
        header: t('list.rowNum'),
        sortable: false,
        render: (_value, _row, rowIndex) => (
          <div className="min-w-[56px] text-slate-700">
            {(page - 1) * limit + rowIndex + 1}
          </div>
        ),
      },
      ...enhancedColumns,
      {
        key: "__actions",
        header: t('list.actions'),
        sortable: false,
        render: (_value, row) => (
          <RecordActionButtons
            extraItems={
              extraActionItemsForRow
                ? extraActionItemsForRow(row, fetchItems)
                : []
            }
            onView={
              viewPathForRow ? () => navigate(viewPathForRow(row)) : undefined
            }
            onEdit={
              editPathForRow ? () => navigate(editPathForRow(row)) : undefined
            }
            onDelete={deleteEnabled ? () => handleDelete(row) : undefined}
          />
        ),
      },
    ];
  }, [
    columns,
    t,
    viewPathForRow,
    editPathForRow,
    deleteEnabled,
    page,
    limit,
    extraActionItemsForRow,
    navigate,
  ]);

  const totalForPagination = clientSidePagination
    ? filteredSortedItems.length
    : total;

  const handlePDFExport = () => {
    const exportableColumns = columns.filter(
      (column) => column.key && !String(column.key).startsWith("__"),
    ).map((column) => ({
      ...column,
      header: column.header ? t(column.header, { defaultValue: column.header }) : column.header,
    }));
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(18);
    doc.text(title || t('list.report'), 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    const tableData = filteredSortedItems.map((row) =>
      exportableColumns.map((column) => getRowValue(row, column.key, column)),
    );
    autoTable(doc, {
      startY: 34,
      head: [exportableColumns.map((column) => column.header)],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [6, 182, 212] },
    });
    doc.save(
      `${(title || "export").toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.pdf`,
    );
  };

  const handleExport = () => {
    const exportableColumns = columns.filter(
      (column) => column.key && !String(column.key).startsWith("__"),
    ).map((column) => ({
      ...column,
      header: column.header ? t(column.header, { defaultValue: column.header }) : column.header,
    }));
    const rows = filteredSortedItems.map((row) =>
      exportableColumns
        .map(
          (column) => `"${getCellValue(row, column.key).replace(/"/g, '""')}"`,
        )
        .join(","),
    );
    const csv = [
      exportableColumns.map((column) => `"${column.header}"`).join(","),
      ...rows,
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const pageActions = (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {enableExport ? (
        <>
          <Button variant="outline" icon={FiDownload} onClick={handlePDFExport}>
            {t('list.exportPdf')}
          </Button>
          <Button variant="outline" icon={FiDownload} onClick={handleExport}>
            {t('list.exportCsv')}
          </Button>
        </>
      ) : null}
      {extraActions}
      {createPath ? (
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => navigate(createPath)}
        >
          {t('list.addNew')}
        </Button>
      ) : null}
    </div>
  );

  const content = (
    <>
      {headerContent}
      <Card className="rounded-[28px] shadow-none">
        <div className={`rounded-[24px] border p-3 sm:p-4 lg:p-6 ${panelShellClass}`}>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${toneStyles.soft}`}
            >
              {t('list.searchAndFilter')}
            </div>
            <div
              className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {t('list.quickControls')}
            </div>
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid w-full gap-4 lg:max-w-4xl lg:grid-cols-[minmax(300px,420px)_220px_220px]">
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  {t('list.searchPlaceholder')}
                </label>
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${controlClass}`}
                  placeholder={searchPlaceholder || t('list.searchPlaceholder')}
                />
              </div>
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  {t('list.filterBy')}
                </label>
                <select
                  value={filterColumn}
                  onChange={(e) => {
                    setFilterColumn(e.target.value);
                    setPage(1);
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${controlClass}`}
                >
                  <option value="all">
                    {t('list.allColumns')}
                  </option>
                  {filterableColumns.map((column) => (
                    <option key={column.key} value={column.key}>
                      {column.header}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                >
                  {t('list.filterValue')}
                </label>
                <input
                  value={filterValue}
                  onChange={(e) => {
                    setFilterValue(e.target.value);
                    setPage(1);
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${controlClass}`}
                  placeholder={t('list.typeToFilter')}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
      {error && !loading && (
        <Card className="rounded-[28px] shadow-none">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-rose-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3
                  className={`text-sm font-semibold ${isDark ? "text-rose-200" : "text-rose-900"}`}
                >
                  {t('list.unableToLoad')}
                </h3>
                <p
                  className={`mt-1 text-sm ${isDark ? "text-rose-300" : "text-rose-700"}`}
                >
                  {error}
                </p>
                <button
                  onClick={fetchItems}
                  className="mt-3 inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
                >
                  {t('common.retry')}
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}
      <Card className="rounded-[28px] shadow-none">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}
            >
              {t('list.recordsTable')}
            </h2>
            <p
              className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {t('list.tableDescription')}
            </p>
          </div>
          {deletingId && (
            <div className="text-sm text-rose-500">
              {t('list.deletingRecord')}
            </div>
          )}
        </div>
        <div
          className={`overflow-x-auto rounded-[24px] border ${isDark ? "border-slate-700 bg-slate-900"     : "border-slate-200 bg-transparent"}`}
        >
          {loading ? (
            <div className="p-3 sm:p-4 lg:p-6 text-sm text-slate-500">
              {t('list.loadingData')}
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-3 sm:px-4 lg:px-6 py-16 text-center">
              <div
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${isDark ? "bg-slate-800 text-slate-300" : "bg-transparent text-slate-500"}`}
              >
                {t('list.noRecords')}
              </div>
              <h3
                className={`mt-4 text-xl font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}
              >
                {t('list.noMatch')}
              </h3>
              <p
                className={`mt-2 max-w-xl text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                {t('list.tryChanging')}
              </p>
            </div>
          ) : (
            <DataTable
              columns={columnsWithActions.map((column) => ({
                ...column,
                sortable:
                  column.key !== "__actions" &&
                  column.key !== "__index" &&
                  column.sortable !== false,
              }))}
              data={visibleItems}
              rowClassName="odd:bg-transparent even:bg-transparent hover:bg-cyan-50/40"
              cellClassName="align-middle"
              headerClassName="bg-transparent text-slate-700"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )}
        </div>
      </Card>
      <StaffPagination
        page={page}
        limit={limit}
        total={totalForPagination}
        onPageChange={setPage}
        onPageSizeChange={(value) => {
          setLimit(value);
          setPage(1);
        }}
      />
    </>
  );

  if (embedded) return content;

  return (
    <StaffPageLayout
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      actions={pageActions}
    >
      {content}
    </StaffPageLayout>
  );
};

export default ListPage;
