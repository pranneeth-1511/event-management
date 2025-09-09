import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthWrapper } from './components/Auth/AuthWrapper';
import { Layout } from './components/Layout/Layout';

import { Dashboard } from './pages/Dashboard';
import Events from './pages/Events';
import Participants from './pages/Participants';
import { Venues } from './pages/Venues';
import { Attendance } from './pages/Attendance';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { UserManagement } from './pages/UserManagement';
import NotFound from './pages/errors/NotFound';
import ServerError from './pages/errors/ServerError';
import Unauthorized from './pages/errors/Unauthorized';

function App() {
  console.log('App component rendering');
  
  return (
    <AuthWrapper>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="events" element={<Events />} />
              <Route path="participants" element={<Participants />} />
              <Route path="venues" element={<Venues />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="error/500" element={<ServerError />} />
              <Route path="error/403" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AppProvider>
    </AuthWrapper>
  );
}

export default App;