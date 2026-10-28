import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = 'bg-white border-l-4 border-green-500 shadow-lg';
        let IconComponent = CheckCircle2;
        let iconColor = 'text-green-500';

        if (toast.type === 'info') {
          bgClass = 'bg-white border-l-4 border-blue-500 shadow-lg';
          IconComponent = Info;
          iconColor = 'text-blue-500';
        } else if (toast.type === 'warning') {
          bgClass = 'bg-white border-l-4 border-yellow-500 shadow-lg';
          IconComponent = AlertTriangle;
          iconColor = 'text-yellow-500';
        } else if (toast.type === 'error') {
          bgClass = 'bg-white border-l-4 border-red-500 shadow-lg';
          IconComponent = XCircle;
          iconColor = 'text-red-500';
        }

        return (
          <div
            key={toast.id}
            className={`${bgClass} rounded-r p-4 pointer-events-auto flex items-start gap-3 transition-all duration-300 animate-slide-in`}
          >
            <IconComponent className={`w-5 h-5 flex-shrink-0 ${iconColor} mt-0.5`} />
            <div className="flex-1 text-sm">
              <h4 className="font-semibold text-gray-800">{toast.title}</h4>
              <p className="text-gray-600 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
