import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import { readStoredLanguage } from '../../../lib/languageStorage';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiUser } from 'react-icons/fi';
import api from '../../../lib/api';

const Section = ({ title, children }) => (
  <div className="p-6 border-b border-slate-200 last:border-b-0">
    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">{children}</div>
  </div>
);

const DetailRow = ({ label, value }) => {
  const { t } = useTranslation('admin');
  return (
    <div className="flex justify-between py-2 border-b border-slate-100">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-right max-w-[60%]">{value || value === 0 ? String(value) : t('common.na')}</span>
    </div>
  );
};

const StaffView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/hr/employees/${id}`)
      .then(res => setStaff(res.data?.data))
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

  if (loading) return <div className="p-6 text-slate-500">{t('common.loading')}</div>;
  if (!staff) return <div className="p-6 text-red-500">{t('users.staffNotFound')}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/admin/users/staff')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <FiArrowLeft size={18} /> {t('users.backToStaff')}
        </button>
        <button onClick={() => navigate(`/admin/users/staff/edit/${id}`)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <FiEdit size={16} /> {t('users.editStaff')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <FiUser className="text-purple-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{staff.fullName}</h1>
              <p className="text-slate-500">{t('users.staff')} · {staff.employeeCode || t('common.na')} · <span className={staff.status === 'active' ? 'text-green-600' : 'text-red-600'}>{staff.status}</span></p>
            </div>
          </div>
        </div>

        <Section title={t('users.employmentInfo')}>
          <DetailRow label={t('users.employeeCode')} value={staff.employeeCode} />
          <DetailRow label={t('users.employeeId')} value={staff.employeeCode} />
          <DetailRow label={t('users.employeeType')} value={staff.employeeType} />
          <DetailRow label={t('users.department')} value={staff.department?.departmentName} />
          <DetailRow label={t('users.department')} value={staff.designation?.designationTitle} />
          <DetailRow label={t('users.joiningDate')} value={staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : t('common.na')} />
          <DetailRow label={t('users.employmentType')} value={staff.employmentType} />
          <DetailRow label={t('users.shiftTiming')} value={staff.shiftTiming} />
          <DetailRow label={t('users.reportingManager')} value={staff.reportingManager?.fullName || t('common.na')} />
          <DetailRow label={t('users.status')} value={staff.status} />
          <DetailRow label={t('users.previousExperience')} value={staff.previousExperience ? t('users.years', { value: staff.previousExperience }) : t('common.na')} />
        </Section>

        <Section title={t('users.personalInformation')}>
          <DetailRow label={t('users.fullName')} value={staff.fullName} />
          <DetailRow label={t('users.fullNameArabic')} value={staff.fullNameArabic} />
          <DetailRow label={t('users.fatherName')} value={staff.fatherName} />
          <DetailRow label={t('users.dateOfBirth')} value={staff.dateOfBirth ? new Date(staff.dateOfBirth).toLocaleDateString() : t('common.na')} />
          <DetailRow label={t('users.gender')} value={staff.gender} />
          <DetailRow label={t('users.bloodGroup')} value={staff.bloodGroup} />
          <DetailRow label={t('users.maritalStatus')} value={staff.maritalStatus} />
          <DetailRow label={t('users.cnic')} value={staff.cnic} />
          <DetailRow label={t('users.highestQualification')} value={staff.highestQualification} />
          <DetailRow label={t('users.specialization')} value={staff.specialization} />
        </Section>

        <Section title={t('users.contactInformation')}>
          <DetailRow label={t('users.phoneNumber')} value={staff.phoneNumber} />
          <DetailRow label={t('users.secondaryPhone')} value={staff.secondaryPhone} />
          <DetailRow label={t('users.email')} value={staff.email} />
          <DetailRow label={t('users.currentAddress')} value={staff.currentAddress} />
          <DetailRow label={t('users.permanentAddress')} value={staff.permanentAddress} />
        </Section>

        <Section title={t('users.emergencyContact')}>
          <DetailRow label={t('users.emergencyContactName')} value={staff.emergencyContactName} />
          <DetailRow label={t('users.emergencyContactRelation')} value={staff.emergencyContactRelation} />
          <DetailRow label={t('users.emergencyContactPhone')} value={staff.emergencyContactPhone} />
        </Section>

        <Section title={t('users.salaryBankInfo')}>
          <DetailRow label={t('users.baseSalary')} value={staff.baseSalary ? `${staff.baseSalary}` : t('common.na')} />
          <DetailRow label={t('users.houseAllowance')} value={staff.houseAllowance ? `${staff.houseAllowance}` : t('common.na')} />
          <DetailRow label={t('users.transportAllowance')} value={staff.transportAllowance ? `${staff.transportAllowance}` : t('common.na')} />
          <DetailRow label={t('users.medicalAllowance')} value={staff.medicalAllowance ? `${staff.medicalAllowance}` : t('common.na')} />
          <DetailRow label={t('users.bankName')} value={staff.bankName} />
          <DetailRow label={t('users.accountNumber')} value={staff.accountNumber} />
          <DetailRow label={t('users.accountTitle')} value={staff.accountTitle} />
          <DetailRow label={t('users.paymentMethod')} value={staff.paymentMethod} />
        </Section>
      </div>
    </div>
  );
};

export default StaffView;
