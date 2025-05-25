import { getStatusColor, getStatusLabel } from '../../../constants/gameConstants';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  // Usa la variabile CSS per lo sfondo con opacità 0.15
  const bgVar = `--status-${status.replace(/_/g, '-').toLowerCase()}`;
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-sm font-medium font-secondary"
      style={{
        backgroundColor: `rgba(var(${bgVar}), 0.15)`,
        color: `rgb(var(${bgVar}))`,
      }}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
