import React from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

interface Deal {
  id: string;
  name: string;
  value: number;
  stageName: string;
  closeDate: string;
  description?: string;
  probability?: number;
}

interface RelatedDealsCardProps {
  deals: Deal[];
  onAddDeal?: () => void;
  onEditDeal?: (deal: Deal) => void;
  onDeleteDeal?: (dealId: string) => void;
  onViewAllDeals?: () => void;
}

const RelatedDealsCard = ({ deals, onAddDeal, onEditDeal, onDeleteDeal, onViewAllDeals }: RelatedDealsCardProps) => {

  const totalValue = deals.reduce((sum: number, deal: Deal) => sum + deal.value, 0);
  const wonDeals = deals.filter((deal: Deal) => deal.stageName === 'won');
  const activeDeals = deals.filter((deal: Deal) => !['won', 'lost'].includes(deal.stageName));

  const handleCreateDeal = () => {
    if (onAddDeal) {
      onAddDeal();
    }
  };

  const handleEditDeal = (deal: Deal) => {
    if (onEditDeal) {
      onEditDeal(deal);
    }
  };

  const handleDeleteDeal = (dealId: string) => {
    if (onDeleteDeal) {
      onDeleteDeal(dealId);
    }
  };

  const handleViewAllDeals = () => {
    if (onViewAllDeals) {
      onViewAllDeals();
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Onboarding':
        return 'bg-blue-100 text-blue-800';
      case 'Implementation':
        return 'bg-amber-100 text-amber-800';
      case 'Go-Live':
        return 'bg-red-100 text-red-800';
      case 'Success':
        return 'bg-green-100 text-green-800';
      case 'won':
        return 'bg-success/10 text-success';
      case 'lost':
        return 'bg-error/10 text-error';
      case 'proposal':
        return 'bg-warning/10 text-warning';
      case 'negotiation':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">Related Deals</h3>
          <Button 
            variant="outline" 
            size="sm" 
            iconName="Plus" 
            iconPosition="left"
            onClick={handleCreateDeal}
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
            {deals.slice(0, 3).map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{deal.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStageColor(deal.stageName)}`}>
                      {deal.stageName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(deal.value)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Close Date</p>
                    <p className="text-sm font-medium text-foreground">{deal.closeDate}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditDeal(deal)}
                      className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Icon name="Edit" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDeal(deal.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Icon name="Trash" size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {deals.length > 1 && (
              <Button 
                variant="ghost" 
                className="w-full mt-3"
                onClick={handleViewAllDeals}
              >
                View All {deals.length} Deals
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Icon name="DollarSign" size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-3">No deals found</p>
            <Button 
              variant="outline" 
              size="sm" 
              iconName="Plus" 
              iconPosition="left"
              onClick={handleCreateDeal}
            >
              Create First Deal
            </Button>
          </div>
        )}
      </div>


    </div>
  );
};

export default RelatedDealsCard;
