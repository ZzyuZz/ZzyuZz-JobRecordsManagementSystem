import { useState, useEffect } from 'react';
import 'animate.css';

function InterviewList() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailInterview, setDetailInterview] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/interviews')
      .then(res => res.json())
      .then(data => {
        setInterviews(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    fetch(`http://localhost:3001/api/interviews/${id}`, { method: 'DELETE' })
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
      if (!item.date) return futureOrToday.push(item); // No date is considered future
      const dateOnly = item.date.split(' ')[0];
      const itemDate = new Date(dateOnly);
      itemDate.setHours(0,0,0,0);
      if (itemDate < today) {
        past.push(item);
      } else {
        futureOrToday.push(item);
      }
    });
    const byDateAsc = (a, b) => {
      const aDate = new Date((a.date||'').split(' ')[0]);
      const bDate = new Date((b.date||'').split(' ')[0]);
      return aDate - bDate;
    };
    futureOrToday.sort(byDateAsc);
    past.sort(byDateAsc);
    return [...futureOrToday, ...past];
  })();

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Left sidebar (empty for now) */}
        <div className="col-12 col-md-2 mb-4" />
        {/* Center content: interview list */}
        <div className="col-12 col-md-8 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 fw-bold">Interview Records</h2>
          </div>
          {loading ? (
            <div className="text-center text-secondary py-4">Loading...</div>
          ) : (
            <ul className="list-group">
              {sortedInterviews.map((item) => {
                // Date background color
                let dateBg = '';
                let isPast = false;
                if (item.date) {
                  const today = new Date();
                  const dateOnly = item.date.split(' ')[0];
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
                // For restoring class
                const baseBgClasses = ['bg-light', 'bg-warning', 'bg-success'];
                return (
                  <li
                    key={item.id}
                    className={`list-group-item d-flex justify-content-between align-items-center mb-2 rounded shadow-sm border-0 animate__animated ${dateBg}`}
                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                    onClick={() => setDetailInterview(item)}
                    onMouseEnter={e => {
                      baseBgClasses.forEach(cls => e.currentTarget.classList.remove(cls));
                      e.currentTarget.classList.add('bg-info', 'bg-opacity-25', 'animate__pulse');
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.classList.remove('bg-info', 'bg-opacity-25', 'animate__pulse');
                      // Restore class based on date
                      if (item.date) {
                        const today = new Date();
                        const dateOnly = item.date.split(' ')[0];
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
                    <div>
                      <div className="fw-semibold">{item.position}</div>
                      <div className="small">{item.company} ・ {item.date} ・ {item.location} </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                      className="btn btn-outline-danger btn-sm animate__animated animate__fadeIn"
                      style={
                        isPast
                          ? { animationDuration: '0.3s', background: '#e9ecef', borderColor: '#ced4da', color: '#adb5bd', cursor: 'not-allowed' }
                          : { animationDuration: '0.3s', background: '#ffe5e5', borderColor: '#ffb3b3', color: '#b30000' }
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
        {/* Right sidebar (empty for now) */}
        <div className="col-12 col-md-2" />
      </div>
      {/* Detail Modal */}
      {detailInterview && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Interview Detail</h5>
                <button type="button" className="btn-close" onClick={() => setDetailInterview(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2"><strong>Company:</strong> {detailInterview.company}</div>
                <div className="mb-2"><strong>Position:</strong> {detailInterview.position}</div>
                <div className="mb-2"><strong>Date:</strong> {detailInterview.date}</div>
                {detailInterview.location && <div className="mb-2"><strong>Location:</strong> {detailInterview.location}</div>}
                {detailInterview.time && <div className="mb-2"><strong>Time:</strong> {detailInterview.time}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDetailInterview(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewList;
