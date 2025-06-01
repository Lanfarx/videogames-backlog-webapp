import { getStatusColor, getStatusLabel } from '../../../constants/gameConstants';

interface StatusBadgeProps {
  Status?: string;
}

const StatusBadge = ({ Status }: StatusBadgeProps) => {
  // Se Status è undefined, non renderizzare niente
  if (!Status) {
    return null;
  }

  const label = getStatusLabel(Status);
  // Usa la variabile CSS per lo sfondo con opacità 0.15
  const bgVar = `--status-${Status.toLowerCase()}`;
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
