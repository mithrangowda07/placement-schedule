import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { CompanyForm } from '../components/CompanyForm';
import type { CompanyWithEvents } from '../types/company';
import { getCompanyById, updateCompanyWithEvents } from '../services/companyService';

export const EditCompany: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyWithEvents | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const data = await getCompanyById(id);
      setCompany(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSubmit = async (companyData: any, eventsData: any) => {
    if (!id) return;
    await updateCompanyWithEvents(id, companyData, eventsData);
    navigate('/admin/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading company data...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500" />
        <h2 className="text-xl font-bold text-slate-900">Company Not Found</h2>
        <Link
          to="/admin/dashboard"
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          BACK TO DASHBOARD
        </Link>
      </div>
    );
  }

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
              <h1 className="text-xl sm:text-2xl font-bold">Edit Company: {company.companyName}</h1>
              <p className="text-xs text-slate-400">Update company details, dates, URLs, or activities</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <CompanyForm
          initialData={company}
          isEdit={true}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/dashboard')}
        />
      </main>
    </div>
  );
};
