import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import Sections from './pages/Sections';
import SiteSettings from './pages/SiteSettings';
import Submissions from './pages/Submissions';
import Categories from './pages/Categories';
import Services from './pages/Services';
import Experience from './pages/Experience';

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
            <Route path="categories" element={<Categories />} />
            <Route path="services" element={<Services />} />
            <Route path="experience" element={<Experience />} />
            <Route path="sections" element={<Sections />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="submissions" element={<Submissions />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

