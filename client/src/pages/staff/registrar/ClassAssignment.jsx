import React, { useState, useEffect } from 'react';
import ListPage from '../shared/ListPage';
import StaffPageLayout from '../shared/StaffPageLayout';
import Card from '../../../components/UIHelper/Card';
import { PageSkeleton } from '../../../components/UIHelper/SkeletonLoader';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';
import axios from 'axios';
import Button from '../../../components/UIHelper/Button';
import Modal from '../../../components/UIHelper/Modal';
import { FiUsers, FiUserCheck, FiArrowRight, FiTrendingUp, FiAward } from 'react-icons/fi';

export const classAssignmentConfig = {
  title: 'Class Assignment & Student Transfer',
  subtitle: 'Assign students to classes, manage transfers, and promotions',
  endpoint: '/student/all',
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
  const [pageLoading, setPageLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    assignedStudents: 0,
    unassignedStudents: 0,
    activeStudents: 0,
    byClass: [],
    byStatus: []
  });
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchClassAssignmentStats();
  }, []);

  const fetchClassAssignmentStats = async () => {
    try {
      setPageLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await fetch(`${API_BASE}/student/all`, config);
      const data = await res.json();
      
      if (data.success || data.data) {
        const students = data.data || [];
        
        const totalStudents = students.length;
        const assignedStudents = students.filter(s => s.currentClass).length;
        const unassignedStudents = totalStudents - assignedStudents;
        const activeStudents = students.filter(s => s.status === 'active').length;
        
        // By Class
        const classMap = {};
        students.forEach(s => {
          const className = s.currentClass?.className || 'Unassigned';
          classMap[className] = (classMap[className] || 0) + 1;
        });
        const byClass = Object.entries(classMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8);
        
        // By Status
        const statusMap = {};
        students.forEach(s => {
          const status = s.status || 'unknown';
          statusMap[status] = (statusMap[status] || 0) + 1;
        });
        const byStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
        
        setStats({
          totalStudents,
          assignedStudents,
          unassignedStudents,
          activeStudents,
          byClass,
          byStatus
        });
      }
    } catch (err) {
      console.error('Error fetching class assignment stats:', err);
    } finally {
      setPageLoading(false);
    }
  };

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

  if (pageLoading) {
    return (
      <StaffPageLayout eyebrow="Registrar" title="Class Assignment & Student Transfer">
        <PageSkeleton type="dashboard" />
      </StaffPageLayout>
    );
  }

  return (
    <StaffPageLayout eyebrow="Registrar" title="Class Assignment & Student Transfer" subtitle="Assign students to classes, manage transfers, and promotions">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Assigned</p>
              <p className="text-2xl font-bold text-slate-900">{stats.assignedStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FiUserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Unassigned</p>
              <p className="text-2xl font-bold text-slate-900">{stats.unassignedStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <FiArrowRight className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
        
        <Card className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-violet-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Active Students</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Students by Class</h3>
          {stats.byClass.length > 0 ? (
            <BarChartComponent data={stats.byClass} dataKey="value" nameKey="name" height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
        
        <Card className="rounded-[28px] border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Student Status Distribution</h3>
          {stats.byStatus.length > 0 ? (
            <PieChartComponent data={stats.byStatus} height={250} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </Card>
      </div>
      
      {/* List Page */}
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
    </StaffPageLayout>
  );
};

export default ClassAssignment;
