import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../components/UIHelper/Card';
import Badge from '../../../components/UIHelper/Badge';
import Button from '../../../components/UIHelper/Button';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatAuditValue = (val) => {
  if (val === null || val === undefined) return 'N/A';
  if (typeof val === 'object') {
    try { return JSON.stringify(val); } catch { return String(val); }
  }
  return String(val);
};

const DataCorrection = () => {
  const { t } = useTranslation(['staff', 'common']);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [changeLogs, setChangeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [correctionData, setCorrectionData] = useState({
    field: '',
    oldValue: '',
    newValue: '',
    reason: ''
  });

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchChangeLogs(selectedStudent._id);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/student/all`, getConfig());
      setStudents(response.data.data || []);
    } catch (err) {
      setError(t('registrar.dataCorrection.errors.fetchFailed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeLogs = async (studentId) => {
    try {
      setChangeLogs([]);
      const response = await axios.get(`${API_BASE}/student/Student/${studentId}/audit-logs`, getConfig());
      setChangeLogs(response.data?.data || response.data || []);
    } catch (err) {
      console.error(t('registrar.dataCorrection.errors.fetchLogsFailed'), err);
    }
  };

  const handleOpenCorrection = (student, field, currentValue) => {
    setSelectedStudent(student);
    setCorrectionData({
      field,
      oldValue: currentValue,
      newValue: currentValue,
      reason: ''
    });
    setShowCorrectionForm(true);
  };

  const handleSubmitCorrection = async () => {
    if (!selectedStudent || !correctionData.newValue || !correctionData.reason) {
      alert(t('registrar.dataCorrection.errors.fillAllFields'));
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/student/students/${selectedStudent._id}/correct-data`,
        {
          field: correctionData.field,
          oldValue: correctionData.oldValue,
          newValue: correctionData.newValue,
          reason: correctionData.reason
        },
        getConfig()
      );

      alert(t('registrar.dataCorrection.success'));
      setShowCorrectionForm(false);
      fetchStudents();
    } catch (error) {
      console.error(t('registrar.dataCorrection.errors.correctionError'), error);
      alert(error.response?.data?.message || t('registrar.dataCorrection.errors.submitFailed'));
    }
  };

  const getFieldType = (field) => {
    const types = {
      firstName: 'text',
      lastName: 'text',
      fatherName: 'text',
      grandfatherName: 'text',
      dob: 'date',
      bloodType: 'select',
      phone: 'tel',
      whatsapp: 'tel',
      email: 'email',
      permanentAddress_province: 'text',
      permanentAddress_district: 'text',
      permanentAddress_village: 'text',
      currentAddress_province: 'text',
      currentAddress_district: 'text',
      currentAddress_village: 'text',
      studentCode: 'text',
      currentClass: 'relation',
      currentLevel: 'text',
      status: 'select'
    };
    return types[field] || 'text';
  };

  const getCorrectionFieldKey = (label) => {
    const map = {
      'First Name': 'firstName',
      'Last Name': 'lastName',
      'Father Name': 'fatherName',
      'Grandfather Name': 'grandfatherName',
      'Date of Birth': 'dob',
      'Blood Type': 'bloodType',
      'Phone': 'phone',
      'WhatsApp': 'whatsapp',
      'Email': 'email',
      'Student Code': 'studentCode',
      'Current Class': 'currentClass',
      'Current Level': 'currentLevel',
      'Status': 'status'
    };
    return map[label] || label.toLowerCase().replace(/\s+/g, '_');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('registrar.dataCorrection.loading')}</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="w-full bg-transparent min-h-screen p-3 sm:p-4 lg:p-6">
        <Card className="rounded-[28px] border border-rose-200 bg-rose-50 mb-6">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-rose-900">{t('registrar.dataCorrection.errors.unableToLoad')}</h3>
                <p className="mt-1 text-sm text-rose-700">{error}</p>
                <button onClick={fetchStudents} className="mt-3 inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors">
                  {t('registrar.dataCorrection.retry')}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full bg-transparent min-h-screen p-3 sm:p-4 lg:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('registrar.dataCorrection.title')}</h1>
        <p className="text-gray-600">{t('registrar.dataCorrection.subtitle')}</p>
      </div>

      <Card className="mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-transparent">
              <tr>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('registrar.dataCorrection.table.studentCode')}</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('registrar.dataCorrection.table.name')}</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('registrar.dataCorrection.table.fatherName')}</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('registrar.dataCorrection.table.class')}</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('registrar.dataCorrection.table.phone')}</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('registrar.dataCorrection.table.level')}</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('registrar.dataCorrection.table.status')}</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('registrar.dataCorrection.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student._id}>
                  <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.studentCode || t('registrar.dataCorrection.table.na')}
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">
                      {`${student.firstName || ''} ${student.lastName || ''}`.trim() || student.user?.name || '-'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.fatherName || '-'}
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.currentClass?.name || student.currentClass?.className || t('registrar.dataCorrection.table.notAssigned')}
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.phone || student.user?.phone || '-'}
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.currentLevel || '-'}
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-800' : student.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {student.status || t('registrar.dataCorrection.table.na')}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {t('registrar.dataCorrection.table.viewHistory')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedStudent && (
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => fetchChangeLogs(selectedStudent._id)}
              className="text-xl font-semibold text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer text-left"
            >
              {t('registrar.dataCorrection.changeHistory')} {selectedStudent.firstName} {selectedStudent.lastName}
            </button>
            <button
              onClick={() => { setSelectedStudent(null); setChangeLogs([]); }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ {t('registrar.dataCorrection.close')}
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries({
                [t('registrar.dataCorrection.fields.firstName')]: selectedStudent.firstName,
                [t('registrar.dataCorrection.fields.lastName')]: selectedStudent.lastName,
                [t('registrar.dataCorrection.fields.fatherName')]: selectedStudent.fatherName,
                [t('registrar.dataCorrection.fields.grandfatherName')]: selectedStudent.grandfatherName,
                [t('registrar.dataCorrection.fields.dateOfBirth')]: selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : t('registrar.dataCorrection.table.na'),
                [t('registrar.dataCorrection.fields.bloodType')]: selectedStudent.bloodType || t('registrar.dataCorrection.table.na'),
                [t('registrar.dataCorrection.fields.currentClass')]: selectedStudent.currentClass?.name || selectedStudent.currentClass?.className || t('registrar.dataCorrection.table.notAssigned'),
                [t('registrar.dataCorrection.fields.phone')]: selectedStudent.phone || selectedStudent.user?.phone || t('registrar.dataCorrection.table.na'),
                [t('registrar.dataCorrection.fields.whatsapp')]: selectedStudent.whatsapp || t('registrar.dataCorrection.table.na'),
                [t('registrar.dataCorrection.fields.email')]: selectedStudent.email || selectedStudent.user?.email || t('registrar.dataCorrection.table.na'),
                [t('registrar.dataCorrection.fields.studentCode')]: selectedStudent.studentCode || t('registrar.dataCorrection.table.na'),
                [t('registrar.dataCorrection.fields.currentLevel')]: selectedStudent.currentLevel || t('registrar.dataCorrection.table.na'),
                [t('registrar.dataCorrection.fields.status')]: selectedStudent.status || t('registrar.dataCorrection.table.na')
              }).map(([field, value]) => (
                <div key={field} className="border rounded-lg p-3 hover:bg-transparent">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-700">{field}</span>
                    <button
                      onClick={() => handleOpenCorrection(selectedStudent, getCorrectionFieldKey(field), value)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ✏️ {t('registrar.dataCorrection.correct')}
                    </button>
                  </div>
                  <p className="text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">{t('registrar.dataCorrection.recentChanges')}</h3>
              {changeLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2">{t('registrar.dataCorrection.noChangeHistory')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {changeLogs.map((log, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-transparent">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{log.changedBy?.name || t('registrar.dataCorrection.unknown')}</span> {t('registrar.dataCorrection.changed')}{' '}
                        <span className="font-medium">{log.field}</span> {t('registrar.dataCorrection.from')}{' '}
                        <span className="text-red-600">{formatAuditValue(log.oldValue)}</span> {t('registrar.dataCorrection.to')}{' '}
                        <span className="text-green-600">{formatAuditValue(log.newValue)}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('registrar.dataCorrection.reason')}: {log.reason} | {new Date(log.changedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {showCorrectionForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-transparent rounded-lg p-3 sm:p-4 lg:p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">{t('registrar.dataCorrection.correctionForm.title')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registrar.dataCorrection.correctionForm.fieldToCorrect')}
                </label>
                <p className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-transparent text-gray-700 text-sm">
                  {correctionData.field.replace(/_/g, ' ')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registrar.dataCorrection.correctionForm.currentValue')}
                </label>
                <p className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-transparent text-gray-700 text-sm">
                  {correctionData.oldValue}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registrar.dataCorrection.correctionForm.newValue')} *
                </label>
                <input
                  type="text"
                  value={correctionData.newValue}
                  onChange={(e) => setCorrectionData({...correctionData, newValue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={t('registrar.dataCorrection.correctionForm.enterCorrectedValue')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registrar.dataCorrection.correctionForm.reasonForCorrection')} *
                </label>
                <textarea
                  value={correctionData.reason}
                  onChange={(e) => setCorrectionData({...correctionData, reason: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={t('registrar.dataCorrection.correctionForm.explainReason')}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowCorrectionForm(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitCorrection}
                  disabled={!correctionData.newValue || !correctionData.reason}
                >
                  {t('registrar.dataCorrection.correctionForm.submitCorrection')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataCorrection;
