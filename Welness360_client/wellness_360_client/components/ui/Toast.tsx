'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ToastProps {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  category?: string;
  icon?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
}

export interface ToastProviderProps {
  children: React.ReactNode;
}

// Create context for the toast functionality
const ToastContext = React.createContext<{
  showToast: (toast: Omit<ToastProps, 'id'>) => void;
  hideToast: (id: string) => void;
}>({
  showToast: () => {},
  hideToast: () => {},
});

// Toast component that displays a single notification
const Toast: React.FC<ToastProps & { onClose: () => void }> = ({ 
  title, 
  message, 
  type = 'info', 
  category,
  icon,
  duration = 5000,
  onClose 
}) => {
  const [timeLeft, setTimeLeft] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up the countdown timer and progress bar
  useEffect(() => {
    // Set up the auto-close timer
    timerRef.current = setTimeout(() => {
      onClose();
    }, duration);
    
    // Set up the progress bar timer
    const interval = 50; // Update every 50ms for smooth animation
    const steps = duration / interval;
    const decrementPerStep = 100 / steps;
    
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newValue = Math.max(0, prev - decrementPerStep);
        return newValue;
      });
    }, interval);
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, onClose]);
  
  // Pause the timer when hovering
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  
  // Resume the timer when no longer hovering
  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      onClose();
    }, (duration * timeLeft) / 100);
    
    const interval = 50;
    const remainingTime = (duration * timeLeft) / 100;
    const steps = remainingTime / interval;
    const decrementPerStep = timeLeft / steps;
    
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newValue = Math.max(0, prev - decrementPerStep);
        return newValue;
      });
    }, interval);
  };

  return (
    <div 
      className="relative w-full bg-black/90 rounded-md shadow-lg overflow-hidden border border-green-500/20 animate-slide-in"
      role="alert"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Category indicator */}
      <div className="absolute top-0 right-0 p-1">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
      </div>
      
      {/* Content */}
      <div className="flex items-start p-3.5">
        {icon && <div className="flex-shrink-0 mr-3 text-xl">{icon}</div>}
        
        <div className="flex-1 min-w-0 pr-2">
          {title && <h4 className="font-medium text-sm text-white truncate pr-4">{title}</h4>}
          <p className="text-xs text-gray-300 line-clamp-2 mt-0.5">{message}</p>
        </div>
        
        <button 
          onClick={onClose}
          className="flex-shrink-0 ml-1 p-1 rounded-full text-gray-400 hover:text-green-400 hover:bg-black/40 transition-colors focus:outline-none"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div 
        className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-100 ease-linear"
        style={{ width: `${timeLeft}%` }}
      />
    </div>
  );
};

// ToastContainer manages all toast notifications
const ToastContainer: React.FC<{ toasts: ToastProps[], hideToast: (id: string) => void }> = ({ toasts, hideToast }) => {
  return createPortal(
    <div className="fixed top-[4.5rem] sm:top-[4rem] right-4 z-40 max-w-sm w-[calc(100%-2rem)] pointer-events-none">
      <div className="flex flex-col gap-2 items-end pointer-events-auto">
        {toasts.map((toast) => (
          <div key={toast.id} className="w-full max-w-md transform transition-all duration-300">
            <Toast 
              {...toast} 
              onClose={() => hideToast(toast.id)} 
            />
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
};

// Provider component that manages toast state
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [mounted, setMounted] = useState(false);

  // Handle client-side only rendering
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const showToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // Limit the number of toasts to 3 at a time
    setToasts((prev) => {
      // If we already have 3 toasts, remove the oldest one
      const newToasts = prev.length >= 3 ? prev.slice(1) : prev;
      return [...newToasts, { ...toast, id }];
    });
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {mounted && <ToastContainer toasts={toasts} hideToast={hideToast} />}
    </ToastContext.Provider>
  );
};

// Custom hook to use toast functionality
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Add global CSS for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    @keyframes slideOut {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(100%); }
    }
    .animate-slide-out {
      animation: slideOut 0.2s cubic-bezier(0.65, 0, 0.35, 1) forwards;
    }
  `;
  document.head.appendChild(style);
} 