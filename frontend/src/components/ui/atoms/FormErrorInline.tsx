import React from "react";

interface FormErrorInlineProps {
  message?: string | null;
  className?: string;
}

export default function FormErrorInline({ message, className = "" }: FormErrorInlineProps) {
  if (!message) return null;
  return (
    <div className={`text-accent-danger text-sm font-medium mt-2 flex items-center gap-2 ${className}`}>
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      {message}
    </div>
  );
}
