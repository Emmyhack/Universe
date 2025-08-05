import { cn } from '@/utils/cn';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  text: string;
  size?: 'sm' | 'md';
  className?: string;
}

const StatusBadge = ({ status, text, size = 'md', className }: StatusBadgeProps) => {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      classes: 'bg-green-100 text-green-800 border-green-200',
    },
    warning: {
      icon: AlertCircle,
      classes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    error: {
      icon: XCircle,
      classes: 'bg-red-100 text-red-800 border-red-200',
    },
    info: {
      icon: Clock,
      classes: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    pending: {
      icon: Clock,
      classes: 'bg-gray-100 text-gray-800 border-gray-200',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center space-x-1 rounded-full border font-medium',
        sizeClasses[size],
        config.classes,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      <span>{text}</span>
    </span>
  );
};

export default StatusBadge;