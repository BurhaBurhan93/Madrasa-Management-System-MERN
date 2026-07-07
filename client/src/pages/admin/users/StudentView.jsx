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

const StudentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/student/all/${id}`)
      .then(res => setStudent(res.data?.data))
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
  if (!student) return <div className="p-6 text-red-500">{t('users.studentNotFound')}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/admin/users/students')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <FiArrowLeft size={18} /> {t('users.backToStudents')}
        </button>
        <button onClick={() => navigate(`/admin/users/students/edit/${id}`)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <FiEdit size={16} /> {t('users.editStudent')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <FiUser className="text-blue-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || t('users.unknown')}</h1>
              <p className="text-slate-500">{t('users.student')} · {student.studentCode || t('common.na')} · <span className={student.status === 'active' ? 'text-green-600' : 'text-red-600'}>{student.status}</span></p>
            </div>
          </div>
        </div>

        <Section title={t('users.academicInfo')}>
          <DetailRow label={t('users.studentCode')} value={student.studentCode} />
          <DetailRow label={t('users.rollNo')} value={student.rollNo || student.studentCode} />
          <DetailRow label={t('users.class')} value={student.currentClass?.name} />
          <DetailRow label={t('users.section')} value={student.section || t('users.sectionADefault')} />
          <DetailRow label={t('users.currentLevel')} value={student.currentLevel} />
          <DetailRow label={t('users.admissionDate')} value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : t('common.na')} />
          <DetailRow label={t('users.status')} value={student.status} />
          <DetailRow label={t('users.hostelResident')} value={student.isHostelResident ? t('users.yes') : t('users.no')} />
          <DetailRow label={t('users.createdAt')} value={student.createdAt ? new Date(student.createdAt).toLocaleDateString() : t('common.na')} />
        </Section>

        <Section title={t('users.personalInformation')}>
          <DetailRow label={t('users.firstName')} value={student.firstName} />
          <DetailRow label={t('users.lastName')} value={student.lastName} />
          <DetailRow label={t('users.fatherName')} value={student.fatherName} />
          <DetailRow label={t('users.fatherName')} value={student.grandfatherName} />
          <DetailRow label={t('users.dateOfBirth')} value={student.dob ? new Date(student.dob).toLocaleDateString() : t('common.na')} />
          <DetailRow label={t('users.bloodGroup')} value={student.bloodType} />
          <DetailRow label={t('users.currentAddress')} value={student.currentAddress?.province} />
          <DetailRow label={t('users.currentAddress')} value={student.currentAddress?.district} />
          <DetailRow label={t('users.currentAddress')} value={student.currentAddress?.village} />
          <DetailRow label={t('users.permanentAddress')} value={student.permanentAddress?.province} />
          <DetailRow label={t('users.permanentAddress')} value={student.permanentAddress?.district} />
          <DetailRow label={t('users.permanentAddress')} value={student.permanentAddress?.village} />
        </Section>

        <Section title={t('users.contactInformation')}>
          <DetailRow label={t('users.email')} value={student.email || student.user?.email} />
          <DetailRow label={t('users.phone')} value={student.phone || student.user?.phone} />
          <DetailRow label={t('users.phone')} value={student.whatsapp} />
          <DetailRow label={t('users.email')} value={student.user?.email} />
          <DetailRow label={t('users.phone')} value={student.user?.phone} />
        </Section>

        <Section title={t('users.guardianInfo')}>
          <DetailRow label={t('users.guardianName')} value={student.guardianName} />
          <DetailRow label={t('users.relationship')} value={student.guardianRelationship} />
          <DetailRow label={t('users.guardianPhone')} value={student.guardianPhone} />
          <DetailRow label={t('users.guardianEmail')} value={student.guardianEmail} />
        </Section>
      </div>
    </div>
  );
};

export default StudentView;
