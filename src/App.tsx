import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext';
import { AuthProvider } from './context/AuthContext';

// Public Components & Pages
import { ScrollToTop } from './components/common/ScrollToTop';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Lightbox } from './components/common/Lightbox';
import { InteractiveCursor } from './components/common/InteractiveCursor';
import { HomePage } from './pages/HomePage';

const WorkPage = lazy(() => import('./pages/WorkPage').then((module) => ({ default: module.WorkPage })));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage').then((module) => ({ default: module.ProjectDetailPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((module) => ({ default: module.ContactPage })));

// Load CMS screens only when the visitor enters the admin area.
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then((module) => ({ default: module.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage').then((module) => ({ default: module.AdminProjectsPage })));
const AdminSelectedWorksPage = lazy(() => import('./pages/admin/AdminSelectedWorksPage').then((module) => ({ default: module.AdminSelectedWorksPage })));
const AdminProjectEditorPage = lazy(() => import('./pages/admin/AdminProjectEditorPage').then((module) => ({ default: module.AdminProjectEditorPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then((module) => ({ default: module.AdminCategoriesPage })));
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMediaPage').then((module) => ({ default: module.AdminMediaPage })));
const AdminAboutPage = lazy(() => import('./pages/admin/AdminAboutPage').then((module) => ({ default: module.AdminAboutPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then((module) => ({ default: module.AdminSettingsPage })));
const AdminActivityPage = lazy(() => import('./pages/admin/AdminActivityPage').then((module) => ({ default: module.AdminActivityPage })));
const AdminInquiriesPage = lazy(() => import('./pages/admin/AdminInquiriesPage').then((module) => ({ default: module.AdminInquiriesPage })));

export const App: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <PortfolioProvider>
        <div className={`min-h-screen flex flex-col bg-white text-[#111111]${isAdminRoute ? '' : ' cursor-site'}`}>
          {/* Automatic scroll restoration and anchor navigation */}
          <ScrollToTop />

          {/* Public Navbar (omitted in Admin area for clean focused CMS) */}
          {!isAdminRoute && <Navbar />}

          {/* Main App Routes */}
          <div className="flex-1">
            <Suspense fallback={null}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/work" element={<WorkPage />} />
              <Route path="/project/:slug" element={<ProjectDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/projects" element={<AdminProjectsPage />} />
              <Route path="/admin/selected-works" element={<AdminSelectedWorksPage />} />
              <Route path="/admin/projects/new" element={<AdminProjectEditorPage />} />
              <Route path="/admin/projects/:id/edit" element={<AdminProjectEditorPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/media" element={<AdminMediaPage />} />
              <Route path="/admin/about" element={<AdminAboutPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
              <Route path="/admin/activity" element={<AdminActivityPage />} />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
                    <h1 className="text-[64px] font-bold tracking-tight">404</h1>
                    <p className="text-[#6B6B6B] mt-2 mb-6">Page not found.</p>
                    <Link
                      to="/"
                      className="px-6 py-2.5 rounded-[8px] bg-black text-white text-[14px] font-medium hover:bg-black/80 transition-colors"
                    >
                      Return Home
                    </Link>
                  </div>
                }
              />
            </Routes>
            </Suspense>
          </div>

          {/* Public Footer */}
          {!isAdminRoute && <Footer />}

          {/* Global Lightbox for full-res imagery */}
          <Lightbox />
          {!isAdminRoute && <InteractiveCursor />}
        </div>
      </PortfolioProvider>
    </AuthProvider>
  );
};
