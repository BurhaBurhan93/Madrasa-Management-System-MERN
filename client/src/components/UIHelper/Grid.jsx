import React from 'react';
import { theme } from '../theme';

const Grid = ({ children, className = '', cols = 1, gap = 6 }) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  const gapClasses = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
  };

  return (
    <div className={`grid ${colClasses[cols] || colClasses[1]} ${gapClasses[gap] || gapClasses[6]} ${className}`}>
      {children}
    </div>
  );
};

export default Grid;
