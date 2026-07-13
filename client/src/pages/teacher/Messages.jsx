import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch, parseJsonSafe } from '../../lib/apiFetch';
import { PANEL_PAGE_BG } from '../../Constatns/pageStyles';

const Messages = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const chatEnd = useRef(null);

  const fieldCls = 'rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200';

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/communications/messages');
      const data = await parseJsonSafe(res);
      if (data.success) setMessages(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      const res = await apiFetch('/communications/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientRole: 'admin',
          subject: newMsg.trim().slice(0, 50),
          content: newMsg.trim(),
        }),
      });
      const data = await parseJsonSafe(res);
      if (data.success) {
        setNewMsg('');
        fetchMessages();
      } else {
        alert(data.message || t('teacher.messages.failedToSend'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={PANEL_PAGE_BG}>
      <div className="flex h-[calc(100vh-8rem)] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('teacher.messages.title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('teacher.messages.subtitle')}</p>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-4 text-5xl">💬</div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('teacher.messages.noMessages')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg._id} className="flex justify-start">
                    <div className="max-w-lg rounded-3xl px-5 py-3 bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{msg.sender?.name || t('common.unknown')}</p>
                      <p className="mt-1 text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="mt-1 text-right text-xs text-slate-400 dark:text-slate-500">
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEnd} />
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-4 dark:border-slate-700">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('teacher.messages.typeMessage')}
                className={fieldCls + ' flex-1'}
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMsg.trim()}
                className="rounded-2xl bg-cyan-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {sending ? t('common.sending') : t('teacher.messages.send')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
