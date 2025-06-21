import { NavLink } from 'react-router-dom';

/**
 * Logo principale dell'applicazione, riutilizzabile ovunque.
 * Accetta opzionalmente una classe CSS aggiuntiva e la possibilità di essere un link.
 */
const AppLogo = ({ className = '', asLink = true }: { className?: string; asLink?: boolean }) => {
  const logo = (
    <span className={`text-3xl font-bold text-text-primary font-primary ${className}`}>
      Game<span className="text-accent-primary">Backlog</span>
    </span>
  );  return asLink ? (
    <NavLink to="/" aria-label="Homepage">
      {logo}
    </NavLink>
  ) : (
    logo
  );
};

export default AppLogo;
