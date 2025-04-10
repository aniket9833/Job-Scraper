import { Link, useLocation } from 'react-router-dom';

function Sidebar({ isOpen }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <ul className="sidebar-nav">
        <li className={isActive('/')}>
          <Link to="/">
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li className={isActive('/jobs')}>
          <Link to="/jobs">
            <i className="fas fa-briefcase"></i>
            <span>Jobs</span>
          </Link>
        </li>
        <li className={isActive('/manual-scrape')}>
          <Link to="/manual-scrape">
            <i className="fas fa-search"></i>
            <span>Manual Scrape</span>
          </Link>
        </li>
        <li className={isActive('/domains')}>
          <Link to="/domains">
            <i className="fas fa-globe"></i>
            <span>Domains</span>
          </Link>
        </li>
        <li className={isActive('/keywords')}>
          <Link to="/keywords">
            <i className="fas fa-tags"></i>
            <span>Keywords</span>
          </Link>
        </li>
        <li className={isActive('/schedule')}>
          <Link to="/schedule">
            <i className="fas fa-clock"></i>
            <span>Schedule</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
