import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

interface SortConfigType { key: string; direction: 'asc' | 'desc' }
interface CompaniesTableProps {
  companies: any[];
  selectedCompanies: string[];
  onSelectCompany: (id: string) => void;
  onSelectAll: () => void;
  sortConfig: SortConfigType;
  onSort: (key: string) => void;
  onEdit?: (company: any) => void;
  onDelete?: (company: any) => void;
  onOpenFieldCustomizer?: () => void;
  loading?: boolean;
}

const CompaniesTable: React.FC<CompaniesTableProps> = ({ 
  companies, 
  selectedCompanies, 
  onSelectCompany, 
  onSelectAll, 
  sortConfig, 
  onSort,
  onEdit,
  onDelete,
  onOpenFieldCustomizer,
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const getSortIcon = (column: string) => {
    if (sortConfig.key !== column) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-primary" />
      : <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  const isAllSelected = companies.length > 0 && selectedCompanies.length === companies.length;
  const isIndeterminate = selectedCompanies.length > 0 && selectedCompanies.length < companies.length;

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
              {[
                { key: 'name', label: 'Company Name' },
                { key: 'phone', label: 'Phone' },
                { key: 'website', label: 'Website' },
                { key: 'owner', label: 'Owner' },
              ].map((col) => (
                <th key={col.key} className="text-left px-3 py-2 font-medium text-foreground text-sm">
                  <button
                    onClick={() => onSort(col.key)}
                    className="flex items-center space-x-1.5 hover:text-primary transition-smooth text-sm"
                  >
                    <span>{col.label}</span>
                    {getSortIcon(col.key)}
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
            {companies.map((company) => (
              <tr
                key={company.id || company._id}
                className={`hover:bg-muted/30 transition-smooth ${
                  selectedCompanies.includes(company.id || company._id) ? 'bg-accent/10' : ''
                }`}
                onMouseEnter={() => setHoveredRow(company.id || company._id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(company.id || company._id)}
                    onChange={() => onSelectCompany(company.id || company._id)}
                    className="rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                  />
                </td>

                {/* Company Name */}
                <td className="px-3 py-2 text-sm font-medium text-foreground">
                  {company.name || 'Unnamed Company'}
                </td>

                {/* Phone */}
                <td className="px-3 py-2 text-sm text-foreground">
                  {company.phone ? (
                    <a href={`tel:${company.phone}`} className="hover:text-primary">{company.phone}</a>
                  ) : '-'}
                </td>

                {/* Website */}
                <td className="px-3 py-2 text-sm text-foreground">
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {company.website}
                    </a>
                  ) : '-'}
                </td>

                {/* Owner */}
                <td className="px-3 py-2 text-sm text-foreground">
                  {company.owner || 'No Owner'}
                </td>

                {/* Actions */}
                <td className="px-3 py-2">
                  <div className={`flex items-center space-x-0.5 transition-smooth ${
                    hoveredRow === (company.id || company._id) ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit && onEdit(company)}
                      className="h-6 w-6 p-0"
                      title="Edit"
                    >
                      <Icon name="Edit2" size={12} />
                    </Button>
                    
                    <div className="relative" ref={openDropdown === (company.id || company._id) ? dropdownRef : null}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenDropdown(openDropdown === (company.id || company._id) ? null : (company.id || company._id))}
                        className="h-6 w-6 p-0"
                        title="More actions"
                      >
                        <Icon name="MoreVertical" size={12} />
                      </Button>
                      
                      {openDropdown === (company.id || company._id) && (
                        <div className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                          {company.phone && (
                            <button
                              onClick={() => { window.open(`tel:${company.phone}`); setOpenDropdown(null); }}
                              className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-muted w-full text-left"
                            >
                              <Icon name="Phone" size={14} />
                              <span>Call</span>
                            </button>
                          )}
                          {company.website && (
                            <button
                              onClick={() => { window.open(company.website, '_blank'); setOpenDropdown(null); }}
                              className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-muted w-full text-left"
                            >
                              <Icon name="Globe" size={14} />
                              <span>Website</span>
                            </button>
                          )}
                          <hr className="my-1 border-border" />
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${company.name || 'this company'}?`)) {
                                onDelete && onDelete(company);
                              }
                              setOpenDropdown(null);
                            }}
                            className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive w-full text-left"
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

     
    </div>
  );
};

export default CompaniesTable;
