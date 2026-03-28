import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../../../components/UIHelper/Button';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiEye } from 'react-icons/fi';

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
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/hr/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setEmployees(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/hr/departments?status=active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setDepartments(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDesignations = async (deptId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/hr/designations/department/${deptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setDesignations(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('token');
      const url = editMode
        ? `http://localhost:5000/api/hr/employees/${currentId}`
        : 'http://localhost:5000/api/hr/employees';
      
      const method = editMode ? 'put' : 'post';
      
      const res = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:5000/api/hr/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert(res.data.message);
        fetchEmployees();
      }
    } catch (error) {
      alert('Failed to delete employee');
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Register and manage employees</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-cyan-500 hover:bg-cyan-600 text-white">
          <FiPlus className="inline mr-2" /> Add Employee
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
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
            ) : (
              employees.map((emp) => (
                <tr key={emp._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{emp.employeeCode}</td>
                  <td className="p-3">{emp.fullName}</td>
                  <td className="p-3">{emp.department?.departmentName || '-'}</td>
                  <td className="p-3">{emp.designation?.designationTitle || '-'}</td>
                  <td className="p-3">{emp.phoneNumber}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${emp.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => handleDelete(emp._id)} className="text-red-600 hover:text-red-800">
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{editMode ? 'Edit' : 'Add'} Employee</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Personal Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father Name</label>
                    <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
                    <input type="text" name="cnic" value={formData.cnic} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="12345-1234567-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                    <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="A+" />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                    <input type="text" name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                    <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Employment Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Account <span className="text-red-500">*</span></label>
                    <select name="user" value={formData.user} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                      <option value="">Select User</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.username})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Type</label>
                    <select name="employeeType" value={formData.employeeType} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                      <option value="support">Support</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="security">Security</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select name="department" value={formData.department} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.departmentName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <select name="designation" value={formData.designation} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                      <option value="">Select Designation</option>
                      {designations.map(d => <option key={d._id} value={d._id}>{d.designationTitle}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date <span className="text-red-500">*</span></label>
                    <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                    <select name="employmentType" value={formData.employmentType} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                      <option value="permanent">Permanent</option>
                      <option value="contract">Contract</option>
                      <option value="part-time">Part-time</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Salary Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Salary & Bank Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary <span className="text-red-500">*</span></label>
                    <input type="number" name="baseSalary" value={formData.baseSalary} onChange={handleInputChange} required className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">House Allowance</label>
                    <input type="number" name="houseAllowance" value={formData.houseAllowance} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : editMode ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeRegistration;
