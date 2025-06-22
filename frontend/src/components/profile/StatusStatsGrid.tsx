import React from 'react';
import { Gamepad2, Play, CheckCircle, XCircle } from 'lucide-react';

interface StatusStatsGridProps {
  statusStats: {
    notStarted: number;
    inProgress: number;
    completed: number;
    abandoned: number;
  };
}

interface StatusCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ label, value, icon, bgColor, iconColor, borderColor }) => {
  const formattedValue = value.toLocaleString('it-IT');
  
  return (
    <div className={`${bgColor} ${borderColor} border-l-4 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-text-secondary font-secondary mb-1">{label}</div>
          <div className="text-3xl font-bold text-text-primary font-primary">{formattedValue}</div>
        </div>
        <div className={`p-3 rounded-full bg-white/10 dark:bg-black/10`}>
          <div className={`${iconColor}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusStatsGrid: React.FC<StatusStatsGridProps> = ({ statusStats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">      <StatusCard 
        label="Da iniziare" 
        value={statusStats.notStarted}
        icon={<Gamepad2 className="h-8 w-8" />}
        bgColor="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
        iconColor="text-status-NotStarted"
        borderColor="border-status-NotStarted"
      />
      <StatusCard 
        label="In corso" 
        value={statusStats.inProgress}
        icon={<Play className="h-8 w-8" />}
        bgColor="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950"
        iconColor="text-status-InProgress"
        borderColor="border-status-InProgress"
      />
      <StatusCard 
        label="Completati" 
        value={statusStats.completed}
        icon={<CheckCircle className="h-8 w-8" />}
        bgColor="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-950"
        iconColor="text-status-Completed"
        borderColor="border-status-Completed"
      />
      <StatusCard 
        label="Abbandonati" 
        value={statusStats.abandoned}
        icon={<XCircle className="h-8 w-8" />}
        bgColor="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-950"
        iconColor="text-status-Abandoned"
        borderColor="border-status-Abandoned"
      />
    </div>
  );
};

export default StatusStatsGrid;
