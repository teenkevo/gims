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
          }
        }
  `);

  try {
    const project = await sanityFetch({
      query: PROJECT_BY_ID_QUERY,
      params: { projectId },
      tags: [`project-${projectId}`, "quotation"],
    });

    // return data or empty array if no data is found
    return project || [];
  } catch (error) {
    console.error("Error fetching project by id", error);
    return [];
  }
};
