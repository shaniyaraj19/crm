import React, { useState } from 'react';
import Layout from '../../components/Layout';
import Icon from '../../components/AppIcon';
import { useFields } from '../../contexts/FieldsContext';
import FieldCustomizer from '../../components/FieldCustomizer';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Module Fields');
  const [activeSection, setActiveSection] = useState('Fields');
  const [customizerOpen, setCustomizerOpen] = useState<'contacts' | 'companies' | 'products' | null>(null);
  const { fields } = useFields();

  const sidebarItems = [
    { id: 'fields', label: 'Fields', icon: 'List', active: true },
  ];

  // Get fields from context, sorted by order and filtered by visibility
  const contactFields = fields.contacts.sort((a, b) => a.order - b.order);
  const companyFields = fields.companies.sort((a, b) => a.order - b.order);
  const productFields = fields.products.sort((a, b) => a.order - b.order);
  
  const addressFields = [
    'Billing Street', 'Billing City', 'Billing State', 'Billing Country', 'Billing Code'
  ];

  return (
    <Layout>
      <div className="h-[calc(100vh-80px)] flex overflow-hidden">
        {/* Main Content */}
        <div className="flex gap-6 w-full h-full">
          {/* Sidebar */}
          <div className="w-64 bg-card border border-border rounded-lg flex flex-col flex-shrink-0 h-full">
            {/* Navigation */}
            <div className="p-6 flex-1 overflow-y-auto">
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.label)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      item.active || activeSection === item.label
                        ? 'bg-primary/10 text-primary border-l-4 border-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon name={item.icon} size={16} className="mr-3" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full">


            {/* Tabs */}
            <div className="border-b border-border bg-card flex-shrink-0">
              <div className="px-6">
                <nav className="flex space-x-8">
                  {['Module Fields', 'Pipeline Fields'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-2 border-b-2 font-medium text-base whitespace-nowrap transition-colors ${
                        activeTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-3 gap-6 h-fit">
                {/* Contacts Column */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Icon name="Users" size={16} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
                          <p className="text-xs text-gray-600">{contactFields.length} total fields</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                          <Icon name="Edit2" size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                          <Icon name="MoreVertical" size={16} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="space-y-4">
                      {/* Contact Information Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contact Information</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {contactFields.filter(f => !f.name.includes('mailing')).length} fields
                          </span>
                        </div>
                        <div className="space-y-1">
                          {contactFields.filter(f => !f.name.includes('mailing')).map((field) => (
                            <div key={field.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md transition-colors group border border-transparent hover:border-gray-200">
                              <div className="flex items-center space-x-2 flex-1">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  field.visible ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                                <div className="flex items-center space-x-2 flex-1">
                                  <span className="text-sm text-gray-900 font-medium">{field.label}</span>
                                  <span className="text-xs text-gray-500 capitalize">{field.type}</span>
                                  {field.isCustom && (
                                    <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                      Custom
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setCustomizerOpen('contacts')}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Edit field"
                                >
                                  <Icon name="Edit2" size={12} className="text-gray-600" />
                                </button>
                                <Icon 
                                  name={field.visible ? 'Eye' : 'EyeOff'} 
                                  size={12} 
                                  className={field.visible ? 'text-green-600' : 'text-gray-400'} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    
                      {/* Address Information Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Address Information</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {contactFields.filter(f => f.name.includes('mailing')).length} fields
                          </span>
                        </div>
                        <div className="space-y-1">
                          {contactFields.filter(f => f.name.includes('mailing')).map((field) => (
                            <div key={field.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md transition-colors group border border-transparent hover:border-gray-200">
                              <div className="flex items-center space-x-2 flex-1">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  field.visible ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                                <div className="flex items-center space-x-2 flex-1">
                                  <span className="text-sm text-gray-900 font-medium">{field.label}</span>
                                  <span className="text-xs text-gray-500 capitalize">{field.type}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setCustomizerOpen('contacts')}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Edit field"
                                >
                                  <Icon name="Edit2" size={12} className="text-gray-600" />
                                </button>
                                <Icon 
                                  name={field.visible ? 'Eye' : 'EyeOff'} 
                                  size={12} 
                                  className={field.visible ? 'text-green-600' : 'text-gray-400'} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button 
                      onClick={() => setCustomizerOpen('contacts')}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Icon name="Settings" size={16} />
                      <span>Customize Fields</span>
                    </button>
                    <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                      <Icon name="Info" size={12} className="mr-1" />
                      Used Custom Fields: {contactFields.filter(f => f.isCustom).length}/25
                    </div>
                  </div>
                </div>

                {/* Companies Column */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <Icon name="Building" size={16} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Companies</h3>
                          <p className="text-xs text-gray-600">{companyFields.length} total fields</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                          <Icon name="Edit2" size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                          <Icon name="MoreVertical" size={16} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="space-y-4">
                      {/* Company Information Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Company Information</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {companyFields.length} fields
                          </span>
                        </div>
                        <div className="space-y-1">
                          {companyFields.map((field) => (
                            <div key={field.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md transition-colors group border border-transparent hover:border-gray-200">
                              <div className="flex items-center space-x-2 flex-1">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  field.visible ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                                <div className="flex items-center space-x-2 flex-1">
                                  <span className="text-sm text-gray-900 font-medium">{field.label}</span>
                                  <span className="text-xs text-gray-500 capitalize">{field.type}</span>
                                  {field.isCustom && (
                                    <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                      Custom
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setCustomizerOpen('companies')}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Edit field"
                                >
                                  <Icon name="Edit2" size={12} className="text-gray-600" />
                                </button>
                                <Icon 
                                  name={field.visible ? 'Eye' : 'EyeOff'} 
                                  size={12} 
                                  className={field.visible ? 'text-green-600' : 'text-gray-400'} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    
                      {/* Address Information Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Address Information</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {addressFields.length} fields
                          </span>
                        </div>
                        <div className="space-y-1">
                          {addressFields.map((field, index) => (
                            <div key={index} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md transition-colors group border border-transparent hover:border-gray-200">
                              <div className="flex items-center space-x-2 flex-1">
                                <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                                <div className="flex items-center space-x-2 flex-1">
                                  <span className="text-sm text-gray-900 font-medium">{field}</span>
                                  <span className="text-xs text-gray-500">Text</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setCustomizerOpen('companies')}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Edit field"
                                >
                                  <Icon name="Edit2" size={12} className="text-gray-600" />
                                </button>
                                <Icon name="EyeOff" size={12} className="text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button 
                      onClick={() => setCustomizerOpen('companies')}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <Icon name="Settings" size={16} />
                      <span>Customize Fields</span>
                    </button>
                    <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                      <Icon name="Info" size={12} className="mr-1" />
                      Used Custom Fields: {companyFields.filter(f => f.isCustom).length}/25
                    </div>
                  </div>
                </div>

                {/* Products Column */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Icon name="Package" size={16} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            Products
                            <Icon name="HelpCircle" size={16} className="ml-2 text-gray-500" />
                          </h3>
                          <p className="text-xs text-gray-600">{productFields.length} total fields</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                          <Icon name="Edit2" size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                          <Icon name="MoreVertical" size={16} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="space-y-4">
                      {/* Product Information Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Product Information</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {productFields.length} fields
                          </span>
                        </div>
                        <div className="space-y-1">
                          {productFields.map((field) => (
                            <div key={field.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md transition-colors group border border-transparent hover:border-gray-200">
                              <div className="flex items-center space-x-2 flex-1">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  field.visible ? 'bg-green-500' : 'bg-gray-300'
                                }`} />
                                <div className="flex items-center space-x-2 flex-1">
                                  <span className="text-sm text-gray-900 font-medium">{field.label}</span>
                                  <span className="text-xs text-gray-500 capitalize">{field.type}</span>
                                  {field.isCustom && (
                                    <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                      Custom
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setCustomizerOpen('products')}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Edit field"
                                >
                                  <Icon name="Edit2" size={12} className="text-gray-600" />
                                </button>
                                <Icon 
                                  name={field.visible ? 'Eye' : 'EyeOff'} 
                                  size={12} 
                                  className={field.visible ? 'text-green-600' : 'text-gray-400'} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button 
                      onClick={() => setCustomizerOpen('products')}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                    >
                      <Icon name="Settings" size={16} />
                      <span>Customize Fields</span>
                    </button>
                    <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
                      <Icon name="Info" size={12} className="mr-1" />
                      Used Custom Fields: {productFields.filter(f => f.isCustom).length}/25
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Field Customizer Modals */}
        <FieldCustomizer
          module="contacts"
          isOpen={customizerOpen === 'contacts'}
          onClose={() => setCustomizerOpen(null)}
        />
        <FieldCustomizer
          module="companies"
          isOpen={customizerOpen === 'companies'}
          onClose={() => setCustomizerOpen(null)}
        />
        <FieldCustomizer
          module="products"
          isOpen={customizerOpen === 'products'}
          onClose={() => setCustomizerOpen(null)}
        />
      </div>
    </Layout>
  );
};

export default SettingsPage;