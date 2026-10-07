import React from 'react';
import { AudioService } from '../../services/AudioService';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    AudioService.getInstance().playButtonSound();
    if (onClick) {
      onClick(e);
    }
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 text-amber-950 border-t border-l border-r border-amber-300 border-b-[6px] border-b-amber-700 shadow-xl hover:brightness-110 active:border-b-0 active:translate-y-[6px]',
    secondary:
      'bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 text-white border-t border-l border-r border-slate-500 border-b-[6px] border-b-slate-900 shadow-xl hover:brightness-110 active:border-b-0 active:translate-y-[6px]',
    accent:
      'bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 text-white border-t border-l border-r border-blue-400 border-b-[6px] border-b-blue-800 shadow-xl hover:brightness-110 active:border-b-0 active:translate-y-[6px]',
    danger:
      'bg-gradient-to-b from-red-400 via-red-500 to-red-600 text-white border-t border-l border-r border-red-400 border-b-[6px] border-b-red-900 shadow-xl hover:brightness-110 active:border-b-0 active:translate-y-[6px]',
  }[variant];

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-bold rounded-lg',
    md: 'px-5 py-2.5 text-sm font-extrabold rounded-xl tracking-wide',
    lg: 'px-7 py-3.5 text-base font-black rounded-2xl tracking-wider',
  }[size];

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 select-none uppercase transition-all duration-75 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${sizeStyles} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
