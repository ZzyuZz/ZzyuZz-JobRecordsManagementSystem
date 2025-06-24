import { useState, useEffect } from 'react';

function InterviewList() {
  const [interviews, setInterviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ company: '', position: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/interviews')
      .then(res => res.json())
      .then(data => {
        setInterviews(data);
        setLoading(false);
      });
  }, []);

  const handleAdd = () => setShowModal(true);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (form.company && form.position) {
      fetch('http://localhost:3001/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
        .then(res => res.json())
        .then(newRecord => {
          setInterviews([...interviews, newRecord]);
          setForm({ company: '', position: '' });
          setShowModal(false);
        });
    }
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:3001/api/interviews/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setInterviews(interviews.filter((item) => item.id !== id));
      });
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Left sidebar (empty for now) */}
        <div className="col-12 col-md-2 mb-4" />
        {/* Center content: interview list */}
        <div className="col-12 col-md-8 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 fw-bold">Interview Records</h2>
            <button onClick={handleAdd} className="btn btn-primary">Add</button>
          </div>
          {loading ? (
            <div className="text-center text-secondary py-4">Loading...</div>
          ) : (
            <ul className="list-group">
              {interviews.map((item) => (
                <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center mb-2 rounded shadow-sm border-0 bg-light">
                  <div>
                    <div className="fw-semibold">{item.position}</div>
                    <div className="text-secondary small">{item.company} ・ {item.date}</div>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">Delete</button>
                </li>
              ))}
              {interviews.length === 0 && <li className="list-group-item text-center text-secondary py-4">No records</li>}
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
                  <h5 className="modal-title">Add Interview</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Company Name</label>
                    <input name="company" value={form.company} onChange={handleFormChange} required className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Job Title</label>
                    <input name="position" value={form.position} onChange={handleFormChange} required className="form-control" />
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

export default InterviewList;
