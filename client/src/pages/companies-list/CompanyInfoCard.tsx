import React, { useState } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { updateCompany } from '../../services/conpany';

const CompanyInfoCard = ({ company, onSave }: { company: any; onSave: (company: any) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(company ?? {});
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    const companyCopy = JSON.parse(JSON.stringify(company ?? {}));
    setIsEditing(true);
    setEditData(companyCopy);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(company ?? {});
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const updateData: any = {};
      let hasChanges = false;
      
      // Handle simple string fields
      const simpleFields = ['name', 'email', 'phone', 'website'];
      simpleFields.forEach(field => {
        const originalValue = company?.[field];
        const editedValue = editData?.[field];
        const hasChanged = originalValue !== editedValue;
        
        if (hasChanged) {
          updateData[field] = editedValue;
          hasChanges = true;
        }
      });
      
      // Handle address field specifically (it's an object in the backend)
      const originalAddress = company?.address || {};
      const editedAddress = editData?.address || {};
      
      // Check if address has changed by comparing the string representation
      const originalAddressStr = company?.address || '';
      const editedAddressStr = editData?.address || '';
      
      if (originalAddressStr !== editedAddressStr) {
        // If address is a string, convert it to the expected object format
        if (typeof editedAddressStr === 'string' && editedAddressStr.trim()) {
          // Parse the address string into components (simple parsing)
          const addressParts = editedAddressStr.split(',').map(part => part.trim());
          updateData.address = {
            street: addressParts[0] || '',
            city: addressParts[1] || '',
            state: addressParts[2] || '',
            zipCode: addressParts[3] || '',
            country: addressParts[4] || ''
          };
        } else if (typeof editedAddressStr === 'string' && !editedAddressStr.trim()) {
          // If address is empty string, set it to undefined to clear it
          updateData.address = undefined;
        } else {
          // If it's already an object, use it as is
          updateData.address = editedAddressStr;
        }
        hasChanges = true;
      }
      
      if (!hasChanges) {
        setIsEditing(false);
        return;
      }
      
      try {
        const companyId = company._id || company.id;
        
        // Log the exact data being sent
        console.log('🚀 Sending update data:', updateData);
        console.log('📊 Data types:', Object.keys(updateData).map(key => ({
          field: key,
          value: updateData[key],
          type: typeof updateData[key],
          length: updateData[key]?.length
        })));
        
        const updatedCompany = await updateCompany(companyId, updateData);
        
        onSave(updatedCompany);
        
        if (company && updatedCompany) {
          const mergedCompany = { ...company, ...updatedCompany };
        }
        
        setIsEditing(false);
        setEditData({});
        alert('Company updated successfully!');
        
      } catch (error: any) {
        console.error('Error updating company:', error);
        
        // Enhanced error logging to see what's actually failing
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
          console.error('Response headers:', error.response.headers);
          
          // Try to get more specific error details
          if (error.response.data && error.response.data.errors) {
            console.error('Validation errors:', error.response.data.errors);
            const errorDetails = error.response.data.errors.map((err: any) => 
              `${err.path || err.field}: ${err.message}`
            ).join('\n');
            alert(`Validation failed:\n${errorDetails}`);
          } else if (error.response.data && error.response.data.message) {
            alert(`Failed to update company: ${error.response.data.message}`);
          } else {
            alert(`Failed to update company: ${error.message || 'Unknown error'}`);
          }
        } else {
          alert(`Failed to update company: ${error.message || 'Unknown error'}`);
        }
        
        setEditData(company ?? {});
      }
      
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData((prev: any) => {
      const updated = {
        ...(prev || {}),
        [field]: value
      };
      return updated;
    });
  };

  // Helper function to format address for display
  const formatAddress = (address: any) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-semibold">
              {(company?.name?.charAt(0) || 'C')}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card ${
              (company?.status || 'inactive') === 'active' ? 'bg-success' :
              (company?.status || '') === 'prospect' ? 'bg-warning' : 'bg-muted'
            }`}></div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              {company?.name || 'Company Name'}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button variant="outline" onClick={handleEdit} iconName="Edit" iconPosition="left">
              Edit Company
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                variant="default" 
                onClick={handleSave} 
                iconName="Save" 
                iconPosition="left"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Company Information */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Basic Information</h3>
            
            {isEditing ? (
              <>
                <Input
                  label="Company Name"
                  value={editData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
                <Input
                  label="Website"
                  type="url"
                  value={editData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <Icon name="Building" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company Name</p>
                    <p className="font-medium text-foreground">{company?.name || '-'}</p>
                  </div>
                </div>
                {company?.website && (
                  <div className="flex items-center space-x-3">
                    <Icon name="Globe" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:text-primary/80 transition-smooth">
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Contact Information</h3>
            
            {isEditing ? (
              <>
                <Input
                  label="Email"
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contact@company.com"
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={editData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                <Input
                  label="Address"
                  value={editData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street, City, State, ZIP, Country"
                />
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <Icon name="Mail" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    {company?.email ? (
                      <a href={`mailto:${company.email}`} className="font-medium text-primary hover:text-primary/80 transition-smooth">
                        {company.email}
                      </a>
                    ) : (
                      <p className="font-medium text-foreground">-</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Phone" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    {company?.phone ? (
                      <a href={`tel:${company.phone}`} className="font-medium text-primary hover:text-primary/80 transition-smooth">
                        {company.phone}
                      </a>
                    ) : (
                      <p className="font-medium text-foreground">-</p>
                    )}
                  </div>
                </div>
                
                {company?.address && (
                  <div className="flex items-center space-x-3">
                    <Icon name="MapPin" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium text-foreground">{formatAddress(company.address)}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-lg font-medium text-foreground mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {(company?.tags || []).map((tag: string, index: number) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoCard;