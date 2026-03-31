import React, { useState, useEffect } from 'react';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Input from '../components/UIHelper/Input';
import { FiPlus, FiEdit2, FiTrash2, FiGraduationCap, FiBook } from 'react-icons/fi';
import axios from 'axios';

const StudentEducation = () => {
  console.log('[StudentEducation] Component initializing...');
  const [educationHistory, setEducationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    previousDegree: '',
    previousInstitution: '',
    location: ''
  });

  // Get API config with auth token
  const getConfig = () => {
    const token = localStorage.getItem('token');
    console.log('[StudentEducation] Token exists:', !!token);
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    console.log('[StudentEducation] useEffect triggered - fetching data from API...');
    fetchEducationData();
  }, []);

  const fetchEducationData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[StudentEducation] Fetching education records from API...');
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/student/education', config);
      
      console.log('[StudentEducation] API response:', response.data);
      setEducationHistory(response.data || []);
    } catch (err) {
      console.error('[StudentEducation] Error fetching education data:', err);
      setError('Failed to fetch education records. Please try again.');
      setEducationHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`[StudentEducation] Input changed - ${name}:`, value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[StudentEducation] Form submitted - editingId:', editingId, 'formData:', formData);
    
    try {
      setLoading(true);
      const config = getConfig();
      
      if (editingId) {
        console.log('[StudentEducation] Updating existing record:', editingId);
        const response = await axios.put(`http://localhost:5000/api/student/education/${editingId}`, formData, config);
        console.log('[StudentEducation] Record updated successfully:', response.data);
      } else {
        console.log('[StudentEducation] Creating new record');
        const response = await axios.post('http://localhost:5000/api/student/education', formData, config);
        console.log('[StudentEducation] New record created:', response.data);
      }
      
      // Refresh data from API
      await fetchEducationData();
      
      console.log('[StudentEducation] Resetting form state');
      setShowForm(false);
      setEditingId(null);
      setFormData({ previousDegree: '', previousInstitution: '', location: '' });
      console.log('[StudentEducation] Form submission completed successfully');
    } catch (err) {
      console.error('[StudentEducation] Error in handleSubmit:', err);
      alert('Error saving education record: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (edu) => {
    console.log('[StudentEducation] Edit clicked for record:', edu._id, edu);
    setFormData({ previousDegree: edu.previousDegree, previousInstitution: edu.previousInstitution, location: edu.location });
    setEditingId(edu._id);
    setShowForm(true);
    console.log('[StudentEducation] Edit mode activated for:', edu._id);
  };

  const handleDelete = async (id) => {
    console.log('[StudentEducation] Delete clicked for record:', id);
    if (window.confirm('Delete this record?')) {
      console.log('[StudentEducation] Confirming delete for:', id);
      try {
        setLoading(true);
        const config = getConfig();
        await axios.delete(`http://localhost:5000/api/student/education/${id}`, config);
        console.log('[StudentEducation] Record deleted from API');
        
        // Refresh data from API
        await fetchEducationData();
        console.log('[StudentEducation] Delete operation completed');
      } catch (err) {
        console.error('[StudentEducation] Error deleting record:', err);
        alert('Error deleting record: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    } else {
      console.log('[StudentEducation] Delete cancelled by user');
    }
  };

  console.log('[StudentEducation] Rendering with', educationHistory.length, 'records');

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Education History</h1>
        <p className="text-gray-600 mt-1">Manage your previous education and academic background</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-3xl font-bold text-blue-600">{educationHistory.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full"><FiBook className="w-6 h-6 text-blue-600" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certifications</p>
              <p className="text-3xl font-bold text-green-600">{educationHistory.filter(e => e.previousDegree?.toLowerCase().includes('diploma') || e.previousDegree?.toLowerCase().includes('certificate')).length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full"><FiGraduationCap className="w-6 h-6 text-green-600" /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Institutions</p>
              <p className="text-3xl font-bold text-purple-600">{new Set(educationHistory.map(e => e.previousInstitution)).size}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full"><FiBook className="w-6 h-6 text-purple-600" /></div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <Button onClick={() => setShowForm(!showForm)}>
          <FiPlus className="mr-2" /> {showForm ? 'Cancel' : 'Add Education Record'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{editingId ? 'Edit' : 'Add'} Education Record</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Degree/Certificate" name="previousDegree" value={formData.previousDegree} onChange={handleInputChange} placeholder="e.g., High School Diploma" />
              <Input label="Institution" name="previousInstitution" value={formData.previousInstitution} onChange={handleInputChange} placeholder="e.g., Kabul High School" />
            </div>
            <Input label="Location" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., Kabul, Afghanistan" />
            <div className="flex space-x-4">
              <Button type="submit">{editingId ? 'Update' : 'Add'} Record</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setFormData({ previousDegree: '', previousInstitution: '', location: '' }); }}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Previous Education Records">
        {educationHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiGraduationCap className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">No education records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Degree/Certificate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {educationHistory.map((edu) => (
                  <tr key={edu._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <FiGraduationCap className="text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{edu.previousDegree}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{edu.previousInstitution}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{edu.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(edu.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-3">
                        <button onClick={() => handleEdit(edu)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"><FiEdit2 size={18} /></button>
                        <button onClick={() => handleDelete(edu._id)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"><FiTrash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentEducation;
