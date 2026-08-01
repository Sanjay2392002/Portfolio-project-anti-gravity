import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import Sections from './pages/Sections';

const App = () => {
  return (
    <Router basename="/admin">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="projects" element={<Projects />} />
            <Route path="sections" element={<Sections />} />
            <Route path="settings" element={<div className="text-white">Settings Placeholder</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
