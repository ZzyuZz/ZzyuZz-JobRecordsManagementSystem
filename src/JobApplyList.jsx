import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import JobCalendarSidebar from './JobCalendarSidebar';

function JobApplyList() {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', company: '', mssage: '' });
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailJob, setDetailJob] = useState(null);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewForm, setInterviewForm] = useState({ date: '', time: '', location: '' });
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', company: '', mssage: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetch('/api/jobs')
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
      fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
        .then(res => res.json())
        .then(newJob => {
          setJobs([...jobs, newJob]);
          setForm({ title: '', company: '', mssage: '' });
          setShowModal(false);
        });
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setJobs(jobs.filter((job) => job.id !== id));
      });
  };

  const handleInterviewFormChange = (e) => {
    setInterviewForm({ ...interviewForm, [e.target.name]: e.target.value });
  };

  const handleInterviewSubmit = (e) => {
    e.preventDefault();
    if (!detailJob) return;
    const interviewData = {
      company: detailJob.company,
      position: detailJob.title,
      date: interviewForm.date,
      time: interviewForm.time,
      location: interviewForm.location
    };
    fetch('/api/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interviewData)
    })
      .then(res => res.json())
      .then(() => {
        setShowInterviewForm(false);
        setInterviewForm({ date: '', time: '', location: '' });
        setDetailJob(null);
      });
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchText =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    const matchFrom = !dateFrom || job.date >= dateFrom;
    const matchTo = !dateTo || job.date <= dateTo;
    return matchText && matchFrom && matchTo;
  });

  // When closing job detail modal, also reset interview form
  const handleCloseDetailJob = () => {
    setDetailJob(null);
    setShowInterviewForm(false);
    setInterviewForm({ date: '', time: '', location: '' });
  };

  // When opening detail modal, also reset edit state
  const handleOpenDetailJob = (job) => {
    setDetailJob(job);
    setEditMode(false);
    setEditForm({ title: job.title, company: job.company, mssage: job.mssage || '' });
  };

  // Save edit
  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSave = () => {
    if (!detailJob) return;
    setEditSaving(true);
    setEditError('');
    fetch(`/api/jobs/${detailJob.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm)
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Save failed');
        }
        return res.json();
      })
      .then((updatedJob) => {
        setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
        setDetailJob(updatedJob);
        setEditMode(false);
      })
      .catch(e => {
        setEditError(e.message);
        alert('Save failed: ' + e.message);
      })
      .finally(() => setEditSaving(false));
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
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
        <div className="col-12 col-md-7 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 fw-bold">My Job Apply Records</h2>
            <button
              onClick={() => handleAdd()}
              className="btn btn-primary animate__animated animate__pulse animate__faster"
              style={{ animationDuration: '0.3s' }}
              onMouseEnter={e => e.currentTarget.classList.add('animate__pulse')}
              onAnimationEnd={e => e.currentTarget.classList.remove('animate__pulse')}
            >Add</button>
          </div>
          {loading ? (
            <div className="text-center text-secondary py-4">Loading...</div>
          ) : (
            <ul className="list-group">
              {filteredJobs.map((job) => (
                <li
                  key={job.id}
                  className="list-group-item d-flex justify-content-between align-items-center mb-2 rounded shadow-sm border-0 bg-light animate__animated"
                  style={{ cursor: 'pointer', transition: 'background 0.2s', height: 80, overflow: 'hidden' }}
                  onClick={() => handleOpenDetailJob(job)}
                  onMouseEnter={e => e.currentTarget.classList.add('animate__pulse', 'bg-info', 'bg-opacity-25')}
                  onMouseLeave={e => e.currentTarget.classList.remove('animate__pulse', 'bg-info', 'bg-opacity-25')}
                >
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div className="fw-semibold text-truncate">{job.title}</div>
                    <div className="text-secondary small text-truncate">{job.company} ・ {job.date}{job.mssage ? ' ・ ' + job.mssage : ''}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(job.id); }}
                    className="btn btn-danger btn-sm animate__animated animate__fadeIn"
                    style={{ animationDuration: '0.3s', flexShrink: 0, marginLeft: 12 }}
                    onMouseEnter={e => e.currentTarget.classList.add('animate__pulse')}
                    onAnimationEnd={e => e.currentTarget.classList.remove('animate__pulse')}
                  >Delete</button>
                </li>
              ))}
              {filteredJobs.length === 0 && <li className="list-group-item text-center text-secondary py-4">No records</li>}
            </ul>
          )}
        </div>
        <div className="col-12 col-md-3 mb-4">
          <JobCalendarSidebar />
        </div>
      </div>
      {/*Add Modal */}
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
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea name="mssage" value={form.mssage} onChange={handleFormChange} className="form-control" rows={3} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary animate__animated animate__fadeIn" style={{ animationDuration: '0.3s' }} onMouseEnter={e => e.currentTarget.classList.add('animate__pulse')} onAnimationEnd={e => e.currentTarget.classList.remove('animate__pulse')} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success animate__animated animate__pulse animate__faster" style={{ animationDuration: '0.3s' }} onMouseEnter={e => e.currentTarget.classList.add('animate__pulse')} onAnimationEnd={e => e.currentTarget.classList.remove('animate__pulse')}>Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Detail Page */}
      {detailJob && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Job Detail</h5>
                <button type="button" className="btn-close" onClick={handleCloseDetailJob}></button>
              </div>
              <div className="modal-body">
                {editMode ? (
                  <>
                    <div className="mb-2">
                      <label className="form-label">Title</label>
                      <input name="title" value={editForm.title} onChange={handleEditFormChange} className="form-control" />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Company</label>
                      <input name="company" value={editForm.company} onChange={handleEditFormChange} className="form-control" />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Message</label>
                      <textarea name="mssage" value={editForm.mssage} onChange={handleEditFormChange} className="form-control" rows={3} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-2"><strong>Title:</strong> {detailJob.title}</div>
                    <div className="mb-2"><strong>Company:</strong> {detailJob.company}</div>
                    <div className="mb-2"><strong>Date:</strong> {detailJob.date}</div>
                    <div className="mb-2"><strong>Message:</strong><br />{detailJob.mssage ? detailJob.mssage.split('\n').map((line, i) => <span key={i}>{line}<br /></span>) : <span className="text-secondary">(No message)</span>}</div>
                  </>
                )}
                {!editMode && <button className="btn btn-warning me-2" onClick={() => setEditMode(true)}>Edit</button>}
                {editMode && (
                  <>
                    <button className="btn btn-success me-2" onClick={handleEditSave} disabled={editSaving}>{editSaving ? 'Saving...' : 'Save'}</button>
                    <button className="btn btn-secondary" onClick={() => { setEditMode(false); setEditForm({ title: detailJob.title, company: detailJob.company, mssage: detailJob.mssage || '' }); }}>Cancel</button>
                  </>
                )}
                {editMode && editError && <div className="alert alert-danger py-1 my-2">{editError}</div>}
                <button className="btn btn-info ms-0" style={{ display: editMode ? 'none' : '' }} onClick={() => setShowInterviewForm(true)}>Interview</button>
                {showInterviewForm && (
                  <form className="mt-4" onSubmit={handleInterviewSubmit}>
                    <div className="mb-2">
                      <label className="form-label">Interview Date</label>
                      <input type="date" name="date" value={interviewForm.date} onChange={handleInterviewFormChange} className="form-control" required />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Interview Time</label>
                      <input type="time" name="time" value={interviewForm.time} onChange={handleInterviewFormChange} className="form-control" required />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Location</label>
                      <input type="text" name="location" value={interviewForm.location} onChange={handleInterviewFormChange} className="form-control" required />
                    </div>
                    <button type="submit" className="btn btn-success">Submit Interview</button>
                  </form>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDetailJob}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobApplyList;
