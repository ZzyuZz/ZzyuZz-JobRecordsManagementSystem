import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function JobCalendarSidebar() {
  const [value, setValue] = useState(new Date());
  const [interviewDates, setInterviewDates] = useState([]);

  useEffect(() => {
    fetch('src/interview-records.json')
      .then(res => res.json())
      .then(data => {
        // Extract only the date part (YYYY-MM-DD) for each interview
        const dates = data.map(item => item.date.split(' ')[0]);
        setInterviewDates(dates);
      });
  }, []);

  // Helper to check if a date has an interview
  const hasInterview = (date) => {
    const yyyyMMdd = date.toISOString().split('T')[0];
    return interviewDates.includes(yyyyMMdd);
  };

  return (
    <div className="card shadow-sm p-3 d-flex flex-column align-items-stretch" style={{ height: '50%', minHeight: 350 }}>
      <h5 className="card-title mb-3 text-primary w-100">Calendar</h5>
      <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'stretch', justifyContent: 'center', overflow: 'auto' }}>
        <div style={{ width: '100%', minWidth: 0 }}>
          <Calendar
            onChange={setValue}
            value={value}
            className="w-100 border-0"
            locale="en-US"
            tileContent={({ date, view }) =>
              view === 'month' && hasInterview(date) ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2, height: 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'red', display: 'inline-block' }}></span>
                </div>
              ) : null
            }
            tileClassName={({ date, view }) => {
              if (view === 'month') {
                const today = new Date();
                today.setHours(0,0,0,0);
                const d = new Date(date);
                d.setHours(0,0,0,0);
                if (d < today) {
                  return 'bg-light text-secondary';
                }
              }
              return null;
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default JobCalendarSidebar;
