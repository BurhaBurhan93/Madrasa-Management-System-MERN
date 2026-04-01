import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import Button from '../../../components/UIHelper/Button';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const EmployeeRegistration = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user: '',
    fullName: '',
    fullNameArabic: '',
    fatherName: '',
    dateOfBirth: '',
    gender: 'male',
    cnic: '',
    bloodGroup: '',
    maritalStatus: 'single',
    phoneNumber: '',
    secondaryPhone: '',
    email: '',
    currentAddress: '',
    permanentAddress: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    employeeType: 'support',
    department: '',
    designation: '',
    joiningDate: '',
    employmentType: 'permanent',
    shiftTiming: '',
    reportingManager: '',
    highestQualification: '',
    specialization: '',
    previousExperience: 0,
    baseSalary: '',
    houseAllowance: 0,
    transportAllowance: 0,
    medicalAllowance: 0,
    bankName: '',
    accountNumber: '',
    accountTitle: '',
    paymentMethod: 'cash',
    status: 'active'
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees');
      if (res.data.success) setEmployees(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/hr/departments?status=active');
      if (res.data.success) setDepartments(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDesignations = async (deptId) => {
    try {
      const res = await api.get(`/hr/designations/department/${deptId}`);
      if (res.data.success) setDesignations(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) setUsers(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'department' && value) {
      fetchDesignations(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api[editMode ? 'put' : 'post'](
        editMode ? `/hr/employees/${currentId}` : '/hr/employees',
        formData
      );

      if (res.data.success) {
        alert(res.data.message);
        fetchEmployees();
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;

    try {
      const res = await api.delete(`/hr/employees/${id}`);

      if (res.data.success) {
        alert(res.data.message);
        fetchEmployees();
      }
    } catch (error) {
      alert('Failed to delete employee');
    }
  };

  const handleEdit = (emp) => {
    setFormData({
      user: emp.user?._id || emp.user || '',
      fullName: emp.fullName || '',
      fullNameArabic: emp.fullNameArabic || '',
      fatherName: emp.fatherName || '',
      dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
      gender: emp.gender || 'male',
      cnic: emp.cnic || '',
      bloodGroup: emp.bloodGroup || '',
      maritalStatus: emp.maritalStatus || 'single',
      phoneNumber: emp.phoneNumber || '',
      secondaryPhone: emp.secondaryPhone || '',
      email: emp.email || '',
      currentAddress: emp.currentAddress || '',
      permanentAddress: emp.permanentAddress || '',
      emergencyContactName: emp.emergencyContactName || '',
      emergencyContactRelation: emp.emergencyContactRelation || '',
      emergencyContactPhone: emp.emergencyContactPhone || '',
      employeeType: emp.employeeType || 'support',
      department: emp.department?._id || emp.department || '',
      designation: emp.designation?._id || emp.designation || '',
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
      employmentType: emp.employmentType || 'permanent',
      shiftTiming: emp.shiftTiming || '',
      reportingManager: emp.reportingManager || '',
      highestQualification: emp.highestQualification || '',
      specialization: emp.specialization || '',
      previousExperience: emp.previousExperience || 0,
      baseSalary: emp.baseSalary || '',
      houseAllowance: emp.houseAllowance || 0,
      transportAllowance: emp.transportAllowance || 0,
      medicalAllowance: emp.medicalAllowance || 0,
      bankName: emp.bankName || '',
      accountNumber: emp.accountNumber || '',
      accountTitle: emp.accountTitle || '',
      paymentMethod: emp.paymentMethod || 'cash',
      status: emp.status || 'active'
    });
    setCurrentId(emp._id);
    setEditMode(true);
    if (emp.department?._id || emp.department) {
      fetchDesignations(emp.department?._id || emp.department);
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      user: '', fullName: '', fullNameArabic: '', fatherName: '', dateOfBirth: '',
      gender: 'male', cnic: '', bloodGroup: '', maritalStatus: 'single',
      phoneNumber: '', secondaryPhone: '', email: '', currentAddress: '', permanentAddress: '',
      emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '',
      employeeType: 'support', department: '', designation: '', joiningDate: '',
      employmentType: 'permanent', shiftTiming: '', reportingManager: '',
      highestQualification: '', specialization: '', previousExperience: 0,
      baseSalary: '', houseAllowance: 0, transportAllowance: 0, medicalAllowance: 0,
      bankName: '', accountNumber: '', accountTitle: '', paymentMethod: 'cash', status: 'active'
    });
    setEditMode(false);
    setCurrentId(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Employee Registration</h1>
        <p className="text-sm text-gray-500 mt-1">Register and manage employees</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6 overflow-y-auto max-h-[80vh] space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">{editMode ? 'Edit Employee' : 'Add Employee'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">Personal</p>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required placeholder="Full Name *" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="Father Name" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input type="text" name="cnic" value={formData.cnic} onChange={handleInputChange} placeholder="CNIC" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />

            <p className="text-xs font-semibold text-gray-400 uppercase pt-2">Contact</p>
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required placeholder="Phone Number *" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
            <input type="text" name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} placeholder="Current Address" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
            <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} placeholder="Emergency Contact Name" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
            <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} placeholder="Emergency Contact Phone" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />

            <p className="text-xs font-semibold text-gray-400 uppercase pt-2">Employment</p>
            <select name="user" value={formData.user} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
              <option value="">Select User Account *</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
            <select name="employeeType" value={formData.employeeType} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="support">Support</option>
              <option value="kitchen">Kitchen</option>
              <option value="security">Security</option>
            </select>
            <select name="department" value={formData.department} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
              <option value="">Select Department</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}
            </select>
            <select name="designation" value={formData.designation} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
              <option value="">Select Designation</option>
              {designations.map(d => <option key={d._id} value={d._id}>{d.designationTitle}</option>)}
            </select>
            <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
            <select name="employmentType" value={formData.employmentType} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
              <option value="permanent">Permanent</option>
              <option value="contract">Contract</option>
              <option value="part-time">Part-time</option>
            </select>

            <p className="text-xs font-semibold text-gray-400 uppercase pt-2">Salary & Bank</p>
            <input type="number" name="baseSalary" value={formData.baseSalary} onChange={handleInputChange} required placeholder="Basic Salary *" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
            <input type="number" name="houseAllowance" value={formData.houseAllowance} onChange={handleInputChange} placeholder="House Allowance" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
            </select>
            <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="Bank Name" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
            <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} placeholder="Account Number" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none" />
            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

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
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Designation</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No employees found</td></tr>
              ) : employees.map(emp => (
                <tr key={emp._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{emp.employeeCode}</td>
                  <td className="p-3">{emp.fullName}</td>
                  <td className="p-3">{emp.department?.departmentName || '-'}</td>
                  <td className="p-3">{emp.designation?.designationTitle || '-'}</td>
                  <td className="p-3">{emp.phoneNumber}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${emp.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{emp.status}</span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:text-blue-800"><FiEdit2 size={18} /></button>
                    <button onClick={() => handleDelete(emp._id)} className="text-red-600 hover:text-red-800"><FiTrash2 size={18} /></button>
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

export default EmployeeRegistration;
