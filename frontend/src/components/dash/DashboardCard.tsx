'use client';

import { ReactNode } from 'react';

interface DashboardCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

export default function DashboardCard({ icon, label, value }: DashboardCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col gap-2 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-xs text-gray-500 dark:text-gray-400">Info</span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
      <div className="text-lg font-bold text-gray-800 dark:text-white">{value}</div>
    </div>
  );
}
