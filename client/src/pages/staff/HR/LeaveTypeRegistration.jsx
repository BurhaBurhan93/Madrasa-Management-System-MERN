import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/UIHelper/Button';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

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
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/hr/leave-types', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setLeaveTypes(res.data.data);
      }
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
      const token = localStorage.getItem('token');
      const url = editMode
        ? `http://localhost:5000/api/hr/leave-types/${currentId}`
        : 'http://localhost:5000/api/hr/leave-types';
      
      const method = editMode ? 'put' : 'post';
      
      const res = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:5000/api/hr/leave-types/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Type Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Manage different types of leaves</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <FiPlus className="inline mr-2" /> Add Leave Type
        </Button>
      </div>

      {/* Leave Types Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Leave Type</th>
              <th className="p-3 text-left">Max Days</th>
              <th className="p-3 text-left">Paid/Unpaid</th>
              <th className="p-3 text-left">Carry Forward</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveTypes.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  No leave types found. Click "Add Leave Type" to create one.
                </td>
              </tr>
            ) : (
              leaveTypes.map((leaveType) => (
                <tr key={leaveType._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{leaveType.leaveCode}</td>
                  <td className="p-3">{leaveType.leaveTypeName}</td>
                  <td className="p-3">{leaveType.maxDaysAllowed} days</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        leaveType.isPaid
                          ? 'bg-green-100 text-green-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {leaveType.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="p-3">{leaveType.carryForward ? 'Yes' : 'No'}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        leaveType.status === 'active'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {leaveType.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(leaveType)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(leaveType._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editMode ? 'Edit Leave Type' : 'Add New Leave Type'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="leaveTypeName"
                    value={formData.leaveTypeName}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="e.g., Sick Leave"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="leaveCode"
                    value={formData.leaveCode}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="e.g., SL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Days Allowed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="maxDaysAllowed"
                    value={formData.maxDaysAllowed}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="e.g., 15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender Specific
                  </label>
                  <select
                    name="genderSpecific"
                    value={formData.genderSpecific}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="both">Both</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPaid"
                    checked={formData.isPaid}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Paid Leave</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="carryForward"
                    checked={formData.carryForward}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Carry Forward</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requiresMedicalCertificate"
                    checked={formData.requiresMedicalCertificate}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Medical Certificate</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="Leave type description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editMode ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTypeRegistration;
