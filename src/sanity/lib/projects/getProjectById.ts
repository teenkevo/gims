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
                unitPrice,
                quantity,
                lineTotal,
                testMethod->{
                  _id,
                  standard->{
                    _id,
                    acronym,
                  },
                },
              },
              otherItems[] {
                type,
                activity,
                unitPrice,
                quantity,
                lineTotal,
              },
              vatPercentage,
              paymentNotes,
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
              unitPrice,
              quantity,
              lineTotal,
              testMethod->{
                _id,
                standard->{
                  _id,
                  acronym,
                },
              },
            },
            otherItems[] {
              type,
              activity,
              unitPrice,
              quantity,
              lineTotal,
            },
            vatPercentage,
            paymentNotes,
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
