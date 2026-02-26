import React, { useMemo } from 'react';
import Card from '../../../components/UIHelper/Card';

const StaffLibraryReports = () => {
  const data = {
    totalBooks: 320,
    borrowed: 45,
    returned: 120,
    purchases: 25,
    sales: 18,
    lowStock: 12,
  };

  const ratios = useMemo(() => {
    return {
      borrowedRate: Math.round((data.borrowed / data.totalBooks) * 100),
      returnedRate: Math.round((data.returned / data.totalBooks) * 100),
    };
  }, [data]);

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="py-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Library Reports</h1>
        <p className="text-gray-600">Overview and KPIs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{data.totalBooks}</div>
          <div className="text-sm text-gray-600">Total Books</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{data.borrowed}</div>
          <div className="text-sm text-gray-600">Borrowed</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">{data.returned}</div>
          <div className="text-sm text-gray-600">Returned</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">{data.purchases}</div>
          <div className="text-sm text-gray-600">Purchases</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-pink-600">{data.sales}</div>
          <div className="text-sm text-gray-600">Sales</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">{data.lowStock}</div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Quick Ratios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">Borrowed Rate</p>
            <p className="text-2xl font-bold text-blue-700">{ratios.borrowedRate}%</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">Returned Rate</p>
            <p className="text-2xl font-bold text-green-700">{ratios.returnedRate}%</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">Low Stock</p>
            <p className="text-2xl font-bold text-red-700">{data.lowStock}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StaffLibraryReports;
