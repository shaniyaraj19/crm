import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AddContactModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    status: 'Prospect',
    owner: '',
    tags: [],
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const statusOptions = [
    { value: 'Hot Lead', label: 'Hot Lead' },
    { value: 'Warm Lead', label: 'Warm Lead' },
    { value: 'Cold Lead', label: 'Cold Lead' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Prospect', label: 'Prospect' }
  ];

  const ownerOptions = [
    { value: 'john-smith', label: 'John Smith' },
    { value: 'sarah-johnson', label: 'Sarah Johnson' },
    { value: 'mike-davis', label: 'Mike Davis' },
    { value: 'emily-chen', label: 'Emily Chen' },
    { value: 'david-wilson', label: 'David Wilson' }
  ];

  const tagOptions = [
    { value: 'vip', label: 'VIP' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'smb', label: 'SMB' },
    { value: 'startup', label: 'Startup' },
    { value: 'partner', label: 'Partner' },
    { value: 'referral', label: 'Referral' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newContact = {
        id: Date.now(),
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        title: formData.title,
        status: formData.status,
        owner: formData.owner,
        tags: formData.tags,
        notes: formData.notes,
        lastContact: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      onSave(newContact);
      handleClose();
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      title: '',
      status: 'Prospect',
      owner: '',
      tags: [],
      notes: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1200 p-4">
      <div className="bg-card rounded-lg shadow-elevation-2 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Add New Contact</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <Icon name="X" size={16} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={errors.firstName}
                  required
                  placeholder="Enter first name"
                />
                
                <Input
                  label="Last Name"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={errors.lastName}
                  required
                  placeholder="Enter last name"
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  required
                  placeholder="Enter email address"
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                  required
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  error={errors.company}
                  required
                  placeholder="Enter company name"
                />
                
                <Input
                  label="Job Title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter job title"
                />
              </div>
            </div>

            {/* CRM Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">CRM Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Status"
                  options={statusOptions}
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  placeholder="Select status"
                />
                
                <Select
                  label="Owner"
                  options={ownerOptions}
                  value={formData.owner}
                  onChange={(value) => handleInputChange('owner', value)}
                  placeholder="Assign to owner"
                />
              </div>
              
              <div className="mt-4">
                <Select
                  label="Tags"
                  options={tagOptions}
                  value={formData.tags}
                  onChange={(value) => handleInputChange('tags', value)}
                  placeholder="Add tags"
                  multiple
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes about this contact..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/30">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            loading={isLoading}
            iconName="Plus"
            iconPosition="left"
          >
            Add Contact
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;