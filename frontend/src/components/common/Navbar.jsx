import { Link } from 'react-router-dom';

function Navbar({ onMenuToggle }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <i className="fas fa-bars"></i>
        </button>
        <Link to="/" className="navbar-brand">
          Job Scraper
        </Link>
      </div>
      <div className="navbar-right">
        <button
          className="btn btn-primary"
          onClick={() => (window.location.href = '/manual-scrape')}
        >
          Quick Scrape
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
