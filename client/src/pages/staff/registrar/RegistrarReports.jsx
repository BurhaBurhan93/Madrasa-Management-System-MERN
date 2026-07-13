import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../../lib/api";
import StaffPageLayout from "../shared/StaffPageLayout";
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";
import {
  formatDateInput,
  getDateRangeFromWeekValue,
  getDefaultPeriodFilters,
  getPeriodDateRange,
} from "../../../utils/reportPeriods";

const defaultPeriodFilters = getDefaultPeriodFilters();

const RegistrarReports = () => {
  const { t } = useTranslation(['staff', 'common']);
  const [filters, setFilters] = useState({
    status: "",
    period: "monthly",
    date: defaultPeriodFilters.date,
    week: defaultPeriodFilters.week,
    month: defaultPeriodFilters.month,
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const query = { ...(filters.status && { status: filters.status }) };

      if (filters.period === "custom") {
        if (filters.startDate) query.startDate = filters.startDate;
        if (filters.endDate) query.endDate = filters.endDate;
      } else if (filters.period === "daily") {
        query.startDate = filters.date;
        query.endDate = filters.date;
      } else if (filters.period === "weekly") {
        const { startDate, endDate } = getDateRangeFromWeekValue(filters.week);
        query.startDate = startDate;
        query.endDate = endDate;
      } else {
        const { start, end } = getPeriodDateRange(filters);
        query.startDate = formatDateInput(start);
        query.endDate = formatDateInput(end);
      }

      const params = new URLSearchParams(query);
      const res = await api.get(`/student/reports?${params}`);
      setReport(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('staff.registrar.registrarReports.errors.generateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!report?.students?.length) return;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(18);
    doc.text(t('staff.registrar.registrarReports.pdf.title'), 14, 20);
    doc.setFontSize(10);
    doc.text(`${t('staff.registrar.registrarReports.pdf.generated')}: ${new Date().toLocaleDateString()}`, 14, 28);

    let y = 38;
    doc.setFontSize(12);
    doc.text(t('staff.registrar.registrarReports.pdf.summary'), 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`${t('staff.registrar.registrarReports.pdf.totalStudents')}: ${report.stats?.totalStudents || 0}`, 14, y);
    y += 7;
    doc.text(`${t('staff.registrar.registrarReports.pdf.active')}: ${report.stats?.activeStudents || 0}`, 14, y);
    y += 7;
    doc.text(`${t('staff.registrar.registrarReports.pdf.inactive')}: ${report.stats?.inactiveStudents || 0}`, 14, y);
    y += 7;
    doc.text(`${t('staff.registrar.registrarReports.pdf.classes')}: ${Object.keys(report.stats?.byClass || {}).length}`, 14, y);
    y += 12;

    const classEntries = Object.entries(report.stats?.byClass || {});
    if (classEntries.length > 0) {
      doc.setFontSize(12);
      doc.text(t('staff.registrar.registrarReports.pdf.classDistribution'), 14, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head: [[t('staff.registrar.registrarReports.pdf.class'), t('staff.registrar.registrarReports.pdf.count')]],
        body: classEntries.map(([cls, count]) => [cls, String(count)]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [6, 182, 212] },
      });
      y = doc.lastAutoTable.finalY + 12;
    }

    const tableData = (report.students || []).map((student, index) => [
      String(index + 1),
      student.studentCode || "",
      `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
        student.user?.name ||
        "",
      student.fatherName || "",
      student.currentClass?.name || student.currentClass?.className || "",
      student.status || "",
      student.admissionDate
        ? new Date(student.admissionDate).toLocaleDateString()
        : "",
    ]);
    autoTable(doc, {
      startY: y,
      head: [
        [t('staff.registrar.registrarReports.pdf.hash'), t('staff.registrar.registrarReports.pdf.code'), t('staff.registrar.registrarReports.pdf.name'), t('staff.registrar.registrarReports.pdf.fatherName'), t('staff.registrar.registrarReports.pdf.class'), t('staff.registrar.registrarReports.pdf.status'), t('staff.registrar.registrarReports.pdf.admissionDate')],
      ],
      body: tableData,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [6, 182, 212] },
    });
    doc.save(`registrar_report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportCSV = () => {
    if (!report?.students?.length) return;
    const rows = report.students.map((student) => [
      student.studentCode || "",
      `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
        student.user?.name ||
        "",
      student.fatherName || "",
      student.currentClass?.name || student.currentClass?.className || "",
      student.status || "",
      student.admissionDate
        ? new Date(student.admissionDate).toLocaleDateString()
        : "",
    ]);
    const csv = [
      [t('staff.registrar.registrarReports.csv.code'), t('staff.registrar.registrarReports.csv.name'), t('staff.registrar.registrarReports.csv.fatherName'), t('staff.registrar.registrarReports.csv.class'), t('staff.registrar.registrarReports.csv.status'), t('staff.registrar.registrarReports.csv.admissionDate')],
      ...rows,
    ]
      .map((row) => row.join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `student_report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const set = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const statCards = report
    ? [
        {
          label: t('staff.registrar.registrarReports.statCards.totalStudents'),
          value: report.stats?.totalStudents || 0,
          color: "from-cyan-500 to-sky-500",
        },
        {
          label: t('staff.registrar.registrarReports.statCards.active'),
          value: report.stats?.activeStudents || 0,
          color: "from-emerald-500 to-emerald-600",
        },
        {
          label: t('staff.registrar.registrarReports.statCards.inactive'),
          value: report.stats?.inactiveStudents || 0,
          color: "from-amber-500 to-amber-600",
        },
        {
          label: t('staff.registrar.registrarReports.statCards.classes'),
          value: Object.keys(report.stats?.byClass || {}).length,
          color: "from-violet-500 to-violet-600",
        },
      ]
    : [];

  return (
    <StaffPageLayout
      title={t('staff.registrar.registrarReports.title')}
      subtitle={t('staff.registrar.registrarReports.subtitle')}
      actions={
        report && (
          <div className="flex gap-2">
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7.5 10V2" />
                <polyline points="4 7 7.5 10 11 7" />
                <path d="M2 13h11" />
              </svg>
              {t('staff.registrar.registrarReports.exportPdf')}
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7.5 10V2" />
                <polyline points="4 7 7.5 10 11 7" />
                <path d="M2 13h11" />
              </svg>
              {t('staff.registrar.registrarReports.exportCsv')}
            </button>
          </div>
        )
      }
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-cyan-500 to-sky-500" />
        <div className="p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            {t('staff.registrar.registrarReports.filters.title')}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('staff.registrar.registrarReports.filters.status')}
              </label>
              <select
                value={filters.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">{t('staff.registrar.registrarReports.filters.all')}</option>
                <option value="active">{t('staff.registrar.registrarReports.filters.active')}</option>
                <option value="inactive">{t('staff.registrar.registrarReports.filters.inactive')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('staff.registrar.registrarReports.filters.period')}
              </label>
              <select
                value={filters.period}
                onChange={(e) => set("period", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="daily">{t('staff.registrar.registrarReports.filters.daily')}</option>
                <option value="weekly">{t('staff.registrar.registrarReports.filters.weekly')}</option>
                <option value="monthly">{t('staff.registrar.registrarReports.filters.monthly')}</option>
                <option value="custom">{t('staff.registrar.registrarReports.filters.customRange')}</option>
              </select>
            </div>

            {filters.period === "daily" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('staff.registrar.registrarReports.filters.date')}
                </label>
                <CalendarDatePicker
                  value={filters.date}
                  onChange={(date) => set("date", date)}
                  placeholder={t('staff.registrar.registrarReports.filters.selectDate')}
                />
              </div>
            )}

            {filters.period === "weekly" && (
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('staff.registrar.registrarReports.filters.week')}
                </label>
                <input
                  type="week"
                  value={filters.week}
                  onChange={(e) => set("week", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            )}

            {filters.period === "monthly" && (
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t('staff.registrar.registrarReports.filters.month')}
                </label>
                <input
                  type="month"
                  value={filters.month}
                  onChange={(e) => set("month", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            )}

            {filters.period === "custom" && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('staff.registrar.registrarReports.filters.startDate')}
                  </label>
                  <CalendarDatePicker
                    value={filters.startDate}
                    onChange={(date) => set("startDate", date)}
                    placeholder={t('staff.registrar.registrarReports.filters.selectDate')}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('staff.registrar.registrarReports.filters.endDate')}
                  </label>
                  <CalendarDatePicker
                    value={filters.endDate}
                    onChange={(date) => set("endDate", date)}
                    placeholder={t('staff.registrar.registrarReports.filters.selectDate')}
                  />
                </div>
              </>
            )}
          </div>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-60"
            >
              {loading && (
                <svg
                  className="animate-spin"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="7" cy="7" r="5" strokeOpacity=".25" />
                  <path d="M7 2a5 5 0 0 1 5 5" strokeLinecap="round" />
                </svg>
              )}
              {loading ? t('staff.registrar.registrarReports.generating') : t('staff.registrar.registrarReports.generateReport')}
            </button>
          </div>
        </div>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map(({ label, value, color }) => (
              <div
                key={label}
                className={`rounded-2xl bg-gradient-to-br ${color} p-5 text-white shadow-sm`}
              >
                <p className="text-sm font-medium text-white/80">{label}</p>
                <p className="mt-1 text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          {Object.keys(report.stats?.byClass || {}).length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  {t('staff.registrar.registrarReports.classDistribution')}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
                {Object.entries(report.stats.byClass).map(([cls, count]) => (
                  <div
                    key={cls}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {cls}
                    </span>
                    <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-700">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                {t('staff.registrar.registrarReports.studentList')}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {report.students?.length || 0} {t('staff.registrar.registrarReports.records')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {[
                      t('staff.registrar.registrarReports.table.hash'),
                      t('staff.registrar.registrarReports.table.code'),
                      t('staff.registrar.registrarReports.table.name'),
                      t('staff.registrar.registrarReports.table.fatherName'),
                      t('staff.registrar.registrarReports.table.class'),
                      t('staff.registrar.registrarReports.table.status'),
                      t('staff.registrar.registrarReports.table.admissionDate'),
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(report.students || []).map((student, index) => (
                    <tr
                      key={student._id}
                      className="border-b border-slate-50 hover:bg-cyan-50/40"
                    >
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {student.studentCode || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {`${student.firstName || ""} ${student.lastName || ""}`.trim() ||
                          student.user?.name ||
                          "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {student.fatherName || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {student.currentClass?.name || student.currentClass?.className || t('staff.registrar.registrarReports.notAssigned')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${student.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          {student.status || t('staff.registrar.registrarReports.na')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {student.admissionDate
                          ? new Date(student.admissionDate).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!report && !loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400 shadow-sm">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="8" y="4" width="24" height="32" rx="3" />
            <line x1="14" y1="14" x2="26" y2="14" />
            <line x1="14" y1="20" x2="26" y2="20" />
            <line x1="14" y1="26" x2="20" y2="26" />
          </svg>
          <p className="mt-3 text-sm font-medium">{t('staff.registrar.registrarReports.noReport')}</p>
          <p className="mt-1 text-xs">
            {t('staff.registrar.registrarReports.noReportHint')}
          </p>
        </div>
      )}
    </StaffPageLayout>
  );
};

export default RegistrarReports;
