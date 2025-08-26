import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

interface SortConfigType { key: string; direction: 'asc' | 'desc' }
interface ContactsExcelGridProps {
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
}

const ContactsExcelGrid: React.FC<ContactsExcelGridProps> = ({ 
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
  const navigate = useNavigate();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [cellValue, setCellValue] = useState('');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'Hot Lead': 'bg-red-100 text-red-800 border-red-200',
      'Warm Lead': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Cold Lead': 'bg-gray-100 text-gray-800 border-gray-200',
      'Customer': 'bg-green-100 text-green-800 border-green-200',
      'Prospect': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSortIcon = (column: string) => {
    if (sortConfig.key !== column) {
      return <Icon name="ArrowUpDown" size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' 
      ? <Icon name="ArrowUp" size={12} className="text-primary" />
      : <Icon name="ArrowDown" size={12} className="text-primary" />;
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
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  // const getInitials = (name: string) => {
  //   if (!name) return '';
  //   return name
  //     .split(' ')
  //     .map((word: string) => word.charAt(0))
  //     .join('')
  //     .toUpperCase()
  //     .slice(0, 2);
  // };

  const handleCellClick = (contactId: string, field: string) => {
    setSelectedCell(`${contactId}-${field}`);
    setEditingCell(null); // Clear any editing
  };

  const handleCellDoubleClick = (contactId: string, field: string, value: string) => {
    setEditingCell(`${contactId}-${field}`);
    setSelectedCell(`${contactId}-${field}`);
    setCellValue(value || '');
  };

  const handleCellBlur = async () => {
    if (editingCell && cellValue !== undefined) {
      await saveCell();
    }
    setEditingCell(null);
    setCellValue('');
    // Keep the cell selected after editing
  };

  const saveCell = async () => {
    if (!editingCell) return;
    
    try {
      // Here you would make an API call to save the data
      // For now, we'll just show a toast
      const [contactId, field] = editingCell.split('-');
      
      // Simulate API call
      console.log(`Saving ${field} for contact ${contactId}: ${cellValue}`);
      
      // Show success toast
      showToast('Changes saved successfully', 'success');
      
      // TODO: Update the contact data in parent component
      // You would call something like: onUpdateContact(contactId, { [field]: cellValue });
      
    } catch (error) {
      showToast('Failed to save changes', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleKeyDown = async (e: KeyboardEvent) => {
    if (editingCell) {
      // Handle editing mode keys
      if (e.key === 'Enter') {
        e.preventDefault();
        await saveCell();
        setEditingCell(null);
        setCellValue('');
      } else if (e.key === 'Escape') {
        setEditingCell(null);
        setCellValue('');
      }
    } else if (selectedCell) {
      // Handle navigation keys when cell is selected
      e.preventDefault();
      const [contactId, field] = selectedCell.split('-');
      const contactIndex = contacts.findIndex(c => (c._id || c.id) === contactId);
      const fields = ['name', 'company', 'phone', 'email', 'status', 'lastContact'];
      const fieldIndex = fields.indexOf(field);
      
      let newContactIndex = contactIndex;
      let newFieldIndex = fieldIndex;
      
      switch (e.key) {
        case 'ArrowUp':
          newContactIndex = Math.max(0, contactIndex - 1);
          break;
        case 'ArrowDown':
          newContactIndex = Math.min(contacts.length - 1, contactIndex + 1);
          break;
        case 'ArrowLeft':
          newFieldIndex = Math.max(0, fieldIndex - 1);
          break;
        case 'ArrowRight':
          newFieldIndex = Math.min(fields.length - 1, fieldIndex + 1);
          break;
        case 'Enter':
        case 'F2':
          // Start editing current cell
          const currentContact = contacts[contactIndex];
          const currentValue = getFieldValue(currentContact, field as string);
          handleCellDoubleClick(contactId as string, field as string, currentValue as string);
          return;
        default:
          return;
      }
      
      const newContact = contacts[newContactIndex];
      const newField = fields[newFieldIndex];
      const newCellId = `${newContact._id || newContact.id}-${newField}`;
      setSelectedCell(newCellId);
    }
  };

  const getFieldValue = (contact: any, field: string): string => {
    switch (field) {
      case 'name':
        return `${contact.firstName} ${contact.lastName}`;
      case 'company':
        return contact.company;
      case 'phone':
        return contact.phone;
      case 'email':
        return contact.email;
      case 'status':
        return contact.status;
      case 'lastContact':
        return contact.lastContact || contact.createdAt;
      default:
        return '';
    }
  };

  const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length;
  const isIndeterminate = selectedContacts.length > 0 && selectedContacts.length < contacts.length;

  // Add keyboard event listener for the grid
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (gridRef.current && gridRef.current.contains(document.activeElement as Node)) {
        handleKeyDown(e as any);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [editingCell, selectedCell, contacts]);

  // Initialize first cell selection when grid loads
  useEffect(() => {
    if (contacts.length > 0 && !selectedCell) {
      const firstContact = contacts[0];
      setSelectedCell(`${firstContact._id || firstContact.id}-name`);
    }
  }, [contacts]);

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
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            <Icon 
              name={toast.type === 'success' ? 'CheckCircle' : 'AlertCircle'} 
              size={16} 
            />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Excel-style Grid */}
      <div 
        ref={gridRef}
        className="overflow-x-auto focus:outline-none" 
        tabIndex={0}
      >
        <div className="inline-block min-w-full">
          {/* Header Row */}
          <div className="flex bg-gray-50 border-b border-gray-300 sticky top-0 z-10">
            {/* Checkbox Header */}
            <div className="w-12 h-8 flex items-center justify-center bg-gray-100 border-r border-gray-300">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={input => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={onSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-1"
              />
            </div>

            {/* Column Headers */}
            {[ 
              { key: 'name', label: 'Contact', width: 'w-48' },
              { key: 'company', label: 'Company', width: 'w-40' },
              { key: 'phone', label: 'Phone', width: 'w-36' },
              { key: 'email', label: 'Email', width: 'w-56' },
              { key: 'status', label: 'Status', width: 'w-32' },
              { key: 'lastContact', label: 'Last Contact', width: 'w-32' },
              { key: 'actions', label: 'Create Field', width: 'w-30' }
            ].map((column) => (
              <div
                key={column.key}
                className={`${column.width} h-8 flex items-center justify-between px-3 bg-gray-100 border-r border-gray-300 group`}
                onClick={() => {
                  if (column.key === 'actions') return;
                  onSort(column.key)
                }}
              >
                {column.key !== 'actions' ? (
                  <span className="text-xs font-medium text-gray-700 select-none">
                    {column.label}
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenFieldCustomizer && onOpenFieldCustomizer();
                    }}
                    className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white px-2 py-1 h-6 text-xs rounded"
                  >
                    <Icon name="Plus" size={12} />
                    <span>Create Field</span>
                  </button>
                )}
                {column.key !== 'actions' && getSortIcon(column.key)}
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {contacts.map((contact, index) => (
            <div
              key={contact._id || contact.id || index}
              className={`flex border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                selectedContacts.includes(contact._id || contact.id) ? 'bg-blue-50' : 'bg-white'
              }`}
              onMouseEnter={() => setHoveredRow(contact._id || contact.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {/* Checkbox */}
              <div className="w-12 h-10 flex items-center justify-center border-r border-gray-200">
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact._id || contact.id)}
                  onChange={() => onSelectContact(contact._id || contact.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-1"
                />
              </div>

              {/* Contact Name */}
              <div 
                className={`w-48 h-10 border-r border-gray-200 px-2 flex items-center cursor-pointer ${
                  selectedCell === `${contact._id || contact.id}-name` ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleCellClick(contact._id || contact.id, 'name');
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  // For name field, navigate to details on double click instead of editing
                  navigate(`/contact-details/${contact._id || contact.id}`, { state: { contact } });
                }}
              >
                <div className="flex items-center w-full">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-900 text-sm truncate block">
                      {contact.firstName} {contact.lastName}
                    </span>
                    {contact.jobTitle && (
                      <p className="text-xs text-gray-500 truncate">{contact.jobTitle}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company */}
              <div 
                className={`w-40 h-10 border-r border-gray-200 px-2 flex items-center cursor-pointer ${
                  selectedCell === `${contact._id || contact.id}-company` ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleCellClick(contact._id || contact.id, 'company')}
                onDoubleClick={() => handleCellDoubleClick(contact._id || contact.id, 'company', contact.company)}
              >
                {editingCell === `${contact._id || contact.id}-company` ? (
                  <input
                    type="text"
                    value={cellValue}
                    onChange={(e) => setCellValue(e.target.value)}
                    onBlur={handleCellBlur}
                    onKeyDown={(e) => handleKeyDown(e as any)}
                    className="w-full px-1 py-0.5 text-sm border-0 focus:ring-1 focus:ring-blue-500 bg-white"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm text-gray-900 w-full truncate">
                    {contact.company || 'Add company'}
                  </span>
                )}
              </div>

              {/* Phone */}
              <div 
                className={`w-36 h-10 border-r border-gray-200 px-2 flex items-center cursor-pointer ${
                  selectedCell === `${contact._id || contact.id}-phone` ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleCellClick(contact._id || contact.id, 'phone');
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  handleCellDoubleClick(contact._id || contact.id, 'phone', contact.phone);
                }}
              >
                {editingCell === `${contact._id || contact.id}-phone` ? (
                  <input
                    type="text"
                    value={cellValue}
                    onChange={(e) => setCellValue(e.target.value)}
                    onBlur={handleCellBlur}
                    onKeyDown={(e) => handleKeyDown(e as any)}
                    className="w-full px-1 py-0.5 text-sm border-0 focus:ring-1 focus:ring-blue-500 bg-white"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm text-blue-600 w-full truncate">
                    {formatPhoneNumber(contact.phone) || 'Add phone'}
                  </span>
                )}
              </div>

              {/* Email */}
              <div 
                className={`w-56 h-10 border-r border-gray-200 px-2 flex items-center cursor-pointer ${
                  selectedCell === `${contact._id || contact.id}-email` ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleCellClick(contact._id || contact.id, 'email');
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  handleCellDoubleClick(contact._id || contact.id, 'email', contact.email);
                }}
              >
                {editingCell === `${contact._id || contact.id}-email` ? (
                  <input
                    type="email"
                    value={cellValue}
                    onChange={(e) => setCellValue(e.target.value)}
                    onBlur={handleCellBlur}
                    onKeyDown={(e) => handleKeyDown(e as any)}
                    className="w-full px-1 py-0.5 text-sm border-0 focus:ring-1 focus:ring-blue-500 bg-white"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm text-blue-600 w-full truncate">
                    {contact.email || 'Add email'}
                  </span>
                )}
              </div>

              {/* Status */}
              <div 
                className={`w-32 h-10 border-r border-gray-200 px-2 flex items-center cursor-pointer ${
                  selectedCell === `${contact._id || contact.id}-status` ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleCellClick(contact._id || contact.id, 'status')}
                onDoubleClick={() => {
                  const newStatus = prompt('Enter new status (Hot Lead, Warm Lead, Cold Lead, Customer, Prospect):', contact.status || '');
                  if (newStatus && newStatus.trim()) {
                    onUpdateContact && onUpdateContact(contact._id || contact.id, { status: newStatus });
                  }
                }}
              >
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(contact.status)}`}>
                  {contact.status || 'No Status'}
                </span>
              </div>

              {/* Last Contact */}
              <div 
                className={`w-32 h-10 border-r border-gray-200 px-2 flex items-center cursor-pointer ${
                  selectedCell === `${contact._id || contact.id}-lastContact` ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleCellClick(contact._id || contact.id, 'lastContact')}
              >
                <span className="text-xs text-gray-500">
                  {contact.lastContact ? formatDate(contact.lastContact) : formatDate(contact.createdAt)}
                </span>
              </div>

              {/* Create Field */}
              <div className="w-24 h-10 border-r border-gray-200 px-1 flex items-center justify-center">
                <div className={`flex items-center space-x-0.5 transition-opacity ${
                  hoveredRow === (contact._id || contact.id) ? 'opacity-100' : 'opacity-0'
                }`}>
                  <button
                    onClick={() => onEdit && onEdit(contact)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Icon name="Edit2" size={12} />
                  </button>
                  
                  <div className="relative" ref={openDropdown === (contact._id || contact.id) ? dropdownRef : null}>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === (contact._id || contact.id) ? null : (contact._id || contact.id))}
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-800 transition-colors"
                      title="More actions"
                    >
                      <Icon name="MoreVertical" size={12} />
                    </button>
                    
                    {openDropdown === (contact._id || contact.id) && (
                      <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-300 rounded-lg shadow-lg py-1 z-50">
                        <button
                          onClick={() => {
                            contact.phone && window.open(`tel:${contact.phone}`);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left transition-colors text-gray-700"
                        >
                          <Icon name="Phone" size={12} />
                          <span>Call</span>
                        </button>
                        <button
                          onClick={() => {
                            contact.email && window.open(`mailto:${contact.email}`);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left transition-colors text-gray-700"
                        >
                          <Icon name="Mail" size={12} />
                          <span>Email</span>
                        </button>
                        <hr className="my-1 border-gray-200" />
                        <button
                          onClick={() => {
                            const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.name;
                            const confirmMessage = `Are you sure you want to delete ${name || 'this contact'}? This action cannot be undone.`;
                            if (window.confirm(confirmMessage)) {
                              onDelete && onDelete(contact);
                            }
                            setOpenDropdown(null);
                          }}
                          className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600 w-full text-left transition-colors"
                        >
                          <Icon name="Trash2" size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
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

export default ContactsExcelGrid;