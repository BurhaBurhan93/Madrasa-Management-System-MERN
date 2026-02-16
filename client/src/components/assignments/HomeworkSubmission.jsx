import React, { useState } from 'react';
import Card from '../UIHelper/Card';
import Button from '../UIHelper/Button';
import Input from '../UIHelper/Input';

const HomeworkSubmission = () => {
  const [homeworkData, setHomeworkData] = useState({
    title: '',
    description: '',
    course: '',
    dueDate: '',
    file: null
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the homework data to the backend
    console.log('Homework submitted:', homeworkData);
    alert('Homework submitted successfully!');
    
    // Reset form
    setHomeworkData({
      title: '',
      description: '',
      course: '',
      dueDate: '',
      file: null
    });
  };

  return (
    <Card title="Submit Homework">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Assignment Title"
            name="title"
            value={homeworkData.title}
            onChange={handleInputChange}
            placeholder="Enter assignment title"
            required
          />
        </div>
        
        <div>
          <Input
            label="Course"
            name="course"
            value={homeworkData.course}
            onChange={handleInputChange}
            placeholder="Enter course name"
            required
          />
        </div>
        
        <div>
          <Input
            label="Due Date"
            type="date"
            name="dueDate"
            value={homeworkData.dueDate}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={homeworkData.description}
            onChange={handleInputChange}
            placeholder="Describe the assignment requirements..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File
          </label>
          <div className="flex items-center space-x-2">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, TXT or images (MAX. 10MB)
                </p>
              </div>
              <input 
                type="file" 
                name="file"
                onChange={handleFileChange}
                className="hidden" 
              />
            </label>
          </div>
          {homeworkData.file && (
            <p className="mt-1 text-sm text-gray-600">
              Selected file: {homeworkData.file.name}
            </p>
          )}
        </div>
        
        <div className="pt-4">
          <Button type="submit" className="w-full">
            Submit Homework
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default HomeworkSubmission;