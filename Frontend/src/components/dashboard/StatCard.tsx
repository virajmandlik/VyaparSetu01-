
import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  description?: string;
  action?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
  description,
  action,
}) => {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1 mb-1">{value}</h3>
          {description && <p className="text-xs text-gray-500">{description}</p>}
          {trend && (
            <div className={`text-xs font-medium flex items-center mt-1
              ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-1">
                {trend.isPositive ? '↑' : '↓'}
              </span>
              {trend.value}%
              <span className="ml-1">vs. last period</span>
            </div>
          )}
          {action && <div className="mt-2">{action}</div>}
        </div>
        <div className="p-2 rounded-md bg-retail-purple-100 text-retail-purple-600">
          {icon}
        </div>
      </div>
    </div>
  );
};
