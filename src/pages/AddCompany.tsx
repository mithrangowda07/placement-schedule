import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CompanyForm } from '../components/CompanyForm';
import { saveCompanyWithEvents } from '../services/companyService';

export const AddCompany: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (companyData: any, eventsData: any) => {
    await saveCompanyWithEvents(companyData, eventsData);
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="bg-slate-900 text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Add New Placement Company</h1>
              <p className="text-xs text-slate-400">Add company details and recruitment activities</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <CompanyForm onSubmit={handleSubmit} onCancel={() => navigate('/admin/dashboard')} />
      </main>
    </div>
  );
};
