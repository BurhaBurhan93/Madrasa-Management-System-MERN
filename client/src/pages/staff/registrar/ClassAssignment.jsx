import React, { useState } from 'react';
import ListPage from '../shared/ListPage';
import axios from 'axios';
import Button from '../../../components/UIHelper/Button';
import Modal from '../../../components/UIHelper/Modal';

export const classAssignmentConfig = {
  title: 'Class Assignment & Student Transfer',
  subtitle: 'Assign students to classes, manage transfers, and promotions',
  endpoint: '/students/all',
  columns: [
    { key: 'studentCode', header: 'Student Code' },
    { key: 'name', header: 'Student Name', render: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.user?.name || '-' },
    { key: 'currentClass', header: 'Current Class', render: (value) => value?.className || 'Not Assigned' },
    { key: 'currentLevel', header: 'Level' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions', render: (value, row, actions) => (
      <div className="flex gap-2">
        <button 
          onClick={() => actions.onTransfer(row)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Transfer
        </button>
        <button 
          onClick={() => actions.onPromote(row)}
          className="text-green-600 hover:text-green-800 text-sm font-medium"
        >
          Promote
        </button>
      </div>
    )}
  ],
  formFields: [
    { name: 'studentCode', label: 'Student Code', required: true },
    { name: 'firstName', label: 'First Name', required: true },
    { name: 'lastName', label: 'Last Name' },
    { name: 'fatherName', label: 'Father Name', required: true },
    { name: 'currentClass', label: 'Current Class', type: 'relation', relationEndpoint: '/academic/classes', relationLabel: (row) => row.className || row.name },
    { name: 'currentLevel', label: 'Current Level' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ],
  initialForm: {
    studentCode: '',
    firstName: '',
    lastName: '',
    fatherName: '',
    currentClass: '',
    currentLevel: '',
    status: 'active'
  },
  mapRowToForm: (row) => ({
    studentCode: row.studentCode || '',
    firstName: row.firstName || row.user?.name?.split(' ')[0] || '',
    lastName: row.lastName || row.user?.name?.split(' ')[1] || '',
    fatherName: row.fatherName || '',
    currentClass: row.currentClass?._id || row.currentClass || '',
    currentLevel: row.currentLevel || '',
    status: row.status || 'active'
  })
};

const ClassAssignment = () => {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newClass, setNewClass] = useState('');
  const [loading, setLoading] = useState(false);

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleTransfer = async () => {
    if (!selectedStudent || !newClass) return;
    
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/students/${selectedStudent._id}/transfer`,
        { newClass: newClass },
        getConfig()
      );
      alert('Student transferred successfully!');
      setShowTransferModal(false);
      setNewClass('');
      window.location.reload(); // Refresh to show updated data
    } catch (error) {
      console.error('Transfer error:', error);
      alert(error.response?.data?.message || 'Failed to transfer student');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!selectedStudent || !newClass) return;
    
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/api/students/${selectedStudent._id}/promote`,
        { newClass: newClass },
        getConfig()
      );
      alert('Student promoted successfully!');
      setShowPromoteModal(false);
      setNewClass('');
      window.location.reload();
    } catch (error) {
      console.error('Promotion error:', error);
      alert(error.response?.data?.message || 'Failed to promote student');
    } finally {
      setLoading(false);
    }
  };

  const openTransferModal = (student) => {
    setSelectedStudent(student);
    setShowTransferModal(true);
  };

  const openPromoteModal = (student) => {
    setSelectedStudent(student);
    setShowPromoteModal(true);
  };

  return (
    <>
      <ListPage 
        {...classAssignmentConfig} 
        customActions={{
          onTransfer: openTransferModal,
          onPromote: openPromoteModal
        }}
      />

      {/* Transfer Modal */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Transfer Student to New Class"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Student:</p>
            <p className="font-medium">
              {selectedStudent ? `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}` : ''}
            </p>
            <p className="text-sm text-gray-500">
              Current Class: {selectedStudent?.currentClass?.className || 'Not Assigned'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer to Class *
            </label>
            <select
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class</option>
              {/* Classes will be loaded dynamically by the relation field */}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleTransfer}
              disabled={loading || !newClass}
            >
              {loading ? 'Transferring...' : 'Transfer Student'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Promote Modal */}
      <Modal
        isOpen={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
        title="Promote Student to Next Level"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Student:</p>
            <p className="font-medium">
              {selectedStudent ? `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}` : ''}
            </p>
            <p className="text-sm text-gray-500">
              Current Level: {selectedStudent?.currentLevel || 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promote to Class *
            </label>
            <select
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Class</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowPromoteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handlePromote}
              disabled={loading || !newClass}
            >
              {loading ? 'Promoting...' : 'Promote Student'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ClassAssignment;
