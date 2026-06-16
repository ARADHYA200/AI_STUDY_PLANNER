import React from 'react';

export const Card = ({
  title,
  children,
  className = '',
  footer,
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {title}
        </h3>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
