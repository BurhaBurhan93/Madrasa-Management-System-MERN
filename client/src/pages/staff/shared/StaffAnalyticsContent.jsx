import React from 'react';
import Card from '../../../components/UIHelper/Card';
import { BarChartComponent, LineChartComponent, PieChartComponent } from '../../../components/UIHelper/ECharts';
import { apiFetch, parseJsonSafe } from '../../../lib/apiFetch';
import { useTheme } from '../../../contexts/ThemeContext.jsx';

const toneStyles = {
  blue: {
    card: 'from-blue-50 to-cyan-50 border-blue-100',
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-950',
    helper: 'text-blue-700'
  },
  emerald: {
    card: 'from-emerald-50 to-green-50 border-emerald-100',
    icon: 'bg-emerald-100 text-emerald-600',
    value: 'text-emerald-950',
    helper: 'text-emerald-700'
  },
  amber: {
    card: 'from-amber-50 to-yellow-50 border-amber-100',
    icon: 'bg-amber-100 text-amber-600',
    value: 'text-amber-950',
    helper: 'text-amber-700'
  },
  rose: {
    card: 'from-rose-50 to-red-50 border-rose-100',
    icon: 'bg-rose-100 text-rose-600',
    value: 'text-rose-950',
    helper: 'text-rose-700'
  },
  violet: {
    card: 'from-violet-50 to-fuchsia-50 border-violet-100',
    icon: 'bg-violet-100 text-violet-600',
    value: 'text-violet-950',
    helper: 'text-violet-700'
  },
  slate: {
    card: 'from-slate-50 to-white border-slate-200',
    icon: 'bg-slate-100 text-slate-600',
    value: 'text-slate-950',
    helper: 'text-slate-600'
  }
};

const chartRenderers = {
  pie: PieChartComponent,
  bar: BarChartComponent,
  line: LineChartComponent
};

const StaffAnalyticsContent = ({ stats = [], charts = [], insight }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-6">
      {stats.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((stat) => {
            const tone = toneStyles[stat.tone] || toneStyles.slate;
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className={`rounded-[28px] shadow-none ${
                  isDark
                    ? 'border-slate-700 bg-slate-900/80'
                    : `border bg-gradient-to-br ${tone.card}`
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                    <p className={`mt-3 text-3xl font-black tracking-tight ${isDark ? 'text-slate-100' : tone.value}`}>{stat.value}</p>
                    {stat.helper ? <p className={`mt-2 text-sm font-medium ${isDark ? 'text-slate-400' : tone.helper}`}>{stat.helper}</p> : null}
                  </div>
                  {Icon ? (
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? 'bg-slate-800 text-cyan-300' : tone.icon}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {insight ? (
        <Card
          className={`rounded-[28px] shadow-none ${
            isDark
              ? 'border-slate-700 bg-slate-900/70'
              : 'border-slate-200 bg-gradient-to-r from-slate-50 via-white to-cyan-50/50'
          }`}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>{insight.eyebrow || 'Snapshot'}</p>
              <h3 className={`mt-2 text-xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{insight.title}</h3>
              {insight.description ? <p className={`mt-2 max-w-3xl text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{insight.description}</p> : null}
            </div>
            {insight.meta ? <div className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{insight.meta}</div> : null}
          </div>
        </Card>
      ) : null}

      {charts.length > 0 && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {charts.map((chart) => {
            const ChartComponent = chartRenderers[chart.type] || BarChartComponent;
            return (
              <ChartComponent
                key={chart.title}
                title={chart.title}
                data={chart.data}
                dataKey={chart.dataKey || 'value'}
                nameKey={chart.nameKey || 'name'}
                emptyText={chart.emptyText}
                height={chart.height || 320}
                className={`rounded-[28px] shadow-none ${isDark ? 'border-slate-700 bg-slate-900/70' : 'border-slate-200 bg-white'}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const fetchCollectionData = async (endpoint, options = {}) => {
  const { limit = 500 } = options;
  const connector = endpoint.includes('?') ? '&' : '?';
  const response = await apiFetch(`${endpoint}${connector}limit=${limit}`);
  const parsed = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(parsed.message || `Request failed with status ${response.status}`);
  }
  const records = parsed.data || parsed.records || parsed.items || parsed;
  return Array.isArray(records) ? records : [];
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

export const formatCompactNumber = (value) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(Number(value || 0));

export const groupAmountByMonth = (items, dateKey, amountKey) => {
  const monthMap = new Map();
  items.forEach((item) => {
    const rawDate = item?.[dateKey] || item?.createdAt;
    if (!rawDate) return;
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = monthMap.get(key) || { date, total: 0 };
    current.total += Number(item?.[amountKey] || 0);
    monthMap.set(key, current);
  });

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, value]) => ({
      name: value.date.toLocaleString('en-US', { month: 'short' }),
      value: Math.round(value.total)
    }));
};

export const groupCountByKey = (items, key, fallback = 'Unknown') => {
  const counts = new Map();
  items.forEach((item) => {
    const rawValue = item?.[key];
    const name =
      typeof rawValue === 'object' && rawValue !== null
        ? rawValue.name || rawValue.title || rawValue.accountName || fallback
        : rawValue || fallback;
    counts.set(String(name), (counts.get(String(name)) || 0) + 1);
  });
  return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
};

export default StaffAnalyticsContent;
