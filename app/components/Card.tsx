import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => {
  return (
    <div
      className={`
        bg-[#0a1810] border-2 border-[#dfbe6c] border-opacity-20
        rounded-lg p-6 sm:p-8
        transition-all duration-300
        hover:border-opacity-40
        ${className}
      `}
    >
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#dfbe6c] mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[#ffffff] text-opacity-70 text-sm">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
