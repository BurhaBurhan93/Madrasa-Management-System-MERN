import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/UIHelper/Button';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const DesignationRegistration = () => {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    designationTitle: '',
    department: '',
    jobLevel: 'entry',
    minQualification: '',
    salaryRangeMin: '',
    salaryRangeMax: '',
    jobDescription: '',
    responsibilities: '',
    status: 'active'
  });

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, []);

  const fetchDesignations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/hr/designations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setDesignations(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching designations:', error);
      alert('Failed to fetch designations');
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/hr/departments?status=active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = editMode
        ? `http://localhost:5000/api/hr/designations/${currentId}`
        : 'http://localhost:5000/api/hr/designations';
      
      const method = editMode ? 'put' : 'post';
      
      const res = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert(res.data.message);
        fetchDesignations();
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error saving designation:', error);
      alert(error.response?.data?.message || 'Failed to save designation');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (designation) => {
    setFormData({
      designationTitle: designation.designationTitle,
      department: designation.department?._id || '',
      jobLevel: designation.jobLevel,
      minQualification: designation.minQualification || '',
      salaryRangeMin: designation.salaryRangeMin || '',
      salaryRangeMax: designation.salaryRangeMax || '',
      jobDescription: designation.jobDescription || '',
      responsibilities: designation.responsibilities || '',
      status: designation.status
    });
    setCurrentId(designation._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this designation?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:5000/api/hr/designations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert(res.data.message);
        fetchDesignations();
      }
    } catch (error) {
      console.error('Error deleting designation:', error);
      alert(error.response?.data?.message || 'Failed to delete designation');
    }
  };

  const resetForm = () => {
    setFormData({
      designationTitle: '',
      department: '',
      jobLevel: 'entry',
      minQualification: '',
      salaryRangeMin: '',
      salaryRangeMax: '',
      jobDescription: '',
      responsibilities: '',
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
          <h1 className="text-2xl font-bold text-gray-800">Designation Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Manage job positions and roles</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <FiPlus className="inline mr-2" /> Add Designation
        </Button>
      </div>

      {/* Designations Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-3 text-left">Designation</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Job Level</th>
              <th className="p-3 text-left">Salary Range</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {designations.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No designations found. Click "Add Designation" to create one.
                </td>
              </tr>
            ) : (
              designations.map((designation) => (
                <tr key={designation._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{designation.designationTitle}</td>
                  <td className="p-3">{designation.department?.departmentName || '-'}</td>
                  <td className="p-3 capitalize">{designation.jobLevel}</td>
                  <td className="p-3">
                    {designation.salaryRangeMin && designation.salaryRangeMax
                      ? `${designation.salaryRangeMin} - ${designation.salaryRangeMax}`
                      : '-'}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        designation.status === 'active'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {designation.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(designation)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(designation._id)}
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editMode ? 'Edit Designation' : 'Add New Designation'}
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
                    Designation Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="designationTitle"
                    value={formData.designationTitle}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="e.g., Senior Teacher"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Level
                  </label>
                  <select
                    name="jobLevel"
                    value={formData.jobLevel}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Qualification
                  </label>
                  <input
                    type="text"
                    name="minQualification"
                    value={formData.minQualification}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="e.g., Bachelor's Degree"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Range Min
                  </label>
                  <input
                    type="number"
                    name="salaryRangeMin"
                    value={formData.salaryRangeMin}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="e.g., 30000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Range Max
                  </label>
                  <input
                    type="number"
                    name="salaryRangeMax"
                    value={formData.salaryRangeMax}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description
                </label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="Brief job description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsibilities
                </label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="Key responsibilities..."
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

export default DesignationRegistration;
