import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Companies } from './pages/Companies';
import { CompanyDetails } from './pages/CompanyDetails';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AddCompany } from './pages/AddCompany';
import { EditCompany } from './pages/EditCompany';
import { ProtectedRoute } from './components/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <Navbar />

        <div className="flex-1">
          <Routes>
            {/* PUBLIC STUDENT ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/company/:id" element={<CompanyDetails />} />

            {/* PUBLIC ADMIN LOGIN */}
            <Route path="/admin" element={<AdminLogin />} />

            {/* PROTECTED ADMIN ROUTES */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/company/new" element={<AddCompany />} />
              <Route path="/admin/company/:id/edit" element={<EditCompany />} />
            </Route>

            {/* FALLBACK REDIRECT */}
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
