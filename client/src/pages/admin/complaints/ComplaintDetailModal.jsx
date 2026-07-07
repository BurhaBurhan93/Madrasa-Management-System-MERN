import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../../components/UIHelper/Modal';
import Badge from '../../../components/UIHelper/Badge';
import Button from '../../../components/UIHelper/Button';
import api from '../../../lib/api';
import { FiSend, FiMessageSquare, FiCheckCircle, FiPlay } from 'react-icons/fi';

const fields = [
  { key: 'complaintCode', labelKey: 'complaintId', prefix: '#' },
  { key: 'subject', labelKey: 'subject' },
  { key: 'description', labelKey: 'description' },
  { key: 'category', labelKey: 'category', badge: true },
  { key: 'priority', labelKey: 'priorityLabel', badge: true },
  { key: 'status', labelKey: 'status', badge: true },
  { key: 'submittedBy', labelKey: 'submittedBy', nested: 'name' },
  { key: 'assignedTo', labelKey: 'assignedTo', nested: 'name', fallback: 'Unassigned' },
  { key: 'createdAt', labelKey: 'date', date: true },
  { key: 'closedAt', labelKey: 'resolvedDate', date: true },
];

const statusColorMap = { pending: 'yellow', 'in-progress': 'blue', resolved: 'green' };
const priorityColorMap = { high: 'red', medium: 'yellow', low: 'green' };

const ComplaintDetailModal = ({ complaint, isOpen, onClose, onRefresh }) => {
  const { t } = useTranslation('admin');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  if (!complaint) return null;

  const getValue = (field) => {
    let val = complaint[field.key];
    if (field.nested && val) val = val[field.nested];
    if (field.date && val) val = new Date(val).toLocaleDateString();
    if (val === undefined || val === null) return field.fallback || '-';
    if (field.prefix) return field.prefix + val;
    return val;
  };

  const handleSendNote = async () => {
    if (!note.trim()) return;
    setSending(true);
    try {
      await api.put(`/complaints/${complaint._id}`, { adminNotes: note });
      setNote('');
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); } finally { setSending(false); }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.put(`/complaints/${complaint._id}`, { status });
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) { console.error(err); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={complaint.subject || t('untitled')} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t('complaints.' + f.labelKey) || t('common.' + f.labelKey) || f.labelKey}</label>
              <p className="mt-0.5 text-sm text-slate-800">
                {f.badge ? (
                  <Badge color={f.key === 'priority' ? priorityColorMap[getValue(f)] : statusColorMap[getValue(f)]}>
                    {getValue(f)}
                  </Badge>
                ) : getValue(f)}
              </p>
            </div>
          ))}
        </div>

        {complaint.adminNotes && (
          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FiMessageSquare size={12} /> {t('complaints.actionNotes') || 'Admin Notes'}
            </label>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 whitespace-pre-wrap">{complaint.adminNotes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          {complaint.status === 'pending' && (
            <Button size="sm" icon={FiPlay} onClick={() => handleStatusChange('in-progress')}>{t('complaints.markInProgress')}</Button>
          )}
          {complaint.status !== 'resolved' && (
            <Button size="sm" variant="success" icon={FiCheckCircle} onClick={() => handleStatusChange('resolved')}>{t('complaints.resolve')}</Button>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FiMessageSquare size={12} /> {complaint.adminNotes ? (t('complaints.actionNotes') || 'Add Note') : (t('complaints.actionNotes') || 'Admin Notes')}
          </label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder={t('complaints.enterActionDetails') || 'Type a note or action...'} />
          <div className="mt-1.5 flex justify-end">
            <Button size="sm" icon={FiSend} onClick={handleSendNote} disabled={sending || !note.trim()}>
              {t('common.submit')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ComplaintDetailModal;
