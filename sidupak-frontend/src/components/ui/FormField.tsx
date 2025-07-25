import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  helpText?: string;
}

const FormField = ({ label, children, error, helpText }: FormFieldProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start pt-2">
      <label className="w-full md:w-1/4 text-sm font-medium text-gray-700 mb-2 md:mb-0 md:pt-3">
        {label}
      </label>
      <div className="w-full md:flex-1">
        {children}
        {helpText && <p className="text-gray-500 text-xs mt-1">{helpText}</p>}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default FormField;