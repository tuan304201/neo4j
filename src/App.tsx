import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AlertManagement from './pages/AlertManagement';
import Topology from './pages/Topology';
import Layout from './components/common/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/alerts" replace />} />
          <Route path="alerts" element={<AlertManagement />} />
          <Route path="topology" element={<Topology />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;