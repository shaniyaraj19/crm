import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Field {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'date' | 'textarea' | 'number';
  required: boolean;
  visible: boolean;
  editable: boolean;
  options?: string[]; // For select fields
  order: number;
  isCustom: boolean;
  module: 'contacts' | 'companies' | 'products';
}

interface FieldsContextType {
  fields: {
    contacts: Field[];
    companies: Field[];
    products: Field[];
  };
  addField: (module: 'contacts' | 'companies' | 'products', field: Omit<Field, 'id' | 'order' | 'module'>) => void;
  updateField: (module: 'contacts' | 'companies' | 'products', fieldId: string, updates: Partial<Field>) => void;
  deleteField: (module: 'contacts' | 'companies' | 'products', fieldId: string) => void;
  reorderFields: (module: 'contacts' | 'companies' | 'products', fields: Field[]) => void;
  toggleFieldVisibility: (module: 'contacts' | 'companies' | 'products', fieldId: string) => void;
}

const FieldsContext = createContext<FieldsContextType | undefined>(undefined);

// Default fields for each module
const defaultFields = {
  contacts: [
    { id: 'firstName', name: 'firstName', label: 'First Name', type: 'text' as const, required: true, visible: true, editable: true, order: 1, isCustom: false, module: 'contacts' as const },
    { id: 'lastName', name: 'lastName', label: 'Last Name', type: 'text' as const, required: true, visible: true, editable: true, order: 2, isCustom: false, module: 'contacts' as const },
    { id: 'email', name: 'email', label: 'Email (Unique)', type: 'email' as const, required: true, visible: true, editable: true, order: 3, isCustom: false, module: 'contacts' as const },
    { id: 'phone', name: 'phone', label: 'Phone', type: 'phone' as const, required: false, visible: true, editable: true, order: 4, isCustom: false, module: 'contacts' as const },
    { id: 'company', name: 'company', label: 'Company Name', type: 'text' as const, required: false, visible: true, editable: true, order: 5, isCustom: false, module: 'contacts' as const },
    { id: 'title', name: 'title', label: 'Title', type: 'text' as const, required: false, visible: true, editable: true, order: 6, isCustom: false, module: 'contacts' as const },
    { id: 'status', name: 'status', label: 'Status', type: 'select' as const, required: true, visible: true, editable: true, order: 7, isCustom: false, module: 'contacts' as const, options: ['Hot Lead', 'Warm Lead', 'Cold Lead', 'Customer', 'Prospect'] },
    { id: 'mobile', name: 'mobile', label: 'Mobile', type: 'phone' as const, required: false, visible: false, editable: true, order: 8, isCustom: false, module: 'contacts' as const },
    { id: 'homePhone', name: 'homePhone', label: 'Home Phone', type: 'phone' as const, required: false, visible: false, editable: true, order: 9, isCustom: false, module: 'contacts' as const },
    { id: 'emailOptOut', name: 'emailOptOut', label: 'Email Opt Out', type: 'select' as const, required: false, visible: false, editable: true, order: 10, isCustom: false, module: 'contacts' as const, options: ['Yes', 'No'] },
    { id: 'description', name: 'description', label: 'Description', type: 'textarea' as const, required: false, visible: false, editable: true, order: 11, isCustom: false, module: 'contacts' as const },
  ],
  companies: [
    { id: 'name', name: 'name', label: 'Company Name', type: 'text' as const, required: true, visible: true, editable: true, order: 1, isCustom: false, module: 'companies' as const },
    { id: 'phone', name: 'phone', label: 'Phone', type: 'phone' as const, required: false, visible: true, editable: true, order: 2, isCustom: false, module: 'companies' as const },
    { id: 'website', name: 'website', label: 'Website', type: 'text' as const, required: false, visible: true, editable: true, order: 3, isCustom: false, module: 'companies' as const },
    { id: 'email', name: 'email', label: 'Email', type: 'email' as const, required: false, visible: true, editable: true, order: 4, isCustom: false, module: 'companies' as const },
    { id: 'description', name: 'description', label: 'Description', type: 'textarea' as const, required: false, visible: true, editable: true, order: 5, isCustom: false, module: 'companies' as const },
  ],
  products: [
    { id: 'productName', name: 'productName', label: 'Product Name (Unique)', type: 'text' as const, required: true, visible: true, editable: true, order: 1, isCustom: false, module: 'products' as const },
    { id: 'productCode', name: 'productCode', label: 'Product Code', type: 'text' as const, required: false, visible: true, editable: true, order: 2, isCustom: false, module: 'products' as const },
    { id: 'productCategory', name: 'productCategory', label: 'Product Category', type: 'select' as const, required: false, visible: true, editable: true, order: 3, isCustom: false, module: 'products' as const },
    { id: 'unitPrice', name: 'unitPrice', label: 'Unit Price', type: 'number' as const, required: false, visible: true, editable: true, order: 4, isCustom: false, module: 'products' as const },
    { id: 'description', name: 'description', label: 'Description', type: 'textarea' as const, required: false, visible: true, editable: true, order: 5, isCustom: false, module: 'products' as const },
    { id: 'productActive', name: 'productActive', label: 'Product Active', type: 'select' as const, required: false, visible: true, editable: true, order: 6, isCustom: false, module: 'products' as const, options: ['Yes', 'No'] },
  ]
};

export const FieldsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fields, setFields] = useState(() => {
    // Try to load from localStorage, fallback to defaults
    const saved = localStorage.getItem('crm-fields-config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved fields config:', e);
      }
    }
    return defaultFields;
  });

  // Save to localStorage whenever fields change
  useEffect(() => {
    localStorage.setItem('crm-fields-config', JSON.stringify(fields));
  }, [fields]);

  const addField = (module: 'contacts' | 'companies' | 'products', fieldData: Omit<Field, 'id' | 'order' | 'module'>) => {
    const newField: Field = {
      ...fieldData,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: fields[module].length + 1,
      module,
      isCustom: true,
    };

    console.log(`🔧 Adding custom field to ${module}:`, newField);

    setFields((prev: any) => {
      const updatedFields = {
        ...prev,
        [module]: [...prev[module], newField]
      };
      console.log(`🔧 Updated fields for ${module}:`, updatedFields[module]);
      return updatedFields;
    });
  };

  const updateField = (module: 'contacts' | 'companies' | 'products', fieldId: string, updates: Partial<Field>) => {
    setFields(prev => ({
      ...prev,
      [module]: prev[module].map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const deleteField = (module: 'contacts' | 'companies' | 'products', fieldId: string) => {
    setFields(prev => ({
      ...prev,
      [module]: prev[module].filter(field => field.id !== fieldId)
    }));
  };

  const reorderFields = (module: 'contacts' | 'companies' | 'products', newFields: Field[]) => {
    const reorderedFields = newFields.map((field, index) => ({
      ...field,
      order: index + 1
    }));

    setFields(prev => ({
      ...prev,
      [module]: reorderedFields
    }));
  };

  const toggleFieldVisibility = (module: 'contacts' | 'companies' | 'products', fieldId: string) => {
    updateField(module, fieldId, { visible: !fields[module].find(f => f.id === fieldId)?.visible });
  };

  return (
    <FieldsContext.Provider value={{
      fields,
      addField,
      updateField,
      deleteField,
      reorderFields,
      toggleFieldVisibility,
    }}>
      {children}
    </FieldsContext.Provider>
  );
};

export const useFields = () => {
  const context = useContext(FieldsContext);
  if (context === undefined) {
    throw new Error('useFields must be used within a FieldsProvider');
  }
  return context;
};