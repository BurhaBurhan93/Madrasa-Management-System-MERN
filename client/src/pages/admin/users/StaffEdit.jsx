import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import api from '../../../lib/api';

const EMPLOYEE_TYPES = [
  { value: 'admin', label: 'Admin' }, { value: 'finance', label: 'Finance' },
  { value: 'registrar', label: 'Registrar' }, { value: 'hr', label: 'HR' },
  { value: 'librarian', label: 'Librarian' }, { value: 'kitchen', label: 'Kitchen' },
  { value: 'security', label: 'Security' }, { value: 'support', label: 'Support' },
  { value: 'maintenance', label: 'Maintenance' }, { value: 'payroll', label: 'Payroll' },
  { value: 'complaints', label: 'Complaints' }, { value: 'inventory', label: 'Inventory' },
];

const Field = ({ label, value, onChange, type = 'text', options, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    {options ? (
      <select value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea value={value} onChange={onChange} rows={2} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder={placeholder} />
    ) : (
      <input type={type} value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder={placeholder} />
    )}
  </div>
);

const StaffEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '', fullNameArabic: '', fatherName: '', dateOfBirth: '',
    gender: 'male', employeeType: 'support', bloodGroup: '', maritalStatus: '', cnic: '',
    phoneNumber: '', secondaryPhone: '', email: '',
    currentAddress: '', permanentAddress: '',
    emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '',
    highestQualification: '', specialization: '', previousExperience: '',
    shiftTiming: '', employmentType: 'permanent',
    baseSalary: '', houseAllowance: '', transportAllowance: '', medicalAllowance: '',
    bankName: '', accountNumber: '', accountTitle: '', paymentMethod: 'cash',
    status: 'active',
  });

  useEffect(() => {
    api.get(`/hr/employees/${id}`)
      .then(res => {
        const e = res.data?.data || {};
        setForm({
          fullName: e.fullName || '',
          fullNameArabic: e.fullNameArabic || '',
          fatherName: e.fatherName || '',
          dateOfBirth: e.dateOfBirth ? e.dateOfBirth.split('T')[0] : '',
          gender: e.gender || 'male',
          employeeType: e.employeeType || 'support',
          bloodGroup: e.bloodGroup || '',
          maritalStatus: e.maritalStatus || '',
          cnic: e.cnic || '',
          phoneNumber: e.phoneNumber || '',
          secondaryPhone: e.secondaryPhone || '',
          email: e.email || '',
          currentAddress: e.currentAddress || '',
          permanentAddress: e.permanentAddress || '',
          emergencyContactName: e.emergencyContactName || '',
          emergencyContactRelation: e.emergencyContactRelation || '',
          emergencyContactPhone: e.emergencyContactPhone || '',
          highestQualification: e.highestQualification || '',
          specialization: e.specialization || '',
          previousExperience: e.previousExperience || '',
          shiftTiming: e.shiftTiming || '',
          employmentType: e.employmentType || 'permanent',
          baseSalary: e.baseSalary || '',
          houseAllowance: e.houseAllowance || '',
          transportAllowance: e.transportAllowance || '',
          medicalAllowance: e.medicalAllowance || '',
          bankName: e.bankName || '',
          accountNumber: e.accountNumber || '',
          accountTitle: e.accountTitle || '',
          paymentMethod: e.paymentMethod || 'cash',
          status: e.status || 'active',
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const syncLang = () => {
      const lang = readStoredLanguage('adminLang', 'en');
      if (i18n.language !== lang) i18n.changeLanguage(lang);
    };
    syncLang();
    window.addEventListener('storage', syncLang);
    return () => window.removeEventListener('storage', syncLang);
  }, []);

  const buildPayload = () => ({
    fullName: form.fullName,
    fullNameArabic: form.fullNameArabic || undefined,
    fatherName: form.fatherName || undefined,
    dateOfBirth: form.dateOfBirth || undefined,
    gender: form.gender,
    employeeType: form.employeeType,
    bloodGroup: form.bloodGroup || undefined,
    maritalStatus: form.maritalStatus || undefined,
    cnic: form.cnic || undefined,
    phoneNumber: form.phoneNumber,
    secondaryPhone: form.secondaryPhone || undefined,
    email: form.email || undefined,
    currentAddress: form.currentAddress || undefined,
    permanentAddress: form.permanentAddress || undefined,
    emergencyContactName: form.emergencyContactName || undefined,
    emergencyContactRelation: form.emergencyContactRelation || undefined,
    emergencyContactPhone: form.emergencyContactPhone || undefined,
    highestQualification: form.highestQualification || undefined,
    specialization: form.specialization || undefined,
    previousExperience: form.previousExperience ? Number(form.previousExperience) : undefined,
    shiftTiming: form.shiftTiming || undefined,
    employmentType: form.employmentType,
    baseSalary: form.baseSalary ? Number(form.baseSalary) : 0,
    houseAllowance: form.houseAllowance ? Number(form.houseAllowance) : 0,
    transportAllowance: form.transportAllowance ? Number(form.transportAllowance) : 0,
    medicalAllowance: form.medicalAllowance ? Number(form.medicalAllowance) : 0,
    bankName: form.bankName || undefined,
    accountNumber: form.accountNumber || undefined,
    accountTitle: form.accountTitle || undefined,
    paymentMethod: form.paymentMethod,
    status: form.status,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/hr/employees/${id}`, buildPayload());
      navigate(`/admin/users/staff/view/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || t('users.failedToUpdate'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-slate-500">{t('common.loading')}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/users/staff')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <FiArrowLeft size={18} /> {t('common.back')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('users.editStaff')}</h1>
        <form onSubmit={handleSubmit} className="space-y-8">

          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">{t('users.employmentInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label={t('users.employeeType')} value={form.employeeType} onChange={e => setForm({...form, employeeType: e.target.value})} options={EMPLOYEE_TYPES.map(et => ({ ...et, label: t(`users.employeeTypes.${et.value}`) }))} />
              <Field label={t('users.employmentType')} value={form.employmentType} onChange={e => setForm({...form, employmentType: e.target.value})} options={[
                { value: 'permanent', label: t('users.permanent') }, { value: 'contract', label: t('users.contract') }, { value: 'part-time', label: t('users.partTime') },
              ]} />
              <Field label={t('users.shiftTiming')} value={form.shiftTiming} onChange={e => setForm({...form, shiftTiming: e.target.value})} placeholder={t('users.shiftTimingPlaceholder')} />
              <Field label={t('users.previousExperience')} type="number" value={form.previousExperience} onChange={e => setForm({...form, previousExperience: e.target.value})} />
              <Field label={t('users.status')} value={form.status} onChange={e => setForm({...form, status: e.target.value})} options={[
                { value: 'active', label: t('users.active') }, { value: 'inactive', label: t('users.inactive') },
              ]} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">{t('users.personalInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label={t('users.fullName')} value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
              <Field label={t('users.fullNameArabic')} value={form.fullNameArabic} onChange={e => setForm({...form, fullNameArabic: e.target.value})} />
              <Field label={t('users.fatherName')} value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} />
              <Field label={t('users.dateOfBirth')} type="date" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} />
              <Field label={t('users.gender')} value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} options={[
                { value: 'male', label: t('users.male') }, { value: 'female', label: t('users.female') },
              ]} />
              <Field label={t('users.maritalStatus')} value={form.maritalStatus} onChange={e => setForm({...form, maritalStatus: e.target.value})} options={[
                { value: '', label: t('users.selectBlood') }, { value: 'single', label: t('users.single') },
                { value: 'married', label: t('users.married') }, { value: 'divorced', label: t('users.divorced') },
                { value: 'widowed', label: t('users.widowed') },
              ]} />
              <Field label={t('users.bloodGroup')} value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})} />
              <Field label={t('users.cnic')} value={form.cnic} onChange={e => setForm({...form, cnic: e.target.value})} />
              <Field label={t('users.highestQualification')} value={form.highestQualification} onChange={e => setForm({...form, highestQualification: e.target.value})} />
              <Field label={t('users.specialization')} value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">{t('users.contactInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label={t('users.phoneNumber')} value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} />
              <Field label={t('users.secondaryPhone')} value={form.secondaryPhone} onChange={e => setForm({...form, secondaryPhone: e.target.value})} />
              <Field label={t('users.email')} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">{t('users.address')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={t('users.currentAddress')} type="textarea" value={form.currentAddress} onChange={e => setForm({...form, currentAddress: e.target.value})} />
              <Field label={t('users.permanentAddress')} type="textarea" value={form.permanentAddress} onChange={e => setForm({...form, permanentAddress: e.target.value})} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">{t('users.emergencyContact')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label={t('users.emergencyContactName')} value={form.emergencyContactName} onChange={e => setForm({...form, emergencyContactName: e.target.value})} />
              <Field label={t('users.emergencyContactRelation')} value={form.emergencyContactRelation} onChange={e => setForm({...form, emergencyContactRelation: e.target.value})} />
              <Field label={t('users.emergencyContactPhone')} value={form.emergencyContactPhone} onChange={e => setForm({...form, emergencyContactPhone: e.target.value})} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">{t('users.salaryBankInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Field label={t('users.baseSalary')} type="number" value={form.baseSalary} onChange={e => setForm({...form, baseSalary: e.target.value})} />
              <Field label={t('users.houseAllowance')} type="number" value={form.houseAllowance} onChange={e => setForm({...form, houseAllowance: e.target.value})} />
              <Field label={t('users.transportAllowance')} type="number" value={form.transportAllowance} onChange={e => setForm({...form, transportAllowance: e.target.value})} />
              <Field label={t('users.medicalAllowance')} type="number" value={form.medicalAllowance} onChange={e => setForm({...form, medicalAllowance: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <Field label={t('users.bankName')} value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} />
              <Field label={t('users.accountNumber')} value={form.accountNumber} onChange={e => setForm({...form, accountNumber: e.target.value})} />
              <Field label={t('users.accountTitle')} value={form.accountTitle} onChange={e => setForm({...form, accountTitle: e.target.value})} />
              <Field label={t('users.paymentMethod')} value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} options={[
                { value: 'cash', label: t('users.cash') }, { value: 'bank', label: t('users.bankTransfer') },
              ]} />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <FiSave size={16} /> {saving ? t('users.saving') : t('users.saveChanges')}
            </button>
            <button type="button" onClick={() => navigate(`/admin/users/staff/view/${id}`)} className="px-6 py-2 border rounded-lg hover:bg-slate-50">{t('users.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffEdit;
