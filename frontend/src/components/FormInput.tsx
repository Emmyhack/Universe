import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
  success?: boolean;
  icon?: React.ReactNode;
  required?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ 
    label, 
    error, 
    helpText, 
    success, 
    icon, 
    required, 
    className, 
    ...props 
  }, ref) => {
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    return (
      <div className="space-y-2">
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              'input',
              icon ? 'pl-10' : '',
              hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
              hasSuccess ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : '',
              className
            )}
            {...props}
          />
          
          {(hasError || hasSuccess) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {hasError && <AlertCircle className="w-5 h-5 text-red-500" />}
              {hasSuccess && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
        
        {helpText && !error && (
          <p className="text-sm text-gray-600">{helpText}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helpText, required, className, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="space-y-2">
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <textarea
          ref={ref}
          className={cn(
            'input min-h-[100px] resize-y',
            hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
        
        {helpText && !error && (
          <p className="text-sm text-gray-600">{helpText}</p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helpText, required, className, children, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="space-y-2">
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <select
          ref={ref}
          className={cn(
            'input cursor-pointer',
            hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
            className
          )}
          {...props}
        >
          {children}
        </select>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
        
        {helpText && !error && (
          <p className="text-sm text-gray-600">{helpText}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

interface FormErrorProps {
  title?: string;
  message: string;
}

export const FormError = ({ title = 'Error', message }: FormErrorProps) => {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-red-800">{title}</h4>
          <p className="text-sm text-red-700 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
};

interface FormSuccessProps {
  title?: string;
  message: string;
}

export const FormSuccess = ({ title = 'Success', message }: FormSuccessProps) => {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-start space-x-3">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-green-800">{title}</h4>
          <p className="text-sm text-green-700 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
};