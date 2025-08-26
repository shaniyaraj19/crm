import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ContactInfoCard = ({ contact, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(contact ?? {});

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(contact ?? {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(contact ?? {});
  };

  const handleSave = () => {
    onSave(editData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...(prev || {}),
      [field]: value
    }));
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'customer', label: 'Customer' }
  ];

  const leadSourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'trade_show', label: 'Trade Show' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-semibold">
              {(contact?.firstName?.charAt(0) || '')}{(contact?.lastName?.charAt(0) || '')}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card ${
              (contact?.status || 'inactive') === 'active' ? 'bg-success' :
              (contact?.status || '') === 'prospect' ? 'bg-warning' : 'bg-muted'
            }`}></div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              {contact?.firstName || ''} {contact?.lastName || ''}
            </h2>
            <p className="text-muted-foreground">{contact?.jobTitle || ''} at {contact?.company || ''}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button variant="outline" onClick={handleEdit} iconName="Edit" iconPosition="left">
              Edit Contact
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

      {/* Contact Information */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Basic Information</h3>
            
            {isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={editData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={editData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Job Title"
                  value={editData.jobTitle || ''}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                />
                <Input
                  label="Company"
                  value={editData.company || ''}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
                <Select
                  label="Status"
                  options={statusOptions}
                  value={editData.status || 'inactive'}
                  onChange={(value) => handleInputChange('status', value)}
                />
                <Select
                  label="Lead Source"
                  options={leadSourceOptions}
                  value={editData.leadSource || ''}
                  onChange={(value) => handleInputChange('leadSource', value)}
                />
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <Icon name="User" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium text-foreground">{contact?.firstName || ''} {contact?.lastName || ''}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Briefcase" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Job Title</p>
                    <p className="font-medium text-foreground">{contact?.jobTitle || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Building" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium text-foreground">{contact?.company || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Tag" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      (contact?.status || 'inactive') === 'active' ? 'bg-success/10 text-success' :
                      (contact?.status || '') === 'prospect'? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                    }`}>
                      {contact?.status || 'inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Target" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Lead Source</p>
                    <p className="font-medium text-foreground capitalize">{(contact?.leadSource || '').replace('_', ' ')}</p>
                  </div>
                </div>
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
                  required
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
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <Icon name="Mail" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${contact?.email || ''}`} className="font-medium text-primary hover:text-primary/80 transition-smooth">
                      {contact?.email || '-'}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Phone" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a href={`tel:${contact?.phone || ''}`} className="font-medium text-primary hover:text-primary/80 transition-smooth">
                      {contact?.phone || '-'}
                    </a>
                  </div>
                </div>
                {contact?.website && (
                  <div className="flex items-center space-x-3">
                    <Icon name="Globe" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a href={contact.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:text-primary/80 transition-smooth">
                        {contact.website}
                      </a>
                    </div>
                  </div>
                )}
                {contact?.linkedin && (
                  <div className="flex items-center space-x-3">
                    <Icon name="Linkedin" size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">LinkedIn</p>
                      <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:text-primary/80 transition-smooth">
                        View Profile
                      </a>
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
            {(contact?.tags || []).map((tag, index) => (
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

export default ContactInfoCard;