import React from 'react';
import clsx from 'clsx';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  name: string;
  placeholder?: string;
  ariaLabel: string;
  defaultChecked?: boolean;
}

export default function Checkbox({
  label,
  id,
  name,
  placeholder,
  ariaLabel,
  defaultChecked,
  className,
  ...props
}: CheckboxProps) {
  const classes = clsx('form-control mt-4 max-w-xs', className);

  return (
    <div className={classes}>
      <label htmlFor={id} className="label justify-start cursor-pointer">
        <input
          id={id}
          name={name}
          type="checkbox"
          className="checkbox checkbox-accent"
          placeholder={placeholder}
          aria-label={ariaLabel}
          defaultChecked={defaultChecked}
          {...props}
        />
        <span className="label-text ml-2">{label}</span>
      </label>
    </div>
  );
}
