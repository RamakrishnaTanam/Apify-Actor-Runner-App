import React from 'react';
import { XCircle, AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning';
  className?: string;
}

export function ErrorMessage({ message, type = 'error', className = '' }: ErrorMessageProps) {
  const isError = type === 'error';
  
  return (
    <div className={`
      flex items-start space-x-2 p-3 rounded-lg
      ${isError ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}
      ${className}
    `}>
      {isError ? (
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
      )}
      <p className={`text-sm ${isError ? 'text-red-800' : 'text-yellow-800'}`}>
        {message}
      </p>
    </div>
  );
}