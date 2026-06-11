export type LabFormValues = {
  internalId: string;
  name: string;
  description: string;
  labSection: string;
  status: string;
  location: string;
  capacity: string;
  notes: string;
  personnelIds: string[];
  labHeadId: string;
  equipmentIds: string[];
  testCapabilityIds: string[];
  accreditationStandard: string;
  accreditationCertificateNumber: string;
  accreditationAccreditingBody: string;
  accreditationExpiryDate: string;
};

export const LAB_CREATE_STEPS = [
  {
    step: 1,
    title: "Laboratory Identity",
    description: "Name, section, location, and capacity",
    fields: [
      "internalId",
      "name",
      "labSection",
      "description",
      "status",
      "location",
      "capacity",
    ] as const,
  },
  {
    step: 2,
    title: "Staffing",
    description: "Assign personnel and designate the lab head",
    fields: ["personnelIds", "labHeadId"] as const,
  },
  {
    step: 3,
    title: "Resources & Capabilities",
    description: "Equipment and accredited test methods",
    fields: ["equipmentIds", "testCapabilityIds"] as const,
  },
  {
    step: 4,
    title: "Accreditation & Operations",
    description: "ISO 17025 details and operational notes",
    fields: [
      "accreditationStandard",
      "accreditationCertificateNumber",
      "accreditationAccreditingBody",
      "accreditationExpiryDate",
      "notes",
    ] as const,
  },
] as const;

export function getLabFormDefaultValues(): LabFormValues {
  return {
    internalId: `LAB-${Math.floor(10000 + Math.random() * 90000).toString()}`,
    name: "",
    description: "",
    labSection: "",
    status: "available",
    location: "",
    capacity: "",
    notes: "",
    personnelIds: [],
    labHeadId: "",
    equipmentIds: [],
    testCapabilityIds: [],
    accreditationStandard: "",
    accreditationCertificateNumber: "",
    accreditationAccreditingBody: "",
    accreditationExpiryDate: "",
  };
}
