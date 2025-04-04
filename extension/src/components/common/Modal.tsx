import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { MagicParticles } from './MagicParticles';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-magic-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-gradient-to-br from-magic-800 to-magic-900 rounded-lg w-full shadow-xl border border-magic-700/30 animate-magic-reveal ${className}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-magic-700/30">
          <h3 className="text-lg font-semibold text-magic-200">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-magic-700/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-magic-400" />
          </button>
        </div>
        <div className="relative">
          {children}
          <MagicParticles />
        </div>
      </div>
    </div>
  );
}
