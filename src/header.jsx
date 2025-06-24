import 'animate.css';

const navItems = [
  { name: 'My Job Apply', key: 'jobs' },
  { name: 'Interview', key: 'saved' },
];

function Header({ currentPage, onChangePage }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
      <div className="container-fluid px-4">
        <span className="navbar-brand d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => onChangePage('jobs')}>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>My Job Apply</span>
        </span>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {navItems.map((item) => (
              <li className="nav-item" key={item.key}>
                <button
                  className={`nav-link btn btn-link animate__animated animate__pulse animate__faster ${currentPage === item.key ? 'active fw-bold text-white' : 'text-white-50'}`}
                  style={{ textDecoration: 'none', animationDuration: '0.3s' }}
                  onClick={() => onChangePage(item.key)}
                  onMouseEnter={e => e.currentTarget.classList.add('animate__pulse')}
                  onAnimationEnd={e => e.currentTarget.classList.remove('animate__pulse')}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;