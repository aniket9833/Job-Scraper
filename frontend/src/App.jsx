import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/Dashboard';
import JobList from './components/JobList';
import ManualScrape from './components/ManualScrape';
import DomainManagement from './components/DomainManagement';
import KeywordManagement from './components/KeywordManagement';
import ScheduleConfig from './components/ScheduleConfig';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="app">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="container">
          <Sidebar isOpen={sidebarOpen} />
          <main className={`content ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/manual-scrape" element={<ManualScrape />} />
              <Route path="/domains" element={<DomainManagement />} />
              <Route path="/keywords" element={<KeywordManagement />} />
              <Route path="/schedule" element={<ScheduleConfig />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
