import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

const PROJECTS_FOR_CONTACT_QUERY = defineQuery(`
  *[_type == "project" && references($contactPersonId)] | order(internalId desc) {
    _id,
    internalId,
    name,
    startDate,
    endDate,
    stagesCompleted,
    clients[]->{
      _id,
      name,
      internalId
    },
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
    quotation->{
      _id,
      revisionNumber,
      currency,
      status,
      rejectionNotes,
      revisions[]->|order(revisionNumber desc){
        _id,
        revisionNumber,
        currency,
        status,
        rejectionNotes,
        items[] {
          lineTotal,
        },
        otherItems[] {
          lineTotal,
        },
        vatPercentage,
        advance,
      },
      items[] {
        lineTotal,
      },
      otherItems[] {
        lineTotal,
      },
      vatPercentage,
      advance,
    }
  }
`);

export async function getProjectsForContact(contactPersonId: string) {
  try {
    const projects = await sanityFetch({
      query: PROJECTS_FOR_CONTACT_QUERY,
      params: { contactPersonId },
      revalidate: 0,
    });

    return projects || [];
  } catch (error) {
    console.error("Error fetching projects for contact", error);
    return [];
  }
}
