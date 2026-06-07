export const LAB_SECTIONS = [
  { label: "Soil Testing", value: "soil_testing" },
  { label: "Rock Testing", value: "rock_testing" },
  { label: "Seismic Testing", value: "seismic_testing" },
  { label: "Asphalt Lab", value: "asphalt_lab" },
  { label: "Concrete Testing", value: "concrete_testing" },
  { label: "General Materials Lab", value: "general_materials" },
] as const;

export const LAB_STATUSES = [
  { label: "Available", value: "available" },
  { label: "Under Maintenance", value: "under_maintenance" },
  { label: "Retired", value: "retired" },
  { label: "Full Capacity", value: "fullCapacity" },
] as const;

export const SOP_CATEGORIES = [
  { label: "Health & Safety", value: "health_safety" },
  { label: "Evacuation Protocols", value: "evacuation" },
  { label: "Quality Control Procedures", value: "quality_control" },
  { label: "Equipment Handling", value: "equipment_handling" },
  { label: "General Operations", value: "general_operations" },
] as const;

export type LabSection = (typeof LAB_SECTIONS)[number]["value"];
export type LabStatus = (typeof LAB_STATUSES)[number]["value"];

export function getLabSectionLabel(value?: string | null) {
  return LAB_SECTIONS.find((s) => s.value === value)?.label ?? value ?? "—";
}

export function getLabStatusLabel(value?: string | null) {
  return LAB_STATUSES.find((s) => s.value === value)?.label ?? value ?? "—";
}

export function getSopCategoryLabel(value?: string | null) {
  return SOP_CATEGORIES.find((s) => s.value === value)?.label ?? value ?? "—";
}
