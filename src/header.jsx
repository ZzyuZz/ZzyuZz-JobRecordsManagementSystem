const navItems = [
  { name: 'My Job Apply', key: 'jobs' },
  { name: 'Interview', key: 'saved' },
];

function Header({ currentPage, onChangePage }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
      <div className="container-fluid px-4">
        <span className="navbar-brand d-flex align-items-center">
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>My Job Apply</span>
        </span>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {navItems.map((item) => (
              <li className="nav-item" key={item.key}>
                <button
                  className={`nav-link btn btn-link ${currentPage === item.key ? 'active fw-bold text-white' : 'text-white-50'}`}
                  style={{ textDecoration: 'none' }}
                  onClick={() => onChangePage(item.key)}
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