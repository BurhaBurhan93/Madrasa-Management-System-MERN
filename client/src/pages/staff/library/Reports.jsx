import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../../components/UIHelper/Card';
import { PieChartComponent, BarChartComponent } from '../../../components/UIHelper/ECharts';

const StaffLibraryReports = () => {
  const [data, setData] = useState({
    totalBooks: 0,
    borrowed: 0,
    returned: 0,
    lowStock: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchLibraryStats();
  }, []);

  const fetchLibraryStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getConfig();
      const response = await axios.get('http://localhost:5000/api/staff/library/stats', config);
      
      setData(response.data);
    } catch (err) {
      console.error('Error fetching library stats:', err);
      setError('Failed to fetch library statistics. Please try again.');

    } finally {

      setLoading(false);

    }

  };



  const borrowedRate = data.totalBooks > 0 ? Math.round((data.borrowed / data.totalBooks) * 100) : 0;

  const returnedRate = data.totalBooks > 0 ? Math.round((data.returned / data.totalBooks) * 100) : 0;



  return (

    <div className="w-full bg-gray-50 min-h-screen">

      <div className="py-6 mb-8">

        <h1 className="text-3xl font-bold text-gray-900">Library Reports</h1>

        <p className="text-gray-600">Overview and KPIs</p>

      </div>



      {error && !loading && (
        <Card className="rounded-[28px] border border-rose-200 bg-rose-50 mb-6">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-rose-900">Unable to Load Reports</h3>
                <p className="mt-1 text-sm text-rose-700">{error}</p>
                <button onClick={fetchLibraryStats} className="mt-3 inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}



      {loading ? (

        <div className="text-center py-8">

          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>

          <p className="mt-4 text-gray-600">Loading reports...</p>

        </div>

      ) : (

      <>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

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

          <div className="text-2xl font-bold text-red-600">{data.lowStock}</div>

          <div className="text-sm text-gray-600">Low Stock</div>

        </Card>

      </div>



      <Card>

        <h2 className="text-xl font-semibold mb-4">Quick Ratios</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">

            <p className="text-sm text-blue-700">Borrowed Rate</p>

            <p className="text-2xl font-bold text-blue-700">{borrowedRate}%</p>

          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">

            <p className="text-sm text-green-700">Returned Rate</p>

            <p className="text-2xl font-bold text-green-700">{returnedRate}%</p>

          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">

            <p className="text-sm text-red-700">Low Stock</p>

            <p className="text-2xl font-bold text-red-700">{data.lowStock}</p>

          </div>

        </div>

      </Card>



      {/* Charts Section */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

        <Card title="Book Status Distribution">

          <PieChartComponent 

            data={[

              { name: 'Available', value: data.totalBooks - data.borrowed, color: '#10B981' },

              { name: 'Borrowed', value: data.borrowed, color: '#F59E0B' },

              { name: 'Low Stock', value: data.lowStock, color: '#EF4444' }

            ].filter(d => d.value > 0)}

            dataKey="value"

            nameKey="name"

            height={300}

          />

        </Card>



        <Card title="Library Activity Overview">

          <BarChartComponent 

            data={[

              { name: 'Total', value: data.totalBooks },

              { name: 'Borrowed', value: data.borrowed },

              { name: 'Returned', value: data.returned },

              { name: 'Low Stock', value: data.lowStock }

            ]}

            dataKey="value"

            nameKey="name"

            height={300}

          />

        </Card>

      </div>

      </>

      )}

    </div>

  );

};



export default StaffLibraryReports;

