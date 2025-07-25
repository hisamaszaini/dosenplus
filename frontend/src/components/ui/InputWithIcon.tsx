import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon: string;
};

const InputWithIcon = ({ icon, ...rest }: InputProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className={`${icon} text-gray-400`}></i>
      </div>
      <input
        {...rest}
        className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
      />
    </div>
  );
};

export default InputWithIcon;