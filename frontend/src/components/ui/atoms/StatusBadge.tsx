import { getStatusColor, getStatusLabel } from '../../../utils/statusData';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-sm font-medium font-secondary"
      style={{ backgroundColor: `${color}20`, color: color }}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
