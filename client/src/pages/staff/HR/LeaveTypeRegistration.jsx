import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/UIHelper/Button';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const LeaveTypeRegistration = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeName: '',
    leaveCode: '',
    maxDaysAllowed: '',
    carryForward: false,
    requiresMedicalCertificate: false,
    isPaid: true,
    genderSpecific: 'both',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get('/hr/leave-types');
      if (res.data.success) setLeaveTypes(res.data.data);
    } catch (error) {
      console.error('Error fetching leave types:', error);
      alert('Failed to fetch leave types');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api[editMode ? 'put' : 'post'](
        editMode ? `/hr/leave-types/${currentId}` : '/hr/leave-types',
        formData
      );

      if (res.data.success) {
        alert(res.data.message);
        fetchLeaveTypes();
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error saving leave type:', error);
      alert(error.response?.data?.message || 'Failed to save leave type');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (leaveType) => {
    setFormData({
      leaveTypeName: leaveType.leaveTypeName,
      leaveCode: leaveType.leaveCode,
      maxDaysAllowed: leaveType.maxDaysAllowed,
      carryForward: leaveType.carryForward,
      requiresMedicalCertificate: leaveType.requiresMedicalCertificate,
      isPaid: leaveType.isPaid,
      genderSpecific: leaveType.genderSpecific,
      description: leaveType.description || '',
      status: leaveType.status
    });
    setCurrentId(leaveType._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave type?')) return;

    try {
      const res = await api.delete(`/hr/leave-types/${id}`);

      if (res.data.success) {
        alert(res.data.message);
        fetchLeaveTypes();
      }
    } catch (error) {
      console.error('Error deleting leave type:', error);
      alert(error.response?.data?.message || 'Failed to delete leave type');
    }
  };

  const resetForm = () => {
    setFormData({
      leaveTypeName: '',
      leaveCode: '',
      maxDaysAllowed: '',
      carryForward: false,
      requiresMedicalCertificate: false,
      isPaid: true,
      genderSpecific: 'both',
      description: '',
      status: 'active'
    });
    setEditMode(false);
    setCurrentId(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Leave Type Registration</h1>
        <p className="text-sm text-gray-500 mt-1">Manage different types of leaves</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">{editMode ? 'Edit Leave Type' : 'Add Leave Type'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type Name <span className="text-red-500">*</span></label>
              <input type="text" name="leaveTypeName" value={formData.leaveTypeName} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="e.g., Sick Leave" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Code <span className="text-red-500">*</span></label>
              <input type="text" name="leaveCode" value={formData.leaveCode} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="e.g., SL" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Days <span className="text-red-500">*</span></label>
              <input type="number" name="maxDaysAllowed" value={formData.maxDaysAllowed} onChange={handleInputChange} required min="1" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender Specific</label>
              <select name="genderSpecific" value={formData.genderSpecific} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="both">Both</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleInputChange} className="w-4 h-4 text-cyan-600 rounded" /> Paid Leave
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="carryForward" checked={formData.carryForward} onChange={handleInputChange} className="w-4 h-4 text-cyan-600 rounded" /> Carry Forward
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="requiresMedicalCertificate" checked={formData.requiresMedicalCertificate} onChange={handleInputChange} className="w-4 h-4 text-cyan-600 rounded" /> Medical Certificate
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Saving...' : editMode ? 'Update' : 'Create'}</Button>
              {editMode && <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Leave Type</th>
                <th className="p-3 text-left">Max Days</th>
                <th className="p-3 text-left">Paid</th>
                <th className="p-3 text-left">Carry Forward</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No leave types found</td></tr>
              ) : leaveTypes.map(lt => (
                <tr key={lt._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{lt.leaveCode}</td>
                  <td className="p-3">{lt.leaveTypeName}</td>
                  <td className="p-3">{lt.maxDaysAllowed} days</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${lt.isPaid ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{lt.isPaid ? 'Paid' : 'Unpaid'}</span>
                  </td>
                  <td className="p-3">{lt.carryForward ? 'Yes' : 'No'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${lt.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{lt.status}</span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => handleEdit(lt)} className="text-blue-600 hover:text-blue-800"><FiEdit2 size={18} /></button>
                    <button onClick={() => handleDelete(lt._id)} className="text-red-600 hover:text-red-800"><FiTrash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveTypeRegistration;
