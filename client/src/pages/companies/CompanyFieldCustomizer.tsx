import React, { useState } from "react";
import { useFields, Field } from "../../contexts/FieldsContext";

import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";

interface FieldCustomizerProps {
  module: "contacts" | "companies" | "products";
  isOpen: boolean;
  onClose: () => void;
}

const CompanyFieldCustomizer: React.FC<FieldCustomizerProps> = ({
  module,
  isOpen,
  onClose,
}) => {
  const { fields, addField, updateField, deleteField, reorderFields } =
    useFields();
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedField, setDraggedField] = useState<Field | null>(null);

  const moduleFields: Field[] = (fields?.[module] ?? []).sort(
    (a, b) => a.order - b.order
  );
  if (!isOpen) return null;

  //   const moduleFields = fields[module].sort((a, b) => a.order - b.order);
  const visibleFields = moduleFields.filter((field) => field.visible);
  const hiddenFields = moduleFields.filter((field) => !field.visible);

  // Debug logging to help troubleshoot field visibility
  if (module === "contacts") {
    console.log("🔍 Field Customizer Debug - Contacts Module:");
    console.log("All fields:", moduleFields);
    console.log("Visible fields:", visibleFields);
    console.log("Hidden fields:", hiddenFields);
    console.log(
      "homePhone field:",
      moduleFields.find((f) => f.name === "homePhone")
    );
    console.log(
      "emailOptOut field:",
      moduleFields.find((f) => f.name === "emailOptOut")
    );
  }

  // Filter hidden fields by search term
  const filteredHiddenFields = hiddenFields.filter((field) =>
    field.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Field type labels mapping
  const getFieldTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      text: "Single Line",
      email: "Email (Unique)",
      phone: "Phone",
      number: "Number",
      date: "Date",
      select: "Lookup",
      textarea: "Multi-line (Large)",
      checkbox: "Checkbox",
    };
    return typeMap[type] || "Single Line";
  };

  // Organize visible fields into sections
  const fieldSections = {
    "Company Information": visibleFields.filter((field) =>
      ["firstName", "lastName", "title", "email", "phone", "company"].includes(
        field.name
      )
    ),
    "Additional Company Fields": visibleFields.filter((field) =>
      ["mobile", "homePhone", "description"].includes(field.name)
    ),
    "Preferences & Settings": visibleFields.filter((field) =>
      ["emailOptOut", "status"].includes(field.name)
    ),
    "Custom Fields": visibleFields.filter((field) => field.isCustom),
  };

  const handleDragStart = (field: Field) => {
    setDraggedField(field);
  };

  const handleDrop = (targetSection: string) => {
    if (draggedField && !draggedField.visible) {
      updateField(module, draggedField.id, { visible: true });
      setDraggedField(null);
    }
  };

  const handleRemoveField = (field: Field) => {
    if (!field.required) {
      console.log("🔧 Removing field:", field.name);
      updateField(module, field.id, { visible: false });
      console.log("🔧 Field removed, current fields:", fields);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-6xl bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit {module.charAt(0).toUpperCase() + module.slice(1)} Fields
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon name="X" size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Active Fields */}
          <div className="flex-1 bg-white overflow-y-auto">
            <div className="p-6">
              {/* Custom Field Button */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Active Fields
                </h3>
                <Button
                  onClick={() => {
                    const customFieldName = `customField${Date.now()}`;
                    console.log("🔧 Adding custom field:", customFieldName);
                    addField(module, {
                      name: customFieldName,
                      label: "New Custom Field",
                      type: "text",
                      required: false,
                      visible: true,
                      editable: true,
                      options: [],
                      isCustom: true,
                    });
                    console.log("🔧 Custom field added, current fields:", fields);
                  }}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Icon name="Plus" size={16} />
                  <span>Custom Field</span>
                </Button>
              </div>

              {/* Field Sections */}
              {Object.entries(fieldSections).map(
                ([sectionName, sectionFields]) =>
                  sectionFields.length > 0 && (
                    <div
                      key={sectionName}
                      className="mb-8"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(sectionName)}
                    >
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        {sectionName}
                      </h4>
                      <div className="space-y-2">
                        {sectionFields.map((field) => (
                          <div
                            key={field.id}
                            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                            draggable
                            onDragStart={() => handleDragStart(field)}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon
                                name="GripVertical"
                                size={16}
                                className="text-gray-400 cursor-move"
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {field.label}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {getFieldTypeLabel(field.type)}
                                </div>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) =>
                                updateField(module, field.id, {
                                  label: e.target.value,
                                })
                              }
                              className="font-medium text-gray-900 bg-transparent border-b border-dashed border-transparent focus:border-gray-400 focus:outline-none"
                            />

                            <div className="flex items-center space-x-2">
                              {!field.required && (
                                <button
                                  onClick={() => handleRemoveField(field)}
                                  className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                                  title="Remove field"
                                >
                                  <Icon name="X" size={16} />
                                </button>
                              )}
                              {field.required && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>

          {/* Right Panel - Unused Fields */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Unused Fields
              </h3>
              <div className="relative">
                <Icon
                  name="Search"
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Icon name="X" size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredHiddenFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    draggable
                    onDragStart={() => handleDragStart(field)}
                    onClick={() =>
                      updateField(module, field.id, { visible: true })
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        name="GripVertical"
                        size={16}
                        className="text-gray-400"
                      />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {field.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getFieldTypeLabel(field.type)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              Used Custom Fields:{" "}
              <span className="font-medium">
                {moduleFields.filter((f) => f.isCustom).length}/25
              </span>
            </p>
            {module === "companies" && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Reset all contact fields to defaults? This will clear any customizations."
                    )
                  ) {
                    localStorage.removeItem("crm-fields-config");
                    window.location.reload();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 underline"
                title="Reset fields to defaults"
              >
                Reset to Defaults
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={onClose} variant="default">
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyFieldCustomizer;
