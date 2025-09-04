import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import Header from "../../components/ui/Header";
import Sidebar from "../../components/ui/Sidebar";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import DealManager from "../../components/DealManager";
import { Deal, getDealsByCompany, transformDealForFrontend } from "../../services/deals";
import CompanyInfoCard from "./CompanyInfoCard";
import QuickActionsPanel from "./QuickActionsPanel";
import RelatedDealsCard from "./RelatedDealsCard";
import RecentActivityCard from "./RecentActivityCard";
import CompanyTabs from "./CompanyTabs.tsx";

const CompanyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deals, setDeals] = useState<Deal[]>([]); // Empty array for manual deal insertion
  const [globalActivities, setGlobalActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('activities'); // Add state to track active tab
  const [dealModalTrigger, setDealModalTrigger] = useState(0);
  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false);



  // Load deals for this company
  const loadCompanyDeals = useCallback(async () => {
    if (!id) return;
    console.log('🔄 Loading deals for company:', id);
    const response = await getDealsByCompany(id);

    console.log('📊 Deals response:', response);

    if (response.success) {
      const dealsData = response.data?.deals || [];
      console.log('📋 Raw deals data:', dealsData);
      const transformedDeals = dealsData.map((deal: any) => transformDealForFrontend(deal));
      console.log('🔄 Transformed deals:', transformedDeals);
      setDeals(transformedDeals);
      console.log('✅ Successfully loaded and set deals:', transformedDeals.length);
    } else {
      console.error('❌ Failed to load deals:', response);
    }
  }, [id]);

  // Load activities for the current company
  const loadCompanyActivities = useCallback(async () => {
    if (!id) return;
    try {
      const response = await api.get<any>(`/activities?companyId=${id}&limit=50`);
      if (response.success) {
        const activitiesData = (response.data as any)?.activities || [];
        setGlobalActivities(activitiesData);
      }
    } catch (error) {
      console.error('Error loading company activities:', error);
    }
  }, [id]);

  // Load company activities on component mount
  useEffect(() => {
    loadCompanyActivities();
  }, [loadCompanyActivities]);

  // Helpers

  const normalizeCompany = (c: any) =>
    c && {
      id: c._id || c.id,
      name: c.name || "",
      industry: c.industry || "",
      companySize: c.employeeCount
        ? `${c.employeeCount} employees`
        : c.companySize || "",
      status: c.type || c.status || "active",
      email: c.email || "",
      phone: c.phone || "",
      website: c.website || "",
      linkedin: c.linkedinUrl || c.linkedin || "",
      address: c.address
        ? `${c.address.street || ""}, ${c.address.city || ""}, ${
            c.address.state || ""
          } ${c.address.zipCode || ""}`
        : "",
      foundedYear: c.foundedYear || "",
      tags: c.tags || [],
      createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      owner: c.createdBy || "Unassigned",
    };

  // ✅ Refresh company (depends on id only)
  const refreshCompany = useCallback(async () => {
    if (!id || isUpdatingCompany) {
      console.log('🔄 Skipping company refresh - id:', id, 'isUpdatingCompany:', isUpdatingCompany);
      return;
    }
    try {
      console.log('🔄 Refreshing company data...');
      const response = await api.get<any>(`/companies/${id}`);
      if (response.success) {
        const c = response.data?.company || response.data;
        const normalizedCompany = normalizeCompany(c);
        console.log('🔄 Refreshed company data:', normalizedCompany);
        console.log('🔄 Company ID in normalized data:', normalizedCompany?.id);
        
        // Only update if the data has actually changed
        setCompany((prev: any) => {
          if (!prev) return normalizedCompany;
          
          // Check if the key fields have changed
          const hasChanged = 
            prev.name !== normalizedCompany.name ||
            prev.industry !== normalizedCompany.industry ||
            prev.status !== normalizedCompany.status ||
            prev.id !== normalizedCompany.id;
            
          if (hasChanged) {
            console.log('🔄 Company data changed, updating state');
            return normalizedCompany;
          } else {
            console.log('🔄 Company data unchanged, keeping current state');
            return prev;
          }
        });
        
        // Load deals and activities for this company
        await loadCompanyDeals();
        await loadCompanyActivities();
      }
    } catch (error) {
      console.error('Error refreshing company:', error);
    } finally {
      setLoading(false);
    }
  }, [id, loadCompanyDeals, loadCompanyActivities, isUpdatingCompany]);

  // Refresh tabs trigger
  const refreshTabs = useCallback(() => {
    console.log('🔄 Refreshing tabs, current trigger:', refreshTrigger);
    setRefreshTrigger((prev) => prev + 1);
    // Also refresh deals and activities without refreshing the entire company
    loadCompanyDeals();
    loadCompanyActivities();
  }, [refreshTrigger, loadCompanyDeals, loadCompanyActivities]);

  // ✅ Refresh on focus/visibility change (debounced)
  useEffect(() => {
    let focusTimeout: ReturnType<typeof setTimeout> | null = null;
    let visibilityTimeout: ReturnType<typeof setTimeout> | null = null;
  
    // ✅ Call refreshCompany immediately on mount
    refreshCompany();
  
    const handleFocus = () => {
      if (isUpdatingCompany) return; // Don't refresh if we're updating
      if (focusTimeout) clearTimeout(focusTimeout);
      focusTimeout = setTimeout(refreshCompany, 100);
    };
  
    const handleVisibilityChange = () => {
      if (isUpdatingCompany) return; // Don't refresh if we're updating
      if (!document.hidden) {
        if (visibilityTimeout) clearTimeout(visibilityTimeout);
        visibilityTimeout = setTimeout(refreshCompany, 200);
      }
    };
  
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (focusTimeout) clearTimeout(focusTimeout);
      if (visibilityTimeout) clearTimeout(visibilityTimeout);
    };
  }, [refreshCompany, isUpdatingCompany]);
  

  // ✅ Load company on mount and when id changes
  useEffect(() => {
    if (id) {
      refreshCompany();
    }
  }, [id, refreshCompany]);

  // Load deals on mount
  useEffect(() => {
    if (id) {
      loadCompanyDeals();
    }
  }, [id, loadCompanyDeals]);

  const handleDealsUpdate = (updatedDeals: Deal[]) => {
    setDeals(updatedDeals);
  };

  const handleShowDealModal = () => {
    setDealModalTrigger(prev => prev + 1);
  };

  const handleShowEditDeal = (deal: Deal) => {
    // TODO: Implement edit deal functionality - could trigger DealManager edit modal
    console.log('Edit deal:', deal);
  };

  const handleDeleteDeal = (dealId: string) => {
    // TODO: Implement delete deal functionality - could trigger DealManager delete
    console.log('Delete deal:', dealId);
  };

  // ✅ Save company
  const handleSaveCompany = async (newCompanyData: any) => {
    if (isUpdatingCompany) {
      console.log('🔄 Company update already in progress, skipping...');
      return;
    }

    try {
      setIsUpdatingCompany(true);
      console.log('🔄 Starting to save company...');
      console.log('📝 Company object:', company);
      console.log('📝 Company ID (id):', company?.id);
      console.log('📝 Company ID (_id):', company?._id);
      console.log('📝 New company data:', newCompanyData);
      console.log('🔒 isUpdatingCompany set to true');
      
      // Get the company ID from either id or _id field
      const companyId = company?.id || company?._id;
      console.log('📝 Using company ID:', companyId);
      console.log('📝 API URL:', `/companies/${companyId}`);
      console.log('📝 Request method: PUT');
      
      // Check if we have a valid company ID
      if (!companyId) {
        console.error('❌ No company ID found, cannot save');
        console.error('❌ Company object:', company);
        alert('Error: No company ID found. Please refresh the page and try again.');
        return;
      }

      console.log('📡 Making API call to:', `/companies/${companyId}`);
      const response = await api.put<any>(
        `/companies/${companyId}`,
        newCompanyData
      );

      console.log('📨 API Response:', response);
      console.log('📨 Response success:', response.success);
      console.log('📨 Response data:', response.data);
      console.log('📨 Response data.company:', response.data?.company);
      console.log('📨 Response data.data:', response.data?.data);

      if (response.success) {
        // Handle different response structures
        let savedCompany;
        if (response.data?.company) {
          savedCompany = response.data.company;
        } else if (response.data?.data?.company) {
          savedCompany = response.data.data.company;
        } else {
          savedCompany = response.data;
        }
        
        console.log('✅ Company saved successfully:', savedCompany);
        
        // Update the local company state with the saved data
        setCompany((prev: any) => {
          if (!prev) {
            console.log('🔄 No previous company state, setting new state');
            return savedCompany;
          }
          
          // First, merge the returned company data from the API
          const returnedCompany = savedCompany || {};
          
          // Create a simple merge of the data, prioritizing returned data
          const updatedCompany = {
            ...prev,
            ...returnedCompany,
            // Ensure company name is properly set
            name: returnedCompany.name || prev?.name,
            // Ensure industry is properly set
            industry: returnedCompany.industry || prev?.industry,
            // Ensure status is properly set
            status: returnedCompany.status || prev?.status,
            // Ensure ID is properly set
            id: returnedCompany._id || returnedCompany.id || prev?.id,
          };
          
          console.log('🔄 Previous company state:', prev);
          console.log('🔄 Returned company data:', returnedCompany);
          console.log('🔄 Updated company state:', updatedCompany);
          
          return updatedCompany;
        });
        
        // Show success message only once
        alert('Company updated successfully!');
        
        // Only refresh deals and activities, don't trigger full company refresh
        loadCompanyDeals();
        loadCompanyActivities();
      } else {
        console.error('❌ Failed to save company:', response);
        const errorMessage = response.message || 'Unknown error occurred';
        alert(`Error updating company: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('❌ Error saving company:', error);
      alert(`Error updating company: ${error.message || 'Unknown error occurred'}`);
    } finally {
      // Add a small delay to ensure all state updates are complete
      setTimeout(() => {
        console.log('🔓 isUpdatingCompany set to false');
        setIsUpdatingCompany(false);
      }, 500);
    }
  };

  // Function to switch to deals tab
  const handleViewAllDeals = () => {
    setActiveTab('deals');
  };

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-20 px-2 sm:px-4 md:px-6 py-4">
            <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading company details...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Not found
  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-0 md:ml-20 px-2 sm:px-4 md:px-6 py-4">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Company Not Found
              </h2>
            <p className="text-muted-foreground mb-6">
              The company you're looking for doesn't exist or has been removed.
            </p>
            <button
                onClick={() => navigate("/companies-list")}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth"
            >
              Back to Companies
            </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        {/* <main className="flex-1 ml-0  px-2 sm:px-4 md:px-6 py-3">  */}
        <main className="flex-1  px-6 py-2 flex items-center justify-center">
          <div className="w-full">
          <Breadcrumbs />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">
                <CompanyInfoCard 
                  company={company} 
                  onSave={handleSaveCompany}
                />
              <CompanyTabs
                company={company}
                taskRefreshTrigger={refreshTrigger}
                scheduleRefreshTrigger={refreshTrigger}
                noteRefreshTrigger={refreshTrigger}
                deals={deals}
                activities={globalActivities}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onEditDeal={handleShowEditDeal}
                onDeleteDeal={handleDeleteDeal}
              />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6">
              <QuickActionsPanel
                company={company}
                onActionComplete={() => { 
                  console.log('🎯 onActionComplete called - refreshing deals and activities');
                  loadCompanyDeals(); 
                  loadCompanyActivities(); 
                  refreshTabs(); 
                }}
              />
              <RelatedDealsCard
                deals={deals}
                onDealUpdate={handleDealsUpdate}
                company={company}
                onViewAllDeals={handleViewAllDeals}
              />
              <RecentActivityCard 
                activities={globalActivities} 
                onViewAllActivity={() => setActiveTab('activities')}
              />
              </div>
            </div>
          </div>

          {/* Deal Manager Component */}
          <DealManager
            companyId={company?.id || company?._id || id || ""}
            onDealsUpdate={handleDealsUpdate}
            onDealActivity={() => {}} // Simplified for now
            onShowDealModal={handleShowDealModal}
            showDealModalTrigger={dealModalTrigger}
          />
        </main>
      </div>
    </div>
  );
};
export default CompanyDetails;
