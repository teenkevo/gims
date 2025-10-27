# GIMS Project Lifecycle - Detailed Flowchart

## Mermaid Flowchart Diagram

```mermaid
flowchart TD
    Start([Admin clicks "Create Project"]) --> ProjectCreation[Project Creation]

    ProjectCreation --> GenerateProjectID[Auto-generate Project ID<br/>Format: P2024-XXXXX]
    GenerateProjectID --> ProjectDetails[Add Project Details<br/>- Name<br/>- Dates (optional)<br/>- Priority]

    ProjectDetails --> ClientManagement[Client Management]

    ClientManagement --> ClientType{Client Type?}

    ClientType -->|New Client| CreateNewClient[Create New Client<br/>Auto-generate Client ID<br/>Format: C-XXXXX]
    ClientType -->|Existing Client| SelectExistingClient[Select Existing Client]

    CreateNewClient --> LinkClients[Link Client(s) to Project]
    SelectExistingClient --> LinkClients

    LinkClients --> ProjectCreated[Project Created Successfully]
    ProjectCreated --> BillingStage[Stage 1: Billing Integration]

    BillingStage --> CreateQuotation[Create Quotation]
    CreateQuotation --> SendQuotation[Send Quotation to Client]
    SendQuotation --> ClientReview[Client Reviews Quotation]

    ClientReview --> ClientDecision{Client Decision?}

    ClientDecision -->|Accept| QuotationAccepted[Quotation Accepted]
    ClientDecision -->|Reject| QuotationRejected[Quotation Rejected<br/>Process Stops]
    ClientDecision -->|Request Revision| CreateRevision[Create Revised Quotation]

    CreateRevision --> SendQuotation

    QuotationAccepted --> GenerateInvoice[Generate Invoice]
    GenerateInvoice --> ProcessPayments[Process Payments]
    ProcessPayments --> BillingComplete[Billing Stage Complete]

    BillingComplete --> SamplingStage[Stage 2: Sampling Phase]

    SamplingStage --> CreateSampleReceipt[Create Sample Receipt]
    CreateSampleReceipt --> SubmitForApproval[Submit for Internal Approval]
    SubmitForApproval --> InternalApproval[Internal Approval Process]

    InternalApproval --> ApprovalDecision{Approval Decision?}

    ApprovalDecision -->|Approve| SampleApproved[Sample Receipt Approved]
    ApprovalDecision -->|Reject| SampleRejected[Sample Receipt Rejected<br/>Return for Revision]

    SampleRejected --> CreateSampleReceipt

    SampleApproved --> SendToClient[Send Sample Receipt to Client]
    SendToClient --> ClientAcknowledgment[Client Acknowledgment]
    ClientAcknowledgment --> SamplingComplete[Sampling Stage Complete]

    SamplingComplete --> TestingStage[Stage 3: Testing Phase]

    TestingStage --> RecordTests[Record Test Results]
    RecordTests --> TestingComplete[Testing Stage Complete]

    TestingComplete --> AnalysisStage[Stage 4: Analysis Phase]

    AnalysisStage --> PerformAnalysis[Perform Data Analysis]
    PerformAnalysis --> AnalysisComplete[Analysis Stage Complete]

    AnalysisComplete --> ReportingStage[Stage 5: Reporting Phase]

    ReportingStage --> GenerateReport[Generate Final Report]
    GenerateReport --> SendReport[Send Report to Client]
    SendReport --> ReportingComplete[Reporting Stage Complete]

    ReportingComplete --> ProjectComplete[Project Completed Successfully]

    %% Styling
    classDef stageBox fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef decisionBox fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef processBox fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef errorBox fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    classDef successBox fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef clientBox fill:#f3e5f5,stroke:#4a148c,stroke-width:2px

    class ProjectCreation,ProjectDetails,ClientManagement,CreateNewClient,SelectExistingClient,LinkClients,ProjectCreated stageBox
    class ClientType,ClientDecision,ApprovalDecision decisionBox
    class CreateQuotation,SendQuotation,GenerateInvoice,ProcessPayments,CreateSampleReceipt,SubmitForApproval,InternalApproval,SampleApproved,SendToClient,RecordTests,PerformAnalysis,GenerateReport,SendReport processBox
    class QuotationRejected,SampleRejected errorBox
    class BillingComplete,SamplingComplete,TestingComplete,AnalysisComplete,ReportingComplete,ProjectComplete successBox
    class ClientReview,ClientAcknowledgment clientBox
```

## Simplified Project Flow Diagram

```mermaid
flowchart LR
    subgraph "Project Creation"
        A[Create Project] --> B[Add Client(s)]
        B --> C[Project Created]
    end

    subgraph "Billing Integration"
        D[Create Quotation] --> E[Client Acceptance]
        E --> F[Payment Processing]
    end

    subgraph "Sampling Phase"
        G[Create Sample Receipt] --> H[Internal Approval]
        H --> I[Client Acknowledgment]
    end

    subgraph "Testing & Analysis"
        J[Record Tests] --> K[Perform Analysis]
    end

    subgraph "Reporting & Completion"
        L[Generate Report] --> M[Send to Client]
        M --> N[Project Complete]
    end

    C --> D
    F --> G
    I --> J
    K --> L

    %% Styling
    classDef creationBox fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef billingBox fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef samplingBox fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef testingBox fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef reportingBox fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class A,B,C creationBox
    class D,E,F billingBox
    class G,H,I samplingBox
    class J,K testingBox
    class L,M,N reportingBox
```

## Key Decision Points

### 1. **Client Type Selection**

- **New Client**: Creates new client record during project creation
- **Existing Client**: Links to existing client from database
- **Multiple Clients**: Projects can have multiple clients

### 2. **Quotation Acceptance**

- **Accept**: Proceeds to billing and payment processing
- **Reject**: Stops the project process
- **Request Revision**: Creates revised quotation and resubmits

### 3. **Sample Receipt Approval**

- **Approve**: Proceeds to client notification
- **Reject**: Returns for revision and resubmission

### 4. **Stage Progression**

- **Sequential**: Each stage must be completed before moving to the next
- **Completion Tracking**: System tracks which stages are completed
- **Status Updates**: Real-time status updates throughout the lifecycle

## Project Stage Details

### **BILLING Stage**

- Quotation creation and client review
- Payment processing and approval
- Invoice generation and delivery

### **SAMPLING Stage**

- Sample receipt creation and verification
- Internal approval workflow
- Client acknowledgment process

### **TESTING Stage**

- Test execution and result recording
- Data collection and validation
- Quality assurance processes

### **ANALYSIS Stage**

- Data analysis and interpretation
- Statistical processing
- Result validation and verification

### **REPORTING Stage**

- Final report generation
- Client delivery and acknowledgment
- Project completion and archiving

This flowchart focuses on the main project lifecycle steps without over-emphasizing form validations, providing a clear visual representation of the overall process flow.
