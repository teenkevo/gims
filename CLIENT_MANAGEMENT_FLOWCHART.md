# GIMS Client Management - Detailed Flowchart

## Mermaid Flowchart Diagram

```mermaid
flowchart TD
    Start([Admin navigates to Clients page]) --> ClientsList[Display Clients List]

    ClientsList --> ClientAction{Client Action?}

    ClientAction -->|Create New Client| CreateClient[Create New Client]
    ClientAction -->|View Client Details| ClientDetails[View Client Details]

    CreateClient --> EnterClientName[Enter Client Name]
    EnterClientName --> GenerateClientID[Auto-generate Client ID<br/>Format: C-XXXXX]
    GenerateClientID --> SubmitClientForm[Submit Client Form]
    SubmitClientForm --> ClientCreated[Client Created Successfully]
    ClientCreated --> ClientsList

    ClientDetails --> ClientTabs[Client Details Page]

    ClientTabs --> TabSelection{Select Tab?}

    TabSelection -->|Client Profile| ClientProfileTab[Client Profile Tab]
    TabSelection -->|Projects| ProjectsTab[Projects Tab]
    TabSelection -->|Danger| DangerTab[Danger Tab]

    ClientProfileTab --> ProfileActions{Profile Action?}

    ProfileActions -->|Edit Client Name| EditClientName[Edit Client Name]
    ProfileActions -->|Manage Contacts| ContactManagement[Contact Management]

    EditClientName --> UpdateClientInfo[Update Client Information]
    UpdateClientInfo --> ClientUpdated[Client Information Updated]
    ClientUpdated --> ClientProfileTab

    ContactManagement --> ContactTable[Contact Persons Table]

    ContactTable --> ContactAction{Contact Action?}

    ContactAction -->|Add Contact| AddContact[Add New Contact Person]
    ContactAction -->|Edit Contact| EditContact[Edit Contact Person]
    ContactAction -->|Delete Single| DeleteSingleContact[Delete Single Contact]
    ContactAction -->|Select Multiple| SelectMultipleContacts[Select Multiple Contacts]

    AddContact --> ContactForm[Contact Creation Form]
    ContactForm --> EnterContactDetails[Enter Contact Details<br/>- Name<br/>- Email<br/>- Phone<br/>- Designation]
    EnterContactDetails --> SubmitContactForm[Submit Contact Form]
    SubmitContactForm --> ContactCreated[Contact Person Created]
    ContactCreated --> ContactTable

    EditContact --> EditContactForm[Contact Edit Form]
    EditContactForm --> ModifyContactDetails[Modify Contact Details]
    ModifyContactDetails --> SubmitEditForm[Submit Updated Information]
    SubmitEditForm --> ContactUpdated[Contact Person Updated]
    ContactUpdated --> ContactTable

    DeleteSingleContact --> CheckProjectParticipation{Contact in Projects?}

    CheckProjectParticipation -->|No| DeleteContact[Delete Contact Person]
    CheckProjectParticipation -->|Yes| ShowWarning[Show Warning Message<br/>Display Project Links]

    DeleteContact --> ContactDeleted[Contact Deleted Successfully]
    ContactDeleted --> ContactTable

    ShowWarning --> ContactTable

    SelectMultipleContacts --> MultipleSelection[Multiple Contacts Selected]
    MultipleSelection --> DeleteMultiple[Delete Selected Contacts]

    DeleteMultiple --> CheckEachContact[Check Each Contact for<br/>Project Participation]
    CheckEachContact --> SeparateContacts[Separate Contacts into Groups]

    SeparateContacts --> ContactsNotInProjects[Contacts NOT in Projects<br/>Can be deleted]
    SeparateContacts --> ContactsInProjects[Contacts IN Projects<br/>Cannot be deleted]

    ContactsNotInProjects --> ShowDeletionDialog[Show Deletion Dialog<br/>with Both Groups]
    ContactsInProjects --> ShowDeletionDialog

    ShowDeletionDialog --> ConfirmDeletion{Confirm Deletion?}

    ConfirmDeletion -->|Yes| DeleteEligibleContacts[Delete Eligible Contacts]
    ConfirmDeletion -->|No| ContactTable

    DeleteEligibleContacts --> ContactsDeleted[Eligible Contacts Deleted]
    ContactsDeleted --> ContactTable

    ProjectsTab --> ProjectActions{Project Action?}

    ProjectActions -->|View Projects| ViewProjects[View Client's Projects]
    ProjectActions -->|Create Project| CreateProject[Create New Project]

    ViewProjects --> ProjectsTable[Projects Table]
    ProjectsTable --> ClickProject[Click on Project]
    ClickProject --> ProjectDetails[Navigate to Project Details]

    CreateProject --> ProjectForm[Project Creation Form]
    ProjectForm --> EnterProjectDetails[Enter Project Details<br/>- Project Name<br/>- Date Range<br/>- Priority]
    EnterProjectDetails --> GenerateProjectID[Auto-generate Project ID<br/>Format: P2024-XXXXX]
    GenerateProjectID --> SubmitProjectForm[Submit Project Form]
    SubmitProjectForm --> ProjectCreated[Project Created Successfully]
    ProjectCreated --> LinkToClient[Link Project to Client]
    LinkToClient --> RedirectToProjects[Redirect to Projects Tab]
    RedirectToProjects --> ProjectsTab

    DangerTab --> DeleteClient[Delete Client]
    DeleteClient --> CheckClientProjects{Client has Projects?}

    CheckClientProjects -->|No| ConfirmClientDeletion[Confirm Client Deletion]
    CheckClientProjects -->|Yes| ShowClientWarning[Show Warning<br/>Display Project Links]

    ConfirmClientDeletion --> ClientDeleted[Client Deleted Successfully]
    ClientDeleted --> ClientsList

    ShowClientWarning --> DangerTab

    %% Styling
    classDef stageBox fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef decisionBox fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef processBox fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef warningBox fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    classDef successBox fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef formBox fill:#f3e5f5,stroke:#4a148c,stroke-width:2px

    class ClientsList,ClientDetails,ClientTabs,ClientProfileTab,ProjectsTab,DangerTab,ContactTable,ProjectsTable stageBox
    class ClientAction,TabSelection,ProfileActions,ContactAction,ProjectActions,CheckProjectParticipation,ConfirmDeletion,CheckClientProjects decisionBox
    class CreateClient,EnterClientName,GenerateClientID,SubmitClientForm,EditClientName,UpdateClientInfo,AddContact,EditContact,DeleteSingleContact,SelectMultipleContacts,DeleteMultiple,CheckEachContact,SeparateContacts,DeleteEligibleContacts,ViewProjects,CreateProject,EnterProjectDetails,GenerateProjectID,SubmitProjectForm,LinkToClient,RedirectToProjects,DeleteClient,ConfirmClientDeletion processBox
    class ShowWarning,ShowDeletionDialog,ContactsInProjects,ShowClientWarning warningBox
    class ClientCreated,ClientUpdated,ContactCreated,ContactUpdated,ContactDeleted,ContactsDeleted,ProjectCreated,ClientDeleted successBox
    class ContactForm,EnterContactDetails,EditContactForm,ModifyContactDetails,ProjectForm formBox
```

## Simplified Client Management Flow

```mermaid
flowchart LR
    subgraph "Client Creation"
        A[Create Client] --> B[Enter Client Name]
        B --> C[Auto-generate ID]
        C --> D[Client Created]
    end

    subgraph "Client Management"
        E[Edit Client Info] --> F[Update Client Name]
        F --> G[Client Updated]
    end

    subgraph "Contact Management"
        H[Add Contact] --> I[Enter Contact Details]
        I --> J[Contact Created]
        K[Edit Contact] --> L[Update Contact Info]
        L --> M[Contact Updated]
        N[Delete Contact] --> O{In Projects?}
        O -->|No| P[Contact Deleted]
        O -->|Yes| Q[Show Warning]
    end

    subgraph "Project Integration"
        R[View Projects] --> S[Client's Projects Table]
        T[Create Project] --> U[Enter Project Details]
        U --> V[Project Created]
        V --> W[Linked to Client]
    end

    D --> E
    G --> H
    J --> K
    M --> N
    P --> R
    Q --> R
    S --> T
    W --> S

    %% Styling
    classDef creationBox fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef managementBox fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef contactBox fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef projectBox fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class A,B,C,D creationBox
    class E,F,G managementBox
    class H,I,J,K,L,M,N,O,P,Q contactBox
    class R,S,T,U,V,W projectBox
```

## Key Decision Points

### 1. **Contact Deletion Validation**

- **Single Contact**: Check if contact participates in any projects
- **Multiple Contacts**: Check each contact individually for project participation
- **Deletion Rules**: Only contacts not in projects can be deleted
- **Warning System**: Show project links for contacts that cannot be deleted

### 2. **Client-Project Relationship**

- **Project Creation**: Projects can be created directly from client page
- **Project Viewing**: All client's projects displayed in projects tab
- **Navigation**: Seamless movement between client and project pages
- **Dependency Check**: Client deletion blocked if projects exist

### 3. **Bulk Operations**

- **Multiple Selection**: Select multiple contacts from table
- **Batch Processing**: Process multiple contacts simultaneously
- **Selective Deletion**: Only delete contacts eligible for deletion
- **Clear Feedback**: Show which contacts can/cannot be deleted

### 4. **Data Integrity**

- **Project Dependencies**: Track which projects use specific contacts
- **Deletion Prevention**: Prevent deletion of data in use
- **Warning Messages**: Clear communication about deletion restrictions
- **Project Links**: Direct links to projects using specific contacts

## Contact Person Management Details

### **Add Contact Person**

- Click "Add Contact Person" button
- Fill in contact details form
- Submit form to create contact
- Contact automatically linked to client

### **Edit Contact Person**

- Click edit button on contact row
- Modify contact information in dialog
- Submit updated information
- Contact record updated in database

### **Delete Single Contact**

- Click delete button on contact row
- System checks project participation
- If not in projects: Delete contact
- If in projects: Show warning with project links

### **Delete Multiple Contacts**

- Select multiple contacts using checkboxes
- Click "Delete Selected" button
- System checks each contact for project participation
- Show dialog with two groups:
  - Contacts that can be deleted
  - Contacts that cannot be deleted (with project links)
- Confirm deletion of eligible contacts only

## Project Integration Details

### **View Client's Projects**

- Navigate to Projects tab
- View all projects associated with client
- Click on project to view details
- Direct navigation to project pages

### **Create Project for Client**

- Click "Create New Project" button
- Fill in project details form
- System auto-generates project ID
- Project created and linked to client
- Redirect to updated projects list

This flowchart provides a comprehensive visual representation of the client management lifecycle, focusing on the main operational flows and decision points without over-emphasizing technical implementation details.
