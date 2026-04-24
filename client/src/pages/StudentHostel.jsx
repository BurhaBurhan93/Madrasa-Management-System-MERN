import React, { useEffect, useState } from 'react';
import { 
  FiHome, FiCalendar, FiUsers, FiMapPin, FiPhone, 
  FiDollarSign, FiInfo, FiCheckCircle, FiClock,
  FiTool, FiAlertTriangle, FiCoffee, FiChevronRight,
  FiArrowRight, FiShield, FiFileText
} from 'react-icons/fi';
import Card from '../components/UIHelper/Card';
import Badge from '../components/UIHelper/Badge';
import Button from '../components/UIHelper/Button';
import Modal from '../components/UIHelper/Modal';
import Input from '../components/UIHelper/Input';
import Select from '../components/UIHelper/Select';
import { PageSkeleton } from '../components/UIHelper/SkeletonLoader';
import { PieChartComponent, BarChartComponent } from '../components/UIHelper/ECharts';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentHostel = () => {
  const [hostelData, setHostelData] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('room');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState({
    issueType: 'plumbing',
    description: '',
    priority: 'medium'
  });

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchHostelData();
    fetchMealSchedule();
  }, []);

  const fetchHostelData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const config = getConfig();
      const response = await axios.get(`${API_BASE}/hostel/students/${userId}/hostel`, config);
      if (response.data.success) {
        setHostelData(response.data.data);
      }
    } catch (error) {
      console.error('[StudentHostel] Error fetching hostel data:', error);
      setHostelData(null); // Set null on error
    } finally {
      setLoading(false);
    }
  };

  const fetchMealSchedule = async () => {
    try {
      const config = getConfig();
      const response = await axios.get(`${API_BASE}/hostel/meals/upcoming`, config);
      if (response.data.success) {
        setMeals(response.data.data);
      }
    } catch (error) {
      console.error('[StudentHostel] Error fetching meals:', error);
      setMeals([]); // Set empty array on error
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = getConfig();
      await axios.post(`${API_BASE}/student/complaints`, {
        title: `Maintenance: ${reportData.issueType}`,
        description: reportData.description,
        category: 'maintenance',
        priority: reportData.priority,
        issueType: reportData.issueType
      }, config);
      
      alert('Thank you! Your maintenance request has been submitted.');
      setIsReportModalOpen(false);
      setReportData({ issueType: 'plumbing', description: '', priority: 'medium' });
    } catch (error) {
      console.error('[StudentHostel] Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  if (!hostelData || !hostelData.isResident) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Card className="text-center py-16 border-dashed border-2 border-slate-200 bg-slate-50/50">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-8 ring-slate-100">
            <FiHome className="w-12 h-12 text-slate-300" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">No Active Hostel Residency</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
            Our records indicate that you are currently not registered as a resident in any of our hostel facilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="primary" 
              className="px-8 py-3 rounded-2xl font-bold"
              onClick={() => window.location.href = 'mailto:hostel@madrasa.edu'}
            >
              Apply for Hostel
            </Button>
            <Button 
              variant="outline" 
              className="px-8 py-3 rounded-2xl font-bold"
              onClick={() => window.location.href = '/student/communications'}
            >
              Contact Student Affairs
            </Button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-2 text-slate-400">
            <FiInfo className="w-5 h-5" />
            <span className="text-sm font-medium">Need help? Visit the Hostel Warden office in Building A</span>
          </div>
        </Card>
      </div>
    );
  }

  const { room, allocation } = hostelData;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600 mb-1">Accommodation</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hostel Management</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Welcome home, {hostelData.student?.firstName || 'Student'}</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="rounded-2xl border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2"
            onClick={() => setIsReportModalOpen(true)}
          >
            <FiTool className="w-4 h-4" /> Report Issue
          </Button>
          <Button variant="primary" className="rounded-2xl bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-200/50 flex items-center gap-2">
            <FiFileText className="w-4 h-4" /> Hostel Pass
          </Button>
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 rounded-[32px] p-8 text-white shadow-2xl shadow-cyan-200/40 group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-white/20 text-white border-none backdrop-blur-md mb-4 px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                  Current Allocation
                </Badge>
                <h2 className="text-5xl font-black tracking-tight mb-2">Room {room?.roomNumber || 'N/A'}</h2>
                <p className="text-cyan-50 font-medium text-lg flex items-center gap-2">
                  <FiMapPin className="w-5 h-5" /> {room?.building || 'Main Building'}, {room?.floor || '0'} Floor
                </p>
              </div>
              <div className="w-20 h-20 bg-white/10 rounded-[24px] backdrop-blur-xl flex items-center justify-center text-4xl shadow-inner border border-white/20">
                <FiHome />
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <p className="text-cyan-200 text-xs font-bold uppercase tracking-widest mb-1">Bed Number</p>
                <p className="text-2xl font-black">{allocation?.bedNumber || '-'}</p>
              </div>
              <div>
                <p className="text-cyan-200 text-xs font-bold uppercase tracking-widest mb-1">Room Type</p>
                <p className="text-2xl font-black capitalize">{room?.roomType || 'Standard'}</p>
              </div>
              <div className="hidden md:block">
                <p className="text-cyan-200 text-xs font-bold uppercase tracking-widest mb-1">Check-in</p>
                <p className="text-2xl font-black">{allocation?.checkInDate ? new Date(allocation.checkInDate).toLocaleDateString() : '-'}</p>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl"></div>
        </div>

        <Card className="rounded-[32px] p-8 border-none bg-white shadow-xl shadow-slate-200/50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Payment Status</h3>
              <Badge variant="success" className="px-3 py-1 font-bold">Paid</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Monthly Rent</span>
                <span className="text-xl font-black text-slate-900">${allocation?.monthlyRent || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Security Deposit</span>
                <span className="text-xl font-black text-slate-900">${allocation?.securityDeposit || '0'}</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <Button variant="outline" className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 group">
              View Receipt <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex p-1.5 bg-white rounded-3xl shadow-sm border border-slate-200 max-w-md mx-auto">
        {[
          { id: 'room', label: 'Details', icon: <FiInfo /> },
          { id: 'meals', label: 'Dining', icon: <FiCoffee /> },
          { id: 'info', label: 'Rules', icon: <FiShield /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon}
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-8 min-h-[400px]">
        {activeTab === 'room' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <Card title="Room Amenities" className="rounded-[32px] p-8">
              <div className="grid grid-cols-2 gap-4">
                {room?.amenities?.length > 0 ? (
                  room.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-cyan-200 hover:bg-cyan-50 transition-all">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-cyan-600 shadow-sm">
                        <FiCheckCircle className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 capitalize">{amenity}</span>
                    </div>
                  ))
                ) : (
                  ['High-speed Wi-Fi', 'Study Table', 'Air Conditioning', 'Private Bathroom', 'Storage Locker', 'Bed Linen'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-300 shadow-sm">
                        <FiCheckCircle className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-500">{item}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card title="Emergency Contacts" className="rounded-[32px] p-8">
              {allocation?.emergencyContact ? (
                <div className="space-y-4">
                  <div className="p-6 bg-slate-900 rounded-[24px] text-white">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Primary Contact</p>
                    <p className="text-xl font-black">{allocation.emergencyContact.name}</p>
                    <p className="text-cyan-400 font-medium text-sm mt-1">{allocation.emergencyContact.relationship}</p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <FiPhone className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-lg">{allocation.emergencyContact.phone}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 bg-rose-50 border border-rose-100 rounded-[24px]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl shrink-0">
                        <FiAlertTriangle />
                      </div>
                      <div>
                        <h4 className="text-rose-900 font-black">Missing Information</h4>
                        <p className="text-rose-600 text-sm font-medium mt-1">Please provide an emergency contact for your safety.</p>
                        <Button variant="danger" className="mt-4 px-6 py-2 rounded-xl text-xs font-black">Update Now</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                const meal = meals.find(m => m.mealType === mealType && new Date(m.date).toDateString() === new Date().toDateString());
                const icons = { breakfast: '🍳', lunch: '🍲', dinner: '🥗' };
                const times = { breakfast: '07:30 AM', lunch: '01:30 PM', dinner: '08:00 PM' };
                
                return (
                  <Card key={mealType} className="p-6 rounded-[32px] border-none bg-white shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-6">
                      <div className="text-4xl">{icons[mealType]}</div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serving Time</p>
                        <p className="text-sm font-black text-slate-900">{times[mealType]}</p>
                      </div>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 capitalize mb-2">{mealType}</h4>
                    {meal ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-100">
                          <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-1">Main Dish</p>
                          <p className="text-slate-800 font-bold">{meal.menu.mainDish}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Side</p>
                          <p className="text-slate-600 font-medium text-sm">{meal.menu.sideDish}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 bg-slate-50 rounded-[24px] border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-center">
                        <FiClock className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-slate-400 font-bold text-xs">Menu pending</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            <Card title="Weekly Meal Schedule" className="rounded-[32px] p-8 overflow-hidden">
              <div className="overflow-x-auto -mx-8">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Day</th>
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Breakfast</th>
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Lunch</th>
                      <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Dinner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...Array(5)].map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i);
                      const dayMeals = meals.filter(m => new Date(m.date).toDateString() === date.toDateString());
                      
                      return (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <p className="font-black text-slate-900">{date.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                            <p className="text-xs text-slate-400 font-bold">{date.toLocaleDateString()}</p>
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-slate-600">
                            {dayMeals.find(m => m.mealType === 'breakfast')?.menu.mainDish || <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-slate-600">
                            {dayMeals.find(m => m.mealType === 'lunch')?.menu.mainDish || <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-slate-600">
                            {dayMeals.find(m => m.mealType === 'dinner')?.menu.mainDish || <span className="text-slate-300">-</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Hostel Occupancy Chart */}
            <Card title="Room Occupancy" className="rounded-[32px] p-8">
              <PieChartComponent 
                data={[
                  { name: 'Occupied', value: 85, color: '#10B981' },
                  { name: 'Available', value: 15, color: '#3B82F6' }
                ]}
                height={250}
              />
            </Card>

            <Card title="Maintenance Requests" className="rounded-[32px] p-8">
              <BarChartComponent 
                data={[
                  { name: 'Plumbing', value: 12 },
                  { name: 'Electrical', value: 8 },
                  { name: 'Furniture', value: 15 },
                  { name: 'Cleaning', value: 20 }
                ]}
                dataKey="value"
                nameKey="name"
                height={250}
              />
            </Card>

            <Card title="Hostel Guidelines" className="rounded-[32px] p-8 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/20 md:col-span-2">
              <div className="space-y-4">
                {[
                  { icon: <FiClock />, text: 'Quiet hours observed 10:00 PM - 06:00 AM' },
                  { icon: <FiUsers />, text: 'Visitors permitted in lounge area only' },
                  { icon: <FiTool />, text: 'No modification to room structure or furniture' },
                  { icon: <FiShield />, text: 'Ensure door is locked when leaving the room' },
                  { icon: <FiAlertTriangle />, text: 'Cooking is strictly prohibited inside rooms' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="text-cyan-400 text-xl">{item.icon}</div>
                    <p className="text-sm font-medium text-slate-200">{item.text}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-[32px] p-8 border-none bg-white shadow-xl shadow-slate-200/50">
                <h3 className="text-xl font-black text-slate-900 mb-6">Staff Directory</h3>
                <div className="space-y-4">
                  {[
                    { role: 'Warden', name: 'Dr. Ahmad Sarwari', contact: '+93 7XX XXX XXX', color: 'cyan' },
                    { role: 'Security', name: 'Duty Desk (24/7)', contact: 'Ext. 101', color: 'rose' },
                    { role: 'Dining Hall', name: 'Kitchen Manager', contact: 'Ext. 202', color: 'amber' }
                  ].map((staff, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className={`text-[10px] font-bold text-${staff.color}-600 uppercase tracking-widest mb-1`}>{staff.role}</p>
                        <p className="font-black text-slate-900">{staff.name}</p>
                      </div>
                      <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-slate-200 bg-white">
                        <FiPhone className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="p-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-[32px] text-white shadow-xl shadow-amber-200/50 flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black">Help Center</h4>
                  <p className="text-amber-100 font-medium text-sm mt-1">Found something broken?</p>
                </div>
                <Button 
                  className="bg-white text-orange-600 rounded-2xl font-black px-6 py-3 hover:bg-amber-50 shadow-lg"
                  onClick={() => setIsReportModalOpen(true)}
                >
                  Report Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Maintenance Request Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Maintenance Issue"
      >
        <form onSubmit={handleReportSubmit} className="space-y-6">
          <div className="space-y-4">
            <Select
              label="Issue Category"
              options={[
                { value: 'plumbing', label: 'Plumbing (Leaks, Taps)' },
                { value: 'electrical', label: 'Electrical (Lights, Sockets)' },
                { value: 'furniture', label: 'Furniture (Bed, Desk)' },
                { value: 'cleaning', label: 'Cleaning Service' },
                { value: 'internet', label: 'Wi-Fi / Internet' },
                { value: 'other', label: 'Other' }
              ]}
              value={reportData.issueType}
              onChange={(e) => setReportData({...reportData, issueType: e.target.value})}
            />
            
            <Select
              label="Priority Level"
              options={[
                { value: 'low', label: 'Low - Can wait (2-3 days)' },
                { value: 'medium', label: 'Medium - Normal (24 hours)' },
                { value: 'high', label: 'High - Urgent (Today)' },
                { value: 'emergency', label: 'Emergency - Immediate' }
              ]}
              value={reportData.priority}
              onChange={(e) => setReportData({...reportData, priority: e.target.value})}
            />

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Describe the Issue</label>
              <textarea
                required
                rows="4"
                value={reportData.description}
                onChange={(e) => setReportData({...reportData, description: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-cyan-500 outline-none transition-all resize-none font-medium"
                placeholder="Please provide details about the problem..."
              ></textarea>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 rounded-2xl py-4 font-black"
              onClick={() => setIsReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1 rounded-2xl py-4 font-black bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-100"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentHostel;
