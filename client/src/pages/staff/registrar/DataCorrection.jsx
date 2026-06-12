import React, { useState, useEffect } from 'react';
import Card from '../../../components/UIHelper/Card';
import Badge from '../../../components/UIHelper/Badge';
import Button from '../../../components/UIHelper/Button';
import axios from 'axios';

const DataCorrection = () => {
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
      const response = await axios.get('http://localhost:5000/api/students/all', getConfig());
      setStudents(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeLogs = async (studentId) => {
    try {
      setChangeLogs([]);
    } catch (err) {
      console.error('Failed to fetch change logs:', err);
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
      alert('Please fill all fields and provide a reason for the change');
      return;
    }

    try {
      // Call the correction endpoint
      await axios.post(
        `http://localhost:5000/api/students/${selectedStudent._id}/correct-data`,
        {
          field: correctionData.field,
          oldValue: correctionData.oldValue,
          newValue: correctionData.newValue,
          reason: correctionData.reason
        },
        getConfig()
      );

      alert('Data correction submitted successfully!');
      setShowCorrectionForm(false);
      fetchStudents();
    } catch (error) {
      console.error('Correction error:', error);
      alert(error.response?.data?.message || 'Failed to submit correction');
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading students...</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen p-6">
        <Card className="rounded-[28px] border border-rose-200 bg-rose-50 mb-6">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-rose-900">Unable to Load Data</h3>
                <p className="mt-1 text-sm text-rose-700">{error}</p>
                <button onClick={fetchStudents} className="mt-3 inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Correction & Audit Trail</h1>
        <p className="text-gray-600">Correct student data with full audit trail and change history</p>
      </div>

      {/* Students List */}
      <Card className="mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Father Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.studentCode || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">
                      {`${student.firstName || ''} ${student.lastName || ''}`.trim() || student.user?.name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.fatherName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.currentClass?.className || 'Not Assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Change History Panel */}
      {selectedStudent && (
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Change History: {selectedStudent.firstName} {selectedStudent.lastName}
            </h2>
            <button
              onClick={() => setSelectedStudent(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-4">
            {/* Editable Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries({
                'First Name': selectedStudent.firstName,
                'Last Name': selectedStudent.lastName,
                'Father Name': selectedStudent.fatherName,
                'Grandfather Name': selectedStudent.grandfatherName,
                'Date of Birth': selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : 'N/A',
                'Blood Type': selectedStudent.bloodType || 'N/A',
                'Phone': selectedStudent.phone || selectedStudent.user?.phone || 'N/A',
                'WhatsApp': selectedStudent.whatsapp || 'N/A',
                'Email': selectedStudent.email || selectedStudent.user?.email || 'N/A',
                'Student Code': selectedStudent.studentCode || 'N/A',
                'Current Level': selectedStudent.currentLevel || 'N/A',
                'Status': selectedStudent.status || 'N/A'
              }).map(([field, value]) => (
                <div key={field} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-700">{field}</span>
                    <button
                      onClick={() => handleOpenCorrection(selectedStudent, field.toLowerCase().replace(/\s+/g, '_'), value)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ✏️ Correct
                    </button>
                  </div>
                  <p className="text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Change Logs */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Recent Changes</h3>
              {changeLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2">No change history found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {changeLogs.map((log, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{log.changedBy?.name || 'Unknown'}</span> changed{' '}
                        <span className="font-medium">{log.field}</span> from{' '}
                        <span className="text-red-600">{log.oldValue}</span> to{' '}
                        <span className="text-green-600">{log.newValue}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Reason: {log.reason} | {new Date(log.changedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Correction Form Modal */}
      {showCorrectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Submit Data Correction</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field to Correct
                </label>
                <input
                  type="text"
                  value={correctionData.field.replace(/_/g, ' ')}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Value
                </label>
                <input
                  type="text"
                  value={correctionData.oldValue}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Value *
                </label>
                <input
                  type="text"
                  value={correctionData.newValue}
                  onChange={(e) => setCorrectionData({...correctionData, newValue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter corrected value"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Correction *
                </label>
                <textarea
                  value={correctionData.reason}
                  onChange={(e) => setCorrectionData({...correctionData, reason: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Explain why this correction is needed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowCorrectionForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitCorrection}
                  disabled={!correctionData.newValue || !correctionData.reason}
                >
                  Submit Correction
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
