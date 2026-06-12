import React, { useState, useEffect } from 'react';
import Card from '../UIHelper/Card';
import Button from '../UIHelper/Button';
import Input from '../UIHelper/Input';
import Badge from '../UIHelper/Badge';
import axios from 'axios';
import { FiUpload, FiFile, FiCheckCircle, FiClock, FiBook } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const HomeworkSubmission = () => {
  const [homeworkData, setHomeworkData] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: '',
    file: null
  });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const config = getConfig();
      const response = await axios.get(`${API_BASE}/student/assignments`, config);
      // Filter pending assignments
      const pending = (response.data || []).filter(a => a.status !== 'submitted');
      setAssignments(pending);
    } catch (err) {
      console.error('[HomeworkSubmission] Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHomeworkData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setHomeworkData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!homeworkData.title || !homeworkData.course) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const config = getConfig();
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('title', homeworkData.title);
      formData.append('description', homeworkData.description);
      formData.append('course', homeworkData.course);
      formData.append('dueDate', homeworkData.dueDate);
      if (homeworkData.file) {
        formData.append('file', homeworkData.file);
      }

      // Submit to assignments API (creating a new assignment submission)
      await axios.post(`${API_BASE}/student/assignments`, {
        title: homeworkData.title,
        description: homeworkData.description,
        course: homeworkData.course,
        dueDate: homeworkData.dueDate,
        status: 'submitted'
      }, config);
      
      alert('Homework submitted successfully!');
      
      // Reset form
      setHomeworkData({
        title: '',
        description: '',
        course: '',
        dueDate: '',
        file: null
      });
      
      // Refresh assignments list
      fetchAssignments();
    } catch (err) {
      console.error('[HomeworkSubmission] Error submitting:', err);
      alert('Failed to submit homework. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignmentSelect = (assignment) => {
    setHomeworkData(prev => ({
      ...prev,
      title: assignment.title || '',
      course: assignment.subject?.name || assignment.course || '',
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : ''
    }));
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Assignments</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Submit Homework</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Upload your coursework and assignments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submission Form */}
        <div className="lg:col-span-2">
          <Card className="rounded-[32px] p-8 border-none shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <FiUpload className="text-cyan-600" /> New Submission
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Assignment Title"
                  name="title"
                  value={homeworkData.title}
                  onChange={handleInputChange}
                  placeholder="Enter assignment title"
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
                />
                <Input
                  label="Course"
                  name="course"
                  value={homeworkData.course}
                  onChange={handleInputChange}
                  placeholder="Enter course name"
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
                />
              </div>
              
              <Input
                label="Due Date"
                type="date"
                name="dueDate"
                value={homeworkData.dueDate}
                onChange={handleInputChange}
                required
                className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white"
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  name="description"
                  value={homeworkData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your submission or add notes..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none bg-slate-50 font-medium resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest">
                  Upload File
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-white hover:border-cyan-300 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-8 h-8 mb-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                    <p className="mb-2 text-sm text-slate-600 font-medium">
                      <span className="font-black text-cyan-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      PDF, DOC, DOCX, TXT (MAX. 10MB)
                    </p>
                  </div>
                  <input 
                    type="file" 
                    name="file"
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </label>
                {homeworkData.file && (
                  <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-xl border border-cyan-100">
                    <FiFile className="text-cyan-600" />
                    <p className="text-sm font-medium text-cyan-900">{homeworkData.file.name}</p>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  variant="primary"
                  className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 py-4 font-black text-xs uppercase tracking-widest"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Homework'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Pending Assignments Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-[32px] p-8 border-none shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <FiClock className="text-amber-500" /> Pending Tasks
            </h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                </div>
              ) : assignments.length > 0 ? (
                assignments.slice(0, 5).map(assignment => (
                  <div 
                    key={assignment._id || assignment.id}
                    onClick={() => handleAssignmentSelect(assignment)}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-cyan-200 hover:bg-white cursor-pointer transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                        <FiBook />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-900 text-sm truncate">{assignment.title || 'Untitled'}</h4>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                          Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No date'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl">
                  <FiCheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-slate-400 font-medium text-sm">All caught up!</p>
                </div>
              )}
            </div>
          </Card>

          {/* Guidelines Card */}
          <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[32px] text-white shadow-2xl shadow-slate-200/50">
            <h4 className="text-lg font-black mb-4">Submission Guidelines</h4>
            <div className="space-y-3 text-sm">
              <p className="text-slate-400">• Ensure files are properly named</p>
              <p className="text-slate-400">• Check file format requirements</p>
              <p className="text-slate-400">• Submit before deadline</p>
              <p className="text-slate-400">• Include all required components</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeworkSubmission;