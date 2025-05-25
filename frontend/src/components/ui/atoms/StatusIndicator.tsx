import React from 'react'

interface StatusIndicatorProps {
  status: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const bgVar = `--status-${status.replace(/_/g, '-').toLowerCase()}`;
  return (
    <div className="h-1 bg-border-color rounded-t-xl overflow-hidden">
      <div
        className="h-full"
        style={{ backgroundColor: `rgba(var(${bgVar})`, width: '100%' }}
      ></div>
    </div>
  );
};

export default StatusIndicator;
