import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import { FiSearch, FiFilter, FiDownload, FiUser, FiDatabase, FiCalendar, FiAlertCircle, FiCheckCircle, FiFileText, FiTrash2 } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Table, Button, Card, Input, Select, Badge, Loading, Modal } from '../../../components/UIHelper';
import api from '../../../lib/api';

const AuditLogs = () => {
  const { t } = useTranslation('admin');
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportPDF = () => {
    setShowExportMenu(false);
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text(t('users.auditLogs'), 14, 20);
    doc.setFontSize(10);
    doc.text(t('users.generated', { date: new Date().toLocaleDateString() }), 14, 28);
    const cols = columns.filter(c => c.key);
    const head = cols.map(c => c.label);
    const body = filteredLogs.map(row => cols.map(c => row[c.key]));
    autoTable(doc, { startY: 34, head: [head], body, styles: { fontSize: 8 }, headStyles: { fillColor: [79, 70, 229] } });
    doc.save(`audit-logs-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const exportCSV = () => {
    setShowExportMenu(false);
    const cols = columns.filter(c => c.key);
    const head = cols.map(c => `"${c.label}"`).join(',');
    const body = filteredLogs.map(row => cols.map(c => `"${(row[c.key] || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const csv = `${head}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearOldLogs = async () => {
    setClearing(true);
    try {
      await api.delete('/admin/audit-logs/clear', { params: { days: 30 } });
      setShowClearModal(false);
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || t('users.failedToClear'));
    } finally {
      setClearing(false);
    }
  };

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedAction) params.action = selectedAction.toLowerCase();
      if (searchTerm) params.search = searchTerm;
      const res = await api.get('/admin/audit-logs', { params });
      const data = res.data?.data || [];
      const mapped = data.map(l => ({
        id: l._id,
        _id: l._id,
        timestamp: l.timestamp ? new Date(l.timestamp).toLocaleString(i18n.language === 'ps' ? 'ps-AF' : i18n.language === 'prs' ? 'prs-AF' : 'en-CA', { hour12: false }).replace(',', '') : t('common.na'),
        user: l.changedBy?.email || l.changedBy?.name || t('users.system'),
        action: (l.action || '').toUpperCase(),
        module: l.entityType || t('common.na'),
        details: `${l.field}: ${l.reason || t('users.noDetails')}`,
        ip: l.metadata?.ip || t('common.na'),
        status: 'SUCCESS',
      }));
      setLogs(mapped);
      setTotal(res.data?.total || mapped.length);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedAction]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    const matchesUser = !selectedUser || log.user === selectedUser;
    const matchesDate = !dateRange || log.timestamp.startsWith(dateRange);
    return matchesUser && matchesDate;
  });

  const uniqueUsers = [...new Set(logs.map(l => l.user).filter(Boolean))];

  const getActionColor = (action) => {
    switch(action) {
      case 'CREATE': return 'green';
      case 'UPDATE': return 'blue';
      case 'DELETE': return 'red';
      case 'READ': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'SUCCESS' ? <FiCheckCircle className="text-green-500" size={16} /> : <FiAlertCircle className="text-red-500" size={16} />;
  };

  const columns = [
    {
      key: 'timestamp',
      label: t('users.timestamp'),
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <FiCalendar className="text-slate-400" size={14} />
          <span className="font-mono text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'user',
      label: t('users.user'),
      render: (value) => (
        <div className="flex items-center gap-2">
          <FiUser className="text-slate-400" size={14} />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'action',
      label: t('users.action'),
      render: (value) => (
        <Badge color={getActionColor(value)} variant="subtle">
          {value}
        </Badge>
      )
    },
    {
      key: 'module',
      label: t('users.module'),
      render: (value) => (
        <div className="flex items-center gap-2">
          <FiDatabase className="text-slate-400" size={14} />
          <span>{value}</span>
        </div>
      )
    },
    { key: 'details', label: t('users.details') },
    { key: 'ip', label: t('users.ipAddress') },
    {
      key: 'status',
      label: t('users.status'),
      render: (value) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <Badge
            color={value === 'SUCCESS' ? 'green' : 'red'}
            variant="subtle"
          >
            {value}
          </Badge>
        </div>
      )
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('users.auditLogs')}</h1>
          <p className="text-slate-600">{t('users.trackAudit')}</p>
        </div>
        <div className="flex gap-2 relative" ref={exportRef}>
          <Button variant="outline" icon={<FiDownload size={16} />} onClick={() => setShowExportMenu(!showExportMenu)}>
            {t('users.exportLogs')}
          </Button>
          {showExportMenu && (
            <div className="absolute top-full right-36 mt-1 bg-white border rounded-lg shadow-lg z-10 w-36">
              <button onClick={exportPDF} className="w-full px-4 py-2 text-sm text-left hover:bg-slate-50 flex items-center gap-2"><FiFileText size={14} /> {t('users.exportPdf')}</button>
              <button onClick={exportCSV} className="w-full px-4 py-2 text-sm text-left hover:bg-slate-50 flex items-center gap-2"><FiDownload size={14} /> {t('users.exportCsv')}</button>
            </div>
          )}
          <Button variant="outline" color="red" icon={<FiTrash2 size={16} />} onClick={() => setShowClearModal(true)}>
            {t('users.clearOldLogs')}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="md:col-span-2">
            <Input
              placeholder={t('users.searchByDetails')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<FiSearch />}
            />
          </div>
          <Select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            options={[
              { value: '', label: t('users.allActions') },
              { value: 'CREATE', label: t('users.create') },
              { value: 'UPDATE', label: t('users.update') },
              { value: 'DELETE', label: t('users.delete') },
            ]}
          />
          <Select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            options={[
              { value: '', label: t('users.allUsers') },
              ...uniqueUsers.map(u => ({ value: u, label: u })),
            ]}
          />
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: '', label: t('users.allDates') },
              { value: new Date().toISOString().slice(0, 10), label: t('users.today') },
            ]}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-slate-600">
            {t('users.showingLogs', { count: filteredLogs.length, total: total })}
          </div>
          <Button variant="outline" icon={<FiFilter size={16} />}>
            {t('users.advancedFilters')}
          </Button>
        </div>

        <Table
          columns={columns}
          data={filteredLogs}
          pagination
          pageSize={10}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-slate-500 mb-1">{t('users.totalLogs')}</div>
          <div className="text-2xl font-bold text-slate-900">{total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500 mb-1">{t('users.successfulActions')}</div>
          <div className="text-2xl font-bold text-green-600">
            {logs.filter(l => l.status === 'SUCCESS').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500 mb-1">{t('users.failedActions')}</div>
          <div className="text-2xl font-bold text-red-600">
            {logs.filter(l => l.status === 'FAILED').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500 mb-1">{t('users.uniqueUsers')}</div>
          <div className="text-2xl font-bold text-blue-600">
            {uniqueUsers.length}
          </div>
        </Card>
      </div>
      {showClearModal && (
        <Modal onClose={() => setShowClearModal(false)}>
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('users.clearLogsTitle')}</h3>
            <p className="text-slate-600 mb-4">{t('users.clearLogsBody')}</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowClearModal(false)}>{t('users.cancel')}</Button>
              <Button color="red" onClick={handleClearOldLogs} disabled={clearing}>{clearing ? t('common.loading') : t('users.clearLogs')}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuditLogs;
