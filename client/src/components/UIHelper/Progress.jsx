import React from 'react';

const Progress = ({ value, max = 100, label, className = '', barClassName = '' }) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-medium text-gray-700">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full bg-blue-600 ${barClassName}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Progress;