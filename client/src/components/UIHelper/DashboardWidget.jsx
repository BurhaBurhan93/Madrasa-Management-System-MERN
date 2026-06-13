import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMoreVertical } from 'react-icons/fi';

const DashboardWidget = ({
  title,
  value,
  change,
  icon,
  color = 'blue',
  trend = 'up',
  description,
  onClick,
  className = '',
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <div
      className={`rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${colorClasses[color]} ${className} ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className={`ml-2 flex items-center text-sm font-medium ${trendColor}`}>
                {trend === 'up' ? (
                  <FiTrendingUp className="mr-1" size={14} />
                ) : (
                  <FiTrendingDown className="mr-1" size={14} />
                )}
                {change}
              </div>
            )}
          </div>
          {description && (
            <p className="mt-2 text-sm opacity-70">{description}</p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/50">
            {icon}
          </div>
          <button className="mt-2 text-slate-400 hover:text-slate-600">
            <FiMoreVertical size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const StatCard = ({ title, value, icon, trend, change, color = 'slate' }) => (
  <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/50">
        {icon}
      </div>
    </div>
    {trend && change && (
      <div className="mt-3 flex items-center text-sm">
        {trend === 'up' ? (
          <FiTrendingUp className="mr-1 text-green-600" size={14} />
        ) : (
          <FiTrendingDown className="mr-1 text-red-600" size={14} />
        )}
        <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
          {change}
        </span>
        <span className="ml-2 text-slate-500">from last month</span>
      </div>
    )}
  </div>
);

export const ChartWidget = ({ title, children, actions, className = '' }) => (
  <div className={`rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl p-5 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
    <div className="h-64">{children}</div>
  </div>
);

export const ProgressWidget = ({ title, value, max, color = 'blue', description }) => {
  const percentage = (value / max) * 100;
  
  const progressColors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    cyan: 'bg-cyan-600',
  };

  return (
    <div className="rounded-xl border border-white/60 bg-white/40 backdrop-blur-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-slate-900">{title}</h3>
        <span className="text-sm font-medium text-slate-700">
          {value}/{max}
        </span>
      </div>
      <div className="mb-2">
        <div className="h-2 w-full rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${progressColors[color]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {description && (
        <p className="text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
};

export default DashboardWidget;