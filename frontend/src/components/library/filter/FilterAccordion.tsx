import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterAccordionProps {
  title: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function FilterAccordion({ title, isExpanded, onToggle, children }: FilterAccordionProps) {
  return (
    <div className="mb-6">
      <button
        className="flex items-center justify-between w-full font-roboto text-sm text-text-primary mb-2"
        onClick={onToggle}
      >
        {title}
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <div className={`border-t border-border-color pt-4 ${isExpanded ? "block" : "hidden"}`}>
        {children}
      </div>
    </div>
  );
}
