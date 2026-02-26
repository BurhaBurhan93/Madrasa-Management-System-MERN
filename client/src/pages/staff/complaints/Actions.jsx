import React, { useMemo, useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';

const StaffComplaintActions = () => {
  const [actions, setActions] = useState([
    { id: 'a1', complaintId: 'c2', note: 'Called maintenance', result: 'Awaiting parts', followUp: '2026-02-25', nextRequired: true },
  ]);
  const [form, setForm] = useState({ id: '', complaintId: '', note: '', result: '', followUp: '', nextRequired: false });
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return actions.filter(a => a.complaintId.toLowerCase().includes(search.toLowerCase()));
  }, [actions, search]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.complaintId || !form.note) return;
    if (form.id) {
      setActions(prev => prev.map(a => (a.id === form.id ? form : a)));
    } else {
      setActions(prev => [...prev, { ...form, id: Date.now().toString() }]);
    }
    setForm({ id: '', complaintId: '', note: '', result: '', followUp: '', nextRequired: false });
  };

  const onEdit = (a) => setForm(a);
  const onDelete = (id) => setActions(prev => prev.filter(a => a.id !== id));

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaint Actions</h1>
        <p className="text-gray-600">Record actions, notes, and follow-ups</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">{form.id ? 'Edit Action' : 'Add Action'}</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input label="Complaint ID" id="complaintId" name="complaintId" type="text" value={form.complaintId} onChange={e => setForm({ ...form, complaintId: e.target.value })} />
            <Input label="Note" id="note" name="note" type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            <Input label="Result" id="result" name="result" type="text" value={form.result} onChange={e => setForm({ ...form, result: e.target.value })} />
            <Input label="Follow-up Date" id="followUp" name="followUp" type="date" value={form.followUp} onChange={e => setForm({ ...form, followUp: e.target.value })} />
            <div className="flex items-center gap-2">
              <input id="nextRequired" type="checkbox" checked={form.nextRequired} onChange={e => setForm({ ...form, nextRequired: e.target.checked })} />
              <label htmlFor="nextRequired" className="text-sm">Next action required</label>
            </div>
            <Button type="submit">{form.id ? 'Update' : 'Create'}</Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Action History</h2>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by Complaint ID" className="px-3 py-2 border rounded" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Complaint</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Note</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Result</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Follow-up</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Next</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td className="px-4 py-2">{a.complaintId}</td>
                    <td className="px-4 py-2">{a.note}</td>
                    <td className="px-4 py-2">{a.result || '-'}</td>
                    <td className="px-4 py-2">{a.followUp || '-'}</td>
                    <td className="px-4 py-2">{a.nextRequired ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => onEdit(a)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => onDelete(a.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StaffComplaintActions;
