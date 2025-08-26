import React, { useState, useMemo, useEffect, useRef } from 'react';
// Removed react-helmet to avoid UNSAFE_componentWillMount warning
import Layout from '../../components/Layout';

import ContactsTable from './components/ContactsTable';
import ContactsExcelGrid from './components/ContactsExcelGrid';
import ContactsFilters from './components/ContactsFilters';
import BulkActionsBar from './components/BulkActionsBar';
import ContactsPagination from './components/ContactsPagination';
import ContactSlideForm from './components/ContactSlideForm';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { api } from '../../services/api';
import FieldCustomizer from '../../components/FieldCustomizer';

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  status?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ContactFilters {
  status: string;
  company: string;
  owner: string;
  tags: string;
  dateRange: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const ContactsList: React.FC = () => {
  // State management with real API integration
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<ContactFilters>({
    status: '',
    company: '',
    owner: '',
    tags: '',
    dateRange: ''
  });
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'firstName', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isSlideFormOpen, setIsSlideFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'excel'
  const [isFieldCustomizerOpen, setIsFieldCustomizerOpen] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 25
  });

  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Check authentication
  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    console.log('🔐 Auth Check:', { hasToken: !!token, tokenLength: token?.length });
    
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      setError('Please log in to view contacts. Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return false;
    }
    console.log('✅ Token found, proceeding with API call');
    return true;
  };

  // Fetch contacts from API
  const fetchContacts = async () => {
    if (!checkAuth()) return;
    
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

      console.log('📡 Making API call to:', `/contacts?${queryParams}`);
      const response = await api.get<{ contacts: any[]; pagination: any }>(`/contacts?${queryParams}`);
      console.log('📨 API Response:', response);
      
      // Check if response has success field (proper API format) or direct data (legacy format)
      const hasSuccessField = response.success !== undefined;
      const isSuccessful = hasSuccessField ? response.success : ((response as any).contacts !== undefined);
      
      if (isSuccessful) {
        // Handle both API formats
        const contactsData = hasSuccessField ? (response.data as any).contacts : (response as any).contacts;
        const paginationData = hasSuccessField ? (response.data as any).pagination : (response as any).pagination;
        
        // Transform backend data to match frontend expectations
        const transformedContacts = contactsData.map((contact: any) => ({
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

        console.log('✅ Transformed contacts:', transformedContacts);
        console.log('📊 Pagination data:', paginationData);
        
        setContacts(transformedContacts);
        setPagination({
          total: paginationData.total || 0,
          pages: paginationData.totalPages || paginationData.pages || 0,
          page: paginationData.page || 1,
          limit: paginationData.limit || 25
        });
      } else {
        console.log('❌ API response not successful:', response);
        const errorMessage = hasSuccessField ? response.message : 'Unknown error';
        setError(`API Error: ${errorMessage}`);
      }
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      
      // Handle authentication errors
      if (err.statusCode === 401 || err.statusCode === 403) {
        setError('Please log in to view contacts. Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(`Failed to load contacts: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Set page title
  useEffect(() => {
    document.title = 'Contacts - V-Accel CRM';
  }, []);

  // Load contacts on component mount and when dependencies change
  useEffect(() => {
    fetchContacts();
  }, [currentPage, itemsPerPage, searchTerm, filters, sortConfig]);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle contact creation
  const handleAddContact = async (contactData: any) => {
    try {
      const response = await api.post<any>('/contacts', contactData);
      if (response.success) {
        await fetchContacts(); // Refresh the list
        setIsSlideFormOpen(false);
      }
    } catch (err) {
      console.error('Error creating contact:', err);
      setError('Failed to create contact. Please try again.');
    }
  };

  // Handle edit contact
  const handleEditContact = (contact: any) => {
    setEditingContact(contact);
    setFormMode('edit');
    setIsSlideFormOpen(true);
  };

  // Handle save contact (both create and edit)
  const handleSaveContact = async (contactData: any) => {
    try {
      if (formMode === 'edit') {
        const response = await api.put<any>(`/contacts/${contactData._id || contactData.id}`, contactData);
        if (response.success) {
          await fetchContacts(); // Refresh the list
        }
      } else {
        const response = await api.post<any>('/contacts', contactData);
        if (response.success) {
          await fetchContacts(); // Refresh the list
        }
      }
    } catch (err) {
      console.error('Error saving contact:', err);
      setError('Failed to save contact. Please try again.');
    }
  };

  // Handle inline contact updates (like status changes)
  const handleUpdateContact = async (contactId: string, updates: any) => {
    try {
      const response = await api.patch<any>(`/contacts/${contactId}`, updates);
      if (response.success) {
        await fetchContacts(); // Refresh the list
      }
    } catch (err) {
      console.error('Error updating contact:', err);
      setError('Failed to update contact. Please try again.');
    }
  };

  // Handle create contact button
  const handleCreateContact = () => {
    setEditingContact(null);
    setFormMode('create');
    setIsSlideFormOpen(true);
  };

  const openContactsFieldCustomizer = () => {
    setIsFieldCustomizerOpen(true);
  };

  // Handle contact deletion
  const handleDeleteContacts = async (contactIds: string[]) => {
    try {
      await Promise.all(
        contactIds.map(id => api.delete<any>(`/contacts/${id}`))
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
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page
  };

  // Handle filters - Updated to work with ContactsFilters component
  const handleFiltersChange = (newFilters: ContactFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page
  };

  // Handle individual filter changes (for ContactsFilters component)
  const handleSingleFilterChange = (newFilters: ContactFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page
  };

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Handle contact selection
  const handleContactSelect = (contactId: string) => {
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
      setSelectedContacts(paginatedContacts.map((contact: any) => contact.id));
    }
  };

  // Quick action handlers
  const handleExport = async () => {
    try {
      const response = await api.get('/contacts/export');
      // Handle export download
      console.log('Export triggered');
      setIsMoreMenuOpen(false);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleMassEmail = () => {
    // Handle mass email functionality
    console.log('Mass email triggered');
    setIsMoreMenuOpen(false);
  };

  const handleImport = () => {
    // Handle import modal/flow
    console.log('Import triggered');
  };

  return (
    <Layout>

      
      <div className="space-y-4">
            {/* Contacts Toolbar */}
            <div className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
              {/* Left Section */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`relative p-1 hover:bg-muted rounded transition-colors ${isFilterOpen ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  <Icon name="Filter" size={16} className={isFilterOpen ? "" : "text-muted-foreground"} />
                  {Object.values(filters).filter(value => value !== '').length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {Object.values(filters).filter(value => value !== '').length}
                    </span>
                  )}
                </button>
                
                {/* Clear Filters Button - Show when there are active filters */}
                {Object.values(filters).filter(value => value !== '').length > 0 && (
                  <button
                    onClick={() => setFilters({
                      status: '',
                      company: '',
                      owner: '',
                      tags: '',
                      dateRange: ''
                    })}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name="X" size={12} />
                    <span>Clear</span>
                  </button>
                )}
                
                {/* Active Filter Chips - Show in toolbar when filters are active */}
                {Object.entries(filters).map(([key, value]: [string, string]) => {
                  if (!value) return null;
                  
                  const getFilterLabel = (key: string, value: string) => {
                    const statusOptions = {
                      'Hot Lead': 'Hot Lead',
                      'Warm Lead': 'Warm Lead', 
                      'Cold Lead': 'Cold Lead',
                      'Customer': 'Customer',
                      'Prospect': 'Prospect'
                    };
                    
                    const dateRangeOptions = {
                      'today': 'Today',
                      'week': 'This Week',
                      'month': 'This Month', 
                      'quarter': 'This Quarter',
                      'year': 'This Year'
                    };
                    
                    const keyLabels = {
                      'status': 'Status',
                      'company': 'Company',
                      'owner': 'Owner', 
                      'tags': 'Tag',
                      'dateRange': 'Date'
                    };
                    
                    const displayValue = key === 'dateRange' ? (dateRangeOptions[value as keyof typeof dateRangeOptions] || value) : value;
                    return `${keyLabels[key as keyof typeof keyLabels]}: ${displayValue}`;
                  };
                  
                  return (
                    <div
                      key={key}
                      className="inline-flex items-center space-x-1 bg-accent/10 text-accent-foreground px-2 py-1 rounded-full text-xs"
                    >
                      <span>{getFilterLabel(key, value)}</span>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, [key]: '' }))}
                        className="hover:text-error transition-colors"
                      >
                        <Icon name="X" size={10} />
                      </button>
                    </div>
                  );
                })}
                
                <div className="relative">
                  <button className="flex items-center space-x-2 px-3 py-1.5 bg-background border border-border rounded-md hover:bg-muted transition-colors">
                    <span className="text-sm font-medium">All Contacts</span>
                    <Icon name="ChevronDown" size={14} className="text-muted-foreground" />
                  </button>
                  {/* Dropdown would go here when needed */}
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-2">
                {/* View Toggle */}
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-accent text-accent-foreground hover:bg-accent/80' 
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon name="List" size={16} />
                  </button>
                  <button 
                    onClick={() => setViewMode('excel')}
                    className={`p-2 transition-colors ${
                      viewMode === 'excel' 
                        ? 'bg-accent text-accent-foreground hover:bg-accent/80' 
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon name="LayoutGrid" size={16} />
                  </button>
                </div>
                
                {/* Add Contact Button */}
                <Button 
                  onClick={handleCreateContact}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Icon name="Plus" size={16} />
                  <span>Contact</span>
                </Button>
                
                {/* More Options */}
                <div className="relative" ref={moreMenuRef}>
                  <button 
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className="p-2 hover:bg-muted rounded transition-colors"
                  >
                    <Icon name="MoreVertical" size={16} className="text-muted-foreground" />
                  </button>
                  
                  {/* More Options Dropdown */}
                  {isMoreMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                      <button
                        onClick={handleExport}
                        className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted w-full text-left transition-colors"
                      >
                        <Icon name="Download" size={16} />
                        <span>Export Contacts</span>
                      </button>
                      <button
                        onClick={handleMassEmail}
                        className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted w-full text-left transition-colors"
                      >
                        <Icon name="Mail" size={16} />
                        <span>Mass Email</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>



            {/* Filters - Show/Hide based on filter button */}
            {isFilterOpen && (
              <ContactsFilters 
                filters={filters}
                onFilterChange={handleSingleFilterChange}
                isExpanded={true}
              />
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
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



            {/* Bulk Actions */}
            {selectedContacts.length > 0 && (
              <BulkActionsBar 
                selectedCount={selectedContacts.length}
                onDelete={() => handleDeleteContacts(selectedContacts)}
                onExport={handleExport}
                onAssignOwner={() => console.log('Assign owner')}
                onAddTags={() => console.log('Add tags')}
                onClearSelection={() => setSelectedContacts([])}
              />
            )}

            {/* Contacts View - Table or Excel Grid */}
            {viewMode === 'list' ? (
              <ContactsTable 
                contacts={paginatedContacts}
                selectedContacts={selectedContacts}
                onSelectContact={handleContactSelect}
                onSelectAll={handleSelectAll}
                sortConfig={sortConfig}
                onSort={handleSort}
                onEdit={handleEditContact}
                onDelete={(contact: any) => {
                  const id = (contact as any)._id || (contact as any).id;
                  if (!id) return;
                  handleDeleteContacts([id]);
                }}
                onUpdateContact={handleUpdateContact}
                loading={loading}
                onOpenFieldCustomizer={openContactsFieldCustomizer}
              />
            ) : (
              <ContactsExcelGrid 
                contacts={paginatedContacts}
                selectedContacts={selectedContacts}
                onSelectContact={handleContactSelect}
                onSelectAll={handleSelectAll}
                sortConfig={sortConfig}
                onSort={handleSort}
                onEdit={handleEditContact}
                onDelete={(contact: any) => {
                  const id = (contact as any)._id || (contact as any).id;
                  if (!id) return;
                  handleDeleteContacts([id]);
                }}
                onUpdateContact={handleUpdateContact}
                onOpenFieldCustomizer={openContactsFieldCustomizer}
              />
            )}

            {/* Pagination */}
            <ContactsPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalContacts}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
      </div>



      {/* Contact Slide Form */}
      <ContactSlideForm
        isOpen={isSlideFormOpen}
        onClose={() => {
          setIsSlideFormOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        contact={editingContact}
        mode={formMode}
      />

      {/* Field Customizer for Contacts */}
      <FieldCustomizer
        module="contacts"
        isOpen={isFieldCustomizerOpen}
        onClose={() => setIsFieldCustomizerOpen(false)}
      />
    </Layout>
  );
};

export default ContactsList;