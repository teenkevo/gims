export type EquipmentUserManual = {
  _key: string;
  name?: string | null;
  asset?: {
    _id: string;
    url?: string | null;
    originalFilename?: string | null;
    mimeType?: string | null;
    size?: number | null;
  } | null;
};

export type EquipmentFormValues = {
  internalId: string;
  name: string;
  serialNumber: string;
  category: string;
  manufacturer: string;
  model: string;
  status: string;
  notes: string;
  lastMaintenance: string;
  nextMaintenance: string;
  personnelIds: string[];
  userManualFiles: File[];
  existingUserManuals: EquipmentUserManual[];
  supplierName: string;
  supplierContactPerson: string;
  supplierContactEmail: string;
  supplierContactPhone: string;
  maintenanceCompanyName: string;
  maintenanceContactPerson: string;
  maintenanceContactEmail: string;
  maintenanceContactPhone: string;
};

export const EQUIPMENT_CREATE_STEPS = [
  {
    step: 1,
    title: "Equipment Identity",
    description: "Asset details, category, and maintenance schedule",
    fields: [
      "internalId",
      "name",
      "serialNumber",
      "category",
      "manufacturer",
      "model",
      "status",
      "notes",
      "lastMaintenance",
      "nextMaintenance",
    ] as const,
  },
  {
    step: 2,
    title: "Assignment & Manuals",
    description: "Responsible personnel and user manual files",
    fields: ["personnelIds", "userManualFiles"] as const,
  },
  {
    step: 3,
    title: "Vendor & Support",
    description: "Supplier and maintenance company contacts",
    fields: [
      "supplierName",
      "supplierContactPerson",
      "supplierContactEmail",
      "supplierContactPhone",
      "maintenanceCompanyName",
      "maintenanceContactPerson",
      "maintenanceContactEmail",
      "maintenanceContactPhone",
    ] as const,
  },
] as const;

export function getEquipmentFormDefaultValues(): EquipmentFormValues {
  return {
    internalId: `EQ-${Math.floor(10000 + Math.random() * 90000).toString()}`,
    name: "",
    serialNumber: "",
    category: "",
    manufacturer: "",
    model: "",
    status: "available",
    notes: "",
    lastMaintenance: "",
    nextMaintenance: "",
    personnelIds: [],
    userManualFiles: [],
    existingUserManuals: [],
    supplierName: "",
    supplierContactPerson: "",
    supplierContactEmail: "",
    supplierContactPhone: "",
    maintenanceCompanyName: "",
    maintenanceContactPerson: "",
    maintenanceContactEmail: "",
    maintenanceContactPhone: "",
  };
}
