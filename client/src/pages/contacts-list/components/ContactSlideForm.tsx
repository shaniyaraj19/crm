import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import FieldCustomizer from '../../../components/FieldCustomizer';
import { useFields } from '../../../contexts/FieldsContext';

interface ContactSlideFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: any) => void;
  contact?: any; // For edit mode
  mode: 'create' | 'edit';
}

const ContactSlideForm: React.FC<ContactSlideFormProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  contact,
  mode = 'create' 
}) => {
  const { fields } = useFields();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    company: '',
    phone: '',
    description: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    status: 'Prospect',
    owner: 'Danush Tom',
    tags: []
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressInfo, setShowAddressInfo] = useState(false);
  const [isFieldCustomizerOpen, setIsFieldCustomizerOpen] = useState(false);

  const customVisibleFields = fields.contacts.filter(f => f.visible && f.isCustom);

  // Phone type options
  const phoneTypes = [
    { value: 'mobile', label: 'Mobile' },
    { value: 'work', label: 'Work' },
    { value: 'home', label: 'Home' }
  ];

  const [phoneType, setPhoneType] = useState('mobile');

  const statusOptions = [
    { value: 'Hot Lead', label: 'Hot Lead' },
    { value: 'Warm Lead', label: 'Warm Lead' },
    { value: 'Cold Lead', label: 'Cold Lead' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Prospect', label: 'Prospect' }
  ];

  const ownerOptions = [
    { value: 'Danush Tom', label: 'Danush Tom' },
    { value: 'John Smith', label: 'John Smith' },
    { value: 'Sarah Johnson', label: 'Sarah Johnson' },
    { value: 'Mike Davis', label: 'Mike Davis' },
    { value: 'Emily Chen', label: 'Emily Chen' }
  ];

  // Populate form data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && contact) {
      setFormData({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        title: contact.jobTitle || contact.title || '',
        email: contact.email || '',
        company: contact.company || '',
        phone: contact.phone || '',
        description: contact.notes || '',
        street: contact.address?.street || '',
        city: contact.address?.city || '',
        state: contact.address?.state || '',
        zipCode: contact.address?.zipCode || '',
        country: contact.address?.country || '',
        status: contact.status || 'Prospect',
        owner: contact.owner || 'Danush Tom',
        tags: contact.tags || []
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        company: '',
        phone: '',
        description: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        status: 'Prospect',
        owner: 'Danush Tom',
        tags: []
      });
    }
  }, [mode, contact, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

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

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const customPayload: any = {};
      customVisibleFields.forEach((f) => {
        customPayload[f.name] = (formData as any)[f.name] || '';
      });

      const contactData = {
        id: contact?.id || Date.now(),
        _id: contact?._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        jobTitle: formData.title,
        title: formData.title,
        status: formData.status,
        owner: formData.owner,
        tags: formData.tags,
        notes: formData.description,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        lastContact: contact?.lastContact || new Date().toISOString(),
        createdAt: contact?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      ,
        ...customPayload,
      };

      onSave(contactData);
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
      title: '',
      email: '',
      company: '',
      phone: '',
      description: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      status: 'Prospect',
      owner: 'Danush Tom',
      tags: []
    });
    setErrors({});
    setShowAddressInfo(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Slide-in Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create Contact' : 'Edit Contact'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                {/* First Name */}
                <div className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                </div>
                
                {/* Last Name */}
                <div className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                
                {/* Title */}
                <div className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                    Title
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter job title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Email */}
                <div className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
                
                {/* Company Name */}
                <div className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                    Company Name
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Enter company name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Status - Required Field */}
                <div className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                        errors.status ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                  </div>
                </div>

                {/* Mobile with dropdown */}
                <div className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                    Mobile
                  </label>
                  <div className="flex-1 flex">
                    <select 
                      value={phoneType}
                      onChange={(e) => setPhoneType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    >
                      {phoneTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="flex-1 px-3 py-2 border border-gray-300 border-l-0 border-r-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 border border-gray-300 border-l-0 rounded-r-md hover:bg-gray-50 transition-colors"
                    >
                      <Icon name="Plus" size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="flex items-start space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0 pt-2">
                    Description
                  </label>
                  <div className="flex-1">
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="A few words about this contact"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Fields (from Field Customizer) */}
            {customVisibleFields.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Fields</h3>
                <div className="space-y-4">
                  {customVisibleFields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-4">
                      <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <div className="flex-1">
                        {field.type === 'textarea' ? (
                          <textarea
                            value={(formData as any)[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                          />
                        ) : field.type === 'select' ? (
                          <select
                            value={(formData as any)[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                          >
                            <option value="">Select {field.label}</option>
                            {(field.options || []).map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type === 'date' ? 'date' : (field.type === 'email' ? 'email' : (field.type === 'number' ? 'number' : 'text'))}
                            value={(formData as any)[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Address Information */}
            <div>
              <button
                type="button"
                onClick={() => setShowAddressInfo(!showAddressInfo)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
                <Icon 
                  name={showAddressInfo ? "ChevronUp" : "ChevronDown"} 
                  size={20} 
                  className="text-gray-400" 
                />
              </button>
              
              {showAddressInfo && (
                <div className="mt-4 space-y-4">
                  {/* Street */}
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                      Street
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        placeholder="Enter street address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* City and State */}
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                      City
                    </label>
                    <div className="flex-1 flex space-x-4">
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">State</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="Enter state"
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Zip Code and Country */}
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                      Zip Code
                    </label>
                    <div className="flex-1 flex space-x-4">
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="Enter zip code"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Country</label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          placeholder="Enter country"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>



          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          {/* Customize Fields */}
          <button
            type="button"
            onClick={() => setIsFieldCustomizerOpen(true)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Icon name="Settings" size={16} />
            <span className="text-sm font-medium">Customize Fields</span>
          </button>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
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
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {mode === 'create' ? 'Save' : 'Update'}
            </Button>
          </div>
        </div>
      </div>
      {/* Field Customizer Modal */}
      <FieldCustomizer
        module="contacts"
        isOpen={isFieldCustomizerOpen}
        onClose={() => setIsFieldCustomizerOpen(false)}
      />
    </>
  );
};

export default ContactSlideForm;