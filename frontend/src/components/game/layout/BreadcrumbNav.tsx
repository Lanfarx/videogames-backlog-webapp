import { Link } from 'react-router-dom';

interface BreadcrumbNavProps {
  title: string;
  parentPath?: string;
  parentLabel?: string;
}

export default function BreadcrumbNav({ 
  title, 
  parentPath = '/library', 
  parentLabel = 'I miei giochi' 
}: BreadcrumbNavProps) {
  return (
    <nav className="font-secondary text-sm">
      <Link to={parentPath} className="text-accent-primary hover:underline">
        {parentLabel}
      </Link>
      <span className="mx-2 text-text-secondary">/</span>
      <span className="text-text-primary">{title}</span>
    </nav>
  );
};
