import React from 'react';
import clsx from 'clsx';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  ariaLabel: string;
  autoFocus?: boolean;
}

export default function TextInput({
  label,
  id,
  name,
  type,
  autoComplete,
  required,
  ariaLabel,
  autoFocus,
  className,
  ...props
}: TextInputProps) {
  const classes = clsx('form-control w-full max-w-xs', className);

  return (
    <label className={classes} htmlFor={id}>
      <div className="label">
        <span className="label-text">{label}</span>
      </div>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        {...props}
      />
    </label>
  );
}
