# Projects Management

## Overview

The Projects section is the central hub for managing all geotechnical projects in GIMS. Here, you can create new projects, track their progress, manage client relationships, and oversee the complete billing lifecycle from quotation to payment.

Projects serve as the foundation for all other activities in the system - they connect clients, enable billing workflows, and track project milestones through a comprehensive lifecycle management system.

**Key Features:**

- Create and manage multiple projects simultaneously
- Link projects to clients and contact persons
- Track project progress through billing stages
- Generate quotations and manage payments
- Update project details and timelines

---

## Project Creation

### Getting Started

Creating a new project is the first step in managing any geotechnical work. The project creation process is designed to be simple and intuitive, guiding you through essential information setup.

**Screenshot Suggestion:** _Show the "Create New Project" button on the projects list page, highlighting the prominent placement and clear call-to-action._

### Step 1: Project Details

When creating a new project, you'll start with basic project information:

#### Project Name

- **Purpose:** Identifies your project in the system
- **Best Practice:** Use descriptive names like "Nakawa Power Lines" or "Kampala Road Foundation"
- **Character Limit:** Keep names concise but meaningful

#### Project ID

- **Auto-Generated:** System creates unique IDs in format `P2024-XXXXX`
- **Format:** P + Year + Random 5-digit number
- **Example:** P2024-12345
- **Note:** This ID cannot be changed after creation

#### Project Dates (Optional)

- **Start Date:** When project work begins
- **End Date:** Expected project completion
- **Validation:** End date must be after start date
- **Flexibility:** Can be updated later if timelines change

**Screenshot Suggestion:** _Show the project details form with sample data filled in, highlighting the auto-generated ID and date picker interface._

### Step 2: Client Management

Every project requires at least one client. You have two options for adding clients:

#### Option 1: Create New Client

- **Client Name:** Enter the full company or organization name
- **Client ID:** Auto-generated in format `C-XXXXX`
- **Use Case:** For new clients not yet in the system

#### Option 2: Select Existing Client

- **Search Function:** Find clients by name
- **Dropdown Selection:** Choose from existing client database
- **Use Case:** For repeat clients or established relationships

**Screenshot Suggestion:** _Show the client selection interface with both "Create New Client" and "Choose Existing" options clearly visible, with a sample client search dropdown._

### Form Validation

The system includes real-time validation to ensure data quality:

- **Required Fields:** Project name and at least one client
- **Client Validation:** New clients require names, existing clients must be selected
- **Date Validation:** End dates must be after start dates
- **Error Messages:** Clear, helpful error messages guide corrections

**Screenshot Suggestion:** _Show validation error messages in action, demonstrating how the system guides users to fix issues._

---

## Project List View

### Understanding Your Projects

The projects list provides an overview of all your active projects with key information at a glance.

#### Project Status Categories

**In Progress**

- Projects currently being worked on
- Default view showing active projects
- Includes projects at any stage of development

**Quoted**

- Projects with quotations created and sent
- Shows projects ready for client response
- Helps track quotation pipeline

**Completed**

- Finished projects
- Archived for reference and reporting
- Maintains historical project data

**Screenshot Suggestion:** _Show the projects list with tabs clearly visible, displaying different project statuses and the clean, organized table layout._

#### Project Information Display

Each project row shows:

- **Project Name:** Primary identifier
- **Project ID:** Unique system identifier
- **Client(s):** Associated client names
- **Status:** Current billing stage
- **Dates:** Start and end dates
- **Actions:** Quick access buttons

**Screenshot Suggestion:** _Close-up of a project row showing all the key information fields and action buttons._

---

## Project Details Page

### Navigating Project Information

The project details page is your command center for managing individual projects. It's organized into five main tabs, each focusing on specific aspects of project management.

**Screenshot Suggestion:** _Show the full project details page header with project ID badge, project name, and the tab navigation bar._

### Project Tab

The Project tab contains core project information that can be updated as needed.

#### Project Name Management

- **Current Name:** Display of existing project name
- **Edit Function:** Click to modify project name
- **Save Action:** Immediate save with success confirmation
- **Use Case:** Update names as project scope changes

#### Date Management

- **Current Dates:** Display of start and end dates
- **Calendar Interface:** Easy date selection
- **Timeline Updates:** Modify dates as project progresses
- **Validation:** System ensures logical date ranges

**Screenshot Suggestion:** _Show the Project tab with editable forms, highlighting the save buttons and success messages._

### Client Tab

The Client tab manages all client-related information and contact persons.

#### Client Cards

Each client associated with the project is displayed in its own card:

- **Client Number:** Sequential numbering (1, 2, 3...)
- **Client Name:** Primary client identifier
- **Edit Options:** Modify client names
- **Remove Option:** Delete clients (if multiple exist)

#### Contact Person Management

- **Contact Table:** Lists all contact persons for each client
- **Add Contacts:** Create new contact persons
- **Edit Contacts:** Update existing contact information
- **Remove Contacts:** Delete contacts from projects
- **Contact Details:** Name, email, phone, role information

**Screenshot Suggestion:** _Show the Client tab with multiple client cards, contact tables, and the various action buttons for managing contacts._

### Billing Tab

The Billing tab integrates the complete billing lifecycle, showing your project's progress through quotation and payment stages.

#### Billing Lifecycle Visualization

The system displays a visual progress bar showing five main stages:

1. **Quotation Preparation** - Creating project quotations
2. **Quotation Sent** - Delivering quotations to clients
3. **Client Feedback** - Awaiting client response
4. **Invoice Generated** - Creating invoices from approved quotations
5. **Payment Processing** - Managing payments and collections

#### Interactive Elements

- **Create Quotation:** Start the billing process
- **Send Quotation:** Deliver quotations to clients
- **Respond to Quotation:** Client response interface
- **Make Payment:** Payment submission forms
- **View Payments:** Payment history and status

**Screenshot Suggestion:** _Show the billing lifecycle with the progress bar, current stage highlighted, and interactive buttons available for the current stage._

#### Quotation File Management

- **File Display:** View quotation documents
- **Download Options:** Access PDF files
- **File Information:** Size, type, creation date

**Screenshot Suggestion:** _Show the quotation file component with download button and file information display._

### Sample Receipt Tab

This tab is prepared for future sample management functionality:

- **Current Status:** Disabled/placeholder
- **Future Features:** Sample tracking, receipt verification, quality control
- **Purpose:** Will integrate with laboratory sample management

**Screenshot Suggestion:** _Show the disabled Sample Receipt tab with placeholder content._

### Danger Tab

The Danger tab handles project deletion with appropriate safeguards:

#### Deletion Process

- **Warning Display:** Clear warning about permanent deletion
- **Data Impact:** Explains what will be deleted
- **Confirmation Required:** Multiple confirmation steps
- **Irreversible Action:** Emphasizes permanent nature

#### What Gets Deleted

- Project data and information
- Associated files and documents
- Quotations and invoices
- Client relationships
- Payment history

**Screenshot Suggestion:** _Show the Danger tab with the warning message and delete confirmation dialog._

---

## Billing Integration

### Understanding Billing Stages

The billing system automatically determines your project's current stage based on quotation status:

#### Stage Determination Logic

- **No Quotation:** Stage 1 (Quotation Preparation)
- **Draft Quotation:** Stage 1 (Quotation Preparation)
- **Sent Quotation:** Stage 2 (Quotation Sent)
- **Accepted Quotation:** Stage 3 (Client Feedback)
- **Rejected Quotation:** Stage 3 (Client Feedback + Rejection)
- **Invoiced:** Stage 4 (Invoice Generated)
- **Partially Paid:** Stage 5 (Payment Processing)
- **Fully Paid:** Stage 5 (Payment Complete)

**Screenshot Suggestion:** _Show a visual diagram of the billing stage progression with different statuses highlighted._

### Billing Workflow Integration

Projects seamlessly integrate with the billing workflow:

1. **Project Creation** → Ready for quotation
2. **Quotation Creation** → Links quotation to project
3. **Client Response** → Updates project status
4. **Invoice Generation** → Creates billing documents
5. **Payment Processing** → Tracks financial progress

**Screenshot Suggestion:** _Show the integration between project details and billing lifecycle, highlighting how project data flows into billing._

---

## Best Practices

### Project Naming Conventions

**Effective Project Names:**

- Use descriptive, specific names
- Include location or client identifier
- Keep names concise but meaningful
- Examples: "Nakawa Power Lines Foundation", "Kampala Road Soil Analysis"

**Avoid:**

- Generic names like "Project 1" or "Test"
- Overly long names that are hard to read
- Special characters or symbols

### Client Management

**Client Organization:**

- Use full company names for clarity
- Maintain consistent naming across projects
- Regularly review and update client information
- Keep contact person information current

### Date Management

**Timeline Best Practices:**

- Set realistic start and end dates
- Update dates as project scope changes
- Use dates for project planning and reporting
- Consider seasonal factors for field work

### Billing Workflow

**Quotation Management:**

- Create quotations promptly after project setup
- Review quotations before sending to clients
- Track client responses and follow up as needed
- Maintain clear communication throughout the process

---

## Troubleshooting

### Common Issues

#### Project Creation Problems

**Issue:** Cannot create project

- **Check:** All required fields are filled
- **Verify:** Client information is complete
- **Solution:** Review error messages and correct validation issues

**Issue:** Project ID conflicts

- **Cause:** System-generated IDs are unique
- **Solution:** Refresh page to get new ID

#### Client Management Issues

**Issue:** Cannot add existing client

- **Check:** Client exists in system
- **Verify:** Search spelling is correct
- **Solution:** Create new client if not found

**Issue:** Contact person not appearing

- **Check:** Contact is linked to correct client
- **Verify:** Contact information is complete
- **Solution:** Refresh page or re-add contact

#### Billing Stage Problems

**Issue:** Billing stage not updating

- **Check:** Quotation status is correct
- **Verify:** Project has associated quotation
- **Solution:** Refresh page or check quotation status

**Issue:** Cannot create quotation

- **Check:** Project has required information
- **Verify:** Client information is complete
- **Solution:** Complete project setup first

### Getting Help

If you encounter issues not covered in this guide:

1. **Check Error Messages:** System provides specific error information
2. **Review Validation:** Ensure all required fields are completed
3. **Refresh Page:** Sometimes resolves temporary display issues
4. **Contact Support:** Reach out to system administrators for complex issues

---

## Next Steps

After setting up your project:

1. **Complete Project Details:** Add any missing information
2. **Manage Clients:** Ensure all client information is current
3. **Create Quotation:** Begin the billing process
4. **Track Progress:** Monitor project through billing stages
5. **Manage Payments:** Handle client payments and collections

The Projects section provides a comprehensive foundation for managing your geotechnical work from initial setup through completion and payment.
