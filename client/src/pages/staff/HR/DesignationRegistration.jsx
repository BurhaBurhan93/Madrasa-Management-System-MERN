import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/UIHelper/Button';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

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
      const res = await api.get('/hr/designations');
      if (res.data.success) setDesignations(res.data.data);
    } catch (error) {
      console.error('Error fetching designations:', error);
      alert('Failed to fetch designations');
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/hr/departments?status=active');
      if (res.data.success) setDepartments(res.data.data);
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
      const res = await api[editMode ? 'put' : 'post'](
        editMode ? `/hr/designations/${currentId}` : '/hr/designations',
        formData
      );

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
      const res = await api.delete(`/hr/designations/${id}`);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Designation Registration</h1>
        <p className="text-sm text-gray-500 mt-1">Manage job positions and roles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">{editMode ? 'Edit Designation' : 'Add Designation'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation Title <span className="text-red-500">*</span></label>
              <input type="text" name="designationTitle" value={formData.designationTitle} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="e.g., Senior Teacher" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
              <select name="department" value={formData.department} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="">Select Department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Level</label>
              <select name="jobLevel" value={formData.jobLevel} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Qualification</label>
              <input type="text" name="minQualification" value={formData.minQualification} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="e.g., Bachelor's" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Min</label>
                <input type="number" name="salaryRangeMin" value={formData.salaryRangeMin} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Max</label>
                <input type="number" name="salaryRangeMax" value={formData.salaryRangeMax} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>
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
                <th className="p-3 text-left">Designation</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Level</th>
                <th className="p-3 text-left">Salary Range</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {designations.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No designations found</td></tr>
              ) : designations.map(d => (
                <tr key={d._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{d.designationTitle}</td>
                  <td className="p-3">{d.department?.departmentName || '-'}</td>
                  <td className="p-3 capitalize">{d.jobLevel}</td>
                  <td className="p-3">{d.salaryRangeMin && d.salaryRangeMax ? `${d.salaryRangeMin} - ${d.salaryRangeMax}` : '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${d.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{d.status}</span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => handleEdit(d)} className="text-blue-600 hover:text-blue-800"><FiEdit2 size={18} /></button>
                    <button onClick={() => handleDelete(d._id)} className="text-red-600 hover:text-red-800"><FiTrash2 size={18} /></button>
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

export default DesignationRegistration;
