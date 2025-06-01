import React from 'react'

interface StatusIndicatorProps {
  Status?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ Status }) => {
  if (!Status) {
    return (
      <div className="h-1 bg-border-color rounded-t-xl overflow-hidden">
        <div className="h-full bg-tertiary-bg" style={{ width: '100%' }}></div>
      </div>
    );
  }

  const bgVar = `--status-${Status.toLowerCase()}`;
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
