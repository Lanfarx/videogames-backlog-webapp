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
  iconColor: string;
  badgeBgColor: string;
}

function StatusCard({ label, value, icon, iconColor, badgeBgColor }: StatusCardProps) {
  const formattedValue = value.toLocaleString('it-IT');
  
  return (
    <div className="bg-primary-bg border border-border-color p-5 rounded-xl shadow-sm hover:shadow-md hover:border-accent-primary hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-text-secondary font-secondary mb-1">{label}</div>
          <div className="text-2xl sm:text-3xl font-bold text-text-primary font-primary">{formattedValue}</div>
        </div>
        <div className={`p-3 rounded-xl ${badgeBgColor} ${iconColor} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function StatusStatsGrid({ statusStats }: StatusStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatusCard 
        label="Da iniziare" 
        value={statusStats.notStarted}
        icon={<Gamepad2 className="h-6 w-6" />}
        badgeBgColor="bg-status-NotStarted/15"
        iconColor="text-status-NotStarted"
      />
      <StatusCard 
        label="In corso" 
        value={statusStats.inProgress}
        icon={<Play className="h-6 w-6" />}
        badgeBgColor="bg-status-InProgress/15"
        iconColor="text-status-InProgress"
      />
      <StatusCard 
        label="Completati" 
        value={statusStats.completed}
        icon={<CheckCircle className="h-6 w-6" />}
        badgeBgColor="bg-status-Completed/15"
        iconColor="text-status-Completed"
      />
      <StatusCard 
        label="Abbandonati" 
        value={statusStats.abandoned}
        icon={<XCircle className="h-6 w-6" />}
        badgeBgColor="bg-status-Abandoned/15"
        iconColor="text-status-Abandoned"
      />
    </div>
  );
}
