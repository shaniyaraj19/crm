import React, { useState, useEffect } from "react";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import { useFields } from "../../contexts/FieldsContext";
import CompanyFieldCustomizer from "./CompanyFieldCustomizer";

interface CompanySlideFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: any) => void;
  company?: any; // For edit mode
  mode: "create" | "edit";
}

const CompanySlideForm: React.FC<CompanySlideFormProps> = ({
  isOpen,
  onClose,
  onSave,
  company,
  mode = "add",
}) => {
  const { fields } = useFields();
  const [formData, setFormData] = useState<Record<string, any>>({
    name: "",
    email: "",
    phone: "",
    website: "",
    description: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    tags: [],
  });

  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressInfo, setShowAddressInfo] = useState(false);
  const [isFieldCustomizerOpen, setIsFieldCustomizerOpen] = useState(false);

  useEffect(() => {
    if (mode === "edit" && company) {
      const customVisibleFields =
        fields?.companies?.filter((f) => f.visible && f.isCustom) || [];

      const initialFormData: Record<string, any> = {
        name: company.name || "",
        email: company.email || "",
        phone: company.phone || "",
        website: company.website || "",
        description: company.description || "",
        street: company.address?.street || "",
        city: company.address?.city || "",
        state: company.address?.state || "",
        zipCode: company.address?.zipCode || "",
        country: company.address?.country || "",
        tags: company.tags || [],
      };

      if (company.customFields) {
        customVisibleFields.forEach((field) => {
          initialFormData[field.name] = company.customFields[field.name] || "";
        });
      }

      setFormData(initialFormData);

      if (
        company.address &&
        (company.address.street ||
          company.address.city ||
          company.address.state ||
          company.address.zipCode ||
          company.address.country)
      ) {
        setShowAddressInfo(true);
      }
    } else if (mode === "create") {
      const customVisibleFields =
        fields?.companies?.filter((f) => f.visible && f.isCustom) || [];

      const initialFormData: Record<string, any> = {
        name: "",
        email: "",
        phone: "",
        website: "",
        description: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        tags: [],
      };

      customVisibleFields.forEach((field) => {
        initialFormData[field.name] = "";
      });

      setFormData(initialFormData);
      setShowAddressInfo(false);
    }
  }, [mode, company, fields]); // ✅ Added fields dependency

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = "Company name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Company name must be at least 2 characters";
    } else if (formData.name.trim().length > 200) {
      newErrors.name = "Company name cannot exceed 200 characters";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (
      formData.phone &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ""))
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (formData.website) {
      try {
        const url = new URL(formData.website);
        if (!url.protocol || !url.hostname) {
          newErrors.website = "Please enter a valid website URL";
        }
      } catch {
        newErrors.website =
          "Please enter a valid website URL (e.g., https://example.com)";
      }
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = "Description cannot exceed 2000 characters";
    }

    if (showAddressInfo) {
      if (formData.street && formData.street.trim().length > 100) {
        newErrors.street = "Street address cannot exceed 100 characters";
      }

      if (formData.city && formData.city.trim().length > 50) {
        newErrors.city = "City name cannot exceed 50 characters";
      }

      if (formData.state && formData.state.trim().length > 50) {
        newErrors.state = "State name cannot exceed 50 characters";
      }

      if (formData.zipCode) {
        if (formData.zipCode.trim().length > 20) {
          newErrors.zipCode = "Zip code cannot exceed 20 characters";
        } else if (!/^[a-zA-Z0-9\s\-]+$/.test(formData.zipCode.trim())) {
          newErrors.zipCode = "Zip code contains invalid characters";
        }
      }

      if (formData.country && formData.country.trim().length > 50) {
        newErrors.country = "Country name cannot exceed 50 characters";
      }
    }

    if (fields?.companies) {
      const customVisibleFields = fields.companies.filter(
        (f) => f.visible && f.isCustom
      );
      customVisibleFields.forEach((field) => {
        if (
          field.required &&
          (!formData[field.name] || formData[field.name].trim() === "")
        ) {
          newErrors[field.name] = `${field.label} is required`;
        } else if (formData[field.name] && formData[field.name].trim() !== "") {
          if (
            field.type === "email" &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.name])
          ) {
            newErrors[
              field.name
            ] = `Please enter a valid ${field.label.toLowerCase()}`;
          } else if (
            field.type === "number" &&
            isNaN(Number(formData[field.name]))
          ) {
            newErrors[
              field.name
            ] = `Please enter a valid number for ${field.label.toLowerCase()}`;
          } else if (
            field.type === "date" &&
            isNaN(Date.parse(formData[field.name]))
          ) {
            newErrors[
              field.name
            ] = `Please enter a valid date for ${field.label.toLowerCase()}`;
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const customFields: Record<string, any> = {};
      const standardFields: Record<string, any> = {};

      const allVisibleFields =
        fields?.companies?.filter((f) => f.visible) || [];

      allVisibleFields.forEach((field) => {
        if (field.isCustom) {
          const fieldValue = formData[field.name] || "";
          customFields[field.name] = fieldValue;
        } else {
          standardFields[field.name] = formData[field.name] || "";
        }
      });

      const companyData = {
        id: company?.id || company?._id || Date.now(),
        _id: company?._id || company?.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        description: formData.description,
        tags: formData.tags,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },

        customFields,
        ...standardFields,
        createdAt: company?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSave(companyData);
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setShowAddressInfo(false);
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      website: "",
      description: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      owner: "",
      tags: [],
    });
    setErrors({});
    setShowAddressInfo(false);
  };

  useEffect(() => {
    if (mode === "create") {
      resetForm();
    }
  }, [mode]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={handleClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === "create" ? "Create Company" : "Edit Company"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Company Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter company name"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter email address"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                    Phone
                  </label>
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Enter phone number"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                    Website
                  </label>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder="Enter website URL"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.website ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.website && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.website}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0 pt-2">
                    Description
                  </label>
                  <div className="flex-1">
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="A few words about this company"
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {(() => {
              const customVisibleFields =
                fields?.companies?.filter((f) => f.visible && f.isCustom) || [];
              return customVisibleFields.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Custom Fields
                  </h3>
                  <div className="space-y-4">
                    {customVisibleFields.map((field: any) => (
                      <div
                        key={field.id}
                        className="flex items-center space-x-4"
                      >
                        <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <div className="flex-1">
                          {field.type === "textarea" ? (
                            <textarea
                              value={(formData as any)[field.name] || ""}
                              onChange={(e) =>
                                handleInputChange(field.name, e.target.value)
                              }
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              rows={3}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm ${
                                errors[field.name]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          ) : field.type === "select" ? (
                            <select
                              value={(formData as any)[field.name] || ""}
                              onChange={(e) =>
                                handleInputChange(field.name, e.target.value)
                              }
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm ${
                                errors[field.name]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            >
                              <option value="">Select {field.label}</option>
                              {(field.options || []).map((opt: any) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={
                                field.type === "date"
                                  ? "date"
                                  : field.type === "email"
                                  ? "email"
                                  : field.type === "number"
                                  ? "number"
                                  : "text"
                              }
                              value={(formData as any)[field.name] || ""}
                              onChange={(e) =>
                                handleInputChange(field.name, e.target.value)
                              }
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[field.name]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          )}
                          {errors[field.name] && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors[field.name]}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            <div>
              <button
                type="button"
                onClick={() => setShowAddressInfo(!showAddressInfo)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  Address Information
                </h3>
                <Icon
                  name={showAddressInfo ? "ChevronUp" : "ChevronDown"}
                  size={20}
                  className="text-gray-400"
                />
              </button>

              {showAddressInfo && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                      Street
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) =>
                          handleInputChange("street", e.target.value)
                        }
                        placeholder="Enter street address"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.street ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.street && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.street}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                      City
                    </label>
                    <div className="flex-1 flex space-x-4">
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        placeholder="Enter city"
                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.city ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.city}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) =>
                            handleInputChange("state", e.target.value)
                          }
                          placeholder="Enter state"
                          className={`w-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.state ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      </div>
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.state}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="w-32 text-sm font-medium text-gray-700 text-right flex-shrink-0">
                      Zip Code
                    </label>
                    <div className="flex-1 flex space-x-4">
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) =>
                          handleInputChange("zipCode", e.target.value)
                        }
                        placeholder="Enter zip code"
                        className={`w-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.zipCode ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.zipCode}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        <label className="w-32 text-sm font-medium text-gray-700">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) =>
                            handleInputChange("country", e.target.value)
                          }
                          placeholder="Enter country"
                          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.country
                              ? "border-red-500"
                              : "border-gray-500"
                          }`}
                        />
                      </div>
                      {errors.country && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={() => setIsFieldCustomizerOpen(true)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Icon name="Settings" size={16} />
            <span className="text-sm font-medium">Customize Fields</span>
          </button>

          <div className="flex items-center space-x-4">
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
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {mode === "create" ? "Save" : "Update"}
            </Button>
          </div>
        </div>
      </div>

      <CompanyFieldCustomizer
        module="companies"
        isOpen={isFieldCustomizerOpen}
        onClose={() => setIsFieldCustomizerOpen(false)}
      />
    </>
  );
};

export default CompanySlideForm;
