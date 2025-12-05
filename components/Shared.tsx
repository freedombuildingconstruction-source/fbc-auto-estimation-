import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const DarkInput: React.FC<InputProps> = ({ label, className, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-xs text-gray-400 font-medium">{label}</label>}
    <input
      className={`bg-navyLight text-white px-3 py-2 rounded border border-transparent focus:border-brandOrange focus:ring-1 focus:ring-brandOrange outline-none transition-all placeholder-gray-500 ${className}`}
      {...props}
    />
  </div>
);

export const DarkSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, children, className, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-xs text-gray-400 font-medium">{label}</label>}
    <select
      className={`bg-navyLight text-white px-3 py-2 rounded border border-transparent focus:border-brandOrange focus:ring-1 focus:ring-brandOrange outline-none transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

export const OrangeButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
  <button
    className={`bg-brandOrange hover:bg-orange-600 text-white font-bold py-2 px-4 rounded shadow-md transition-colors flex items-center justify-center gap-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const CheckboxGroup: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <label className="flex items-center space-x-2 cursor-pointer group">
    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-brandOrange border-brandOrange' : 'bg-navyLight border-gray-600 group-hover:border-brandOrange'}`}>
      {checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
    </div>
    <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="text-sm text-white group-hover:text-gray-200">{label}</span>
  </label>
);