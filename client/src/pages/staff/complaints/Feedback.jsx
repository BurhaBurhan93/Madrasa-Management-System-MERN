import React, { useMemo, useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import Input from '../../../components/UIHelper/Input';

const StaffComplaintFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([
    { id: 'f1', complaintId: 'c3', rating: 4, comment: 'Resolved quickly', date: '2026-02-12' },
  ]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ id: '', complaintId: '', rating: 5, comment: '', date: '' });

  const filtered = useMemo(() => {
    return feedbacks.filter(f => f.complaintId.toLowerCase().includes(search.toLowerCase()));
  }, [feedbacks, search]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.complaintId) return;
    if (form.id) {
      setFeedbacks(prev => prev.map(f => (f.id === form.id ? { ...form, rating: Number(form.rating) } : f)));
    } else {
      setFeedbacks(prev => [...prev, { ...form, id: Date.now().toString(), rating: Number(form.rating) }]);
    }
    setForm({ id: '', complaintId: '', rating: 5, comment: '', date: '' });
  };

  const onEdit = (f) => setForm(f);
  const onDelete = (id) => setFeedbacks(prev => prev.filter(f => f.id !== id));

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complaint Feedback</h1>
        <p className="text-gray-600">Track satisfaction and comments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">{form.id ? 'Edit Feedback' : 'Add Feedback'}</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input label="Complaint ID" id="complaintId" name="complaintId" type="text" value={form.complaintId} onChange={e => setForm({ ...form, complaintId: e.target.value })} />
            <Input label="Rating (1-5)" id="rating" name="rating" type="number" min={1} max={5} value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
            <Input label="Comment" id="comment" name="comment" type="text" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
            <Input label="Date" id="date" name="date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <Button type="submit">{form.id ? 'Update' : 'Create'}</Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Feedback</h2>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by Complaint ID" className="px-3 py-2 border rounded" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Complaint</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rating</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Comment</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(f => (
                  <tr key={f.id}>
                    <td className="px-4 py-2">{f.complaintId}</td>
                    <td className="px-4 py-2">{f.rating}</td>
                    <td className="px-4 py-2">{f.comment || '-'}</td>
                    <td className="px-4 py-2">{f.date || '-'}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => onEdit(f)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => onDelete(f.id)}>Delete</Button>
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

export default StaffComplaintFeedback;
