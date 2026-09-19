import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * A neo-brutalist collapsible accordion.
 *
 * Props:
 *   title        — header label (string or ReactNode)
 *   defaultOpen  — whether to start expanded (default: true)
 *   children     — content to collapse/expand
 *   className    — extra classes for the outer wrapper
 */
export function Accordion({ title, defaultOpen = true, children, className = '' }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`neo-card bg-white overflow-hidden ${className}`}>
      {/* Header / Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-slate-50 transition-colors group"
        aria-expanded={isOpen}
      >
        <span className="text-xl font-black text-slate-900 tracking-tight">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-600 stroke-[2.5] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Collapsible Body */}
      {isOpen && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
}

export default Accordion;
