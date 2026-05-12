import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, icon, fullWidth = true, className = '', ...props },
    ref
  ) => {
    return (
      <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="text-sm font-semibold text-[#dfbe6c]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#dfbe6c]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-lg
              bg-[#0a1810] border-2 border-[#dfbe6c] border-opacity-30
              text-[#ffffff] placeholder-opacity-50
              focus:outline-none focus:border-[#dfbe6c] focus:border-opacity-100
              focus:ring-2 focus:ring-[#dfbe6c] focus:ring-opacity-20
              transition-all duration-300
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 border-opacity-100' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
