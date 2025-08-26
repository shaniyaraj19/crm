import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActionsBar = ({ 
  selectedCount, 
  onExport, 
  onAssignOwner, 
  onAddTags, 
  onDelete, 
  onClearSelection 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showAssignOwner, setShowAssignOwner] = useState(false);
  const [showAddTags, setShowAddTags] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

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
    { value: 'referral', label: 'Referral' },
    { value: 'hot-lead', label: 'Hot Lead' },
    { value: 'follow-up', label: 'Follow Up' }
  ];

  const handleAssignOwner = () => {
    if (selectedOwner) {
      onAssignOwner(selectedOwner);
      setSelectedOwner('');
      setShowAssignOwner(false);
      setShowActions(false);
    }
  };

  const handleAddTags = () => {
    if (selectedTags.length > 0) {
      onAddTags(selectedTags);
      setSelectedTags([]);
      setShowAddTags(false);
      setShowActions(false);
    }
  };

  const handleExport = () => {
    onExport();
    setShowActions(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCount} contact${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`)) {
      onDelete();
      setShowActions(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-1000">
      <div className="bg-card border border-border rounded-lg shadow-elevation-2 p-4">
        <div className="flex items-center space-x-4">
          {/* Selection Info */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Check" size={16} color="white" />
            </div>
            <span className="font-medium text-foreground">
              {selectedCount} contact{selectedCount > 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              iconName="Download"
              iconPosition="left"
            >
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              iconName="MoreHorizontal"
            >
              More Actions
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              iconName="X"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Expanded Actions */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Assign Owner */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Assign Owner</label>
                <div className="flex space-x-2">
                  <Select
                    options={ownerOptions}
                    value={selectedOwner}
                    onChange={setSelectedOwner}
                    placeholder="Select owner"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAssignOwner}
                    disabled={!selectedOwner}
                  >
                    Assign
                  </Button>
                </div>
              </div>

              {/* Add Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Add Tags</label>
                <div className="flex space-x-2">
                  <Select
                    options={tagOptions}
                    value={selectedTags}
                    onChange={setSelectedTags}
                    placeholder="Select tags"
                    multiple
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTags}
                    disabled={selectedTags.length === 0}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Delete */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Danger Zone</label>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  iconName="Trash2"
                  iconPosition="left"
                  className="w-full"
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActionsBar;