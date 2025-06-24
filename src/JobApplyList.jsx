import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function JobApplyList() {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', company: '' });
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      });
  }, []);

  const handleAdd = () => setShowModal(true);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (form.title && form.company) {
      fetch('http://localhost:3001/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
        .then(res => res.json())
        .then(newJob => {
          setJobs([...jobs, newJob]);
          setForm({ title: '', company: '' });
          setShowModal(false);
        });
    }
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:3001/api/jobs/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setJobs(jobs.filter((job) => job.id !== id));
      });
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    const matchText =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    const matchFrom = !dateFrom || job.date >= dateFrom;
    const matchTo = !dateTo || job.date <= dateTo;
    return matchText && matchFrom && matchTo;
  });

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Left sidebar: filter/search */}
        <div className="col-12 col-md-2 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">Filter & Search</h5>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by title or company"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="mb-2">
                <label className="form-label small">From</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label small">To</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Center content: job list */}
        <div className="col-12 col-md-8 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 fw-bold">My Job Apply Records</h2>
            <button onClick={handleAdd} className="btn btn-primary">Add</button>
          </div>
          {loading ? (
            <div className="text-center text-secondary py-4">Loading...</div>
          ) : (
            <ul className="list-group">
              {filteredJobs.map((job) => (
                <li key={job.id} className="list-group-item d-flex justify-content-between align-items-center mb-2 rounded shadow-sm border-0 bg-light">
                  <div>
                    <div className="fw-semibold">{job.title}</div>
                    <div className="text-secondary small">{job.company} ・ {job.date}</div>
                  </div>
                  <button onClick={() => handleDelete(job.id)} className="btn btn-danger btn-sm">Delete</button>
                </li>
              ))}
              {filteredJobs.length === 0 && <li className="list-group-item text-center text-secondary py-4">No records</li>}
            </ul>
          )}
        </div>
        {/* Right sidebar (empty for now) */}
        <div className="col-12 col-md-2" />
      </div>
      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleFormSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Add Job</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Job Title</label>
                    <input name="title" value={form.title} onChange={handleFormChange} required className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Company Name</label>
                    <input name="company" value={form.company} onChange={handleFormChange} required className="form-control" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobApplyList;
