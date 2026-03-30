import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/UIHelper/Button';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const DepartmentRegistration = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentCode: '',
    departmentHead: '',
    description: '',
    location: '',
    contactExtension: '',
    status: 'active'
  });

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/hr/departments');
      if (res.data.success) setDepartments(res.data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      alert('Failed to fetch departments');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees?status=active');
      if (res.data.success) setEmployees(res.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api[editMode ? 'put' : 'post'](
        editMode ? `/hr/departments/${currentId}` : '/hr/departments',
        formData
      );

      if (res.data.success) {
        alert(res.data.message);
        fetchDepartments();
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error saving department:', error);
      alert(error.response?.data?.message || 'Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dept) => {
    setFormData({
      departmentName: dept.departmentName,
      departmentCode: dept.departmentCode,
      departmentHead: dept.departmentHead?._id || '',
      description: dept.description || '',
      location: dept.location || '',
      contactExtension: dept.contactExtension || '',
      status: dept.status
    });
    setCurrentId(dept._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      const res = await api.delete(`/hr/departments/${id}`);

      if (res.data.success) {
        alert(res.data.message);
        fetchDepartments();
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      alert(error.response?.data?.message || 'Failed to delete department');
    }
  };

  const resetForm = () => {
    setFormData({
      departmentName: '',
      departmentCode: '',
      departmentHead: '',
      description: '',
      location: '',
      contactExtension: '',
      status: 'active'
    });
    setEditMode(false);
    setCurrentId(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Department Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Manage organizational departments</p>
        </div>
        <button onClick={resetForm} className="text-sm text-cyan-600 hover:underline">+ New Department</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">{editMode ? 'Edit Department' : 'Add Department'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Name <span className="text-red-500">*</span></label>
              <input type="text" name="departmentName" value={formData.departmentName} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="e.g., Academic Department" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Code <span className="text-red-500">*</span></label>
              <input type="text" name="departmentCode" value={formData.departmentCode} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="e.g., ACAD" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Head</label>
              <select name="departmentHead" value={formData.departmentHead} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="">Select Department Head</option>
                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.fullName} ({emp.employeeCode})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="e.g., Building A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
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
                <th className="p-3 text-left">Department Name</th>
                <th className="p-3 text-left">Head</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No departments found</td></tr>
              ) : departments.map(dept => (
                <tr key={dept._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{dept.departmentCode}</td>
                  <td className="p-3">{dept.departmentName}</td>
                  <td className="p-3">{dept.departmentHead?.fullName || 'Not Assigned'}</td>
                  <td className="p-3">{dept.location || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${dept.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{dept.status}</span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => handleEdit(dept)} className="text-blue-600 hover:text-blue-800"><FiEdit2 size={18} /></button>
                    <button onClick={() => handleDelete(dept._id)} className="text-red-600 hover:text-red-800"><FiTrash2 size={18} /></button>
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

export default DepartmentRegistration;
