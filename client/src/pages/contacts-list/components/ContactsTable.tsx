import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useFields } from '../../../contexts/FieldsContext';

interface SortConfigType { key: string; direction: 'asc' | 'desc' }
interface ContactsTableProps {
  contacts: any[];
  selectedContacts: string[];
  onSelectContact: (id: string) => void;
  onSelectAll: () => void;
  sortConfig: SortConfigType;
  onSort: (key: string) => void;
  onEdit?: (contact: any) => void;
  onDelete?: (contact: any) => void;
  onUpdateContact?: (contactId: string, updates: any) => void;
  onOpenFieldCustomizer?: () => void;
  loading?: boolean;
}

const ContactsTable: React.FC<ContactsTableProps> = ({ 
  contacts, 
  selectedContacts, 
  onSelectContact, 
  onSelectAll, 
  sortConfig, 
  onSort,
  onEdit,
  onDelete,
  onUpdateContact,
  onOpenFieldCustomizer,
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { fields } = useFields();
  
  // Get visible contact fields, sorted by order, excluding lastName
  const visibleFields = fields.contacts
    .filter(field => field.visible && field.name !== 'lastName')
    .sort((a, b) => a.order - b.order);

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'Hot Lead': 'bg-error text-error-foreground',
      'Warm Lead': 'bg-warning text-warning-foreground',
      'Cold Lead': 'bg-muted text-muted-foreground',
      'Customer': 'bg-success text-success-foreground',
      'Prospect': 'bg-accent text-accent-foreground'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getSortIcon = (column: string) => {
    if (sortConfig.key !== column) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-primary" />
      : <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const renderFieldValue = (field: any, contact: any) => {
    const value = contact[field.name] || contact[field.id];
    
    if (!value) return '-';
    
    switch (field.type) {
      case 'email':
        return (
          <a
            href={`mailto:${value}`}
            className="text-foreground hover:text-primary transition-smooth text-sm"
          >
            {value}
          </a>
        );
      case 'phone':
        return (
          <a
            href={`tel:${value}`}
            className="text-foreground hover:text-primary transition-smooth text-sm"
          >
            {formatPhoneNumber(value)}
          </a>
        );
      case 'select':
        if (field.name === 'status') {
          return (
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(value)}`}>
                {value || 'No Status'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newStatus = prompt('Enter new status (Hot Lead, Warm Lead, Cold Lead, Customer, Prospect):', value || '');
                  if (newStatus && newStatus.trim()) {
                    onUpdateContact && onUpdateContact(contact.id || contact._id, { status: newStatus });
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Edit status"
              >
                <Icon name="Edit2" size={12} />
              </button>
            </div>
          );
        }
        return <span className="text-foreground text-sm">{value}</span>;
      case 'date':
        return <span className="text-muted-foreground text-xs">{formatDate(value)}</span>;
      default:
        if (field.name === 'firstName') {
          // Special handling for name fields - show as contact link
          return (
            <div className="flex items-center">
              <div>
                <Link
                  to={`/contact-details/${contact.id || contact._id}`}
                  state={{ contact }}
                  className="font-medium text-foreground hover:text-primary transition-smooth text-sm"
                >
                  {contact.firstName} {contact.lastName}
                </Link>
                <p className="text-xs text-muted-foreground">{contact.title}</p>
              </div>
            </div>
          );
        }
        return <span className="text-foreground text-sm">{value}</span>;
    }
  };



  const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length;
  const isIndeterminate = selectedContacts.length > 0 && selectedContacts.length < contacts.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-card rounded-lg border border-border shadow-elevation-1 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={onSelectAll}
                  className="rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                />
              </th>
              {visibleFields.map((field) => (
                <th key={field.id} className="text-left px-3 py-2 font-medium text-foreground text-sm">
                  <button
                    onClick={() => onSort(field.name)}
                    className="flex items-center space-x-1.5 hover:text-primary transition-smooth text-sm"
                  >
                    <span>{field.name === 'firstName' ? 'Contact' : field.label}</span>
                    {getSortIcon(field.name)}
                  </button>
                </th>
              ))}
              <th className="w-25 px-3 py-2">
                <Button 
                  onClick={onOpenFieldCustomizer}
                  className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white px-2 py-1 h-7 text-xs"
                >
                  <Icon name="Plus" size={12} />
                  <span>Create Field</span>
                </Button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                className={`hover:bg-muted/30 transition-smooth ${
                  selectedContacts.includes(contact.id) ? 'bg-accent/10' : ''
                }`}
                onMouseEnter={() => setHoveredRow(contact.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => onSelectContact(contact.id)}
                    className="rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center">
                    <div>
                      <Link
                        to={`/contact-details/${contact.id || contact._id}`}
                        state={{ contact }}
                        className="font-medium text-foreground hover:text-primary transition-smooth text-sm"
                      >
                        {contact.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{contact.title}</p>
                    </div>
                  </div>
                </td>
                {visibleFields.slice(1).map((field) => (
                  <td key={field.id} className="px-3 py-2">
                    {renderFieldValue(field, contact)}
                  </td>
                ))}
                <td className="px-3 py-2">
                  <div className={`flex items-center space-x-0.5 transition-smooth ${
                    hoveredRow === contact.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit && onEdit(contact)}
                      className="h-6 w-6 p-0"
                      title="Edit"
                    >
                      <Icon name="Edit2" size={12} />
                    </Button>
                    
                    <div className="relative" ref={openDropdown === contact.id ? dropdownRef : null}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenDropdown(openDropdown === contact.id ? null : contact.id)}
                        className="h-6 w-6 p-0"
                        title="More actions"
                      >
                        <Icon name="MoreVertical" size={12} />
                      </Button>
                      
                      {openDropdown === contact.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                          <button
                            onClick={() => {
                              window.open(`tel:${contact.phone}`);
                              setOpenDropdown(null);
                            }}
                            className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-muted w-full text-left transition-colors"
                          >
                            <Icon name="Phone" size={14} />
                            <span>Call</span>
                          </button>
                          <button
                            onClick={() => {
                              window.open(`mailto:${contact.email}`);
                              setOpenDropdown(null);
                            }}
                            className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-muted w-full text-left transition-colors"
                          >
                            <Icon name="Mail" size={14} />
                            <span>Email</span>
                          </button>
                          <hr className="my-1 border-border" />
                          <button
                            onClick={() => {
                              const name = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
                              const confirmMessage = `Are you sure you want to delete ${name || 'this contact'}? This action cannot be undone.`;
                              if (window.confirm(confirmMessage)) {
                                onDelete && onDelete(contact);
                              }
                              setOpenDropdown(null);
                            }}
                            className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive w-full text-left transition-colors"
                          >
                            <Icon name="Trash2" size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden">
        <div className="p-4 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={input => {
                if (input) input.indeterminate = isIndeterminate;
              }}
              onChange={onSelectAll}
              className="rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-foreground">
              {selectedContacts.length} of {contacts.length} selected
            </span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {contacts.map((contact) => (
            <div key={contact.id} className="p-4 hover:bg-muted/30 transition-smooth">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => onSelectContact(contact.id)}
                  className="rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/contact-details/${contact.id || contact._id}`}
                      state={{ contact }}
                      className="font-medium text-foreground hover:text-primary transition-smooth"
                    >
                      {contact.name}
                    </Link>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(contact.status)}`}>
                      {contact.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{contact.company} • {contact.title}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-sm text-foreground hover:text-primary transition-smooth"
                    >
                      {formatPhoneNumber(contact.phone)}
                    </a>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm text-foreground hover:text-primary transition-smooth truncate"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        <div className="p-4 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={input => {
                if (input) input.indeterminate = isIndeterminate;
              }}
              onChange={onSelectAll}
              className="rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-foreground">
              {selectedContacts.length} selected
            </span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {contacts.map((contact) => (
            <div key={contact.id} className="p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => onSelectContact(contact.id)}
                  className="rounded border-border text-primary focus:ring-primary focus:ring-offset-0 mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/contact-details/${contact.id || contact._id}`}
                      state={{ contact }}
                      className="font-medium text-foreground hover:text-primary transition-smooth"
                    >
                      {contact.name}
                    </Link>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(contact.status)}`}>
                      {contact.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{contact.company}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-smooth"
                    >
                      <Icon name="Phone" size={14} />
                      <span className="text-sm">Call</span>
                    </a>
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-smooth"
                    >
                      <Icon name="Mail" size={14} />
                      <span className="text-sm">Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactsTable;