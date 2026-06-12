import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const AdminComplaintFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/complaints?hasFeedback=true');
        const list = Array.isArray(data) ? data : data.data || [];
        setFeedbacks(list.filter(c => c.feedback || c.rating));
      } catch { setFeedbacks([]); } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Complaint Feedback</h1><p className="mt-1 text-sm text-slate-500">Feedback from users on resolved complaints</p></div>
      <div className="space-y-3">
        {feedbacks.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white py-10 text-center text-slate-400">No feedback received yet</div>}
        {feedbacks.map(f => (
          <div key={f._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">{f.subject || f.title || 'Untitled'}</p>
                <p className="text-sm text-slate-500">By: {f.submittedBy?.name || f.userId?.name || 'Anonymous'}</p>
              </div>
              {f.rating && <div className="flex items-center gap-1">{[1,2,3,4,5].map(s => <span key={s} className={`text-lg ${s <= f.rating ? 'text-amber-400' : 'text-slate-200'}`}>&#9733;</span>)}</div>}
            </div>
            {f.feedback && <p className="mt-3 text-sm text-slate-600">{f.feedback}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminComplaintFeedback;
