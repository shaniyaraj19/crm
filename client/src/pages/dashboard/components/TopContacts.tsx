import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TopContacts = () => {
  const [sortBy, setSortBy] = useState('value');

  const contacts = [
    {
      id: 1,
      name: 'Sarah Johnson',
      company: 'Tech Solutions Inc.',
      position: 'VP of Sales',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      dealValue: 125000,
      dealsCount: 3,
      lastContact: new Date(Date.now() - 86400000), // 1 day ago
      status: 'hot',
      email: 'sarah.johnson@techsolutions.com',
      phone: '+1 (555) 123-4567'
    },
    {
      id: 2,
      name: 'Michael Chen',
      company: 'Digital Dynamics',
      position: 'CTO',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      dealValue: 89000,
      dealsCount: 2,
      lastContact: new Date(Date.now() - 172800000), // 2 days ago
      status: 'warm',
      email: 'michael.chen@digitaldynamics.com',
      phone: '+1 (555) 234-5678'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      company: 'Innovation Labs',
      position: 'Product Manager',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      dealValue: 67000,
      dealsCount: 1,
      lastContact: new Date(Date.now() - 259200000), // 3 days ago
      status: 'warm',
      email: 'emma.wilson@innovationlabs.com',
      phone: '+1 (555) 345-6789'
    },
    {
      id: 4,
      name: 'Robert Davis',
      company: 'Acme Corp',
      position: 'Director of Operations',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      dealValue: 156000,
      dealsCount: 4,
      lastContact: new Date(Date.now() - 345600000), // 4 days ago
      status: 'hot',
      email: 'robert.davis@acmecorp.com',
      phone: '+1 (555) 456-7890'
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      company: 'Global Systems',
      position: 'CEO',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      dealValue: 45000,
      dealsCount: 1,
      lastContact: new Date(Date.now() - 432000000), // 5 days ago
      status: 'cold',
      email: 'lisa.anderson@globalsystems.com',
      phone: '+1 (555) 567-8901'
    }
  ];

  const getStatusColor = (status) => {
    const statusMap = {
      hot: 'bg-red-100 text-red-800',
      warm: 'bg-yellow-100 text-yellow-800',
      cold: 'bg-blue-100 text-blue-800'
    };
    return statusMap[status] || statusMap.cold;
  };

  const formatLastContact = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const sortedContacts = [...contacts].sort((a, b) => {
    if (sortBy === 'value') return b.dealValue - a.dealValue;
    if (sortBy === 'deals') return b.dealsCount - a.dealsCount;
    if (sortBy === 'recent') return a.lastContact - b.lastContact;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Top Contacts</h3>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-border rounded-md px-3 py-1 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="value">By Deal Value</option>
            <option value="deals">By Deal Count</option>
            <option value="recent">By Last Contact</option>
            <option value="name">By Name</option>
          </select>
          <button className="p-2 hover:bg-muted rounded-md transition-smooth flex-shrink-0">
            <Icon name="MoreHorizontal" size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="space-y-3 overflow-hidden">
        {sortedContacts.map((contact, index) => (
          <div key={contact.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-smooth cursor-pointer min-w-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden">
                  <Image
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-1 -right-1 text-xs font-bold text-muted-foreground bg-card rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center border border-border">
                  {index + 1}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-card-foreground truncate text-sm md:text-base">{contact.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(contact.status)}`}>
                    {contact.status}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground truncate">{contact.position}</p>
                <p className="text-xs text-muted-foreground truncate">{contact.company}</p>
              </div>
            </div>

            <div className="text-right flex-shrink-0 min-w-0">
              <p className="text-sm font-semibold text-card-foreground truncate">${contact.dealValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{contact.dealsCount} deals</p>
              <p className="text-xs text-muted-foreground hidden sm:block">{formatLastContact(contact.lastContact)}</p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="p-1 hover:bg-muted rounded transition-smooth" title="Call">
                <Icon name="Phone" size={14} className="text-muted-foreground" />
              </button>
              <button className="p-1 hover:bg-muted rounded transition-smooth" title="Email">
                <Icon name="Mail" size={14} className="text-muted-foreground" />
              </button>
              <button className="p-1 hover:bg-muted rounded transition-smooth" title="More">
                <Icon name="MoreVertical" size={14} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-smooth">
          View All Contacts
        </button>
      </div>
    </div>
  );
};

export default TopContacts;