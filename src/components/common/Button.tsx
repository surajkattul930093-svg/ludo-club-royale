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
      'bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 text-slate-950 border-amber-300 shadow-[0_4px_14px_rgba(245,158,11,0.5),inset_0_1px_2px_rgba(255,255,255,0.7)] hover:brightness-110 active:translate-y-0.5',
    secondary:
      'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 text-slate-100 border-slate-600 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)] hover:bg-slate-700 active:translate-y-0.5',
    accent:
      'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 text-white border-blue-400 shadow-[0_4px_14px_rgba(37,99,235,0.5),inset_0_1px_2px_rgba(255,255,255,0.5)] hover:brightness-110 active:translate-y-0.5',
    danger:
      'bg-gradient-to-b from-red-500 via-red-600 to-red-700 text-white border-red-400 shadow-[0_4px_14px_rgba(220,38,38,0.5),inset_0_1px_2px_rgba(255,255,255,0.5)] hover:brightness-110 active:translate-y-0.5',
  }[variant];

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-bold rounded-lg',
    md: 'px-5 py-2.5 text-sm font-extrabold rounded-xl tracking-wide',
    lg: 'px-7 py-3.5 text-base font-black rounded-2xl tracking-wider',
  }[size];

  return (
    <button
      onClick={handleClick}
      className={`border inline-flex items-center justify-center gap-2 select-none uppercase transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${sizeStyles} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
