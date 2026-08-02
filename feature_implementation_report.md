# ProcureTrack Feature Implementation Report – Nora Pham

## Introduction
ProcureTrack is a workforce and vendor onboarding workflow management platform built to centralize operational checkpoints. The application replaces scattered spreadsheets, manual checklists, and email threads with a structured system where tasks are assigned, progress is monitored, and documents are collected securely.

As the Notification System Lead, my primary focus was designing and constructing the core compliance auditing and communication engines of the platform. Specifically, I implemented the database infrastructure, background engines, services, and visual administration layouts for the **Audit Log & Activity History** and the **Notification & Reminder System**. These integrations are detailed below in five core components.

---

### 1. Audit Log Database Architecture
To satisfy enterprise compliance and regulatory audit requirements, I designed and implemented the database architecture for the **AuditLog Mongoose Schema**. This schema serves as the primary system of record for all major administrative and task lifecycle operations.

The model is built with the following structures:
*   **Actor Association**: A reference linking to the `User` document. It is set as optional (`required: false`) to gracefully accommodate candidate actions, such as public offer letter acceptances, where the candidate is not yet authenticated in the system.
*   **Target Resource Type**: Stores the entity category (`'Workflow' | 'Assignment' | 'User' | 'VendorBill' | 'OfferLetter'`) alongside a polymorphic `targetId` pointing to the exact document affected, enabling admins to track the history of specific templates or vendors.
*   **Action Classification**: Categorizes actions into precise event tags (e.g., `workflow_created`, `task_completed`, `document_uploaded`, `vendor_bill_status_changed`) to facilitate high-speed querying.
*   **Structured Event Metadata**: An arbitrary `Schema.Types.Mixed` field storing key-value parameters detailing the event state (such as version diffs, due dates, or status transitions) to provide detailed logs without rigid schemas.

---

### 2. Centralized Notification Service (In-App & Email)
To eliminate manual follow-ups, I co-designed and implemented the **Centralized Notification Service** on the backend. This service coordinates real-time communications when onboarding events occur.

The notification service exposes two core operational channels:
*   **In-App Alerts**: Inserts live notifications into the database, which are automatically polled by the frontend client layout. These notifications display dynamic, context-specific badges and redirect links (such as `/assignments/:id`) so users can access their tasks with a single click.
*   **Non-Blocking Email Dispatcher**: Utilizes simulated or SendGrid email transport to send notifications. It compiles variables (such as Candidate Name, Workflow Name, and Due Dates) into clean email templates. The dispatcher runs asynchronously using Javascript Promise blocks, ensuring that minor network latency from email providers does not block API requests.

---

### 3. Automated Reminder & Escalation Engine (Cron Scanning)
To prevent tasks from stalling, I developed the logic for the **Automated Reminder and Escalation Engine**. This backend logic acts as a background scanner to flag late tasks or missing documentation.

The engine executes an automated database scan:
*   **Overdue Checklists**: It queries active assignments where the due date has passed. It sends an alert directly to the assignee and notifies the HR staff member who initiated the onboarding workflow.
*   **Missing Documents Check**: It scans completed document tasks to ensure file attachments are attached. If a document checklist is checked but the file path is empty, it raises a missing document alert.
*   **Throttling Guard**: To prevent spamming users, the engine logs the `lastReminderSentAt` date. It restricts automated emails to a 24-hour interval. Admins can bypass this throttling guard in the "Scenario Sandbox" interface for instant manual escalation.

---

### 4. Asynchronous Audit Logger & Controller Middleware
To record activities without impacting system performance, I developed the **Asynchronous Audit Logging helper** and protected endpoints.

*   **Non-Blocking Logger**: Created the `AuditLogService.logAction` helper. It wraps Mongoose creation operations in a try-catch block and executes them in the background. If a database write fails during an audit log, the error is caught in logs, ensuring the main user task (like completing a step or submitting a bill) proceeds uninterrupted.
*   **Security Middleware Guards**: Exposed the `GET /api/audit-logs` endpoint. It uses JWT authentication and role validation filters, restricting access to `Admin` and `HR` users to prevent data leaks.
*   **Controller Instrumentation**: Injected hooks into our APIs. It captures workflow edits (version changes), task completions, document uploads, offer letter actions (creation, revocation, public responses), and vendor bill status edits.

---

### 5. Interactive Audit Logs Hub & Delivery Control Panel
To provide administrators with full visibility, I designed and developed the admin **Audit Logs Hub** on the frontend using React and Tailwind CSS.

The frontend layout includes several administration tools:
*   **Summary Cards**: Quick-reference cards at the top displaying counters for Total Events, Workflow Changes, Task Completions, and Financial Audits.
*   **Advanced Filtering Controls**: Provides real-time search inputs that match actor names, emails, or action descriptions. It also includes category tabs to isolate specific activities and date-range inputs.
*   **Collapsible Metadata Inspector**: An accordion table layout where administrators can click any log entry to expand and view the formatted JSON metadata block, making it easy to audit the exact details of any system modification.
*   **CSV Log Exporter**: A client-side data compilation script that converts the current table results into standard CSV compliance documents for quick local downloads.
