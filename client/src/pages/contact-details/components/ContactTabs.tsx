import React, { useState } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const ContactTabs = ({
  contact,
  notes,
  deals,
  onAddNote,
}: {
  contact: any;
  notes: any[];
  deals: any[];
  onAddNote: (note: any) => void;
}) => {
  const [activeTab, setActiveTab] = useState("activities");
  const [newNote, setNewNote] = useState("");

  const tabs = [
    { id: "activities", label: "Activities", icon: "Activity" },
    { id: "deals", label: "Deals", icon: "DollarSign" },
    { id: "notes", label: "Notes", icon: "FileText" },
    { id: "files", label: "Files", icon: "Paperclip" },
  ];

  const activities = [
    {
      id: 1,
      type: "call",
      title: "Outbound call completed",
      description:
        "Discussed project requirements and timeline. Follow-up scheduled for next week.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      user: "John Smith",
      duration: "15 minutes",
    },
    {
      id: 2,
      type: "email",
      title: "Email sent",
      description: "Sent proposal document and pricing information.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      user: "John Smith",
    },
    {
      id: 3,
      type: "meeting",
      title: "Demo meeting",
      description:
        "Product demonstration completed. Client showed strong interest.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      user: "Sarah Johnson",
      duration: "45 minutes",
    },
  ];

  // const deals = [
  //   {
  //     id: 1,
  //     name: "Enterprise Software License",
  //     value: 75000,
  //     stage: "proposal",
  //     probability: 75,
  //     closeDate: "2025-02-15",
  //     owner: "John Smith",
  //   },
  //   {
  //     id: 2,
  //     name: "Consulting Services",
  //     value: 25000,
  //     stage: "negotiation",
  //     probability: 60,
  //     closeDate: "2025-01-30",
  //     owner: "Sarah Johnson",
  //   },
  // ];

  const files = [
    {
      id: 1,
      name: "Proposal_TechCorp_2025.pdf",
      size: "2.4 MB",
      type: "pdf",
      uploadedBy: "John Smith",
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      name: "Contract_Draft_v2.docx",
      size: "156 KB",
      type: "docx",
      uploadedBy: "Sarah Johnson",
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "call":
        return "Phone";
      case "email":
        return "Mail";
      case "meeting":
        return "Calendar";
      default:
        return "Activity";
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return "FileText";
      case "docx":
        return "FileText";
      case "xlsx":
        return "FileSpreadsheet";
      default:
        return "File";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const newNoteObj = {
        content: newNote,
        type: "general" as const,
      };
      onAddNote(newNoteObj);
      setNewNote("");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "activities":
        return (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon
                    name={getActivityIcon(activity.type)}
                    size={16}
                    className="text-primary"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">
                      {activity.title}
                    </h4>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span>by {activity.user}</span>
                    {activity.duration && (
                      <span>Duration: {activity.duration}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "deals":
        return (
          <div className="space-y-4">
            {deals && deals.length > 0 ? (
              deals.map((deal) => (
                <div key={deal.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-foreground">{deal.name || deal.title}</h4>
                    <span className="text-lg font-semibold text-foreground">
                      {formatCurrency(deal.value)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Stage</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full font-medium capitalize ${
                          deal.stageId === "Lead" || deal.stageName === "Lead"
                            ? "bg-red-100 text-red-800"
                            : deal.stageId === "Qualified" || deal.stageName === "Qualified"
                            ? "bg-orange-100 text-orange-800"
                            : deal.stageId === "Proposal" || deal.stageName === "Proposal"
                            ? "bg-yellow-100 text-yellow-800"
                            : deal.stageId === "Negotiation" || deal.stageName === "Negotiation"
                            ? "bg-blue-100 text-blue-800"
                            : deal.stageId === "Closed Won" || deal.stageName === "Closed Won"
                            ? "bg-green-100 text-green-800"
                            : deal.stageId === "Closed Lost" || deal.stageName === "Closed Lost"
                            ? "bg-gray-100 text-gray-800"
                            : deal.stageId === "Onboarding" || deal.stageName === "Onboarding"
                            ? "bg-blue-100 text-blue-800"
                            : deal.stageId === "Implementation" || deal.stageName === "Implementation"
                            ? "bg-amber-100 text-amber-800"
                            : deal.stageId === "Go-Live" || deal.stageName === "Go-Live"
                            ? "bg-red-100 text-red-800"
                            : deal.stageId === "Success" || deal.stageName === "Success"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {deal.stageId || deal.stageName || deal.stage}
                      </span>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Probability</p>
                      <p className="font-medium text-foreground">
                        {deal.probability}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Close Date</p>
                      <p className="font-medium text-foreground">
                        {deal.expectedCloseDate ? formatDate(new Date(deal.expectedCloseDate)) : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Owner</p>
                      <p className="font-medium text-foreground">{deal.assignedTo || deal.owner || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No deals found for this contact.</p>
              </div>
            )}
          </div>
        );

      case "notes":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <Input
                label="Add New Note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter your note here..."
                className="mb-3"
              />
              <Button
                onClick={handleAddNote}
                iconName="Plus"
                iconPosition="left"
              >
                Add Note
              </Button>
            </div>

            {notes.map((note) => (
              <div key={note.id} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">
                    {note.user}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(note.timestamp)}
                  </span>
                </div>
                <div className="text-sm text-foreground whitespace-pre-line">
                  {note.content}
                </div>
              </div>
            ))}
          </div>
        );

      case "files":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-border">
              <div className="text-center">
                <Icon
                  name="Upload"
                  size={32}
                  className="mx-auto text-muted-foreground mb-2"
                />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop files here or
                </p>
                <Button variant="outline" size="sm">
                  Choose Files
                </Button>
              </div>
            </div>

            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon
                    name={getFileIcon(file.type)}
                    size={16}
                    className="text-primary"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{file.size}</span>
                    <span>•</span>
                    <span>Uploaded by {file.uploadedBy}</span>
                    <span>•</span>
                    <span>{formatDate(file.uploadedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Download"
                  ></Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="MoreHorizontal"
                  ></Button>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 w-full">
      {/* Tab Navigation */}
      <div className="border-b border-border overflow-x-auto">
        <nav
          className="flex space-x-6 px-4 sm:space-x-8 sm:px-6"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-smooth ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">{renderTabContent()}</div>
    </div>
  );
};

export default ContactTabs;
