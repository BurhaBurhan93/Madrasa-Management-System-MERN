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

const TeacherView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/hr/employees/${id}`)
      .then(res => setTeacher(res.data?.data))
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
  if (!teacher) return <div className="p-6 text-red-500">{t('users.teacherNotFound')}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/admin/users/teachers')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <FiArrowLeft size={18} /> {t('users.backToTeachers')}
        </button>
        <button onClick={() => navigate(`/admin/users/teachers/edit/${id}`)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <FiEdit size={16} /> {t('users.editTeacher')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <FiUser className="text-green-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{teacher.fullName}</h1>
              <p className="text-slate-500">{t('users.teacher')} <span className="mx-1 text-slate-300">·</span> {teacher.employeeCode || t('common.na')} <span className="mx-1 text-slate-300">·</span> <span className={teacher.status === 'active' ? 'text-green-600' : 'text-red-600'}>{t('common.' + teacher.status) || teacher.status}</span></p>
            </div>
          </div>
        </div>

        <Section title={t('users.employmentInfo')}>
          <DetailRow label={t('users.employeeCode')} value={teacher.employeeCode} />
          <DetailRow label={t('users.employeeId')} value={teacher.employeeCode} />
          <DetailRow label={t('users.department')} value={teacher.department?.departmentName} />
          <DetailRow label={t('users.department')} value={teacher.designation?.designationTitle} />
          <DetailRow label={t('users.joiningDate')} value={teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : t('common.na')} />
          <DetailRow label={t('users.employmentType')} value={teacher.employmentType} />
          <DetailRow label={t('users.shiftTiming')} value={teacher.shiftTiming} />
          <DetailRow label={t('users.reportingManager')} value={teacher.reportingManager?.fullName || t('common.na')} />
          <DetailRow label={t('users.status')} value={t('common.' + teacher.status) || teacher.status} />
          <DetailRow label={t('users.previousExperience')} value={teacher.previousExperience ? t('users.years', { value: teacher.previousExperience }) : t('common.na')} />
        </Section>

        <Section title={t('users.personalInformation')}>
          <DetailRow label={t('users.fullName')} value={teacher.fullName} />
          <DetailRow label={t('users.fullNameArabic')} value={teacher.fullNameArabic} />
          <DetailRow label={t('users.fatherName')} value={teacher.fatherName} />
          <DetailRow label={t('users.dateOfBirth')} value={teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : t('common.na')} />
          <DetailRow label={t('users.gender')} value={teacher.gender} />
          <DetailRow label={t('users.bloodGroup')} value={teacher.bloodGroup} />
          <DetailRow label={t('users.maritalStatus')} value={teacher.maritalStatus} />
          <DetailRow label={t('users.cnic')} value={teacher.cnic} />
          <DetailRow label={t('users.highestQualification')} value={teacher.highestQualification} />
          <DetailRow label={t('users.specialization')} value={teacher.specialization} />
        </Section>

        <Section title={t('users.contactInformation')}>
          <DetailRow label={t('users.phoneNumber')} value={teacher.phoneNumber} />
          <DetailRow label={t('users.secondaryPhone')} value={teacher.secondaryPhone} />
          <DetailRow label={t('users.email')} value={teacher.email} />
          <DetailRow label={t('users.currentAddress')} value={teacher.currentAddress} />
          <DetailRow label={t('users.permanentAddress')} value={teacher.permanentAddress} />
        </Section>

        <Section title={t('users.emergencyContact')}>
          <DetailRow label={t('users.emergencyContactName')} value={teacher.emergencyContactName} />
          <DetailRow label={t('users.emergencyContactRelation')} value={teacher.emergencyContactRelation} />
          <DetailRow label={t('users.emergencyContactPhone')} value={teacher.emergencyContactPhone} />
        </Section>

        <Section title={t('users.salaryBankInfo')}>
          <DetailRow label={t('users.baseSalary')} value={teacher.baseSalary ? `${teacher.baseSalary}` : t('common.na')} />
          <DetailRow label={t('users.houseAllowance')} value={teacher.houseAllowance ? `${teacher.houseAllowance}` : t('common.na')} />
          <DetailRow label={t('users.transportAllowance')} value={teacher.transportAllowance ? `${teacher.transportAllowance}` : t('common.na')} />
          <DetailRow label={t('users.medicalAllowance')} value={teacher.medicalAllowance ? `${teacher.medicalAllowance}` : t('common.na')} />
          <DetailRow label={t('users.bankName')} value={teacher.bankName} />
          <DetailRow label={t('users.accountNumber')} value={teacher.accountNumber} />
          <DetailRow label={t('users.accountTitle')} value={teacher.accountTitle} />
          <DetailRow label={t('users.paymentMethod')} value={teacher.paymentMethod} />
        </Section>
      </div>
    </div>
  );
};

export default TeacherView;
