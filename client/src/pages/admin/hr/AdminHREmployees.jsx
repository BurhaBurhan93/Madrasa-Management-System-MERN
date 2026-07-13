import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import api from '../../../lib/api';
import Card from '../../../components/UIHelper/Card';
import CalendarDatePicker from '../../../components/UIHelper/CalendarDatePicker';

const LIMIT = 10;

const AdminHREmployees = () => {
  const { t } = useTranslation('admin');
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ totalEmployees: 0, activeEmployees: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [form, setForm] = useState({
    fullName: '', fatherName: '', gender: 'male', phoneNumber: '', email: '',
    department: '', designation: '', joiningDate: new Date().toISOString().split('T')[0],
    baseSalary: '', employmentType: 'permanent', employeeType: 'support',
    currentAddress: '', highestQualification: '', previousExperience: '',
  });

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
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const fetchLookups = async () => {
    try {
      const [deptRes, desigRes] = await Promise.all([
        api.get('/hr/departments', { params: { limit: 100 } }),
        api.get('/hr/designations', { params: { limit: 100 } }),
      ]);
      const toArray = (r) => (Array.isArray(r.data) ? r.data : r.data?.data || []);
      setDepartments(toArray(deptRes));
      setDesignations(toArray(desigRes));
    } catch {}
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/hr/employees/stats');
      setStats(data.data || data || {});
    } catch {}
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (deptFilter) params.department = deptFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/hr/employees', { params });
      const result = Array.isArray(data) ? { data, total: data.length, totalPages: 1 } : data;
      setEmployees(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, deptFilter, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchLookups(); fetchStats(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        baseSalary: form.baseSalary ? Number(form.baseSalary) : 0,
        joiningDate: form.joiningDate || new Date().toISOString().split('T')[0],
        phoneNumber: form.phoneNumber || 'N/A',
      };
      if (!payload.department) delete payload.department;
      if (!payload.designation) delete payload.designation;

      if (editingId) await api.put(`/hr/employees/${editingId}`, payload);
      else await api.post('/hr/employees', payload);

      setShowAddModal(false);
      setEditingId(null);
      setForm({ fullName: '', fatherName: '', gender: 'male', phoneNumber: '', email: '', department: '', designation: '', joiningDate: new Date().toISOString().split('T')[0], baseSalary: '', employmentType: 'permanent', employeeType: 'support', currentAddress: '', highestQualification: '', previousExperience: '' });
      fetchData();
      fetchStats();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (emp) => {
    setForm({
      fullName: emp.fullName || '',
      fatherName: emp.fatherName || '',
      gender: emp.gender || 'male',
      phoneNumber: emp.phoneNumber || '',
      email: emp.email || '',
      department: emp.department?._id || emp.department || '',
      designation: emp.designation?._id || emp.designation || '',
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
      baseSalary: emp.baseSalary ?? '',
      employmentType: emp.employmentType || 'permanent',
      employeeType: emp.employeeType || 'support',
      currentAddress: emp.currentAddress || '',
      highestQualification: emp.highestQualification || '',
      previousExperience: emp.previousExperience ?? '',
    });
    setEditingId(emp._id);
    setShowAddModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await api.delete(`/hr/employees/${deleteTarget}`); setDeleteTarget(null); fetchData(); fetchStats(); } catch (err) { console.error(err); }
  };

  const handleStatusToggle = async (emp, newStatus) => {
    try { await api.put(`/hr/employees/${emp._id}`, { status: newStatus }); fetchData(); fetchStats(); } catch (err) { console.error(err); }
  };

  const getDeptName = (d) => (typeof d === 'object' ? d?.departmentName || '' : departments.find(dd => dd._id === d)?.departmentName || '-');
  const getDesigName = (d) => (typeof d === 'object' ? d?.designationTitle || '' : designations.find(dd => dd._id === d)?.designationTitle || '-');

  const pageNumbers = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pageNumbers.push(i);

  if (loading && employees.length === 0) return <div className="flex items-center justify-center py-20 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="w-full min-h-screen p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('hr.hrEmployees')}</h1>
          <p className="text-slate-500 mt-1">{t('hr.manageAllEmployees')}</p>
        </div>
        <button onClick={() => { setShowAddModal(true); setEditingId(null); setForm({ fullName: '', fatherName: '', gender: 'male', phoneNumber: '', email: '', department: '', designation: '', joiningDate: new Date().toISOString().split('T')[0], baseSalary: '', employmentType: 'permanent', employeeType: 'support', currentAddress: '', highestQualification: '', previousExperience: '' }); }} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">+ {t('hr.addNewEmployee')}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"><div className="flex items-center justify-between p-4"><div><p className="text-sm opacity-90">{t('common.totalEmployees')}</p><p className="text-2xl font-bold">{stats.totalEmployees}</p></div></div></Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white"><div className="flex items-center justify-between p-4"><div><p className="text-sm opacity-90">{t('hr.activeEmployees')}</p><p className="text-2xl font-bold">{stats.activeEmployees}</p></div></div></Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')} className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-cyan-500 focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">{t('hr.allDepartments')}</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName || d.departmentCode}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">{t('common.allStatus')}</option>
              <option value="active">{t('common.active')}</option>
              <option value="inactive">{t('common.inactive')}</option>
            </select>
            <div className="flex rounded-lg border border-slate-300 overflow-hidden">
              <button onClick={() => setViewMode('card')} className={`px-3 py-2 text-sm ${viewMode === 'card' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button onClick={() => setViewMode('table')} className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">{t('common.showing')} {employees.length} {t('common.of')} {totalPages > 0 ? `~${totalPages * LIMIT}` : '0'}</div>
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map(emp => (
            <div key={emp._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow min-w-0">
              <div className="flex justify-between items-start mb-4 gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-slate-900 truncate" title={emp.fullName}>{emp.fullName}</h3>
                  <p className="text-slate-600 text-sm truncate" title={getDesigName(emp.designation)}>{getDesigName(emp.designation)}</p>
                  <p className="text-slate-400 text-xs truncate">{emp.employeeCode}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(emp)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  <button onClick={() => setDeleteTarget(emp._id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between gap-2"><span className="text-slate-500 shrink-0">{t('common.department')}:</span><span className="font-medium text-slate-900 text-right truncate min-w-0" title={getDeptName(emp.department)}>{getDeptName(emp.department)}</span></div>
                <div className="flex justify-between gap-2"><span className="text-slate-500 shrink-0">{t('common.joinDate')}:</span><span className="font-medium text-slate-900 text-right shrink-0">{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '-'}</span></div>
                <div className="flex justify-between gap-2"><span className="text-slate-500 shrink-0">{t('hr.monthlySalary')}:</span><span className="font-medium text-slate-900 text-right shrink-0">{emp.baseSalary ? `${t('common.currencyRs')}${emp.baseSalary.toLocaleString()}` : '-'}</span></div>
                <div className="flex justify-between gap-2 items-center"><span className="text-slate-500 shrink-0">{t('common.employmentType')}:</span><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${emp.employmentType === 'permanent' ? 'bg-blue-100 text-blue-700' : emp.employmentType === 'contract' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>{t('hr.' + emp.employmentType) || emp.employmentType || '-'}</span></div>
              </div>
              <div className="flex items-center justify-between">
                <select value={emp.status} onChange={e => handleStatusToggle(emp, e.target.value)} className={`text-xs font-semibold rounded-full px-3 py-1 border-0 focus:ring-0 cursor-pointer ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <option value="active">{t('common.active')}</option>
                  <option value="inactive">{t('common.inactive')}</option>
                </select>
                <button onClick={() => {}} className="text-sm text-cyan-600 hover:text-cyan-900 font-medium shrink-0">{t('hr.viewProfile')}</button>
              </div>
            </div>
          ))}
          {employees.length === 0 && !loading && <div className="col-span-full text-center py-20 text-slate-400">{t('common.noRecords')}</div>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('common.fullName')}</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.designationTitle')}</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('common.department')}</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('common.joinDate')}</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('hr.monthlySalary')}</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('common.employmentType')}</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('common.status')}</th>
                  <th className="px-5 py-3 font-semibold text-slate-600">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">{t('common.noRecords')}</td></tr>}
                {employees.map(emp => (
                  <tr key={emp._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      <div className="truncate max-w-[180px]" title={emp.fullName}>{emp.fullName}</div>
                      <div className="text-xs text-slate-400">{emp.employeeCode}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 truncate max-w-[150px]" title={getDesigName(emp.designation)}>{getDesigName(emp.designation)}</td>
                    <td className="px-5 py-3 text-slate-600 truncate max-w-[120px]" title={getDeptName(emp.department)}>{getDeptName(emp.department)}</td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '-'}</td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{emp.baseSalary ? `${t('common.currencyRs')}${emp.baseSalary.toLocaleString()}` : '-'}</td>
                    <td className="px-5 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${emp.employmentType === 'permanent' ? 'bg-blue-100 text-blue-700' : emp.employmentType === 'contract' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>{emp.employmentType || '-'}</span></td>
                    <td className="px-5 py-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{emp.status === 'active' ? t('common.active') : t('common.inactive')}</span></td>
                    <td className="px-5 py-3"><div className="flex gap-2">
                      <button onClick={() => handleEdit(emp)} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">{t('common.edit')}</button>
                      <button onClick={() => setDeleteTarget(emp._id)} className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100">{t('common.delete')}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">{t('common.previous')}</button>
          {pageNumbers.map(p => <button key={p} onClick={() => setPage(p)} className={`min-w-[36px] rounded-lg px-3 py-1.5 text-sm font-medium ${p === page ? 'bg-cyan-600 text-white shadow-sm' : 'border border-slate-300 text-slate-600 hover:bg-slate-100'}`}>{p}</button>)}
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">{t('common.next')}</button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-900 mb-4">{editingId ? t('common.edit') : t('hr.addNewEmployee')}</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('common.fullName')} *</label><input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('common.fatherName')}</label><input value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('common.email')}</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('common.phoneNumber')} *</label><input value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('common.department')}</label>
                  <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option value="">{t('common.select')}</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName || d.departmentCode}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('hr.designationTitle')}</label>
                  <select value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option value="">{t('common.select')}</option>
                    {designations.map(d => <option key={d._id} value={d._id}>{d.designationTitle}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('common.gender')} *</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option value="male">{t('common.male')}</option>
                    <option value="female">{t('common.female')}</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('common.employmentType')}</label>
                  <select value={form.employmentType} onChange={e => setForm({...form, employmentType: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option value="permanent">{t('hr.permanent')}</option>
                    <option value="contract">{t('hr.contract')}</option>
                    <option value="part-time">{t('hr.partTime')}</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('hr.monthlySalary')} {t('common.currencyRsLabel') || '(Rs.)'} *</label><input type="number" value={form.baseSalary} onChange={e => setForm({...form, baseSalary: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">{t('common.joinDate')}</label><CalendarDatePicker value={form.joiningDate} onChange={(date) => setForm({...form, joiningDate: date})} placeholder={t('common.selectDate')} /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">{t('common.currentAddress')}</label><textarea value={form.currentAddress} onChange={e => setForm({...form, currentAddress: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} /></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 rounded-lg bg-cyan-600 py-2.5 text-sm font-medium text-white hover:bg-cyan-700">{editingId ? t('common.update') : t('hr.addNewEmployee')}</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 rounded-lg bg-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-300">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900">{t('common.confirmDelete')}</h3>
            <p className="mt-2 text-sm text-slate-500">{t('hr.deleteRecordConfirm')}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">{t('common.cancel')}</button>
              <button onClick={confirmDelete} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">{t('common.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHREmployees;
