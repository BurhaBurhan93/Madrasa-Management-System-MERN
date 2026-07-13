import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import ListPage from "../shared/ListPage";
import StaffPageLayout from "../shared/StaffPageLayout";
import Card from "../../../components/UIHelper/Card";
import { PageSkeleton } from "../../../components/UIHelper/SkeletonLoader";
import {
  PieChartComponent,
  BarChartComponent,
} from "../../../components/UIHelper/ECharts";
import api from "../../../lib/api";
import Button from "../../../components/UIHelper/Button";
import Modal from "../../../components/UIHelper/Modal";
import {
  FiUsers,
  FiUserCheck,
  FiArrowRight,
  FiTrendingUp,
} from "react-icons/fi";

const ClassAssignment = () => {
  const { t } = useTranslation(['staff', 'common']);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("assign");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newClass, setNewClass] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [listKey, setListKey] = useState(0);
  const [stats, setStats] = useState({
    totalStudents: 0,
    assignedStudents: 0,
    unassignedStudents: 0,
    activeStudents: 0,
    byClass: [],
    byStatus: [],
  });

  const columns = [
    { key: "studentCode", header: t('staff.registrar.classAssignment.columns.studentCode') },
    {
      key: "name",
      header: t('staff.registrar.classAssignment.columns.studentName'),
      render: (_value, row) =>
        `${row.firstName || ""} ${row.lastName || ""}`.trim() ||
        row.user?.name ||
        t('staff.registrar.classAssignment.columns.na'),
    },
    {
      key: "currentClass",
      header: t('staff.registrar.classAssignment.columns.currentClass'),
      render: (value) =>
        value?.name ||
        value?.className || (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            {t('staff.registrar.classAssignment.columns.notAssigned')}
          </span>
        ),
    },
    { key: "currentLevel", header: t('staff.registrar.classAssignment.columns.level') },
    { key: "status", header: t('staff.registrar.classAssignment.columns.status') },
  ];

  useEffect(() => {
    fetchStats();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/academic/classes");
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];
      setClasses(list.filter((c) => c.status !== "inactive"));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/student/all");
      const students = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      const totalStudents = students.length;
      const assignedStudents = students.filter((s) => s.currentClass).length;
      const unassignedStudents = totalStudents - assignedStudents;
      const activeStudents = students.filter(
        (s) => s.status === "active",
      ).length;

      const classMap = {};
      students.forEach((s) => {
        const className =
          s.currentClass?.className || s.currentClass?.name || t('staff.registrar.classAssignment.unassigned');
        classMap[className] = (classMap[className] || 0) + 1;
      });
      const byClass = Object.entries(classMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      const statusMap = {};
      students.forEach((s) => {
        const status = s.status || "unknown";
        statusMap[status] = (statusMap[status] || 0) + 1;
      });
      const byStatus = Object.entries(statusMap).map(([name, value]) => ({
        name,
        value,
      }));

      setStats({
        totalStudents,
        assignedStudents,
        unassignedStudents,
        activeStudents,
        byClass,
        byStatus,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPageLoading(false);
    }
  };

  const openModal = useCallback((student, mode) => {
    setSelectedStudent(student);
    setModalMode(mode);
    setNewClass("");
    setShowModal(true);
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
    setNewClass("");
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !newClass) return;
    setLoading(true);
    try {
      if (modalMode === "promote") {
        await api.post(`/student/students/${selectedStudent._id}/promote`, {
          newClass,
        });
      } else {
        await api.put(`/student/students/${selectedStudent._id}/transfer`, {
          newClass,
        });
      }
      closeModal();
      await fetchStats();
      setListKey((k) => k + 1);
    } catch (error) {
      alert(
        error.response?.data?.message || t('staff.registrar.classAssignment.operationFailed'),
      );
    } finally {
      setLoading(false);
    }
  };

  const modalTitle = {
    assign: t('staff.registrar.classAssignment.modal.assignTitle'),
    transfer: t('staff.registrar.classAssignment.modal.transferTitle'),
    promote: t('staff.registrar.classAssignment.modal.promoteTitle'),
  }[modalMode];

  const submitLabel = {
    assign: loading ? t('staff.registrar.classAssignment.modal.assigning') : t('staff.registrar.classAssignment.modal.assignClass'),
    transfer: loading ? t('staff.registrar.classAssignment.modal.transferring') : t('staff.registrar.classAssignment.modal.transferStudent'),
    promote: loading ? t('staff.registrar.classAssignment.modal.promoting') : t('staff.registrar.classAssignment.modal.promoteStudent'),
  }[modalMode];

  const extraActionItems = useCallback(
    (row) => [
      {
        label: row.currentClass ? t('staff.registrar.classAssignment.actions.transfer') : t('staff.registrar.classAssignment.actions.assignClass'),
        className: row.currentClass
          ? "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100",
        onClick: () => openModal(row, row.currentClass ? "transfer" : "assign"),
      },
      ...(row.currentClass
        ? [
            {
              label: t('staff.registrar.classAssignment.actions.promote'),
              className:
                "border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300 hover:bg-violet-100",
              onClick: () => openModal(row, "promote"),
            },
          ]
        : []),
    ],
    [openModal, t],
  );

  if (pageLoading) {
    return (
      <StaffPageLayout
        eyebrow={t('staff.registrar.classAssignment.eyebrow')}
        title={t('staff.registrar.classAssignment.title')}
      >
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  return (
    <StaffPageLayout
      eyebrow={t('staff.registrar.classAssignment.eyebrow')}
      title={t('staff.registrar.classAssignment.title')}
      subtitle={t('staff.registrar.classAssignment.subtitle')}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t('staff.registrar.classAssignment.stats.totalStudents'),
            value: stats.totalStudents,
            icon: FiUsers,
            color: "blue",
          },
          {
            label: t('staff.registrar.classAssignment.stats.assigned'),
            value: stats.assignedStudents,
            icon: FiUserCheck,
            color: "green",
          },
          {
            label: t('staff.registrar.classAssignment.stats.unassigned'),
            value: stats.unassignedStudents,
            icon: FiArrowRight,
            color: "amber",
          },
          {
            label: t('staff.registrar.classAssignment.stats.activeStudents'),
            value: stats.activeStudents,
            icon: FiTrendingUp,
            color: "purple",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card
            key={label}
            className={`rounded-2xl border border-slate-200 bg-gradient-to-br from-${color}-50 to-${color === "green" ? "emerald" : color}-50 p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-slate-600">
                  {label}
                </p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${color}-100`}
              >
                <Icon className={`h-6 w-6 text-${color}-600`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-800">
            {t('staff.registrar.classAssignment.charts.studentsByClass')}
          </h3>
          {stats.byClass.length > 0 ? (
            <BarChartComponent
              data={stats.byClass}
              dataKey="value"
              nameKey="name"
              height={240}
            />
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              {t('staff.registrar.classAssignment.charts.noData')}
            </p>
          )}
        </Card>
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-800">
            {t('staff.registrar.classAssignment.charts.statusDistribution')}
          </h3>
          {stats.byStatus.length > 0 ? (
            <PieChartComponent data={stats.byStatus} height={240} />
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              {t('staff.registrar.classAssignment.charts.noData')}
            </p>
          )}
        </Card>
      </div>

      <ListPage
        key={listKey}
        embedded
        eyebrow={t('staff.registrar.classAssignment.eyebrow')}
        title={t('staff.registrar.classAssignment.listTitle')}
        subtitle={t('staff.registrar.classAssignment.listSubtitle')}
        endpoint="/student/all"
        columns={columns}
        deleteEnabled={false}
        clientSidePagination
        searchPlaceholder={t('staff.registrar.classAssignment.searchPlaceholder')}
        extraActionItemsForRow={extraActionItems}
      />

      <Modal isOpen={showModal} onClose={closeModal} title={modalTitle}>
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
              {t('staff.registrar.classAssignment.modal.student')}
            </p>
            <p className="font-semibold text-slate-900">
              {selectedStudent
                ? `${selectedStudent.firstName || ""} ${selectedStudent.lastName || ""}`.trim() ||
                  selectedStudent.user?.name ||
                  t('staff.registrar.classAssignment.modal.na')
                : t('staff.registrar.classAssignment.modal.na')}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              {modalMode === "promote"
                ? `${t('staff.registrar.classAssignment.modal.currentLevel')}: ${selectedStudent?.currentLevel || t('staff.registrar.classAssignment.modal.na')}`
                : `${t('staff.registrar.classAssignment.modal.currentClass')}: ${selectedStudent?.currentClass?.className || selectedStudent?.currentClass?.name || t('staff.registrar.classAssignment.modal.notAssigned')}`}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              {modalMode === "promote"
                ? t('staff.registrar.classAssignment.modal.newClassAfter')
                : t('staff.registrar.classAssignment.modal.selectClass')}
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="">{t('staff.registrar.classAssignment.modal.selectClassPlaceholder')}</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                  {cls.code ? ` (${cls.code})` : ""}
                  {cls.type ? ` · ${cls.type}` : ""}
                </option>
              ))}
            </select>
            {classes.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                {t('staff.registrar.classAssignment.modal.noActiveClasses')}{" "}
                <a href="/staff/registrar/classes/create" className="underline">
                  {t('staff.registrar.classAssignment.modal.createClassFirst')}
                </a>
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" onClick={closeModal}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading || !newClass}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </Modal>
    </StaffPageLayout>
  );
};

export default ClassAssignment;
