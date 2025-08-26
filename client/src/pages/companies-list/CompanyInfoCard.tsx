import React, { useState } from 'react';
import Icon from '../../components/AppIcon';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const CompanyInfoCard = ({ company, onSave }: { company: any; onSave: (company: any) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(company ?? {});

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(company ?? {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(company ?? {});
  };

  const handleSave = () => {
    onSave(editData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData((prev: any) => ({
      ...(prev || {}),
      [field]: value
    }));
  };

  // const statusOptions = [
  //   { value: 'active', label: 'Active' },
  //   { value: 'inactive', label: 'Inactive' },
  //   { value: 'prospect', label: 'Prospect' },
  //   { value: 'customer', label: 'Customer' },
  //   { value: 'partner', label: 'Partner' }
  // ];

  // const industryOptions = [
  //   { value: 'technology', label: 'Technology' },
  //   { value: 'healthcare', label: 'Healthcare' },
  //   { value: 'finance', label: 'Finance' },
  //   { value: 'manufacturing', label: 'Manufacturing' },
  //   { value: 'retail', label: 'Retail' },
  //   { value: 'consulting', label: 'Consulting' },
  //   { value: 'education', label: 'Education' },
  //   { value: 'other', label: 'Other' }
  // ];

  // const companySizeOptions = [
  //   { value: '1-10', label: '1-10 employees' },
  //   { value: '11-50', label: '11-50 employees' },
  //   { value: '51-200', label: '51-200 employees' },
  //   { value: '201-1000', label: '201-1000 employees' },
  //   { value: '1000+', label: '1000+ employees' }
  // ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xl font-semibold">
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
            <p className="text-muted-foreground">{company?.industry || 'Industry'} • {company?.companySize || 'Company Size'}</p>
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
              <Button variant="default" onClick={handleSave} iconName="Save" iconPosition="left">
                Save Changes
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
                />
                {/* <Select
                  label="Industry"
                  options={industryOptions}
                  value={editData.industry || ''}
                  onChange={(value: string) => handleInputChange('industry', value)}
                /> */}
                {/* <Select
                  label="Company Size"
                  options={companySizeOptions}
                  value={editData.companySize || ''}
                  onChange={(value: string) => handleInputChange('companySize', value)}
                /> */}
                {/* <Select
                  label="Status"
                  options={statusOptions}
                  value={editData.status || 'inactive'}
                  onChange={(value: string) => handleInputChange('status', value)}
                />
                <Input
                  label="Founded Year"
                  type="number"
                  value={editData.foundedYear || ''}
                  onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                  placeholder="e.g., 2020"
                /> */}
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
                {/* <div className="flex items-center space-x-3">
                  <Icon name="Briefcase" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="font-medium text-foreground capitalize">{company?.industry || '-'}</p>
                  </div>
                </div> */}
                {/* <div className="flex items-center space-x-3">
                  <Icon name="Users" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company Size</p>
                    <p className="font-medium text-foreground">{company?.companySize || '-'}</p>
                  </div>
                </div> */}
                {/* <div className="flex items-center space-x-3">
                  <Icon name="Tag" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      (company?.status || 'inactive') === 'active' ? 'bg-success/10 text-success' :
                      (company?.status || '') === 'prospect'? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                    }`}>
                      {company?.status || 'inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Calendar" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Founded Year</p>
                    <p className="font-medium text-foreground">{company?.foundedYear || '-'}</p>
                  </div>
                </div> */}
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
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={editData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                <Input
                  label="Website"
                  type="url"
                  value={editData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
                <Input
                  label="LinkedIn"
                  value={editData.linkedin || ''}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                />
                <Input
                  label="Address"
                  value={editData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street, City, State, ZIP"
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
                
                {company?.linkedin && (
                  <div className="flex items-center space-x-3">
                    <Icon name="Linkedin" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">LinkedIn</p>
                      <a href={company.linkedin} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:text-primary/80 transition-smooth">
                        View Company Profile
                      </a>
                    </div>
                  </div>
                )}
                {company?.address && (
                  <div className="flex items-center space-x-3">
                    <Icon name="MapPin" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium text-foreground">{company.address}</p>
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
