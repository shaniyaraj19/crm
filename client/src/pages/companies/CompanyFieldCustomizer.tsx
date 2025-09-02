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
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editForm, setEditForm] = useState({
    label: "",
    type: "text" as "text" | "email" | "phone" | "number" | "date" | "select" | "textarea",
    required: false,
    options: [] as string[],
  });
  const [createForm, setCreateForm] = useState({
    label: "",
    type: "text" as "text" | "email" | "phone" | "number" | "date" | "select" | "textarea",
    required: false,
    options: [] as string[],
  });

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

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    setDraggedOverIndex(index ?? null);
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetSection: string, targetIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("🎯 Drop event triggered:", { draggedField, targetSection, targetIndex });
    
    if (draggedField) {
      if (!draggedField.visible) {
        // Make hidden field visible
        console.log("📝 Making hidden field visible:", draggedField.name);
        updateField(module, draggedField.id, { visible: true });
      } else {
        // Reorder existing field
        console.log("🔄 Reordering field:", draggedField.name);
        const currentFields = moduleFields.filter(f => f.visible);
        const draggedIndex = currentFields.findIndex(f => f.id === draggedField.id);
        
        console.log("📍 Current positions:", { draggedIndex, targetIndex });
        
        if (draggedIndex !== -1 && targetIndex !== undefined && draggedIndex !== targetIndex) {
          const newFields = [...currentFields];
          const [movedField] = newFields.splice(draggedIndex, 1);
          newFields.splice(targetIndex, 0, movedField);
          
          console.log("🔄 New field order:", newFields.map(f => f.name));
          
          // Update order for all fields
          newFields.forEach((field, index) => {
            updateField(module, field.id, { order: index });
          });
        }
      }
      setDraggedField(null);
      setDraggedOverIndex(null);
    }
  };

  const handleRemoveField = (field: Field) => {
    if (!field.required) {
      console.log("🔧 Removing field:", field.name);
      updateField(module, field.id, { visible: false });
      console.log("🔧 Field removed, current fields:", fields);
    }
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
    setEditForm({
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options || [],
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editingField) {
      updateField(module, editingField.id, {
        label: editForm.label,
        type: editForm.type,
        required: editForm.required,
        options: editForm.options,
      });
      setShowEditModal(false);
      setEditingField(null);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingField(null);
    setEditForm({
      label: "",
      type: "text",
      required: false,
      options: [],
    });
  };

  const addOption = () => {
    setEditForm({
      ...editForm,
      options: [...editForm.options, ""],
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...editForm.options];
    newOptions[index] = value;
    setEditForm({
      ...editForm,
      options: newOptions,
    });
  };

  const removeOption = (index: number) => {
    const newOptions = editForm.options.filter((_, i) => i !== index);
    setEditForm({
      ...editForm,
      options: newOptions,
    });
  };

  const handleCreateField = () => {
    setCreateForm({
      label: "",
      type: "text",
      required: false,
      options: [],
    });
    setShowCreateModal(true);
  };

  const handleSaveCreate = () => {
    if (createForm.label) {
      const customFieldName = `customField${Date.now()}`;
      console.log("🔧 Adding custom field:", customFieldName);
      addField(module, {
        name: customFieldName,
        label: createForm.label,
        type: createForm.type,
        required: createForm.required,
        visible: true,
        editable: true,
        options: createForm.options,
        isCustom: true,
      });
      console.log("🔧 Custom field added, current fields:", fields);
      setShowCreateModal(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
    setCreateForm({
      label: "",
      type: "text",
      required: false,
      options: [],
    });
  };

  const addCreateOption = () => {
    setCreateForm({
      ...createForm,
      options: [...createForm.options, ""],
    });
  };

  const updateCreateOption = (index: number, value: string) => {
    const newOptions = [...createForm.options];
    newOptions[index] = value;
    setCreateForm({
      ...createForm,
      options: newOptions,
    });
  };

  const removeCreateOption = (index: number) => {
    const newOptions = createForm.options.filter((_, i) => i !== index);
    setCreateForm({
      ...createForm,
      options: newOptions,
    });
  };

  const handleDeleteUnusedField = (field: Field) => {
    if (field.isCustom) {
      if (window.confirm(`Are you sure you want to permanently delete the field "${field.label}"? This action cannot be undone.`)) {
        deleteField(module, field.id);
      }
    } else {
      alert("Default fields cannot be deleted. You can only hide them from view.");
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
                  onClick={handleCreateField}
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
                      onDragOver={(e) => handleDragOver(e)}
                      onDrop={(e) => handleDrop(e, sectionName)}
                    >
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        {sectionName}
                      </h4>
                      <div className="space-y-2">
                        {sectionFields.map((field, index) => (
                          <div
                            key={field.id}
                            className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                              draggedOverIndex === index
                                ? "bg-blue-100 border-blue-300"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            } ${draggedField?.id === field.id ? "opacity-50" : ""}`}
                            draggable
                            onDragStart={() => handleDragStart(field)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, sectionName, index)}
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
                            <div className="flex items-center space-x-2">
                              {field.required && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                               Required
                                </span>
                              )}
                              <button
                                onClick={() => handleEditField(field)}
                                className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                                title="Edit field"
                              >
                                <Icon name="Edit" size={16} />
                              </button>
                              <button
                                onClick={() => handleRemoveField(field)}
                                className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                                title="Remove field"
                              >
                                <Icon name="Trash2" size={16} />
                              </button>
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

            <div 
              className="flex-1 overflow-y-auto p-4"
              onDragOver={(e) => handleDragOver(e)}
              onDrop={(e) => handleDrop(e, "unused")}
            >
              <div className="space-y-2">
                {filteredHiddenFields.map((field) => (
                  <div
                    key={field.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      draggedField?.id === field.id 
                        ? "opacity-50 bg-blue-50 border-blue-300" 
                        : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(field)}
                  >
                    <div 
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                      onClick={() =>
                        updateField(module, field.id, { visible: true })
                      }
                    >
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUnusedField(field);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                        title={field.isCustom ? "Delete field permanently" : "Default fields cannot be deleted"}
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
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

      {/* Edit Field Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Field</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Field Label
                </label>
                <input
                  type="text"
                  value={editForm.label}
                  onChange={(e) =>
                    setEditForm({ ...editForm, label: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 
                  required
                />
                
              </div>



              <div>
                <label className="block text-sm font-medium mb-1">
                  Field Type
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text">Single Line</option>
                  <option value="email">Email (Unique)</option>
                  <option value="phone">Phone</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Lookup</option>
                  <option value="textarea">Multi-line (Large)</option>
                </select>
              </div>

              {editForm.type === "select" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Options
                  </label>
                  <div className="space-y-2">
                    {editForm.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Option value"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <Icon name="Plus" size={16} />
                      <span>Add Option</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={editForm.required}
                  onChange={(e) =>
                    setEditForm({ ...editForm, required: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="required" className="text-sm font-medium">
                  Required Field
                </label>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Custom Field Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[102] flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Custom Field</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCreate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Field Label
                </label>
                <input
                  type="text"
                  value={createForm.label}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, label: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>



              <div>
                <label className="block text-sm font-medium mb-1">
                  Field Type
                </label>
                <select
                  value={createForm.type}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="text">Single Line</option>
                  <option value="email">Email (Unique)</option>
                  <option value="phone">Phone</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Lookup</option>
                  <option value="textarea">Multi-line (Large)</option>
                </select>
              </div>

              {createForm.type === "select" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Options
                  </label>
                  <div className="space-y-2">
                    {createForm.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateCreateOption(index, e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Option value"
                        />
                        <button
                          type="button"
                          onClick={() => removeCreateOption(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Icon name="Trash2" size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCreateOption}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <Icon name="Plus" size={16} />
                      <span>Add Option</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="createRequired"
                  checked={createForm.required}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, required: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="createRequired" className="text-sm font-medium">
                  Required Field
                </label>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="flex-1">
                  Create Field
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelCreate}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyFieldCustomizer;
