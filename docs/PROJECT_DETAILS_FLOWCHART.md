# GIMS Project Details - Detailed Flowchart

## Mermaid Flowchart Diagram

```mermaid
flowchart TD
    Start([User navigates to project details]) --> LoadPage[Load Project Details Page]

    LoadPage --> ExtractData[Extract project data]
    ExtractData --> DetermineStage[Determine billing stage from quotation]
    DetermineStage --> DisplayHeader[Display project header with ID and name]

    DisplayHeader --> InitializeTabs[Initialize tab system]
    InitializeTabs --> CheckURL[Check URL parameters for active tab]

    CheckURL --> URLTab{URL has tab parameter?}
    URLTab -->|Yes| SetActiveTab[Set active tab from URL]
    URLTab -->|No| SetDefaultTab[Set default tab to 'details']

    SetActiveTab --> DisplayTabContent[Display tab content]
    SetDefaultTab --> DisplayTabContent

    DisplayTabContent --> TabContent{Which tab is active?}

    TabContent -->|Project| ProjectTab[Load Project Tab]
    TabContent -->|Client| ClientTab[Load Client Tab]
    TabContent -->|Billing| BillingTab[Load Billing Tab]
    TabContent -->|Sample Receipt| SampleTab[Load Sample Receipt Tab]
    TabContent -->|Danger| DangerTab[Load Danger Tab]

    %% Project Tab Flow
    ProjectTab --> LoadProjectForms[Load project update forms]
    LoadProjectForms --> ProjectNameForm[Project Name Form]
    LoadProjectForms --> ProjectDatesForm[Project Dates Form]

    ProjectNameForm --> UserEditName[User edits project name]
    UserEditName --> ValidateName[Validate project name]
    ValidateName --> SaveName[Save project name]
    SaveName --> ShowSuccess[Show success message]

    ProjectDatesForm --> UserEditDates[User edits project dates]
    UserEditDates --> ValidateDates[Validate date range]
    ValidateDates --> SaveDates[Save project dates]
    SaveDates --> ShowSuccess

    %% Client Tab Flow
    ClientTab --> MapClients[Map through project clients]
    MapClients --> LoadClientCard[Load client card for each client]
    LoadClientCard --> ClientNameForm[Client Name Form]
    LoadClientCard --> ContactTable[Contact Table]

    ClientNameForm --> UserEditClientName[User edits client name]
    UserEditClientName --> ValidateClientName[Validate client name]
    ValidateClientName --> SaveClientName[Save client name]
    SaveClientName --> ShowSuccess

    ContactTable --> ContactActions{Contact action?}
    ContactActions -->|Add| AddContact[Add new contact]
    ContactActions -->|Edit| EditContact[Edit existing contact]
    ContactActions -->|Remove| RemoveContact[Remove contact from project]

    AddContact --> CreateContactForm[Create contact form]
    EditContact --> UpdateContactForm[Update contact form]
    RemoveContact --> ConfirmRemoval[Confirm contact removal]

    %% Billing Tab Flow
    BillingTab --> LoadBillingLifecycle[Load billing lifecycle component]
    LoadBillingLifecycle --> DetermineBillingStage[Determine current billing stage]
    DetermineBillingStage --> DisplayBillingStage[Display billing stage]

    DisplayBillingStage --> BillingActions{Billing action available?}
    BillingActions -->|Create Quotation| CreateQuotation[Create quotation]
    BillingActions -->|Send Quotation| SendQuotation[Send quotation to client]
    BillingActions -->|Respond to Quotation| RespondQuotation[Respond to quotation]
    BillingActions -->|Make Payment| MakePayment[Make payment]
    BillingActions -->|View Payments| ViewPayments[View payment history]

    CreateQuotation --> QuotationForm[Quotation creation form]
    SendQuotation --> SendConfirmation[Send confirmation]
    RespondQuotation --> ResponseForm[Response form]
    MakePayment --> PaymentForm[Payment form]
    ViewPayments --> PaymentHistory[Payment history display]

    %% Sample Receipt Tab Flow
    SampleTab --> ShowDisabled[Show disabled tab message]
    ShowDisabled --> PlaceholderContent[Display placeholder content]

    %% Danger Tab Flow
    DangerTab --> LoadDeleteForm[Load delete project form]
    LoadDeleteForm --> ShowWarning[Show deletion warning]
    ShowWarning --> UserConfirmDelete[User confirms deletion]
    UserConfirmDelete --> ConfirmDeletion[Confirm deletion action]
    ConfirmDeletion --> DeleteProject[Delete project and all data]
    DeleteProject --> RedirectProjects[Redirect to projects list]

    %% Tab Navigation
    ShowSuccess --> TabNavigation[User clicks different tab]
    PlaceholderContent --> TabNavigation
    PaymentHistory --> TabNavigation

    TabNavigation --> UpdateURL[Update URL parameters]
    UpdateURL --> SetActiveTab

    %% Styling
    classDef tabBox fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef formBox fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef actionBox fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef successBox fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef dangerBox fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    classDef processBox fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px

    class ProjectTab,ClientTab,BillingTab,SampleTab,DangerTab tabBox
    class ProjectNameForm,ProjectDatesForm,ClientNameForm,ContactTable,QuotationForm,PaymentForm formBox
    class UserEditName,UserEditDates,UserEditClientName,ContactActions,BillingActions actionBox
    class ShowSuccess,SaveName,SaveDates,SaveClientName successBox
    class DangerTab,ShowWarning,ConfirmDeletion,DeleteProject dangerBox
    class LoadPage,ExtractData,DetermineStage,DisplayHeader,InitializeTabs processBox
```

## Tab State Management Flowchart

```mermaid
flowchart TD
    TabClick[User clicks tab] --> UpdateURL[Update URL parameters]
    UpdateURL --> SetActiveTab[Set active tab state]
    SetActiveTab --> LoadTabContent[Load tab content]

    LoadTabContent --> TabType{Tab type?}

    TabType -->|Project| ProjectContent[Project form content]
    TabType -->|Client| ClientContent[Client management content]
    TabType -->|Billing| BillingContent[Billing lifecycle content]
    TabType -->|Sample| SampleContent[Sample receipt placeholder]
    TabType -->|Danger| DangerContent[Delete project content]

    ProjectContent --> FormInteractions[Form interactions]
    ClientContent --> ClientInteractions[Client interactions]
    BillingContent --> BillingInteractions[Billing interactions]
    SampleContent --> DisabledMessage[Disabled tab message]
    DangerContent --> DeleteInteractions[Delete interactions]

    FormInteractions --> SaveAction[Save form data]
    ClientInteractions --> ClientAction[Client management action]
    BillingInteractions --> BillingAction[Billing workflow action]
    DeleteInteractions --> DeleteAction[Delete project action]

    SaveAction --> UpdateState[Update component state]
    ClientAction --> UpdateState
    BillingAction --> UpdateState
    DeleteAction --> RedirectAction[Redirect to projects list]

    UpdateState --> RefreshContent[Refresh tab content]
    RefreshContent --> DisplayUpdated[Display updated content]

    RedirectAction --> ProjectsList[Navigate to projects list]

    %% Styling
    classDef interactionBox fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef contentBox fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef actionBox fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef redirectBox fill:#ffebee,stroke:#b71c1c,stroke-width:2px

    class TabClick,FormInteractions,ClientInteractions,BillingInteractions,DeleteInteractions interactionBox
    class ProjectContent,ClientContent,BillingContent,SampleContent,DangerContent contentBox
    class SaveAction,ClientAction,BillingAction,DeleteAction,UpdateState actionBox
    class RedirectAction,ProjectsList redirectBox
```

## Billing Stage Determination Logic

```mermaid
flowchart TD
    LoadProject[Load project data] --> CheckQuotation{Quotation exists?}

    CheckQuotation -->|No| SetStage1[Set Stage 1: Quotation Preparation]
    CheckQuotation -->|Yes| GetQuotationStatus[Get quotation status]

    GetQuotationStatus --> StatusCheck{Quotation status?}

    StatusCheck -->|draft| SetStage1
    StatusCheck -->|sent| SetStage2[Set Stage 2: Quotation Sent]
    StatusCheck -->|accepted| SetStage3[Set Stage 3: Client Feedback]
    StatusCheck -->|rejected| SetStage3Rejected[Set Stage 3: Client Feedback + Rejection]
    StatusCheck -->|invoiced| SetStage4[Set Stage 4: Invoice Generated]
    StatusCheck -->|partially_paid| SetStage5[Set Stage 5: Payment Processing]
    StatusCheck -->|fully_paid| SetStage5Complete[Set Stage 5: Payment Processing Complete]

    SetStage1 --> DisplayBillingStage[Display billing stage]
    SetStage2 --> DisplayBillingStage
    SetStage3 --> DisplayBillingStage
    SetStage3Rejected --> DisplayBillingStage
    SetStage4 --> DisplayBillingStage
    SetStage5 --> DisplayBillingStage
    SetStage5Complete --> DisplayBillingStage

    DisplayBillingStage --> LoadBillingActions[Load appropriate billing actions]

    %% Styling
    classDef decisionBox fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef stageBox fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef processBox fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px

    class CheckQuotation,StatusCheck decisionBox
    class SetStage1,SetStage2,SetStage3,SetStage3Rejected,SetStage4,SetStage5,SetStage5Complete stageBox
    class LoadProject,GetQuotationStatus,DisplayBillingStage,LoadBillingActions processBox
```

## Key Decision Points

### 1. **Tab Navigation**

- **URL Parameter Check**: Determines initial active tab
- **Tab Click Handling**: Updates URL and loads appropriate content
- **State Persistence**: Tab selection maintained across page interactions

### 2. **Billing Stage Determination**

- **Quotation Existence**: Checks if project has associated quotation
- **Status Mapping**: Maps quotation status to billing stage
- **Rejection Handling**: Special handling for rejected quotations

### 3. **Form Interactions**

- **Real-time Validation**: Client-side validation for all forms
- **Save Actions**: Immediate save with success feedback
- **State Updates**: Component state updated after successful saves

### 4. **Client Management**

- **Multiple Clients**: Handles projects with multiple clients
- **Contact Management**: Full CRUD operations for contacts
- **Client Actions**: Add, edit, remove clients and contacts

### 5. **Danger Zone**

- **Confirmation Required**: Multiple confirmation steps for deletion
- **Data Cleanup**: Ensures all related data is removed
- **Irreversible Action**: Clear warning about permanent deletion

## URL State Management

### **Tab Parameter Updates**

- Each tab click updates the URL with `?tab={tabName}`
- Page refresh maintains the active tab
- Default tab is "details" if no parameter specified

### **Tab Names**

- `details` → Project tab
- `client` → Client tab
- `billing` → Billing tab
- `sample-receipt` → Sample Receipt tab
- `danger` → Danger tab

This detailed flowchart shows all the decision points, state management, and user interactions in the project details page, making it easier for users to understand how to navigate and use the interface effectively.
