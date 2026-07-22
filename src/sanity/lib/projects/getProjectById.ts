import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getProjectById = async (projectId: string) => {
  const PROJECT_BY_ID_QUERY = defineQuery(`
        *[_type == "project" && _id == $projectId] {
          _id,
          internalId,
          name, 
          startDate, 
          endDate, 
          stagesCompleted, 
          contactPersons[]->{
            _id,
            name,
            email,
            phone,
            designation,
            appAccessStatus,
            client->{
              _id,
            },
          },
          clients[]->{
            _id, 
            name,
          },
          quotation->{
            _id,
            revisionNumber,
            quotationNumber,
            quotationDate,
            acquisitionNumber,
            currency,
            status,
            rejectionNotes,
            invoice {
              asset->{
                _id,
                url,
                originalFilename,
                size,
                mimeType,
              },
            },
            revisions[]->|order(revisionNumber desc){
              _id,
              revisionNumber,
              quotationNumber,
              quotationDate,
              acquisitionNumber,
              currency,
              status,
              rejectionNotes,
              invoice {
                asset->{
                  _id,
                  url,
                  originalFilename,
                  size,
                  mimeType,
                },
              },
              items[] {
                service -> {
                  _id,
                  testParameter,
                  sampleClass -> {
                    _id,
                    name,
                  },
                },
                unit,
                unitPrice,
                quantity,
                lineTotal,
                testMethod->{
                  _id,
                  code,
                  standard->{
                    _id,
                    acronym,
                  },
                },
              },
              otherItems[] {
                type,
                activity,
                unit,
                unitPrice,
                quantity,
                lineTotal,
              },
              vatPercentage,
              paymentNotes,
              advance,
              grandTotal,
              subtotal,
              payments[] {
                _key,
                paymentTime,
                paymentType,
                amount,
                paymentMode,
                currency,
                internalNotes,
                internalStatus,
                internalDecisionTime,
                internalDecisionBy->{
                  _id,
                  internalId,
                  fullName,
                  email,
                  phone,
                  status,
                  departmentRoles[]->{
                    department->{
                      _id,
                      name,
                    },
                    role,
                  },
                },
                paymentProof {
                  asset->{
                    _id,
                    url,
                    originalFilename,
                    size,
                    mimeType,
                  },
                },
                receipt {
                  asset->{
                    _id,
                    url,
                    originalFilename,
                    name,
                    mimeType,
                    size,
                  },
                },
                resubmissions[] {
                  _key,
                  amount,
                  paymentTime,
                  paymentMode,
                  internalNotes,
                  internalStatus,
                  internalDecisionTime,
                  internalDecisionBy->{
                    _id,
                    internalId,
                    fullName,
                    email,
                    phone,
                    status,
                    departmentRoles[]->{
                      department->{
                        _id,
                        name,
                      },
                      role,
                    },
                  },
                  paymentProof {
                    asset->{
                      _id,
                      url,
                      originalFilename,
                      size,
                      mimeType,
                    },
                  },
                  receipt {
                    asset->{
                      _id,
                      url,
                      originalFilename,
                      name,
                      mimeType,
                      size,
                    },
                  },
                },
              },
              file {
                asset->{
                  _id,
                  url,
                  originalFilename,
                  size,
                  mimeType,
                },
              },
            },
            items[] {
              service -> {
                _id,
                testParameter,
                sampleClass -> {
                  _id,
                  name,
                },
              },
              unit,
              unitPrice,
              quantity,
              lineTotal,
              testMethod->{
                _id,
                code,
                standard->{
                  _id,
                  acronym,
                },
              },
            },
            otherItems[] {
              type,
              activity,
              unit,
              unitPrice,
              quantity,
              lineTotal,
            },
            vatPercentage,
            paymentNotes,
            advance,
            grandTotal,
            subtotal,
            payments[] {
              _key,
              paymentTime,
              paymentType,
              amount,
              paymentMode,
              currency,
              internalNotes,
              internalStatus,
              internalDecisionTime,
              internalDecisionBy->{
                _id,
                internalId,
                fullName,
                email,
                phone,
                status,
                departmentRoles[]->{
                  department->{
                    _id,
                    name,
                  },
                  role,
                },
              },
              resubmissions[] {
                _key,
                amount,
                paymentTime,
                paymentMode,
                internalNotes,
                internalStatus,
                internalDecisionTime,
                internalDecisionBy->{
                  _id,
                  internalId,
                  fullName,
                  email,
                  phone,
                  status,
                  departmentRoles[]->{
                    department->{
                      _id,
                      name,
                    },
                    role,
                  },
                },
                paymentProof {
                  asset->{
                    _id,
                    url,
                    originalFilename,
                    size,
                    mimeType,
                  },
                },
                receipt {
                  asset->{
                    _id,
                    url,
                    originalFilename,
                    name,
                    mimeType,
                    size,
                  },
                },
              },
              paymentProof {
                asset->{
                  _id,
                  url,
                  originalFilename,
                  size,
                  mimeType,
                },
              },
              receipt {
                asset->{
                  _id,
                  url,
                  originalFilename,
                  name,
                  mimeType,
                  size,
                },
              },              
            },
            file {
              asset->{
                _id,
                url,
                originalFilename,
                size,
                mimeType,
              },
            },
          },
          // Reverse‐lookup: find sample verification that reference this project
          "sampleReceipt": *[
            _type == "sampleReceipt" 
            && references(^._id)
          ][0] {
            _id,
            sampleReceiptNumber,
            revisionNumber,
            status,
            reviewTemplate->{
              _id,
              name,
              version,
              description,
              isActive,
            },
            reviewItems[] {
              templateItemId,
              label,
              status,
              comments,
            },
            adequacyTemplate->{
              _id,
              name,
              version,
              description,
              isActive,
            },
            adequacyChecks[] {
              templateItemId,
              label,
              status,
              comments,
            },
            overallStatus,
            overallComments,
            clientAcknowledgement {
              acknowledgementText,
              clientSignature,
              clientRepresentative,
              acknowledgedAt,
              acknowledgementDecisionBy {
                contactPerson->{
                  _id,
                },
                name,
                email,
                role,
              },
            },
            getlabAcknowledgement {
              expectedDeliveryDate,
              sampleRetentionDuration,
              acknowledgementText,
              approvalDecision,
              rejectionReason,
              approvalDecisionAt,
              approvalDecisionBy {
                personnel->{
                  _id,
                },
                name,
                email,
                role,
              },
            },
            sampleReceiptPersonnel {
              role,
              name,
              signature,
              personnel->{
                _id,
                internalId,
                fullName,
                email,
                phone,
              },
            },
            file {
              asset->{
                _id,
                url,
                originalFilename,
                size,
                mimeType,
              },
            },
            revisions[]->|order(revisionNumber desc){
              _id,
              sampleReceiptNumber,
              revisionNumber,
              status,
              reviewTemplate->{
                _id,
                name,
                version,
                description,
                isActive,
              },
              reviewItems[] {
                templateItemId,
                label,
                status,
                comments,
              },
              adequacyTemplate->{
                _id,
                name,
                version,
                description,
                isActive,
              },
              adequacyChecks[] {
                templateItemId,
                label,
                status,
                comments,
              },
              overallStatus,
              overallComments,
              clientAcknowledgement {
                acknowledgementText,
                clientSignature,
                clientRepresentative,
                acknowledgedAt,
                acknowledgementDecisionBy {
                  contactPerson->{
                    _id,
                  },
                  name,
                  email,
                  role,
                },
              },
              getlabAcknowledgement {
                expectedDeliveryDate,
                sampleRetentionDuration,
                acknowledgementText,
                approvalDecision,
                rejectionReason,
                approvalDecisionAt,
                approvalDecisionBy {
                  personnel->{
                    _id,
                  },
                  name,
                  email,
                  role,
                },
              },
              sampleReceiptPersonnel {
                role,
                name,
                signature,
                personnel->{
                  _id,
                  internalId,
                  fullName,
                  email,
                  phone,
                },
              },
              file {
                asset->{
                  _id,
                  url,
                  originalFilename,
                  size,
                  mimeType,
                },
              },
            },
          },
          "report": *[
            _type == "report"
            && references(^._id)
          ] | order(revisionNumber desc) [0] {
            _id,
            reportNumber,
            revisionNumber,
            title,
            summary,
            status,
            submittedAt,
            sentToClientAt,
            qaReview {
              decision,
              notes,
              reviewedAt,
              reviewedBy {
                name,
                email,
                role,
                personnel->{
                  _id,
                },
              },
            },
            preparedBy {
              name,
              role,
              personnel->{
                _id,
                fullName,
                email,
              },
            },
            file {
              asset->{
                _id,
                url,
                originalFilename,
                size,
                mimeType,
              },
            },
            queries[] {
              _key,
              subject,
              status,
              createdAt,
              createdBy {
                name,
                email,
                contactPerson->{
                  _id,
                },
              },
              messages[] {
                _key,
                message,
                sentByClient,
                senderName,
                senderEmail,
                timestamp,
                contactPerson->{
                  _id,
                },
                personnel->{
                  _id,
                },
              },
            },
            revisions[]->|order(revisionNumber desc){
              _id,
              reportNumber,
              revisionNumber,
              title,
              summary,
              status,
              submittedAt,
              sentToClientAt,
              qaReview {
                decision,
                notes,
                reviewedAt,
                reviewedBy {
                  name,
                  email,
                  role,
                  personnel->{
                    _id,
                  },
                },
              },
              preparedBy {
                name,
                role,
                personnel->{
                  _id,
                  fullName,
                  email,
                },
              },
              file {
                asset->{
                  _id,
                  url,
                  originalFilename,
                  size,
                  mimeType,
                },
              },
            },
          }
        }
  `);

  try {
    const project = await sanityFetch({
      query: PROJECT_BY_ID_QUERY,
      params: { projectId },
      tags: [`project-${projectId}`, "quotation", "contactPerson"],
    });

    // return data or empty array if no data is found
    return project || [];
  } catch (error) {
    console.error("Error fetching project by id", error);
    return [];
  }
};
