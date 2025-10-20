import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getRFIById = async (rfiId: string) => {
  const RFI_BY_ID_QUERY = defineQuery(`
        *[_type == "rfi" && _id == $rfiId][0] {
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
      query: RFI_BY_ID_QUERY,
      params: { rfiId },
      revalidate: 0,
    });

    return rfi || null;
  } catch (error) {
    console.error("Error fetching RFI by ID", error);
    return null;
  }
};
