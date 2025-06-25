import { useState, useEffect } from 'react';
import 'animate.css';

function InterviewList() {
  // Interview list state
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  // Modal and edit state
  const [detailInterview, setDetailInterview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ company: '', position: '', date: '', location: '', time: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Fetch interview records on mount
  useEffect(() => {
    fetch('/api/interviews')
      .then(res => res.json())
      .then(data => {
        setInterviews(data);
        setLoading(false);
      });
  }, []);

  // Delete interview record
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    fetch(`/api/interviews/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setInterviews(interviews.filter((item) => item.id !== id));
      });
  };

  // Sort interviews: future/today first, past later, and within each section, sort by nearest date
  const sortedInterviews = (() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const futureOrToday = [];
    const past = [];
    interviews.forEach(item => {
      // If no date, treat as future
      if (!item.date) return futureOrToday.push(item);
      // Use only the date part (ignore time)
      const dateOnly = (item.date || '').split(' ')[0];
      const itemDate = new Date(dateOnly);
      itemDate.setHours(0,0,0,0);
      if (itemDate < today) {
        past.push(item);
      } else {
        futureOrToday.push(item);
      }
    });
    // Sort by ascending date
    const byDateAsc = (a, b) => {
      const aDate = new Date((a.date||'').split(' ')[0]);
      const bDate = new Date((b.date||'').split(' ')[0]);
      return aDate - bDate;
    };
    futureOrToday.sort(byDateAsc);
    past.sort(byDateAsc);
    return [...futureOrToday, ...past];
  })();

  // When opening detail modal, reset edit state
  const handleOpenDetailInterview = (item) => {
    setDetailInterview(item);
    setEditMode(false);
    setEditForm({
      company: item.company || '',
      position: item.position || '',
      date: item.date || '',
      location: item.location || '',
      time: item.time || ''
    });
  };

  // Edit form change handler
  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Save edit handler
  const handleEditSave = () => {
    if (!detailInterview) return;
    setEditSaving(true);
    setEditError('');
    fetch(`/api/interviews/${detailInterview.id}`, {
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
      .then((updated) => {
        setInterviews(interviews.map(i => i.id === updated.id ? updated : i));
        setDetailInterview(updated);
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
        <div className="col-12 col-md-2 mb-4"/>
        <div className="col-12 col-md-8 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 fw-bold">Interview Records</h2>
          </div>
          {loading ? (
            <div className="text-center text-secondary py-4">Loading...</div>
          ) : (
            <ul className="list-group">
              {sortedInterviews.map((item) => {
                // Set background color based on date status
                let dateBg = '';
                let isPast = false;
                if (item.date) {
                  const today = new Date();
                  const dateOnly = (item.date || '').split(' ')[0];
                  const itemDate = new Date(dateOnly);
                  if (itemDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                    dateBg = 'bg-light text-secondary'; // Past
                    isPast = true;
                  } else if (itemDate.getFullYear() === today.getFullYear() && itemDate.getMonth() === today.getMonth() && itemDate.getDate() === today.getDate()) {
                    dateBg = 'bg-warning bg-opacity-50'; // Today
                  } else {
                    dateBg = 'bg-success bg-opacity-25'; // Future
                  }
                }
                // For restoring class on hover
                const baseBgClasses = ['bg-light', 'bg-warning', 'bg-success'];
                return (
                  <li
                    key={item.id}
                    className={`list-group-item d-flex justify-content-between align-items-center mb-2 rounded shadow-sm border-0 animate__animated ${dateBg}`}
                    style={{ cursor: 'pointer', transition: 'background 0.2s', height: 80, overflow: 'hidden' }}
                    onClick={() => handleOpenDetailInterview(item)}
                    onMouseEnter={e => {
                      baseBgClasses.forEach(cls => e.currentTarget.classList.remove(cls));
                      e.currentTarget.classList.add('bg-info', 'bg-opacity-25', 'animate__pulse');
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.classList.remove('bg-info', 'bg-opacity-25', 'animate__pulse');
                      // Restore class based on date
                      if (item.date) {
                        const today = new Date();
                        const dateOnly = (item.date || '').split(' ')[0];
                        const itemDate = new Date(dateOnly);
                        if (itemDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                          e.currentTarget.classList.add('bg-light', 'text-secondary');
                        } else if (itemDate.getFullYear() === today.getFullYear() && itemDate.getMonth() === today.getMonth() && itemDate.getDate() === today.getDate()) {
                          e.currentTarget.classList.add('bg-warning', 'bg-opacity-50');
                        } else {
                          e.currentTarget.classList.add('bg-success', 'bg-opacity-25');
                        }
                      }
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div className="fw-semibold text-truncate">{item.position}</div>
                      <div className="small text-truncate">{item.company} ・ {item.date} ・ {item.location}</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                      className="btn btn-outline-danger btn-sm animate__animated animate__fadeIn"
                      style={
                        isPast
                          ? { animationDuration: '0.3s', background: '#e9ecef', borderColor: '#ced4da', color: '#adb5bd', cursor: 'not-allowed', flexShrink: 0, marginLeft: 12 }
                          : { animationDuration: '0.3s', background: '#ffe5e5', borderColor: '#ffb3b3', color: '#b30000', flexShrink: 0, marginLeft: 12 }
                      }
                      disabled={isPast}
                      onMouseEnter={e => e.currentTarget.classList.add('animate__pulse')}
                      onAnimationEnd={e => e.currentTarget.classList.remove('animate__pulse')}
                    >Delete</button>
                  </li>
                );
              })}
              {interviews.length === 0 && <li className="list-group-item text-center text-secondary py-4">No records</li>}
            </ul>
          )}
        </div>
        <div className="col-12 col-md-2" />
      </div>
      {/* Detail Modal */}
      {detailInterview && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Interview Detail</h5>
                <button type="button" className="btn-close" onClick={() => { setDetailInterview(null); setEditMode(false); }}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', wordBreak: 'break-all' }}>
                {editMode ? (
                  <>
                    <div className="mb-2">
                      <label className="form-label">Company</label>
                      <input name="company" value={editForm.company} onChange={handleEditFormChange} className="form-control" />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Position</label>
                      <input name="position" value={editForm.position} onChange={handleEditFormChange} className="form-control" />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Date</label>
                      <input name="date" type="date" value={editForm.date || ''} onChange={handleEditFormChange} className="form-control" />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Time</label>
                      <input name="time" type="time" value={editForm.time || ''} onChange={handleEditFormChange} className="form-control" />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Location</label>
                      <input name="location" value={editForm.location} onChange={handleEditFormChange} className="form-control" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-2"><strong>Company:</strong> {detailInterview.company}</div>
                    <div className="mb-2"><strong>Position:</strong> {detailInterview.position}</div>
                    <div className="mb-2"><strong>Date:</strong> {detailInterview.date}</div>
                    <div className="mb-2"><strong>Time:</strong> {detailInterview.time}</div>
                    {detailInterview.location && <div className="mb-2" style={{ wordBreak: 'break-all' }}><strong>Location:</strong> {detailInterview.location}</div>}
                  </>
                )}
                {!editMode && <button className="btn btn-warning me-2" onClick={() => setEditMode(true)}>Edit</button>}
                {editMode && (
                  <>
                    <button className="btn btn-success me-2" onClick={handleEditSave} disabled={editSaving}>{editSaving ? 'Saving...' : 'Save'}</button>
                    <button className="btn btn-secondary" onClick={() => { setEditMode(false); setEditForm({ company: detailInterview.company || '', position: detailInterview.position || '', date: detailInterview.date || '', location: detailInterview.location || '', time: detailInterview.time || '' }); }}>Cancel</button>
                  </>
                )}
                {editMode && editError && <div className="alert alert-danger py-1 my-2">{editError}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setDetailInterview(null); setEditMode(false); }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewList;
