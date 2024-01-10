import clsx from 'clsx';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export default function Button({
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'btn text-base-100 drop-shadow-md',
        {
          'text-sm': size === 'sm',
          'text-lg': size === 'lg',
          'text-xl': size === 'xl',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
