import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import api from '../../../lib/api';

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

const StudentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', fatherName: '', grandfatherName: '',
    dob: '', bloodType: '', phone: '', whatsapp: '', email: '',
    guardianName: '', guardianRelationship: '', guardianPhone: '', guardianEmail: '',
    currentProvince: '', currentDistrict: '', currentVillage: '',
    permanentProvince: '', permanentDistrict: '', permanentVillage: '',
    isHostelResident: false, currentLevel: '', rollNo: '', section: 'A', status: 'active',
  });

  useEffect(() => {
    api.get(`/student/all/${id}`)
      .then(res => {
        const s = res.data?.data || {};
        setForm({
          firstName: s.firstName || '',
          lastName: s.lastName || '',
          fatherName: s.fatherName || '',
          grandfatherName: s.grandfatherName || '',
          dob: s.dob ? s.dob.split('T')[0] : '',
          bloodType: s.bloodType || '',
          phone: s.phone || '',
          whatsapp: s.whatsapp || '',
          email: s.email || '',
          guardianName: s.guardianName || '',
          guardianRelationship: s.guardianRelationship || '',
          guardianPhone: s.guardianPhone || '',
          guardianEmail: s.guardianEmail || '',
          currentProvince: s.currentAddress?.province || '',
          currentDistrict: s.currentAddress?.district || '',
          currentVillage: s.currentAddress?.village || '',
          permanentProvince: s.permanentAddress?.province || '',
          permanentDistrict: s.permanentAddress?.district || '',
          permanentVillage: s.permanentAddress?.village || '',
          isHostelResident: s.isHostelResident || false,
          currentLevel: s.currentLevel || '',
          rollNo: s.rollNo || s.studentCode || '',
          section: s.section || 'A',
          status: s.status || 'active',
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
    firstName: form.firstName,
    lastName: form.lastName,
    fatherName: form.fatherName,
    grandfatherName: form.grandfatherName,
    dob: form.dob || undefined,
    bloodType: form.bloodType || undefined,
    phone: form.phone,
    whatsapp: form.whatsapp,
    email: form.email,
    guardianName: form.guardianName,
    guardianRelationship: form.guardianRelationship,
    guardianPhone: form.guardianPhone,
    guardianEmail: form.guardianEmail,
    currentAddress: { province: form.currentProvince, district: form.currentDistrict, village: form.currentVillage },
    permanentAddress: { province: form.permanentProvince, district: form.permanentDistrict, village: form.permanentVillage },
    isHostelResident: form.isHostelResident,
    currentLevel: form.currentLevel,
    section: form.section,
    status: form.status,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/student/all/${id}`, buildPayload());
      navigate(`/admin/users/students/view/${id}`);
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
        <button onClick={() => navigate('/admin/users/students')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <FiArrowLeft size={18} /> {t('common.back')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('users.editStudent')}</h1>
        <form onSubmit={handleSubmit} className="space-y-8">

          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">{t('users.academicInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label={t('users.rollNo')} value={form.rollNo} onChange={e => setForm({...form, rollNo: e.target.value})} />
              <Field label={t('users.section')} value={form.section} onChange={e => setForm({...form, section: e.target.value})} />
              <Field label={t('users.currentLevel')} value={form.currentLevel} onChange={e => setForm({...form, currentLevel: e.target.value})} />
              <Field label={t('users.status')} value={form.status} onChange={e => setForm({...form, status: e.target.value})} options={[
                { value: 'active', label: t('users.active') }, { value: 'inactive', label: t('users.inactive') },
              ]} />
              <Field label={t('users.hostelResident')} value={form.isHostelResident ? 'true' : 'false'} onChange={e => setForm({...form, isHostelResident: e.target.value === 'true'})} options={[
                { value: 'false', label: t('users.no') }, { value: 'true', label: t('users.yes') },
              ]} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">{t('users.personalInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label={t('users.firstName')} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
              <Field label={t('users.lastName')} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
              <Field label={t('users.fatherName')} value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} />
              <Field label={t('users.fatherName')} value={form.grandfatherName} onChange={e => setForm({...form, grandfatherName: e.target.value})} />
              <Field label={t('users.dateOfBirth')} type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
              <Field label={t('users.bloodGroup')} value={form.bloodType} onChange={e => setForm({...form, bloodType: e.target.value})} options={[
                { value: '', label: t('users.selectBlood') }, { value: 'A+', label: t('users.bloodTypeA+') }, { value: 'A-', label: t('users.bloodTypeA-') },
                { value: 'B+', label: t('users.bloodTypeB+') }, { value: 'B-', label: t('users.bloodTypeB-') }, { value: 'O+', label: t('users.bloodTypeO+') },
                { value: 'O-', label: t('users.bloodTypeO-') }, { value: 'AB+', label: t('users.bloodTypeAB+') }, { value: 'AB-', label: t('users.bloodTypeAB-') },
              ]} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">{t('users.contactInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label={t('users.phone')} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              <Field label={t('users.phone')} value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} />
              <Field label={t('users.email')} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">{t('users.currentAddress')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label={t('users.province')} value={form.currentProvince} onChange={e => setForm({...form, currentProvince: e.target.value})} />
              <Field label={t('users.district')} value={form.currentDistrict} onChange={e => setForm({...form, currentDistrict: e.target.value})} />
              <Field label={t('users.village')} value={form.currentVillage} onChange={e => setForm({...form, currentVillage: e.target.value})} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">{t('users.permanentAddress')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label={t('users.province')} value={form.permanentProvince} onChange={e => setForm({...form, permanentProvince: e.target.value})} />
              <Field label={t('users.district')} value={form.permanentDistrict} onChange={e => setForm({...form, permanentDistrict: e.target.value})} />
              <Field label={t('users.village')} value={form.permanentVillage} onChange={e => setForm({...form, permanentVillage: e.target.value})} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">{t('users.guardianInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label={t('users.guardianName')} value={form.guardianName} onChange={e => setForm({...form, guardianName: e.target.value})} />
              <Field label={t('users.relationship')} value={form.guardianRelationship} onChange={e => setForm({...form, guardianRelationship: e.target.value})} />
              <Field label={t('users.guardianPhone')} value={form.guardianPhone} onChange={e => setForm({...form, guardianPhone: e.target.value})} />
              <Field label={t('users.guardianEmail')} type="email" value={form.guardianEmail} onChange={e => setForm({...form, guardianEmail: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <FiSave size={16} /> {saving ? t('users.saving') : t('users.saveChanges')}
            </button>
            <button type="button" onClick={() => navigate(`/admin/users/students/view/${id}`)} className="px-6 py-2 border rounded-lg hover:bg-slate-50">{t('users.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentEdit;
