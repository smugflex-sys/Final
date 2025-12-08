import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { cn } from "./utils";

interface SimpleDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SimpleDropdown({ trigger, children, className }: SimpleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-200",
          className
        )}>
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function SimpleDropdownItem({ 
  children, 
  onClick, 
  className = "",
  danger = false,
  disabled = false
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  className?: string;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => {
        if (disabled) return;
        onClick();
        // Close dropdown by clicking outside
        document.dispatchEvent(new MouseEvent('mousedown'));
      }}
      disabled={disabled}
      className={cn(
        "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150",
        danger && "text-red-600 hover:bg-red-50",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SimpleDropdownSeparator() {
  return <div className="border-t border-gray-200 my-1" />;
}
