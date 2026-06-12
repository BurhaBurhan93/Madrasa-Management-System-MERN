import React, { useState } from 'react';

const APIManagement = () => {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">API Management</h1><p className="mt-1 text-sm text-slate-500">Manage API keys, integrations, and rate limits</p></div>
        <button onClick={handleSave} className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-200 hover:bg-cyan-700">{saved ? '✓ Saved' : 'Save Settings'}</button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">API Keys</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-cyan-600" /><span className="text-sm text-slate-700">Enable api keys</span></label>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Configuration</label><input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Enter value..." /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Description</label><textarea className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} placeholder="Description..." /></div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Rate Limits</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-cyan-600" /><span className="text-sm text-slate-700">Enable rate limits</span></label>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Configuration</label><input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Enter value..." /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Description</label><textarea className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} placeholder="Description..." /></div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Webhooks</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-cyan-600" /><span className="text-sm text-slate-700">Enable webhooks</span></label>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Configuration</label><input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Enter value..." /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Description</label><textarea className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} placeholder="Description..." /></div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Integrations</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-cyan-600" /><span className="text-sm text-slate-700">Enable integrations</span></label>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Configuration</label><input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Enter value..." /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Description</label><textarea className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} placeholder="Description..." /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIManagement;
