import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumbs from '../../components/ui/Breadcrumbs';

import ContactInfoCard from './components/ContactInfoCard';
import QuickActionsPanel from './components/QuickActionsPanel';
import RelatedDealsCard from './components/RelatedDealsCard';
import RecentActivityCard from './components/RecentActivityCard';
import ContactTabs from './components/ContactTabs';

const ContactDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load contact data from router state or API

  // Notes state
  const [notes, setNotes] = useState([
    {
      id: 1,
      content: `Initial contact made through LinkedIn. Client is looking for a comprehensive CRM solution to manage their growing sales team.\n\nKey requirements:\n- Multi-user access\n- Integration with existing tools\n- Mobile accessibility\n- Reporting capabilities`,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      user: 'John Smith',
      type: 'general'
    },
    {
      id: 2,
      content: 'Follow-up call scheduled for next Tuesday at 2 PM EST. Client requested additional information about pricing tiers and implementation timeline.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      user: 'Sarah Johnson',
      type: 'general'
    }
  ]);

  // Function to add new note
  const handleAddNote = (newNote: any) => {
    const noteWithId = {
      ...newNote,
      id: Date.now(),
      timestamp: new Date(),
      user: "Current User" // You can get this from user context
    };
    setNotes(prevNotes => [noteWithId, ...prevNotes]);
    console.log('New note added:', noteWithId);
  };

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
      description: 'Client confirmed budget approval. Moving to contract phase.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      user: 'John Smith'
    },
    {
      id: 5,
      type: 'task',
      title: 'Task completed',
      description: 'Prepared technical documentation for client review.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      user: 'Sarah Johnson'
    }
  ];

  useEffect(() => {
    const loadContact = async () => {
      try {
        setLoading(true);
        // Prefer contact passed via navigation state
        const stateContact = (location as any)?.state?.contact;
        const normalize = (c: any) => {
          if (!c) return null;
          const [first, ...rest] = (c.firstName ? [] : (c.name || '').split(' '));
          const inferredFirst = c.firstName ?? first ?? '';
          const inferredLast = c.lastName ?? (rest?.join(' ') ?? '');
          return {
            id: c._id || c.id,
            firstName: inferredFirst,
            lastName: inferredLast,
            email: c.email || '',
            phone: c.phone || c.mobile || '',
            jobTitle: c.jobTitle || c.title || '',
            company: c.companyId?.name || c.company || '',
            status: c.type || c.status || 'active',
            leadSource: c.leadSource || '',
            website: c.website || '',
            linkedin: c.socialMedia?.linkedin || c.linkedin || '',
            tags: c.tags || [],
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
            lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
            owner: c.createdBy || 'Unassigned'
          };
        };
        if (stateContact) {
          setContact(normalize(stateContact));
          return;
        }
        // Fallback: fetch by id if available
        if (id) {
          const response = await api.get(`/contacts/${id}`);
          if (response.success) {
            const c = (response.data as any)?.contact || (response.data as any);
            setContact(normalize(c));
            return;
          }
        }
      } finally {
        setLoading(false);
      }
    };
    loadContact();
  }, [id]);

  const handleSaveContact = (updatedContact: any) => {
    setContact(updatedContact);
    console.log('Contact updated:', updatedContact);
    // Here you would typically make an API call to save the contact
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
                <p className="text-muted-foreground">Loading contact details...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-20 px-2 sm:px-4 md:px-6 py-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Not Found</h2>
              <p className="text-muted-foreground mb-6">The contact you're looking for doesn't exist or has been removed.</p>
              <button
                onClick={() => navigate('/contacts-list')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth"
              >
                Back to Contacts
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
                {/* Contact Information Card */}
                <ContactInfoCard 
                  contact={contact} 
                  onSave={handleSaveContact}
                />
                
                {/* Contact Tabs */}
                <ContactTabs contact={contact} notes={notes} onAddNote={handleAddNote} />
              </div>

              {/* Right Column - Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                {/* Quick Actions Panel */}
                <QuickActionsPanel contact={contact} onAddNote={handleAddNote} />
                
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

export default ContactDetails;