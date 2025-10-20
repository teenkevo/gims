import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getAllRFIs = async () => {
  const ALL_RFIS_QUERY = defineQuery(`
        *[_type == "rfi"] | order(dateSubmitted desc) {
          _id,
          initiationType,
          rfiManager->{
            _id,
            fullName,
            email,
            phone,
            departmentRoles[]{
              department->{
                _id,
                name,
              },
              role,
            },
          },
          project->{
            _id,
            name,
            internalId
          },
          client->{
            _id,
            name,
            internalId
          },
          subject,
          description,
          labInitiator->{
            _id,
            fullName,
            email,
            phone,
            departmentRoles[]{
              department->{
                _id,
                name,
              },
              role,
            },
          },
          labReceivers[]->{
            _id,
            fullName,
            email,
            phone,
            departmentRoles[]{
              department->{
                _id,
                name,
              },
              role,
            },
          },
          labInitiatorExternal->{
            _id,
            fullName,
            email,
            phone,
            departmentRoles[]{
              department->{
                _id,
                name,
              },
              role,
            },
          },
          clientReceivers[]->{
            _id,
            name,
            email,
            phone,
            designation,
          },
          clientInitiator->{
            _id,
            name,
            email,
            phone,
            designation,
          },
          labReceiversExternal[]->{
            _id,
            fullName,
            email,
            phone,
            departmentRoles[]{
              department->{
                _id,
                name,
              },
              role,
            },
          },
          attachments[] {
            asset->{
                _id,
                url,
                originalFilename,
                size,
                mimeType,
            },
          },
          status,
          statusHistory[] {
            _key,
            status,
            timestamp,
            previousStatus,
            reason,
            officialMessageKey,
            changedBy->{
              _id,
              email,
            },
          },
          dateSubmitted,
          dateResolved,
          conversation[] {
            _key,
            isOfficialResponse,
            message,
            sentByClient,
            clientSender->{
              _id,
              name,
              email,
              phone,
              designation,
            },
            labSender->{
              _id,
              fullName,
              email,
              phone,
              departmentRoles[]{
                department->{
                  _id,
                  name,
                },
                role,
              },
            },
            attachments[] {
              asset->{
                _id,
                url,
                originalFilename,
                size,
                mimeType,
              },
            },
            timestamp,
          },
        }
  `);

  try {
    const rfi = await sanityFetch({
      query: ALL_RFIS_QUERY,
      revalidate: 0,
    });

    // return data or empty array if no data is found
    return rfi || [];
  } catch (error) {
    console.error("Error fetching all RFIs", error);
    return [];
  }
};
