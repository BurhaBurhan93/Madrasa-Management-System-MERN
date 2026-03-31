import React, { useEffect, useState } from 'react';
import Card from '../../../components/UIHelper/Card';
import Button from '../../../components/UIHelper/Button';
import DataTable from '../../../components/UIHelper/DataTable';
import ErrorPage from '../../../components/UIHelper/ErrorPage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const parseJsonSafe = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    const preview = text.slice(0, 200).replace(/\s+/g, ' ');
    throw new Error(`API returned non-JSON (status ${res.status}). Response: ${preview}`);
  }
};

const ListPage = ({
  title,
  subtitle,
  endpoint,
  columns,
  createPath,
  editPathForRow,
  searchPlaceholder = 'Search...'
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (query.trim()) params.set('search', query.trim());

      const res = await fetch(`${API_BASE}${endpoint}?${params.toString()}`);
      const data = await parseJsonSafe(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Request failed (status ${res.status})`);
      }
      setItems(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query]);

  const columnsWithActions = editPathForRow
    ? [
        ...columns,
        {
          key: '__actions',
          header: 'Actions',
          render: (_value, row) => (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => (window.location.href = editPathForRow(row))}>
                Edit
              </Button>
            </div>
          )
        }
      ]
    : columns;

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
              placeholder={searchPlaceholder}
            />
          </div>
          <div className="md:ml-auto">
            <Button variant="primary" onClick={() => (window.location.href = createPath)}>
              Add New
            </Button>
          </div>
        </div>
      </Card>

      {error && !loading && (
        <ErrorPage 
          type="server" 
          title="Unable to Load Data"
          message={error}
          onRetry={fetchItems}
          onHome={() => window.location.href = '/staff/dashboard'}
          showBackButton={false}
        />
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Records</h2>
          <div className="text-sm text-gray-500">Showing {items.length} of {total}</div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          {loading ? (
            <div className="text-sm text-gray-500 p-4">Loading data...</div>
          ) : (
            <DataTable
              columns={columnsWithActions}
              data={items}
              rowClassName="odd:bg-white even:bg-gray-50"
              headerClassName="bg-gray-100 text-gray-700"
            />
          )}
        </div>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">Page {page}</div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button variant="outline" disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListPage;
