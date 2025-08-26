import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumbs from '../../components/ui/Breadcrumbs';

import ContactsTable from './components/ContactsTable';
import ContactsFilters from './components/ContactsFilters';
import BulkActionsBar from './components/BulkActionsBar';
import ContactsPagination from './components/ContactsPagination';
import AddContactModal from './components/AddContactModal';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ContactsList = () => {
  // Mock data
  const mockContacts = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@techcorp.com",
      phone: "5551234567",
      company: "TechCorp Solutions",
      title: "Marketing Director",
      status: "Hot Lead",
      owner: "John Smith",
      tags: ["VIP", "Enterprise"],
      lastContact: "2025-01-30T10:30:00Z",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@globalind.com",
      phone: "5552345678",
      company: "Global Industries",
      title: "CEO",
      status: "Customer",
      owner: "Sarah Johnson",
      tags: ["Enterprise", "Partner"],
      lastContact: "2025-01-29T14:15:00Z",
      avatar: null
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r@innovationlabs.io",
      phone: "5553456789",
      company: "Innovation Labs",
      title: "Product Manager",
      status: "Warm Lead",
      owner: "Mike Davis",
      tags: ["Startup", "Referral"],
      lastContact: "2025-01-28T09:45:00Z",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david.wilson@digitaldyn.com",
      phone: "5554567890",
      company: "Digital Dynamics",
      title: "CTO",
      status: "Prospect",
      owner: "Emily Chen",
      tags: ["SMB"],
      lastContact: "2025-01-27T16:20:00Z",
      avatar: null
    },
    {
      id: 5,
      name: "Lisa Thompson",
      email: "lisa.t@futuresys.com",
      phone: "5555678901",
      company: "Future Systems",
      title: "Sales Director",
      status: "Cold Lead",
      owner: "David Wilson",
      tags: ["Enterprise"],
      lastContact: "2025-01-26T11:30:00Z",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 6,
      name: "Robert Garcia",
      email: "r.garcia@smartsol.net",
      phone: "5556789012",
      company: "Smart Solutions",
      title: "Operations Manager",
      status: "Hot Lead",
      owner: "John Smith",
      tags: ["VIP", "SMB"],
      lastContact: "2025-01-25T13:45:00Z",
      avatar: null
    },
    {
      id: 7,
      name: "Jennifer Lee",
      email: "jennifer.lee@nextgentech.com",
      phone: "5557890123",
      company: "NextGen Tech",
      title: "VP Engineering",
      status: "Customer",
      owner: "Sarah Johnson",
      tags: ["Enterprise", "Partner"],
      lastContact: "2025-01-24T08:15:00Z",
      avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 8,
      name: "Mark Anderson",
      email: "mark.a@alphaent.com",
      phone: "5558901234",
      company: "Alpha Enterprises",
      title: "Business Development",
      status: "Warm Lead",
      owner: "Mike Davis",
      tags: ["Startup"],
      lastContact: "2025-01-23T15:30:00Z",
      avatar: null
    }
  ];

  // State management
  const [contacts, setContacts] = useState(mockContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    company: '',
    owner: '',
    tags: '',
    dateRange: ''
  });
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filtered and sorted contacts
  const filteredContacts = useMemo(() => {
    let filtered = contacts.filter(contact => {
      const matchesSearch = !searchTerm || 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !filters.status || contact.status === filters.status;
      const matchesCompany = !filters.company || contact.company === filters.company;
      const matchesOwner = !filters.owner || contact.owner === filters.owner;
      const matchesTags = !filters.tags || contact.tags.includes(filters.tags);

      return matchesSearch && matchesStatus && matchesCompany && matchesOwner && matchesTags;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'lastContact') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [contacts, searchTerm, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Active filters count
  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  // Event handlers
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectContact = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === paginatedContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(paginatedContacts.map(contact => contact.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedContacts([]);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedContacts([]);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setSelectedContacts([]);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      company: '',
      owner: '',
      tags: '',
      dateRange: ''
    });
    setCurrentPage(1);
  };

  const handleAddContact = (newContact) => {
    setContacts(prev => [newContact, ...prev]);
  };

  const handleEditContact = (contact) => {
    console.log('Editing contact:', contact);
    // Navigate to edit form or open edit modal
  };

  const handleDeleteContact = (contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      setContacts(prev => prev.filter(c => c.id !== contact.id));
      setSelectedContacts(prev => prev.filter(id => id !== contact.id));
    }
  };

  const handleBulkExport = () => {
    console.log('Exporting contacts:', selectedContacts);
    // Implement export functionality
  };

  const handleBulkAssignOwner = (ownerId) => {
    console.log('Assigning owner:', ownerId, 'to contacts:', selectedContacts);
    // Implement bulk assign owner
    setSelectedContacts([]);
  };

  const handleBulkAddTags = (tags) => {
    console.log('Adding tags:', tags, 'to contacts:', selectedContacts);
    // Implement bulk add tags
    setSelectedContacts([]);
  };

  const handleBulkDelete = () => {
    setContacts(prev => prev.filter(contact => !selectedContacts.includes(contact.id)));
    setSelectedContacts([]);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  return (
    <>
      <Helmet>
        <title>Contacts List - CRM Pro</title>
        <meta name="description" content="Manage and organize your customer contacts with advanced filtering, search, and bulk operations." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar />
        
        <main className="md:ml-20 pt-12">
          <div className="p-4">
            <Breadcrumbs />
            
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">Contacts</h1>
                <p className="text-muted-foreground">
                  Manage your customer relationships and track interactions
                </p>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <Button
                  variant="outline"
                  iconName="Upload"
                  iconPosition="left"
                >
                  Import
                </Button>
                <Button
                  variant="default"
                  onClick={() => setIsAddModalOpen(true)}
                  iconName="Plus"
                  iconPosition="left"
                  className="bg-accent hover:bg-accent/90"
                >
                  Add Contact
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Users" size={24} className="text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                    <p className="text-2xl font-semibold text-foreground">{contacts.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="UserCheck" size={24} className="text-success" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Customers</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {contacts.filter(c => c.status === 'Customer').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Icon name="TrendingUp" size={24} className="text-warning" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Hot Leads</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {contacts.filter(c => c.status === 'Hot Lead').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon name="Target" size={24} className="text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Prospects</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {contacts.filter(c => c.status === 'Prospect').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <ContactsFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              activeFiltersCount={activeFiltersCount}
            />

            {/* Results Summary */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredContacts.length} of {contacts.length} contacts
                {searchTerm && (
                  <span> for "{searchTerm}"</span>
                )}
              </p>
              
              {selectedContacts.length > 0 && (
                <p className="text-sm font-medium text-primary">
                  {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Contacts Table */}
            <ContactsTable
              contacts={paginatedContacts}
              selectedContacts={selectedContacts}
              onSelectContact={handleSelectContact}
              onSelectAll={handleSelectAll}
              sortConfig={sortConfig}
              onSort={handleSort}
              onEdit={handleEditContact}
              onDelete={handleDeleteContact}
            />

            {/* Pagination */}
            <ContactsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredContacts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </main>

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedContacts.length}
          onExport={handleBulkExport}
          onAssignOwner={handleBulkAssignOwner}
          onAddTags={handleBulkAddTags}
          onDelete={handleBulkDelete}
          onClearSelection={handleClearSelection}
        />

        {/* Add Contact Modal */}
        <AddContactModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddContact}
        />

        {/* Quick Action Button */}
  
      </div>
    </>
  );
};

export default ContactsList;