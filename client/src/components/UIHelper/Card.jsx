import React from 'react';

const Card = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="border-b border-gray-200 p-6">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div className={title || subtitle ? 'p-6' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return <div className={`p-6 border-b border-gray-200 ${className}`}>{children}</div>;
};

const CardContent = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

const CardFooter = ({ children, className = '' }) => {
  return <div className={`p-6 border-t border-gray-200 ${className}`}>{children}</div>;
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;