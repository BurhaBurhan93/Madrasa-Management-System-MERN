import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiDownload, FiUser, FiDatabase, FiCalendar, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { Table, Button, Card, Input, Select, Badge, Loading } from '../../components/UIHelper';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dateRange, setDateRange] = useState('');

  useEffect(() => {
    const mockLogs = [
      { id: 1, timestamp: '2024-01-15 10:30:25', user: 'admin@madrasa.edu', action: 'CREATE', module: 'Users', details: 'Created new student: Ahmed Khan', ip: '192.168.1.100', status: 'SUCCESS' },
      { id: 2, timestamp: '2024-01-15 11:15:42', user: 'registrar@madrasa.edu', action: 'UPDATE', module: 'Students', details: 'Updated student profile: Roll No 2024001', ip: '192.168.1.101', status: 'SUCCESS' },
      { id: 3, timestamp: '2024-01-15 14:20:18', user: 'teacher@madrasa.edu', action: 'READ', module: 'Attendance', details: 'Viewed attendance report for Class 10A', ip: '192.168.1.102', status: 'SUCCESS' },
      { id: 4, timestamp: '2024-01-15 16:45:33', user: 'admin@madrasa.edu', action: 'DELETE', module: 'Users', details: 'Deleted user: test@example.com', ip: '192.168.1.100', status: 'SUCCESS' },
      { id: 5, timestamp: '2024-01-16 09:10:55', user: 'accountant@madrasa.edu', action: 'CREATE', module: 'Finance', details: 'Created fee payment record', ip: '192.168.1.103', status: 'SUCCESS' },
      { id: 6, timestamp: '2024-01-16 11:30:12', user: 'librarian@madrasa.edu', action: 'UPDATE', module: 'Library', details: 'Updated book inventory', ip: '192.168.1.104', status: 'SUCCESS' },
      { id: 7, timestamp: '2024-01-16 13:45:29', user: 'unknown@madrasa.edu', action: 'LOGIN', module: 'Auth', details: 'Failed login attempt', ip: '203.0.113.25', status: 'FAILED' },
      { id: 8, timestamp: '2024-01-16 15:20:47', user: 'admin@madrasa.edu', action: 'EXPORT', module: 'Reports', details: 'Exported financial report', ip: '192.168.1.100', status: 'SUCCESS' },
      { id: 9, timestamp: '2024-01-17 08:55:10', user: 'registrar@madrasa.edu', action: 'CREATE', module: 'Admissions', details: 'Processed new admission application', ip: '192.168.1.101', status: 'SUCCESS' },
      { id: 10, timestamp: '2024-01-17 12:15:38', user: 'teacher@madrasa.edu', action: 'UPDATE', module: 'Exams', details: 'Updated exam marks for Class 9B', ip: '192.168.1.102', status: 'SUCCESS' },
    ];
    setLogs(mockLogs);
    setLoading(false);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = !selectedAction || log.action === selectedAction;
    const matchesUser = !selectedUser || log.user === selectedUser;
    const matchesDate = !dateRange || log.timestamp.startsWith(dateRange);
    return matchesSearch && matchesAction && matchesUser && matchesDate;
  });

  const getActionColor = (action) => {
    switch(action) {
      case 'CREATE': return 'green';
      case 'UPDATE': return 'blue';
      case 'DELETE': return 'red';
      case 'READ': return 'gray';
      case 'LOGIN': return 'purple';
      case 'EXPORT': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'SUCCESS' ? <FiCheckCircle className="text-green-500" size={16} /> : <FiAlertCircle className="text-red-500" size={16} />;
  };

  const columns = [
    { 
      key: 'timestamp', 
      label: 'Timestamp', 
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <FiCalendar className="text-slate-400" size={14} />
          <span className="font-mono text-sm">{value}</span>
        </div>
      )
    },
    { 
      key: 'user', 
      label: 'User', 
      render: (value) => (
        <div className="flex items-center gap-2">
          <FiUser className="text-slate-400" size={14} />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    { 
      key: 'action', 
      label: 'Action', 
      render: (value) => (
        <Badge color={getActionColor(value)} variant="subtle">
          {value}
        </Badge>
      )
    },
    { 
      key: 'module', 
      label: 'Module',
      render: (value) => (
        <div className="flex items-center gap-2">
          <FiDatabase className="text-slate-400" size={14} />
          <span>{value}</span>
        </div>
      )
    },
    { key: 'details', label: 'Details' },
    { key: 'ip', label: 'IP Address' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <Badge 
            color={value === 'SUCCESS' ? 'green' : 'red'}
            variant="subtle"
          >
            {value}
          </Badge>
        </div>
      )
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-600">Track all system activities and user actions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<FiDownload size={16} />}>
            Export Logs
          </Button>
          <Button variant="outline" color="red">
            Clear Old Logs
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="md:col-span-2">
            <Input
              placeholder="Search by user, details, or module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<FiSearch />}
            />
          </div>
          <Select
            value={selectedAction}
            onChange={setSelectedAction}
            options={[
              { value: '', label: 'All Actions' },
              { value: 'CREATE', label: 'Create' },
              { value: 'UPDATE', label: 'Update' },
              { value: 'DELETE', label: 'Delete' },
              { value: 'READ', label: 'Read' },
              { value: 'LOGIN', label: 'Login' },
              { value: 'EXPORT', label: 'Export' },
            ]}
          />
          <Select
            value={selectedUser}
            onChange={setSelectedUser}
            options={[
              { value: '', label: 'All Users' },
              { value: 'admin@madrasa.edu', label: 'Admin' },
              { value: 'registrar@madrasa.edu', label: 'Registrar' },
              { value: 'teacher@madrasa.edu', label: 'Teacher' },
              { value: 'accountant@madrasa.edu', label: 'Accountant' },
              { value: 'librarian@madrasa.edu', label: 'Librarian' },
            ]}
          />
          <Select
            value={dateRange}
            onChange={setDateRange}
            options={[
              { value: '', label: 'All Dates' },
              { value: '2024-01-15', label: 'Jan 15, 2024' },
              { value: '2024-01-16', label: 'Jan 16, 2024' },
              { value: '2024-01-17', label: 'Jan 17, 2024' },
            ]}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-slate-600">
            Showing {filteredLogs.length} of {logs.length} audit logs
          </div>
          <Button variant="outline" icon={<FiFilter size={16} />}>
            Advanced Filters
          </Button>
        </div>

        <Table
          columns={columns}
          data={filteredLogs}
          pagination
          pageSize={10}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-slate-500 mb-1">Total Logs</div>
          <div className="text-2xl font-bold text-slate-900">{logs.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500 mb-1">Successful Actions</div>
          <div className="text-2xl font-bold text-green-600">
            {logs.filter(l => l.status === 'SUCCESS').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500 mb-1">Failed Actions</div>
          <div className="text-2xl font-bold text-red-600">
            {logs.filter(l => l.status === 'FAILED').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500 mb-1">Unique Users</div>
          <div className="text-2xl font-bold text-blue-600">
            {[...new Set(logs.map(l => l.user))].length}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuditLogs;