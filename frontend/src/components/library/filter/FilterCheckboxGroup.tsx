import React from 'react';

export interface CheckboxOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
}

interface FilterCheckboxGroupProps {
  options: CheckboxOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  prefixId: string;
}

export function FilterCheckboxGroup({ options, selectedValues, onToggle, prefixId }: FilterCheckboxGroupProps) {
  return (
    <>
      {options.map((option) => {
        const isChecked = selectedValues.includes(option.value);
        
        return (
          <div key={option.value} className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {option.color ? (
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id={`${prefixId}-${option.value}`}
                    checked={isChecked}
                    onChange={() => onToggle(option.value)}
                    className="peer h-4 w-4 appearance-none rounded border border-border-color checked:border-0 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 cursor-pointer"
                    style={{ backgroundColor: isChecked ? option.color : "transparent" }}
                  />
                  <svg
                    className="pointer-events-none absolute h-4 w-4 opacity-0 peer-checked:opacity-100"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              ) : (
                <input
                  type="checkbox"
                  id={`${prefixId}-${option.value}`}
                  checked={isChecked}
                  onChange={() => onToggle(option.value)}
                  className="h-4 w-4 rounded border-border-color text-accent-primary focus:ring-accent-primary/30 cursor-pointer"
                />
              )}
              
              <label
                htmlFor={`${prefixId}-${option.value}`}
                className="ml-2 font-roboto text-sm text-text-primary cursor-pointer"
              >
                {option.label}
              </label>
            </div>
            <span className="font-roboto text-xs text-text-secondary">({option.count || 0})</span>
          </div>
        );
      })}
    </>
  );
}
