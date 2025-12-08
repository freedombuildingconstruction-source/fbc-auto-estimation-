import React from 'react';

// Handwritten circle SVG component to simulate a red marker
const HandwrittenCircle = () => (
  <div className="absolute -inset-1.5 z-20 pointer-events-none select-none">
     <svg 
       className="w-full h-full overflow-visible" 
       viewBox="0 0 100 100" 
       preserveAspectRatio="none"
     >
       {/* Rough path mimicking a hand-drawn circle/ellipse */}
       <path 
         d="M3,8 Q40,-2 96,6 Q103,50 96,94 Q50,102 4,92 Q-4,50 3,8 M 3,8 L 5,12" 
         vectorEffect="non-scaling-stroke"
         stroke="#dc2626" 
         strokeWidth="4" 
         fill="none"
         strokeLinecap="round"
         strokeLinejoin="round"
         className="opacity-90 drop-shadow-sm filter"
       />
     </svg>
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
}

export const DarkInput: React.FC<InputProps> = ({ label, className, error, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className={`text-xs font-medium ${error ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{label}</label>}
    <div className="relative">
        <input
          className={`bg-navyLight text-white px-3 py-2 rounded border outline-none transition-all placeholder-gray-500 w-full relative z-10 ${
            error 
              ? 'border-transparent' // Remove standard border, rely on circle
              : 'border-transparent focus:border-brandOrange focus:ring-1 focus:ring-brandOrange'
          } ${className}`}
          {...props}
        />
        {error && <HandwrittenCircle />}
    </div>
  </div>
);

export const DarkSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, error?: boolean }> = ({ label, children, className, error, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className={`text-xs font-medium ${error ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{label}</label>}
    <div className="relative">
        <select
          className={`bg-navyLight text-white px-3 py-2 rounded border outline-none transition-all w-full relative z-10 ${
            error 
              ? 'border-transparent' 
              : 'border-transparent focus:border-brandOrange focus:ring-1 focus:ring-brandOrange'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <HandwrittenCircle />}
    </div>
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: boolean;
}

export const DarkTextarea: React.FC<TextareaProps> = ({ label, className, error, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className={`text-xs font-medium ${error ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{label}</label>}
    <div className="relative">
        <textarea
          className={`bg-navyLight text-white px-3 py-2 rounded border outline-none transition-all placeholder-gray-500 w-full relative z-10 min-h-[80px] ${
            error 
              ? 'border-transparent' 
              : 'border-transparent focus:border-brandOrange focus:ring-1 focus:ring-brandOrange'
          } ${className}`}
          {...props}
        />
        {error && <HandwrittenCircle />}
    </div>
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