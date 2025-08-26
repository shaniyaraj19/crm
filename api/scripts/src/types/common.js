"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.CommunicationChannel = exports.ContactType = exports.DealStatus = exports.DealPriority = exports.ActivityStatus = exports.ActivityType = exports.Permission = exports.UserRole = void 0;
// User roles
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["SALES_REP"] = "sales_rep";
})(UserRole || (exports.UserRole = UserRole = {}));
// Permission types
var Permission;
(function (Permission) {
    // User permissions
    Permission["USER_CREATE"] = "user:create";
    Permission["USER_READ"] = "user:read";
    Permission["USER_UPDATE"] = "user:update";
    Permission["USER_DELETE"] = "user:delete";
    // Pipeline permissions
    Permission["PIPELINE_CREATE"] = "pipeline:create";
    Permission["PIPELINE_READ"] = "pipeline:read";
    Permission["PIPELINE_UPDATE"] = "pipeline:update";
    Permission["PIPELINE_DELETE"] = "pipeline:delete";
    // Deal permissions
    Permission["DEAL_CREATE"] = "deal:create";
    Permission["DEAL_READ"] = "deal:read";
    Permission["DEAL_UPDATE"] = "deal:update";
    Permission["DEAL_DELETE"] = "deal:delete";
    Permission["DEAL_ASSIGN"] = "deal:assign";
    // Contact permissions
    Permission["CONTACT_CREATE"] = "contact:create";
    Permission["CONTACT_READ"] = "contact:read";
    Permission["CONTACT_UPDATE"] = "contact:update";
    Permission["CONTACT_DELETE"] = "contact:delete";
    // Company permissions
    Permission["COMPANY_CREATE"] = "company:create";
    Permission["COMPANY_READ"] = "company:read";
    Permission["COMPANY_UPDATE"] = "company:update";
    Permission["COMPANY_DELETE"] = "company:delete";
    // Activity permissions
    Permission["ACTIVITY_CREATE"] = "activity:create";
    Permission["ACTIVITY_READ"] = "activity:read";
    Permission["ACTIVITY_UPDATE"] = "activity:update";
    Permission["ACTIVITY_DELETE"] = "activity:delete";
    // Report permissions
    Permission["REPORT_READ"] = "report:read";
    Permission["REPORT_CREATE"] = "report:create";
    // Admin permissions
    Permission["ADMIN_ACCESS"] = "admin:access";
    Permission["SYSTEM_SETTINGS"] = "system:settings";
})(Permission || (exports.Permission = Permission = {}));
// Activity types
var ActivityType;
(function (ActivityType) {
    ActivityType["TASK"] = "task";
    ActivityType["CALL"] = "call";
    ActivityType["MEETING"] = "meeting";
    ActivityType["EMAIL"] = "email";
    ActivityType["NOTE"] = "note";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
// Activity status
var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus["PENDING"] = "pending";
    ActivityStatus["IN_PROGRESS"] = "in_progress";
    ActivityStatus["COMPLETED"] = "completed";
    ActivityStatus["CANCELLED"] = "cancelled";
    ActivityStatus["OVERDUE"] = "overdue";
})(ActivityStatus || (exports.ActivityStatus = ActivityStatus = {}));
// Deal priority
var DealPriority;
(function (DealPriority) {
    DealPriority["LOW"] = "low";
    DealPriority["MEDIUM"] = "medium";
    DealPriority["HIGH"] = "high";
    DealPriority["URGENT"] = "urgent";
})(DealPriority || (exports.DealPriority = DealPriority = {}));
// Deal status
var DealStatus;
(function (DealStatus) {
    DealStatus["OPEN"] = "open";
    DealStatus["WON"] = "won";
    DealStatus["LOST"] = "lost";
    DealStatus["PENDING"] = "pending";
})(DealStatus || (exports.DealStatus = DealStatus = {}));
// Contact type
var ContactType;
(function (ContactType) {
    ContactType["LEAD"] = "lead";
    ContactType["PROSPECT"] = "prospect";
    ContactType["CUSTOMER"] = "customer";
    ContactType["PARTNER"] = "partner";
})(ContactType || (exports.ContactType = ContactType = {}));
// Communication channel
var CommunicationChannel;
(function (CommunicationChannel) {
    CommunicationChannel["EMAIL"] = "email";
    CommunicationChannel["PHONE"] = "phone";
    CommunicationChannel["SMS"] = "sms";
    CommunicationChannel["SOCIAL_MEDIA"] = "social_media";
    CommunicationChannel["IN_PERSON"] = "in_person";
    CommunicationChannel["VIDEO_CALL"] = "video_call";
})(CommunicationChannel || (exports.CommunicationChannel = CommunicationChannel = {}));
// Notification types
var NotificationType;
(function (NotificationType) {
    NotificationType["DEAL_ASSIGNED"] = "deal_assigned";
    NotificationType["DEAL_UPDATED"] = "deal_updated";
    NotificationType["DEAL_WON"] = "deal_won";
    NotificationType["DEAL_LOST"] = "deal_lost";
    NotificationType["ACTIVITY_DUE"] = "activity_due";
    NotificationType["ACTIVITY_OVERDUE"] = "activity_overdue";
    NotificationType["TEAM_INVITE"] = "team_invite";
    NotificationType["SYSTEM_ALERT"] = "system_alert";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
