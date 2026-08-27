export const SEED_PREFIX = "seed-";

export function seedId(...parts: string[]) {
  return `${SEED_PREFIX}${parts.join("-")}`;
}

export function seedRef(id: string) {
  return { _type: "reference" as const, _ref: id };
}

export function keyed<T extends Record<string, unknown>>(
  items: T[],
  prefix: string
) {
  return items.map((item, index) => ({
    ...item,
    _key: `${prefix}-${index + 1}`,
  }));
}

export const IDS = {
  standard: {
    bs1377: seedId("standard", "bs1377"),
    astmD422: seedId("standard", "astm-d422"),
    astmD698: seedId("standard", "astm-d698"),
    aashtoT99: seedId("standard", "aashto-t99"),
    bsEn12390: seedId("standard", "bsen-12390"),
  },
  testMethod: {
    psd: seedId("method", "psd"),
    atterberg: seedId("method", "atterberg"),
    compaction: seedId("method", "compaction"),
    cbr: seedId("method", "cbr"),
    cube: seedId("method", "cube"),
    bitumen: seedId("method", "bitumen"),
  },
  sampleClass: {
    soil: seedId("class", "soil"),
    aggregate: seedId("class", "aggregate"),
    concrete: seedId("class", "concrete"),
    asphalt: seedId("class", "asphalt"),
  },
  service: {
    psd: seedId("service", "psd"),
    atterberg: seedId("service", "atterberg"),
    compaction: seedId("service", "compaction"),
    cbr: seedId("service", "cbr"),
    cube: seedId("service", "cube"),
    bitumen: seedId("service", "bitumen"),
  },
  department: {
    laboratories: seedId("dept", "laboratories"),
    technical: seedId("dept", "technical"),
    finance: seedId("dept", "finance"),
    administration: seedId("dept", "administration"),
  },
  personnel: {
    manager: seedId("person", "nakato"),
    engineer: seedId("person", "okello"),
    techSoilA: seedId("person", "namara"),
    techSoilB: seedId("person", "kato"),
    techConcrete: seedId("person", "akyoo"),
    billing: seedId("person", "nambi"),
  },
  client: {
    unra: seedId("client", "unra"),
    kcca: seedId("client", "kcca"),
    crsg: seedId("client", "crsg"),
    pearl: seedId("client", "pearl"),
  },
  contact: {
    unra: seedId("contact", "unra-mugisha"),
    kcca: seedId("contact", "kcca-atuhaire"),
    crsg: seedId("contact", "crsg-li"),
    pearl: seedId("contact", "pearl-ssali"),
  },
  project: {
    jinja: seedId("project", "jinja-expressway"),
    entebbe: seedId("project", "entebbe-overlay"),
    namanve: seedId("project", "namanve-access"),
    gulu: seedId("project", "gulu-nimule"),
    kololo: seedId("project", "kololo-housing"),
    marina: seedId("project", "pearl-marina"),
  },
  quotation: {
    jinja: seedId("quotation", "jinja"),
    entebbe: seedId("quotation", "entebbe"),
    namanve: seedId("quotation", "namanve"),
    gulu: seedId("quotation", "gulu"),
  },
  lab: {
    soil: seedId("lab", "soil"),
    concrete: seedId("lab", "concrete"),
    asphalt: seedId("lab", "asphalt"),
  },
  equipment: {
    sieve: seedId("equip", "sieve-stack"),
    cbr: seedId("equip", "cbr-press"),
    cube: seedId("equip", "cube-crusher"),
    oven: seedId("equip", "drying-oven"),
  },
  maintenance: {
    sieve: seedId("maint", "sieve"),
    cube: seedId("maint", "cube"),
  },
  templates: {
    review: seedId("template", "review"),
    adequacy: seedId("template", "adequacy"),
  },
  sampleReceipt: {
    jinja: seedId("receipt", "jinja"),
    kololo: seedId("receipt", "kololo"),
  },
  workOrder: {
    jinja: seedId("wo", "jinja"),
    kololo: seedId("wo", "kololo"),
  },
  report: {
    jinja: seedId("report", "jinja"),
  },
  rfi: {
    labToLab: seedId("rfi", "lab-to-lab"),
    labToClient: seedId("rfi", "lab-to-client"),
    clientToLab: seedId("rfi", "client-to-lab"),
  },
  feedback: {
    action: seedId("feedback-action", "turnaround"),
    survey: seedId("feedback", "unra"),
  },
  notification: {
    invoiceIssued: seedId("notification", "invoice-issued"),
  },
} as const;

/** Total projects created by the seed, including the six featured jobs. */
export const PROJECT_COUNT = 70;
export const FEATURED_PROJECT_COUNT = 6;

/**
 * Workstation counts. A lab's assigned projects must never exceed capacity.
 * Keep this true whenever seed data is regenerated. Do not set lab status to
 * `fullCapacity` just because a lab is fully booked — that flags overload.
 */
export const LAB_CAPACITIES = {
  soil: 28,
  concrete: 22,
  asphalt: 14,
} as const;

/**
 * How many projects sit on each lab. Only one lab should be at capacity so
 * the dashboard shows mixed load rather than every station full.
 */
export const LAB_TARGET_LOADS = {
  soil: LAB_CAPACITIES.soil,
  concrete: 12,
  asphalt: 7,
} as const;

export type SeedLabKind = keyof typeof LAB_CAPACITIES;

export const FEATURED_LAB_PROJECTS = {
  soil: [
    IDS.project.jinja,
    IDS.project.namanve,
    IDS.project.gulu,
    IDS.project.marina,
  ],
  concrete: [IDS.project.kololo],
  asphalt: [IDS.project.entebbe],
} as const;

export function extraProjectId(seq: number) {
  return seedId("project", String(FEATURED_PROJECT_COUNT + seq).padStart(2, "0"));
}

export function extraQuotationId(seq: number) {
  return seedId("quotation", "x", String(seq).padStart(2, "0"));
}

/**
 * Assign extra projects up to each lab's target load. Remaining extras stay
 * unassigned rather than overflowing or filling every station.
 */
export function extraLabKinds(extraCount: number): Array<SeedLabKind | null> {
  const remaining: Record<SeedLabKind, number> = {
    soil: LAB_TARGET_LOADS.soil - FEATURED_LAB_PROJECTS.soil.length,
    concrete: LAB_TARGET_LOADS.concrete - FEATURED_LAB_PROJECTS.concrete.length,
    asphalt: LAB_TARGET_LOADS.asphalt - FEATURED_LAB_PROJECTS.asphalt.length,
  };
  const order: SeedLabKind[] = ["soil", "concrete", "asphalt"];
  const assigned: Array<SeedLabKind | null> = [];
  let cursor = 0;

  for (let i = 0; i < extraCount; i++) {
    let kind: SeedLabKind | null = null;
    for (let attempt = 0; attempt < order.length; attempt++) {
      const candidate = order[(cursor + attempt) % order.length];
      if (remaining[candidate] > 0) {
        remaining[candidate] -= 1;
        kind = candidate;
        cursor = (cursor + attempt + 1) % order.length;
        break;
      }
    }
    assigned.push(kind);
  }

  return assigned;
}

function takeWithinCapacity(ids: string[], capacity: number, lab: SeedLabKind) {
  if (ids.length > capacity) {
    throw new Error(
      `Seed assigns ${ids.length} projects to the ${lab} lab, over capacity ${capacity}.`
    );
  }
  return ids;
}

export function assignProjectsWithinCapacity(input: {
  soil: string[];
  concrete: string[];
  asphalt: string[];
}) {
  return {
    soil: takeWithinCapacity(input.soil, LAB_CAPACITIES.soil, "soil"),
    concrete: takeWithinCapacity(
      input.concrete,
      LAB_CAPACITIES.concrete,
      "concrete"
    ),
    asphalt: takeWithinCapacity(input.asphalt, LAB_CAPACITIES.asphalt, "asphalt"),
  };
}
