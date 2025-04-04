import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onClose, className = '' }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div className={`p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start mb-4 ${className}`}>
      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="ml-3 flex-grow">
        <p className="text-sm text-magic-200">{message}</p>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="flex-shrink-0 ml-2 p-1 hover:bg-magic-700/50 rounded-full transition-colors"
        >
          <X size={14} className="text-magic-400" />
        </button>
      )}
    </div>
  );
} 