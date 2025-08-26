import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumbs from '../../components/ui/Breadcrumbs';

import CompanyInfoCard from './CompanyInfoCard';
import QuickActionsPanel from './QuickActionsPanel';
import RelatedDealsCard from './RelatedDealsCard';
import RecentActivityCard from './RecentActivityCard';
import CompanyTabs from './CompanyTabs';

const CompanyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load company data from router state or API

  // Mock related deals
  const mockDeals = [
    {
      id: 1,
      name: "Enterprise Software License",
      value: 75000,
      stage: "proposal",
      probability: 75,
      closeDate: "02/15/2025",
      owner: "John Smith"
    },
    {
      id: 2,
      name: "Consulting Services",
      value: 25000,
      stage: "negotiation",
      probability: 60,
      closeDate: "01/30/2025",
      owner: "Sarah Johnson"
    },
    {
      id: 3,
      name: "Support Package",
      value: 15000,
      stage: "won",
      probability: 100,
      closeDate: "12/15/2024",
      owner: "John Smith"
    }
  ];

  // Mock recent activities
  const mockActivities = [
    {
      id: 1,
      type: 'call',
      title: 'Outbound call completed',
      description: 'Discussed project requirements and timeline. Follow-up scheduled for next week.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      user: 'John Smith'
    },
    {
      id: 2,
      type: 'email',
      title: 'Email sent',
      description: 'Sent proposal document and pricing information.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      user: 'John Smith'
    },
    {
      id: 3,
      type: 'meeting',
      title: 'Demo meeting',
      description: 'Product demonstration completed. Client showed strong interest.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      user: 'Sarah Johnson'
    },
    {
      id: 4,
      type: 'note',
      title: 'Note added',
      description: 'Company confirmed budget approval. Moving to contract phase.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      user: 'John Smith'
    },
    {
      id: 5,
      type: 'task',
      title: 'Task completed',
      description: 'Prepared technical documentation for company review.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      user: 'Sarah Johnson'
    }
  ];

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true);
        // Prefer company passed via navigation state
        const stateCompany = (location as any)?.state?.company;
        const normalize = (c: any) => {
          if (!c) return null;
          return {
            id: c._id || c.id,
            name: c.name || '',
            industry: c.industry || '',
            companySize: c.employeeCount ? `${c.employeeCount} employees` : c.companySize || '',
            status: c.type || c.status || 'active',
            email: c.email || '',
            phone: c.phone || '',
            website: c.website || '',
            linkedin: c.linkedinUrl || c.linkedin || '',
            address: c.address ? `${c.address.street || ''}, ${c.address.city || ''}, ${c.address.state || ''} ${c.address.zipCode || ''}` : '',
            foundedYear: c.foundedYear || '',
            tags: c.tags || [],
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
            lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
            owner: c.createdBy || 'Unassigned'
          };
        };
        if (stateCompany) {
          setCompany(normalize(stateCompany));
          return;
        }
        // Fallback: fetch by id if available
        if (id) {
          const response = await api.get(`/companies/${id}`);
          if (response.success) {
            const c = (response.data as any)?.company || (response.data as any);
            setCompany(normalize(c));
            return;
          }
        }
      } finally {
        setLoading(false);
      }
    };
    loadCompany();
  }, [id]);

  const handleSaveCompany = (updatedCompany: any) => {
    setCompany(updatedCompany);
    console.log('Company updated:', updatedCompany);
    // Here you would typically make an API call to save the company
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-20 px-2 sm:px-4 md:px-6 py-4">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading company details...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-20 px-2 sm:px-4 md:px-6 py-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Company Not Found</h2>
              <p className="text-muted-foreground mb-6">The company you're looking for doesn't exist or has been removed.</p>
              <button
                onClick={() => navigate('/companies')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth"
              >
                Back to Companies
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-20 px-2 sm:px-4 md:px-6 py-4">
          <div className="w-full">
            <Breadcrumbs />
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-8 space-y-6">
                {/* Company Information Card */}
                <CompanyInfoCard 
                  company={company} 
                  onSave={handleSaveCompany}
                />
                
                {/* Company Tabs */}
                <CompanyTabs company={company} />
              </div>

              {/* Right Column - Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                {/* Quick Actions Panel */}
                <QuickActionsPanel company={company} />
                
                {/* Related Deals Card */}
                <RelatedDealsCard deals={mockDeals} />
                
                {/* Recent Activity Card */}
                <RecentActivityCard activities={mockActivities} />
              </div>
            </div>
          </div>
        </main>
      </div>

    </div>
  );
};

export default CompanyDetails;