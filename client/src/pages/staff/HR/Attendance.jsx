import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../lib/api';
import Button from '../../../components/UIHelper/Button';
import CalendarDatePicker from "../../../components/UIHelper/CalendarDatePicker";

const statusOptions = ['present', 'absent', 'late', 'half-day', 'on-leave'];

  const statusColors = {
    present: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    absent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    late: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    'half-day': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    'on-leave': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  };

const HRAttendance = () => {
  const { t } = useTranslation(['staff', 'common']);
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) fetchAttendanceByDate(date);
  }, [date, employees.length]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees?status=active');
      if (res.data.success) {
        setEmployees(res.data.data);
        const defaults = {};
        res.data.data.forEach(e => { defaults[e._id] = { status: 'present', checkIn: '', checkOut: '', remarks: '' }; });
        setRecords(defaults);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAttendanceByDate = async (selectedDate) => {
    setFetching(true);
    try {
      const res = await api.get(`/hr/attendance/date/${selectedDate}`);
      if (res.data.success && res.data.data.length > 0) {
        const existing = {};
        res.data.data.forEach(r => {
          existing[r.employee._id] = {
            status: r.status,
            checkIn: r.checkIn || '',
            checkOut: r.checkOut || '',
            remarks: r.remarks || ''
          };
        });
        setRecords(prev => ({ ...prev, ...existing }));
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (employeeId, field, value) => {
    setRecords(prev => ({ ...prev, [employeeId]: { ...prev[employeeId], [field]: value } }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        date,
        records: employees.map(e => ({ employee: e._id, ...records[e._id] }))
      };
      const res = await api.post('/hr/attendance', payload);
      if (res.data.success) alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || t('staff.hr.attendance.failedSave'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('staff.hr.attendance.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('staff.hr.attendance.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <CalendarDatePicker value={date} onChange={(date) => setDate(date)} placeholder={t('staff.hr.attendance.selectDate')} />
          <Button onClick={handleSubmit} disabled={loading} className="bg-cyan-500 hover:bg-cyan-600 text-white">
            {loading ? t('common.saving') : t('staff.hr.attendance.saveAttendance')}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow overflow-hidden">
        {fetching ? (
          <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-3 text-left">{t('staff.hr.attendance.tableEmployee')}</th>
                <th className="p-3 text-left">{t('staff.hr.attendance.tableCode')}</th>
                <th className="p-3 text-left">{t('staff.hr.attendance.tableStatus')}</th>
                <th className="p-3 text-left">{t('staff.hr.attendance.tableCheckIn')}</th>
                <th className="p-3 text-left">{t('staff.hr.attendance.tableCheckOut')}</th>
                <th className="p-3 text-left">{t('staff.hr.attendance.tableRemarks')}</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">{t('staff.hr.attendance.noEmployees')}</td></tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{emp.fullName}</td>
                    <td className="p-3 text-gray-500">{emp.employeeCode}</td>
                    <td className="p-3">
                      <select
                        value={records[emp._id]?.status || 'present'}
                        onChange={e => handleChange(emp._id, 'status', e.target.value)}
                        className={`px-2 py-1 rounded-lg text-sm border-0 outline-none font-medium ${statusColors[records[emp._id]?.status] || ''}`}
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{t(`staff.hr.attendance.status.${s}`)}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="time"
                        value={records[emp._id]?.checkIn || ''}
                        onChange={e => handleChange(emp._id, 'checkIn', e.target.value)}
                        className="border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="time"
                        value={records[emp._id]?.checkOut || ''}
                        onChange={e => handleChange(emp._id, 'checkOut', e.target.value)}
                        className="border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={records[emp._id]?.remarks || ''}
                        onChange={e => handleChange(emp._id, 'remarks', e.target.value)}
                        placeholder={t('staff.hr.attendance.remarksPlaceholder')}
                        className="border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-cyan-500 w-full"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HRAttendance;
