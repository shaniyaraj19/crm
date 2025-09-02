import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "components/ui/Sidebar";
import Header from "components/ui/Header";
import Icon from "../../components/AppIcon";
import Button from "components/ui/Button";
import ContactsFilters from "../../pages/contacts-list/components/ContactsFilters";
import CompanySlideForm from "./CompanySlideForm";
import { api } from "../../services/api";
import CompanyFieldCustomizer from "./CompanyFieldCustomizer";
import { useFields } from "../../contexts/FieldsContext";
import { getCompanies, updateCompany } from "src/services/conpany";
import BulkActionsBar from "../contacts-list/components/BulkActionsBar";

interface Company {
  _id: string;
  id: string;
  name: string;
  phone: string;
  website: string;
  email?: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface CompanyFilters {
  status: string;
  company: string;
  tags: string;
  dateRange: string;
}

const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const { fields } = useFields();
  const [companies, setCompanies] = useState<any[]>([]);

  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [isSlideFormOpen, setIsSlideFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [error, setError] = useState<string | null>(null);
  const [isFieldCustomizerOpen, setIsFieldCustomizerOpen] = useState(false);

  // Inline editing state for grid view
  const [editingCell, setEditingCell] = useState<{
    companyId: string;
    fieldName: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  // Inline editing functions
  const handleStartEdit = (
    companyId: string,
    fieldName: string,
    currentValue: string
  ) => {
    setEditingCell({ companyId, fieldName });
    setEditValue(currentValue);
  };

  const handleSaveEdit = async (company: any, fieldName: string) => {
    try {
      // Update the company data
      const updatedCompany = { ...company };
      if (fields?.companies) {
        const field = fields.companies.find((f) => f.name === fieldName);
        if (field?.isCustom) {
          // Update custom field
          if (!updatedCompany.customFields) updatedCompany.customFields = {};
          updatedCompany.customFields[fieldName] = editValue;
        } else {
          // Update standard field
          updatedCompany[fieldName] = editValue;
        }
      }

      // Update local state immediately for better UX
      setCompanies((prev) =>
        prev.map((c) => (c._id === company._id ? updatedCompany : c))
      );

      // Call API to update the company in the database
      try {
        const field = fields?.companies?.find((f) => f.name === fieldName);

        // Prepare update data based on field type
        let updateData: any = {};
        if (field?.isCustom) {
          // For custom fields, update the customFields object
          updateData.customFields = { [fieldName]: editValue };
        } else {
          // For standard fields, update directly
          updateData[fieldName] = editValue;
        }

        // Call the API to update the company
        const response = await updateCompany(company._id, updateData);
      } catch (apiError: any) {
        // Revert local state if API call fails
        setCompanies((prev) =>
          prev.map((c) => (c._id === company._id ? company : c))
        );

        // Show error to user
        alert(`Failed to save changes: ${apiError.message || "Unknown error"}`);
        return;
      }
    } catch (error) {
      alert("Failed to update field");
    } finally {
      setEditingCell(null);
      setEditValue("");
    }
  };

  // View + options
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");

  // --- Filters ---
  const [filters, setFilters] = useState<CompanyFilters>({
    status: "",
    company: "",
    tags: "",
    dateRange: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const normalizeCompany = (company: any): Company => ({
    _id: company._id,
    id: company._id,
    name: company.name,
    phone: company.phone,
    website: company.website,
    email: company.email,
    description: company.description,
    address: company.address,
    createdBy: company.createdBy,
    tags: company.tags,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  });

  const fetchCompanies = async () => {
    try {
      const res = await getCompanies();
      setCompanies((res as any).companies || []);
    } catch (err: any) {}
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSingleFilterChange = (newFilters: CompanyFilters) => {
    setFilters(newFilters);
  };

  // --- Selection State ---
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const handleSelectCompany = (company: any) => {
    const companyId = company._id || company.id;

    setSelectedCompanies((prev) => {
      const newSelection = prev.includes(companyId)
        ? prev.filter((cid) => cid !== companyId)
        : [...prev, companyId];

      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedCompanies.length === companies.length) {
      setSelectedCompanies([]);
    } else {
      const allCompanyIds = companies.map((c) => c._id || c.id);
      setSelectedCompanies(allCompanyIds);
    }
  };

  const isAllSelected =
    companies.length > 0 && selectedCompanies.length === companies.length;
  const isIndeterminate =
    selectedCompanies.length > 0 && selectedCompanies.length < companies.length;

  const handleAddCompany = async (companyData: Company) => {
    try {
      const response = await api.post<any>("/companies", companyData);
      if (response.success) {
        setCompanies((prev) => [...prev, normalizeCompany(response.data)]);
        setIsSlideFormOpen(false);
      } else {
        setError(response.message || "Failed to create company");
      }
    } catch (err) {
      setError("Failed to create company. Please try again.");
    }
  };

  const handleEditCompany = (company: any) => {
    setEditingCompany(company);
    setFormMode("edit");
    setIsSlideFormOpen(true);
  };

  const handleSaveCompany = async (companyData: Company) => {
    try {
      if (formMode === "edit" && companyData.id) {
        const response = await api.put<any>(
          `/companies/${companyData.id}`,
          companyData
        );
        if (response.success) {
          setCompanies((prev) =>
            prev.map((c) =>
              c.id === companyData.id ? normalizeCompany(response.data) : c
            )
          );
          setIsSlideFormOpen(false);
          setEditingCompany(null);
        } else {
          setError(response.message || "Failed to update company");
        }
      } else {
        const response = await api.post<any>("/companies", companyData);
        if (response.success) {
          setCompanies((prev) => [...prev, normalizeCompany(response.data)]);
          setIsSlideFormOpen(false);
          setEditingCompany(null);
        } else {
          setError(response.message || "Failed to create company");
        }
      }
    } catch (err) {
      setError("Failed to save company. Please try again.");
    } finally {
      fetchCompanies();
    }
  };

  const handleDeleteCompany = async (company: Company) => {
    const confirmMessage = `Are you sure you want to delete ${
      company.name || "this company"
    }? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        await api.delete(`/companies/${company._id || company.id}`);

        // Update state after successful delete
        setCompanies((prev) =>
          prev.filter((c) => c._id !== company._id && c.id !== company.id)
        );
        setSelectedCompanies((prev) =>
          prev.filter((id) => id !== (company._id || company.id))
        );

        // Company deleted successfully
      } finally {
        // Close any open dropdowns
        setOpenDropdown(null);
        fetchCompanies();
      }
    }
  };

  // Bulk Actions Handlers
  const handleBulkExport = () => {
    alert(`Exporting ${selectedCompanies.length} companies...`);
  };

  const handleBulkAssignOwner = (ownerId: string) => {
    alert(`Assigning owner to ${selectedCompanies.length} companies...`);
  };

  const handleBulkAddTags = (tags: string[]) => {
    alert(`Adding tags to ${selectedCompanies.length} companies...`);
  };

  const handleBulkDelete = async () => {
    const confirmMessage = `Are you sure you want to delete ${selectedCompanies.length} companies? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        // Delete all selected companies
        for (const companyId of selectedCompanies) {
          await api.delete(`/companies/${companyId}`);
        }

        // Update state after successful delete
        setCompanies((prev) =>
          prev.filter((c) => !selectedCompanies.includes(c._id || c.id))
        );

        // Clear selection
        setSelectedCompanies([]);

        // Bulk delete completed
        fetchCompanies();
      } catch (err) {
        setError("Failed to delete some companies. Please try again.");
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedCompanies([]);
  };

  // Inline editing functions for grid view
  const startEditing = (
    companyId: string,
    fieldName: string,
    currentValue: string
  ) => {
    setEditingCell({ companyId, fieldName });
    setEditValue(currentValue || "");
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    try {
      const company = companies.find(
        (c) => c._id === editingCell.companyId || c.id === editingCell.companyId
      );
      if (!company) return;

      // Create updated company data
      const updatedCompany = { ...company };
      updatedCompany[editingCell.fieldName] = editValue;

      // Make API call to update the company
      const response = await api.put(
        `/companies/${editingCell.companyId}`,
        updatedCompany
      );

      if (response.success) {
        // Update local state
        setCompanies((prev) =>
          prev.map((c) =>
            c._id === editingCell.companyId || c.id === editingCell.companyId
              ? { ...c, [editingCell.fieldName]: editValue }
              : c
          )
        );

        // Inline edit saved successfully
      } else {
        setError("Failed to save changes. Please try again.");
      }
    } catch (err) {
      setError("Failed to save changes. Please try again.");
    } finally {
      // Clear editing state
      setEditingCell(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 w-full">
          {/* --- Toolbar with Filters + Buttons --- */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 shadow-sm w-full">
              {/* Left Section */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`relative p-1 hover:bg-muted rounded transition-colors ${
                    isFilterOpen ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <Icon
                    name="Filter"
                    size={16}
                    className={isFilterOpen ? "" : "text-muted-foreground"}
                  />
                  {Object.values(filters).filter((v) => v !== "").length >
                    0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {Object.values(filters).filter((v) => v !== "").length}
                    </span>
                  )}
                </button>

                {Object.values(filters).filter((v) => v !== "").length > 0 && (
                  <button
                    onClick={() =>
                      setFilters({
                        status: "",
                        company: "",
                        tags: "",
                        dateRange: "",
                      })
                    }
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name="X" size={12} />
                    <span>Clear</span>
                  </button>
                )}
                <div className="relative">
                  {/* Dropdown trigger example */}
                  <button className="flex items-center space-x-2 px-3 py-1.5 bg-background border border-border rounded-md hover:bg-muted transition-colors">
                    <span className="text-sm font-medium">All Companies</span>
                    <Icon
                      name="ChevronDown"
                      size={14}
                      className="text-muted-foreground"
                    />
                  </button>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  <button
                    onClick={() => setView("list")}
                    className={`p-2 transition-colors ${
                      view === "list"
                        ? "bg-accent text-accent-foreground hover:bg-accent/80"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon name="List" size={16} />
                  </button>
                  <button
                    onClick={() => setView("grid")}
                    className={`p-2 transition-colors ${
                      view === "grid"
                        ? "bg-accent text-accent-foreground hover:bg-accent/80"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon name="LayoutGrid" size={16} />
                  </button>
                </div>

                <Button
                  onClick={() => {
                    setFormMode("create");
                    setEditingCompany(null);
                    setIsSlideFormOpen(true);
                  }}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Icon name="Plus" size={16} />
                  <span>Company</span>
                </Button>

                <div className="relative">
                  <button
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    className="p-2 hover:bg-muted rounded transition-colors"
                  >
                    <Icon
                      name="MoreVertical"
                      size={16}
                      className="text-muted-foreground"
                    />
                  </button>
                  {showMoreOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                      <button className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted w-full text-left transition-colors">
                        <Icon name="Download" size={16} />
                        <span>Export Contacts</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-muted w-full text-left transition-colors">
                        <Icon name="Mail" size={16} />
                        <span>Mass Email</span>
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          localStorage.removeItem("crm-fields-config");
                          window.location.reload();
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600 w-full text-left transition-colors"
                      >
                        <Icon name="RefreshCw" size={16} />
                        <span>Reset Fields to Default</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --- Filters Panel --- */}
          {isFilterOpen && (
            <ContactsFilters
              filters={filters}
              onFilterChange={handleSingleFilterChange}
              isExpanded={true}
            />
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <Icon name="AlertCircle" className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
            </div>
          )}

          {view === "list" && (
            <div className="shadow-md rounded-lg border border-gray-200">
              <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                <table className="min-w-full text-left text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={handleSelectAll}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </th>

                    {fields?.companies ? (
                      fields.companies
                        .filter((f) => f.visible)
                        .map((field) => (
                          <th
                            key={field.id}
                            className="px-4 py-2 text-left font-medium text-sm text-gray-700"
                            style={{ minWidth: "150px" }}
                          >
                            {field.label}
                          </th>
                        ))
                    ) : (
                      <>
                        <th className="px-4 py-2 text-left font-medium text-sm text-gray-700">
                          Company Name
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-sm text-gray-700">
                          Phone
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-sm text-gray-700">
                          Website
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-sm text-gray-700">
                          Email
                        </th>
                      </>
                    )}

                    <th className="w-25 px-3 py-2">
                      <Button
                        onClick={() => setIsFieldCustomizerOpen(true)}
                        className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white px-2 py-1 h-7 text-xs"
                      >
                        <Icon name="Plus" size={12} />
                        <span>Create Field</span>
                      </Button>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {companies?.map((company, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 hover:bg-gray-50"
                      onMouseEnter={() => setHoveredRow(idx)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(
                            company._id || company.id
                          )}
                          onChange={() => handleSelectCompany(company)}
                          className="rounded border-border text-primary focus:ring-primary"
                          data-company-id={company._id || company.id}
                          data-company-name={company.name}
                        />
                      </td>

                      {fields?.companies ? (
                        fields.companies
                          .filter((f) => f.visible)
                          .map((field) => {
                            const value = field.isCustom
                              ? company.customFields?.[field.name] || ""
                              : company[field.name] || "";

                            return (
                              <td key={field.id} className="px-4 py-2">
                                {field.name === "name" ? (
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/companies/${
                                          company.id || company._id
                                        }`
                                      )
                                    }
                                    className="text-left text-primary cursor-pointer w-full "
                                  >
                                    {value || ""}
                                  </button>
                                ) : (
                                  <div className="px-2 py-1">{value || ""}</div>
                                )}
                              </td>
                            );
                          })
                      ) : (
                        <>
                          <td className="px-4 py-2">
                            <button
                              onClick={() =>
                                navigate(
                                  `/companies/${company.id || company._id}`
                                )
                              }
                              className="text-left text-primary  cursor-pointer w-full"
                            >
                              {company.name || ""}
                            </button>
                          </td>
                          <td className="px-4 py-2">{company.phone || ""}</td>
                          <td className="px-4 py-2">{company.website || ""}</td>
                          <td className="px-4 py-2">{company.email || ""}</td>
                        </>
                      )}

                      {/* Actions column */}
                      <td className="px-3 py-2">
                        <div
                          className={`flex items-center space-x-0.5 transition-all ${
                            hoveredRow === idx ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCompany(company)}
                            className="h-6 w-6 p-0"
                            title="Edit"
                          >
                            <Icon name="Edit2" size={12} />
                          </Button>
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === idx ? null : idx
                                )
                              }
                              className="h-6 w-6 p-0"
                            >
                              <Icon name="MoreVertical" size={12} />
                            </Button>
                            {openDropdown === idx && (
                              <div className="absolute right-0 mt-1 w-40 bg-white border rounded-lg shadow-lg py-1 z-50">
                                <button
                                  onClick={() =>
                                    window.open(`tel:${company.phone}`)
                                  }
                                  className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left"
                                >
                                  <Icon name="Phone" size={14} />
                                  <span>Call</span>
                                </button>
                                <button
                                  onClick={() =>
                                    window.open(`mailto:${company.email}`)
                                  }
                                  className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left"
                                >
                                  <Icon name="Mail" size={14} />
                                  <span>Email</span>
                                </button>
                                <hr className="my-1" />
                                <button
                                  onClick={() => handleDeleteCompany(company)}
                                  className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600 w-full text-left"
                                >
                                  <Icon name="Trash2" size={14} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- Grid View (Excel Style) --- */}
          {view === "grid" && (
            <div className="shadow-md rounded-lg border border-gray-200">
              <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                <table className="min-w-full table-fixed border-collapse">
                {/* Header */}
                <thead className="bg-gray-100 text-gray-700 text-sm font-medium border-b border-gray-200">
                  <tr>
                    {/* Checkbox column */}
                    <th className="w-12 text-center border-r border-gray-200 py-2">
                      <input
                        type="checkbox"
                        className="rounded border-border text-primary focus:ring-primary"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={handleSelectAll}
                      />
                    </th>

                    {/* Dynamic / Default Fields */}
                    {fields?.companies ? (
                      fields.companies
                        .filter((f) => f.visible)
                        .map((field) => (
                          <th
                            key={field.id}
                            className="px-3 py-2 border-r border-gray-200 text-left"
                            style={{ minWidth: "180px" }}
                          >
                            {field.label}
                          </th>
                        ))
                    ) : (
                      <>
                        <th className="px-3 py-2 border-r border-gray-200 text-left min-w-[180px]">
                          Company Name
                        </th>
                        <th className="px-3 py-2 border-r border-gray-200 text-left min-w-[180px]">
                          Phone
                        </th>
                        <th className="px-3 py-2 border-r border-gray-200 text-left min-w-[180px]">
                          Website
                        </th>
                        <th className="px-3 py-2 border-r border-gray-200 text-left min-w-[180px]">
                          Email
                        </th>
                      </>
                    )}

                    {/* Actions */}
                    <th className="w-[150px] px-3 py-2 text-center">
                      <Button
                        onClick={() => setIsFieldCustomizerOpen(true)}
                        className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-700 text-white px-2 py-1 h-7 text-xs"
                      >
                        <Icon name="Plus" size={12} />
                        <span>Create Field</span>
                      </Button>
                    </th>
                  </tr>
                </thead>

                {/* Body */}
                <tbody className="text-sm">
                  {companies?.map((company, idx) => (
                    <tr
                      key={company._id || company.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                      onMouseEnter={() => setHoveredRow(idx)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {/* Checkbox */}
                      <td className="w-12 text-center border-r border-gray-200">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(
                            company._id || company.id
                          )}
                          onChange={() => handleSelectCompany(company)}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                      </td>

                      {/* Dynamic Fields */}
                      {fields?.companies ? (
                        fields.companies
                          .filter((f) => f.visible)
                          .map((field) => {
                            const fieldValue = field.isCustom
                              ? company.customFields?.[field.name] || ""
                              : company[field.name] || "";

                            return (
                              <td
                                key={field.id}
                                className="px-3 py-2 border-r border-gray-200 truncate"
                              >
                                {field.name === "name" ? (
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/companies/${
                                          company.id || company._id
                                        }`
                                      )
                                    }
                                    className="text-left text-primary cursor-pointer w-full "
                                  >
                                    {fieldValue}
                                  </button>
                                ) : (
                                  <div className="inline-edit-cell">
                                    {editingCell?.companyId === company._id &&
                                    editingCell?.fieldName === field.name ? (
                                      <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) =>
                                          setEditValue(e.target.value)
                                        }
                                        onBlur={() =>
                                          handleSaveEdit(company, field.name)
                                        }
                                        onKeyPress={(e) =>
                                          e.key === "Enter" &&
                                          handleSaveEdit(company, field.name)
                                        }
                                        className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                      />
                                    ) : (
                                      <div
                                        onClick={() =>
                                          handleStartEdit(
                                            company._id,
                                            field.name,
                                            fieldValue
                                          )
                                        }
                                        className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                        title="Click to edit"
                                      >
                                        {fieldValue}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })
                      ) : (
                        <>
                          <td className="px-3 py-2 border-r border-gray-200 truncate text-primary cursor-pointer ">
                            {company.name}
                          </td>
                          <td className="px-3 py-2 border-r border-gray-200 truncate">
                            {company.phone}
                          </td>
                          <td className="px-3 py-2 border-r border-gray-200 truncate">
                            {company.website}
                          </td>
                          <td className="px-3 py-2 border-r border-gray-200 truncate">
                            {company.email}
                          </td>
                        </>
                      )}

                      {/* Actions */}
                      <td className="px-3 py-2 text-center">
                        <div
                          className={`flex items-center justify-center space-x-1 transition-opacity ${
                            hoveredRow === idx ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCompany(company)}
                            className="h-7 w-7 p-0"
                            title="Edit"
                          >
                            <Icon name="Edit2" size={14} />
                          </Button>
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === idx ? null : idx
                                )
                              }
                              className="h-7 w-7 p-0"
                            >
                              <Icon name="MoreVertical" size={14} />
                            </Button>
                            {openDropdown === idx && (
                              <div className="absolute right-0 mt-1 w-40 bg-white border rounded-lg shadow-lg py-1 z-50">
                                <button
                                  onClick={() =>
                                    window.open(`tel:${company.phone}`)
                                  }
                                  className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left"
                                >
                                  <Icon name="Phone" size={14} />
                                  <span>Call</span>
                                </button>
                                <button
                                  onClick={() =>
                                    window.open(`mailto:${company.email}`)
                                  }
                                  className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left"
                                >
                                  <Icon name="Mail" size={14} />
                                  <span>Email</span>
                                </button>
                                <hr className="my-1" />
                                <button
                                  onClick={() => handleDeleteCompany(company)}
                                  className="flex items-center space-x-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600 w-full text-left"
                                >
                                  <Icon name="Trash2" size={14} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        <CompanySlideForm
          isOpen={isSlideFormOpen}
          onClose={() => {
            setIsSlideFormOpen(false);
            setEditingCompany(null);
            setFormMode("create");
          }}
          onSave={handleSaveCompany}
          company={editingCompany}
          mode={formMode}
        />

        {isFieldCustomizerOpen && (
          <CompanyFieldCustomizer
            module="companies"
            isOpen={isFieldCustomizerOpen}
            onClose={() => setIsFieldCustomizerOpen(false)}
          />
        )}

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedCompanies.length}
          onExport={handleBulkExport}
          onAssignOwner={handleBulkAssignOwner}
          onAddTags={handleBulkAddTags}
          onDelete={handleBulkDelete}
          onClearSelection={handleClearSelection}
        />
      </div>
    </div>
  );
};

export default CompaniesPage;
