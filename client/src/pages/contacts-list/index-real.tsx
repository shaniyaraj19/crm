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
import { api } from '../../services/api';

const ContactsList = () => {
  // State management with real API integration
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    company: '',
    owner: '',
    tags: '',
    dateRange: ''
  });
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'firstName', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 25
  });

  // Fetch contacts from API
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.status && { type: filters.status }),
        ...(filters.company && { company: filters.company }),
        ...(filters.tags && { tags: filters.tags })
      });

      const response = await api.get(`/contacts?${queryParams}`);
      
      if (response.data.success) {
        // Transform backend data to match frontend expectations
        const transformedContacts = response.data.data.contacts.map(contact => ({
          id: contact._id,
          name: `${contact.firstName} ${contact.lastName}`,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email || '',
          phone: contact.phone || contact.mobile || '',
          company: contact.companyId?.name || 'Unknown Company',
          title: contact.jobTitle || '',
          status: contact.type === 'lead' ? 'Lead' : 
                  contact.type === 'prospect' ? 'Prospect' : 
                  contact.type === 'customer' ? 'Customer' : 'Partner',
          owner: contact.createdBy || 'Unassigned',
          tags: contact.tags || [],
          lastContact: contact.updatedAt,
          avatar: null,
          department: contact.department || '',
          linkedIn: contact.socialMedia?.linkedin || ''
        }));

        setContacts(transformedContacts);
        setPagination({
          total: response.data.data.total,
          pages: response.data.data.pages,
          page: response.data.data.page,
          limit: response.data.data.limit
        });
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load contacts on component mount and when dependencies change
  useEffect(() => {
    fetchContacts();
  }, [currentPage, itemsPerPage, searchTerm, filters, sortConfig]);

  // Handle contact creation
  const handleAddContact = async (contactData) => {
    try {
      const response = await api.post('/contacts', contactData);
      if (response.data.success) {
        await fetchContacts(); // Refresh the list
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error('Error creating contact:', err);
      setError('Failed to create contact. Please try again.');
    }
  };

  // Handle contact deletion
  const handleDeleteContacts = async (contactIds) => {
    try {
      await Promise.all(
        contactIds.map(id => api.delete(`/contacts/${id}`))
      );
      await fetchContacts(); // Refresh the list
      setSelectedContacts([]);
    } catch (err) {
      console.error('Error deleting contacts:', err);
      setError('Failed to delete contacts. Please try again.');
    }
  };

  // Filtered and sorted contacts (now handled by backend)
  const filteredContacts = useMemo(() => {
    return contacts; // Backend handles filtering and sorting
  }, [contacts]);

  // Pagination (now handled by backend)
  const paginatedContacts = useMemo(() => {
    return filteredContacts; // Backend handles pagination
  }, [filteredContacts]);

  const totalPages = pagination.pages;
  const totalContacts = pagination.total;

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page
  };

  // Handle filters
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Handle contact selection
  const handleContactSelect = (contactId) => {
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

  // Quick action handlers
  const handleExport = async () => {
    try {
      const response = await api.get('/contacts/export');
      // Handle export download
      console.log('Export triggered');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleImport = () => {
    // Handle import modal/flow
    console.log('Import triggered');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Helmet>
        <title>Contacts - V-Accel CRM</title>
      </Helmet>
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {/* Breadcrumbs */}
            <Breadcrumbs 
              items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Contacts', href: '/contacts-list', current: true }
              ]} 
            />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
                <p className="mt-1 text-sm text-gray-600">
                  {loading ? 'Loading...' : `${totalContacts} total contacts`}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={handleExport}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Icon name="Download" size={16} />
                  <span>Export</span>
                </Button>
                
                <Button 
                  onClick={handleImport}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Icon name="Upload" size={16} />
                  <span>Import</span>
                </Button>
                
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Icon name="Plus" size={16} />
                  <span>Add Contact</span>
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <Icon name="AlertCircle" className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <ContactsFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              searchTerm={searchTerm}
              onSearch={handleSearch}
              loading={loading}
            />

            {/* Bulk Actions */}
            {selectedContacts.length > 0 && (
              <BulkActionsBar 
                selectedCount={selectedContacts.length}
                onDelete={() => handleDeleteContacts(selectedContacts)}
                onExport={handleExport}
                onClearSelection={() => setSelectedContacts([])}
              />
            )}

            {/* Contacts Table */}
            <ContactsTable 
              contacts={paginatedContacts}
              selectedContacts={selectedContacts}
              onContactSelect={handleContactSelect}
              onSelectAll={handleSelectAll}
              sortConfig={sortConfig}
              onSort={handleSort}
              loading={loading}
            />

            {/* Pagination */}
            <ContactsPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalContacts}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              loading={loading}
            />
          </div>
        </main>
      </div>

      {/* Quick Action Button */}


      {/* Add Contact Modal */}
      <AddContactModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddContact}
      />
    </div>
  );
};

export default ContactsList;