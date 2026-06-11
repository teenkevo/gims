export const EQUIPMENT_CATEGORIES = [
  { label: "Compression / Strength", value: "compression_testing" },
  { label: "Sieving & Grading", value: "sieving_grading" },
  { label: "Moisture & Density", value: "moisture_density" },
  { label: "Triaxial & Shear", value: "triaxial_shear" },
  { label: "Consolidation", value: "consolidation" },
  { label: "Rock Mechanics", value: "rock_mechanics" },
  { label: "Calibration Standard", value: "calibration_standard" },
  { label: "Field Instrument", value: "field_instrument" },
  { label: "General Laboratory", value: "general_lab" },
] as const;

export const EQUIPMENT_STATUSES = [
  { label: "Available", value: "available" },
  { label: "In Use", value: "in_use" },
  { label: "Under Maintenance", value: "under_maintenance" },
  { label: "Retired", value: "retired" },
] as const;

export const MAINTENANCE_TYPES = [
  { label: "Routine Check", value: "routine" },
  { label: "Repair", value: "repair" },
  { label: "Calibration", value: "calibration" },
  { label: "Replacement", value: "replacement" },
] as const;

export function getEquipmentCategoryLabel(value?: string | null) {
  return (
    EQUIPMENT_CATEGORIES.find((c) => c.value === value)?.label ?? value ?? "—"
  );
}

export function getEquipmentStatusLabel(value?: string | null) {
  return EQUIPMENT_STATUSES.find((s) => s.value === value)?.label ?? value ?? "—";
}

export function getMaintenanceTypeLabel(value?: string | null) {
  return MAINTENANCE_TYPES.find((t) => t.value === value)?.label ?? value ?? "—";
}
