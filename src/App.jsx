import Footer from './footer.jsx'
import Header from './header.jsx'
import { useState } from 'react';
import JobApplyList from './JobApplyList.jsx';
import InterviewList from './InterviewList.jsx';

function App() {
  // default page is 'jobs'
  const [page, setPage] = useState('jobs');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header currentPage={page} onChangePage={setPage} />
      <main style={{ flex: 1 }}>
        {page === 'jobs' && <JobApplyList />}
        {page === 'saved' && <InterviewList />}
      </main>
      <Footer />
    </div>
  )
}

export default App
