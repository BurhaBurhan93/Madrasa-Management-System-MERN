import React, { useState } from 'react';
import Card from '../components/UIHelper/Card';
import Button from '../components/UIHelper/Button';
import Input from '../components/UIHelper/Input';
import Badge from '../components/UIHelper/Badge';

const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      title: 'Classroom Temperature Issue',
      category: 'Facility',
      date: '2024-02-10',
      status: 'resolved',
      priority: 'medium',
      description: 'Classroom AC is not working properly during afternoon classes.',
      response: 'Maintenance team has fixed the AC unit. Issue resolved.',
      submittedDate: '2024-02-08'
    },
    {
      id: 2,
      title: 'Library Noise Complaint',
      category: 'Environment',
      date: '2024-02-12',
      status: 'pending',
      priority: 'low',
      description: 'Students are making too much noise in the library affecting concentration.',
      submittedDate: '2024-02-10'
    },
    {
      id: 3,
      title: 'Assignment Deadline Extension Request',
      category: 'Academic',
      date: '2024-02-15',
      status: 'in-progress',
      priority: 'high',
      description: 'Requesting deadline extension for mathematics assignment due to family emergency.',
      submittedDate: '2024-02-12'
    }
  ]);

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintData, setComplaintData] = useState({
    title: '',
    category: 'Academic',
    priority: 'medium',
    description: ''
  });

  const handleOpenComplaintModal = () => {
    setShowComplaintModal(true);
  };

  const handleCloseComplaintModal = () => {
    setShowComplaintModal(false);
    setComplaintData({
      title: '',
      category: 'Academic',
      priority: 'medium',
      description: ''
    });
  };

  const handleComplaintChange = (e) => {
    const { name, value } = e.target;
    setComplaintData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitComplaint = (e) => {
    e.preventDefault();
    
    const newComplaint = {
      id: complaints.length + 1,
      ...complaintData,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0]
    };
    
    setComplaints(prev => [newComplaint, ...prev]);
    handleCloseComplaintModal();
    alert('Complaint submitted successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in-progress':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="px-4 sm:px-6 md:px-8 py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaints & Feedback</h1>
        <p className="text-gray-600">Submit complaints and track their status</p>
      </div>

      <div className="px-4 sm:px-6 md:px-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{complaints.length}</div>
          <div className="text-sm text-gray-600">Total Complaints</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {complaints.filter(c => c.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {complaints.filter(c => c.status === 'resolved').length}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </Card>
        
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {complaints.filter(c => c.status === 'in-progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">My Complaints</h2>
        <Button 
          variant="primary" 
          onClick={handleOpenComplaintModal}
        >
          Submit New Complaint
        </Button>
      </div>

      {/* Complaints List */}
      <div className="space-y-6">
        {complaints.map(complaint => (
          <Card key={complaint.id} className="hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start justify-between">
              <div className="flex-1 mb-4 md:mb-0 md:pr-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                  <div className="flex space-x-2">
                    <Badge variant={getPriorityColor(complaint.priority)}>
                      {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                    </Badge>
                    <Badge variant={getStatusColor(complaint.status)}>
                      {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-2">
                  <span className="text-sm text-gray-600">{complaint.category}</span>
                  <span className="text-sm text-gray-500">Submitted: {formatDate(complaint.submittedDate)}</span>
                </div>
                
                <p className="text-gray-700 mb-3">{complaint.description}</p>
                
                {complaint.response && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Response:</span> {complaint.response}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{formatDate(complaint.date)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Submit Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Submit New Complaint
                </h3>
                <button 
                  onClick={handleCloseComplaintModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmitComplaint} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <Input
                    type="text"
                    name="title"
                    value={complaintData.title}
                    onChange={handleComplaintChange}
                    placeholder="Brief title for your complaint"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={complaintData.category}
                      onChange={handleComplaintChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Facility">Facility</option>
                      <option value="Environment">Environment</option>
                      <option value="Staff">Staff</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={complaintData.priority}
                      onChange={handleComplaintChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    value={complaintData.description}
                    onChange={handleComplaintChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Provide detailed description of your complaint..."
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={handleCloseComplaintModal}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                  >
                    Submit Complaint
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default StudentComplaints;