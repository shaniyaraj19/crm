import React, { useState } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { Deal, createDeal, updateDeal, deleteDeal, getDealsByCompany, transformDealForFrontend } from '../../services/deals';

interface RelatedDealsCardProps {
  deals: Deal[];
  onDealUpdate?: (updatedDeals: Deal[]) => void;
  company: any; // Add company prop
  onViewAllDeals?: () => void; // Add callback to switch to deals tab
}

const RelatedDealsCard: React.FC<RelatedDealsCardProps> = ({ deals, onDealUpdate, company, onViewAllDeals }) => {
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  
  // Calculate totals from deals array (will be empty initially for manual insertion)
  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const wonDeals = deals.filter(deal => deal.stageId === 'won' || deal.stageName === 'won'); // For future use
  const activeDeals = deals.filter(deal => {
    const stage = deal.stageId || deal.stageName;
    return stage && !['won', 'lost'].includes(stage);
  }); // For future use

  const handleCreateDeal = async (dealData: any) => { // For future use
    try {
      setLoading(true);
      
      const newDealData = {
        ...dealData,
        currency: 'INR',
        companyId: company.id || company._id,
        priority: 'medium'
      };

      const result = await createDeal(newDealData);
      if (result.success) {
        alert('Deal created successfully!');
        setShowNewDealModal(false);
        // Refresh deals for this company
        const dealsResult = await getDealsByCompany(company.id || company._id);
        if (dealsResult.success) {
          const transformedDeals = dealsResult.data.deals.map(transformDealForFrontend);
          onDealUpdate?.(transformedDeals);
        }
      } else {
        alert(result.message || 'Failed to create deal. Please try again.');
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Failed to create deal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDeal = async (dealData: any) => { // For future use
    try {
      setLoading(true);
      
      if (!editingDeal?.id) {
        alert('No deal selected for editing');
        return;
      }

      const result = await updateDeal(editingDeal.id, dealData);
      if (result.success) {
        // Refresh deals for this company
        const dealsResult = await getDealsByCompany(company.id || company._id);
        if (dealsResult.success) {
          const transformedDeals = dealsResult.data.deals.map(transformDealForFrontend);
          onDealUpdate?.(transformedDeals);
        }
        
        setShowEditModal(false);
        setEditingDeal(null);
        alert('Deal updated successfully!');
      } else {
        alert(result.message || 'Failed to update deal. Please try again.');
      }
    } catch (error) {
      console.error('Error updating deal:', error);
      alert('Failed to update deal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      setLoading(true);
      
      const result = await deleteDeal(dealId);
      if (result.success) {
        // Refresh deals for this company
        const dealsResult = await getDealsByCompany(company.id || company._id);
        if (dealsResult.success) {
          const transformedDeals = dealsResult.data.deals.map(transformDealForFrontend);
          onDealUpdate?.(transformedDeals);
        }
        alert('Deal deleted successfully!');
      } else {
        alert(result.message || 'Failed to delete deal. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert('Failed to delete deal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (deal: Deal) => {
    setEditingDeal(deal);
    setShowEditModal(true);
  };



  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'won':
      case 'closed won':
        return 'bg-success/10 text-success';
      case 'lost':
      case 'closed lost':
        return 'bg-error/10 text-error';
      case 'proposal':
      case 'proposal sent':
        return 'bg-warning/10 text-warning';
      case 'negotiation':
        return 'bg-accent/10 text-accent';
      case 'qualification':
      case 'lead':
        return 'bg-blue-100 text-blue-800';
      case 'need analysis':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Related Deals</h3>
          <Button 
            variant="outline" 
            size="sm" 
            iconName="Plus" 
            iconPosition="left"
            onClick={() => setShowNewDealModal(true)}
          >
            New Deal
          </Button>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-1 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
            <p className="text-sm text-muted-foreground">Total Deal Value</p>
          </div>
          {/* <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-success">{wonDeals.length}</p>
              <p className="text-xs text-muted-foreground">Won</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-primary">{activeDeals.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Deals List */}
      <div className="p-4">
        {deals.length > 0 ? (
          <div className="space-y-3">
            {deals.slice(0, 3).map((deal) => {
              const stage = deal.stageId || deal.stageName || 'unknown';
              const closeDate = deal.closeDate || (deal as any).expectedCloseDate;
              
              return (
                <div key={deal.id || (deal as any)._id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{deal.name || (deal as any).title || 'Untitled Deal'}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStageColor(stage)}`}>
                        {deal.stageName || stage}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(deal.value || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Close Date</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(closeDate)}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(deal)}
                        className="text-primary hover:text-primary/80 p-1"
                        disabled={loading}
                      >
                        <Icon name="Edit" size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteDeal(deal.id || (deal as any)._id || '')}
                        className="text-red-500 hover:text-red-600 p-1"
                        disabled={loading}
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {deals.length > 1 && (
              <Button 
                variant="ghost" 
                className="w-full mt-3"
                onClick={onViewAllDeals}
              >
                View All Deals
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            {/* <Icon name="IndianRupee" size={48} className="mx-auto text-muted-foreground mb-3" /> */}
            {/* <p className="text-muted-foreground mb-3">No deals found</p> */}
            {/* <Button 
              variant="outline" 
              size="sm" 
              iconName="Plus" 
              iconPosition="left"
              onClick={() => setShowNewDealModal(true)}
            >
              Create First Deal
            </Button> */}
          </div>
        )}
      </div>
    </div>

    {/* Edit Deal Modal */}
    {showEditModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-medium text-foreground mb-4">Edit Deal</h3>
          <p className="text-muted-foreground">Edit deal functionality will be implemented here.</p>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditingDeal(null);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* New Deal Modal */}
    {showNewDealModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-medium text-foreground mb-4">Create New Deal</h3>
          <p className="text-muted-foreground">Create deal functionality will be implemented here.</p>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowNewDealModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default RelatedDealsCard;
