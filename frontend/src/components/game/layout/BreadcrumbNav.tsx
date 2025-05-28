import { Link } from 'react-router-dom';

interface BreadcrumbNavProps {
  title: string;
  parentPath?: string;
  parentLabel?: string;
}

const BreadcrumbNav = ({ 
  title, 
  parentPath = '/library', 
  parentLabel = 'Libreria' 
}: BreadcrumbNavProps) => {
  return (
    <nav className="font-secondary text-sm flex items-center gap-1">
      <span className="mx-2 text-text-secondary">/</span>
      <Link to={parentPath} className="text-accent-primary hover:underline">
        {parentLabel}
      </Link>
      <span className="mx-2 text-text-secondary">/</span>
      <span className="text-text-primary">{title}</span>
    </nav>
  );
};

export default BreadcrumbNav;
