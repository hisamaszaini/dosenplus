import React from 'react';

type ButtonVariant = 'primary' | 'danger' | 'warning' | 'secondary';
type ButtonSize = 'normal' | 'small' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  applyDisabledStyle?: boolean;
  children?: React.ReactNode;
}

const Button = ({ 
  variant = 'primary', 
  size = 'normal', 
  icon, 
  children, 
  applyDisabledStyle = true,
  ...props 
}: ButtonProps) => {
  const baseClasses =
    "flex items-center justify-center font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-primary/40 focus:ring-primary-light',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-500/40 focus:ring-red-500',
    warning: 'bg-amber-100 text-amber-600 hover:bg-amber-200 focus:ring-amber-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400',
  };

  const sizeClasses = {
    normal: 'px-6 py-3 rounded-xl gap-2',
    small: 'px-4 py-2 rounded-lg text-sm gap-2',
    icon: 'w-9 h-9 rounded-lg',
  };

  const disabledClasses =
    props.disabled && applyDisabledStyle
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses}`;

  return (
    <button className={combinedClasses} {...props}>
      {icon && <i className={`${icon} ${children ? 'mr-2' : ''}`}></i>}
      {children}
    </button>
  );
};

export default Button;
