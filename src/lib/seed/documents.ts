import {
  assignProjectsWithinCapacity,
  extraLabKinds,
  extraProjectId,
  extraQuotationId,
  FEATURED_LAB_PROJECTS,
  FEATURED_PROJECT_COUNT,
  IDS,
  keyed,
  LAB_CAPACITIES,
  PROJECT_COUNT,
  seedRef,
} from "./ids";

export type SeedDoc = {
  _id: string;
  _type: string;
  [key: string]: unknown;
};

function daysFromNow(days: number) {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function dateFromNow(days: number) {
  return daysFromNow(days).slice(0, 10);
}

const CLIENTS = [
  { client: IDS.client.unra, contact: IDS.contact.unra },
  { client: IDS.client.kcca, contact: IDS.contact.kcca },
  { client: IDS.client.crsg, contact: IDS.contact.crsg },
  { client: IDS.client.pearl, contact: IDS.contact.pearl },
] as const;

const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

const EXTRA_PROJECT_NAMES = [
  "Masaka–Mbarara Road widening — borrow-pit testing",
  "Kampala Flyover — pile foundation soils",
  "Hoima–Butiaba Road — subgrade CBR",
  "Mukono–Katosi Road — laterite classification",
  "Iganga–Tirinyi Road — compaction control",
  "Fort Portal–Bundibugyo Road — residual soils",
  "Soroti–Moroto Road — gravel wearing course",
  "Lira–Kitgum Road — pavement investigation",
  "Mbale–Sironko Road — cut-slope materials",
  "Mityana–Mubende Road — fill acceptance",
  "Tororo–Malaba Road — subbase CBR",
  "Busia border post — foundation soils",
  "Kira–Kasangati Road — roadbed testing",
  "Entebbe–Kampala Expressway — shoulder materials",
  "Namboole stadium access — earthworks",
  "Nakivubo channel lining — backfill soils",
  "Bombo barracks pavement — gravel tests",
  "Kawempe–Mpererwe Road — laterite pits",
  "Gayaza–Zirobwe Road — compaction trials",
  "Lugazi sugar estate roads — borrow assessment",
  "Ntinda–Kiwatule dualing — subgrade",
  "Kisenyi market slab — concrete cubes",
  "Makerere University library — cube crushing",
  "Mulago hospital extension — structural concrete",
  "Speke Resort Convention — cube sets",
  "Acacia Mall expansion — concrete strength",
  "NSSF Pension Towers — 28-day cubes",
  "Uganda Museum annex — concrete quality",
  "KCCA City Hall retrofit — cube testing",
  "Serena Conference Centre — structural cubes",
  "Pearl of Africa Hotel — concrete QA",
  "Nakawa Business Park — cube crushing",
  "Industrial Area warehouse B — concrete",
  "Namanve factory slab — cube sets",
  "Bweyogerere housing — foundation cubes",
  "Lubowa residential — structural concrete",
  "Munyonyo apartments — cube testing",
  "Port Bell jetty — marine concrete",
  "Jinja Bridge approach — deck cubes",
  "Owen Falls dam works — mass concrete",
  "Karuma hydropower camp — concrete QA",
  "Isimba dam access — cube crushing",
  "Entebbe cargo apron — asphalt overlay",
  "Kajjansi airfield — bitumen tests",
  "Mbarara bypass — asphalt mix",
  "Gulu municipal roads — binder tests",
  "Arua town roads — asphalt cores",
  "Kabale–Kisoro Road — bitumen penetration",
  "Masindi–Hoima Road — AC overlay",
  "Kasese airport — runway mix",
  "Pakwach bridge approaches — asphalt",
  "Lweza–Kajjansi Road — wearing course",
  "Northern Bypass section 3 — asphalt",
  "Clock Tower junction — overlay mix",
  "Wandegeya underpass — bitumen",
  "Mukono town roads — AC testing",
  "Wakiso district roads — gravel & CBR",
  "Mpigi town council — laterite",
  "Kayunga–Bbaale Road — soils",
  "Buikwe landing site — earthworks",
  "Kalangala ferry terminal — fill",
  "Ssembabule–Lwemiyaga Road — CBR",
  "Lyantonde–Rakai Road — compaction",
  "Rukungiri–Kihihi Road — residual soils",
] as const;

type LabKind = "soil" | "concrete" | "asphalt";

function extraServiceFor(kind: LabKind, seq: number) {
  if (kind === "concrete") {
    return { serviceId: IDS.service.cube, methodId: IDS.testMethod.cube };
  }
  if (kind === "asphalt") {
    return { serviceId: IDS.service.bitumen, methodId: IDS.testMethod.bitumen };
  }
  const soil = [
    { serviceId: IDS.service.psd, methodId: IDS.testMethod.psd },
    { serviceId: IDS.service.atterberg, methodId: IDS.testMethod.atterberg },
    { serviceId: IDS.service.compaction, methodId: IDS.testMethod.compaction },
    { serviceId: IDS.service.cbr, methodId: IDS.testMethod.cbr },
  ];
  return soil[(seq - 1) % soil.length];
}

function extraPersonnelId(kind: LabKind) {
  if (kind === "concrete") return IDS.personnel.techConcrete;
  if (kind === "asphalt") return IDS.personnel.engineer;
  return IDS.personnel.techSoilA;
}

function quotationDoc(input: {
  id: string;
  number: string;
  status: string;
  items: Array<{
    serviceId: string;
    methodId: string;
    unitPrice: number;
    quantity: number;
    unit: string;
  }>;
  otherItems?: Array<{
    type: "mobilization" | "reporting";
    activity: string;
    unitPrice: number;
    quantity: number;
  }>;
  rejectionNotes?: string;
}): SeedDoc {
  const items = keyed(
    input.items.map((item) => ({
      _type: "serviceItem",
      service: seedRef(item.serviceId),
      testMethod: seedRef(item.methodId),
      unit: item.unit,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.unitPrice * item.quantity,
    })),
    "item"
  );
  const otherItems = keyed(
    (input.otherItems ?? []).map((item) => ({
      _type: "otherItem",
      type: item.type,
      activity: item.activity,
      unit: "lump sum",
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.unitPrice * item.quantity,
    })),
    "other"
  );
  const subtotal =
    items.reduce((sum, item) => sum + Number(item.lineTotal), 0) +
    otherItems.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  const vatPercentage = 18;
  const grandTotal = Math.round(subtotal * (1 + vatPercentage / 100));

  return {
    _id: input.id,
    _type: "quotation",
    quotationNumber: input.number,
    revisionNumber: "R2026-00",
    acquisitionNumber: input.number.replace("Q", "A"),
    quotationDate: daysFromNow(-20),
    currency: "ugx",
    status: input.status,
    items,
    otherItems,
    vatPercentage,
    advance: 60,
    paymentNotes: "60% advance on acceptance. Balance on report issue.",
    subtotal,
    grandTotal,
    rejectionNotes: input.rejectionNotes,
  };
}

export function buildSeedDocuments(): SeedDoc[] {
  const extraKinds = extraLabKinds(PROJECT_COUNT - FEATURED_PROJECT_COUNT);

  const standards: SeedDoc[] = [
    {
      _id: IDS.standard.bs1377,
      _type: "standard",
      name: "Methods of test for soils for civil engineering purposes",
      acronym: "BS 1377",
      description: "British Standard suite for classification and compaction of soils.",
    },
    {
      _id: IDS.standard.astmD422,
      _type: "standard",
      name: "Standard Test Method for Particle-Size Analysis of Soils",
      acronym: "ASTM D422",
      description: "Hydrometer and sieve analysis of soils.",
    },
    {
      _id: IDS.standard.astmD698,
      _type: "standard",
      name: "Standard Test Methods for Laboratory Compaction Characteristics",
      acronym: "ASTM D698",
      description: "Standard Proctor compaction.",
    },
    {
      _id: IDS.standard.aashtoT99,
      _type: "standard",
      name: "Moisture-Density Relations of Soils",
      acronym: "AASHTO T99",
      description: "AASHTO standard Proctor.",
    },
    {
      _id: IDS.standard.bsEn12390,
      _type: "standard",
      name: "Testing hardened concrete — Compressive strength",
      acronym: "BS EN 12390",
      description: "Concrete cube and cylinder compressive strength.",
    },
  ];

  const testMethods: SeedDoc[] = [
    {
      _id: IDS.testMethod.psd,
      _type: "testMethod",
      standard: seedRef(IDS.standard.astmD422),
      code: "ASTM D422 / BS 1377-2",
      description: "Particle size distribution by wet/dry sieving and hydrometer.",
    },
    {
      _id: IDS.testMethod.atterberg,
      _type: "testMethod",
      standard: seedRef(IDS.standard.bs1377),
      code: "BS 1377-2 §4–5",
      description: "Liquid and plastic limits.",
    },
    {
      _id: IDS.testMethod.compaction,
      _type: "testMethod",
      standard: seedRef(IDS.standard.astmD698),
      code: "ASTM D698 / AASHTO T99",
      description: "Standard Proctor — MDD and OMC.",
    },
    {
      _id: IDS.testMethod.cbr,
      _type: "testMethod",
      standard: seedRef(IDS.standard.bs1377),
      code: "BS 1377-4 / AASHTO T193",
      description: "California Bearing Ratio, soaked.",
    },
    {
      _id: IDS.testMethod.cube,
      _type: "testMethod",
      standard: seedRef(IDS.standard.bsEn12390),
      code: "BS EN 12390-3",
      description: "Compressive strength of 150 mm cubes.",
    },
    {
      _id: IDS.testMethod.bitumen,
      _type: "testMethod",
      standard: seedRef(IDS.standard.bs1377),
      code: "ASTM D5 / D36",
      description: "Bitumen penetration and softening point.",
    },
  ];

  const sampleClasses: SeedDoc[] = [
    {
      _id: IDS.sampleClass.soil,
      _type: "sampleClass",
      name: "Soil",
      description: "Disturbed and undisturbed soil samples from trial pits and boreholes.",
      subclasses: keyed(
        [
          { name: "Disturbed", key: "disturbed" },
          { name: "Undisturbed (U100)", key: "undisturbed" },
          { name: "Bulk", key: "bulk" },
        ],
        "soil"
      ),
    },
    {
      _id: IDS.sampleClass.aggregate,
      _type: "sampleClass",
      name: "Aggregate",
      description: "Fine and coarse aggregates for concrete and pavement.",
      subclasses: keyed(
        [
          { name: "Fine", key: "fine" },
          { name: "Coarse", key: "coarse" },
        ],
        "agg"
      ),
    },
    {
      _id: IDS.sampleClass.concrete,
      _type: "sampleClass",
      name: "Concrete",
      description: "Fresh concrete cubes and cores.",
      subclasses: keyed(
        [
          { name: "Cubes", key: "cubes" },
          { name: "Cores", key: "cores" },
        ],
        "conc"
      ),
    },
    {
      _id: IDS.sampleClass.asphalt,
      _type: "sampleClass",
      name: "Asphalt / Bitumen",
      description: "Bituminous binders and asphalt mix.",
      subclasses: keyed(
        [
          { name: "Binder", key: "binder" },
          { name: "Asphalt mix", key: "mix" },
        ],
        "asp"
      ),
    },
  ];

  const services: SeedDoc[] = [
    {
      _id: IDS.service.psd,
      _type: "service",
      code: "SOIL-PSD",
      testParameter: "Particle Size Distribution",
      testMethods: [seedRef(IDS.testMethod.psd)],
      sampleClass: seedRef(IDS.sampleClass.soil),
      status: "active",
    },
    {
      _id: IDS.service.atterberg,
      _type: "service",
      code: "SOIL-ATT",
      testParameter: "Atterberg Limits",
      testMethods: [seedRef(IDS.testMethod.atterberg)],
      sampleClass: seedRef(IDS.sampleClass.soil),
      status: "active",
    },
    {
      _id: IDS.service.compaction,
      _type: "service",
      code: "SOIL-COMP",
      testParameter: "Compaction (MDD / OMC)",
      testMethods: [seedRef(IDS.testMethod.compaction)],
      sampleClass: seedRef(IDS.sampleClass.soil),
      status: "active",
    },
    {
      _id: IDS.service.cbr,
      _type: "service",
      code: "SOIL-CBR",
      testParameter: "California Bearing Ratio",
      testMethods: [seedRef(IDS.testMethod.cbr)],
      sampleClass: seedRef(IDS.sampleClass.soil),
      status: "active",
    },
    {
      _id: IDS.service.cube,
      _type: "service",
      code: "CONC-CUBE",
      testParameter: "Concrete Cube Strength",
      testMethods: [seedRef(IDS.testMethod.cube)],
      sampleClass: seedRef(IDS.sampleClass.concrete),
      status: "active",
    },
    {
      _id: IDS.service.bitumen,
      _type: "service",
      code: "ASP-PEN",
      testParameter: "Bitumen Penetration",
      testMethods: [seedRef(IDS.testMethod.bitumen)],
      sampleClass: seedRef(IDS.sampleClass.asphalt),
      status: "active",
    },
  ];

  const departments: SeedDoc[] = [
    {
      _id: IDS.department.laboratories,
      _type: "department",
      department: "Laboratories",
      createdBy: "seed",
      roles: keyed(
        [
          { roleName: "Lab Technician" },
          { roleName: "Lab Engineer" },
          { roleName: "Senior Lab Engineer" },
          { roleName: "Lab Manager" },
        ],
        "role"
      ),
    },
    {
      _id: IDS.department.technical,
      _type: "department",
      department: "Technical",
      createdBy: "seed",
      roles: keyed([{ roleName: "Technical Manager" }], "role"),
    },
    {
      _id: IDS.department.finance,
      _type: "department",
      department: "Finance",
      createdBy: "seed",
      roles: keyed(
        [{ roleName: "Billing Officer" }, { roleName: "Accounts Officer" }],
        "role"
      ),
    },
    {
      _id: IDS.department.administration,
      _type: "department",
      department: "Administration",
      createdBy: "seed",
      roles: keyed([{ roleName: "Administrator" }], "role"),
    },
  ];

  const personnel: SeedDoc[] = [
    {
      _id: IDS.personnel.manager,
      _type: "personnel",
      internalId: "GET-90001",
      fullName: "Sarah Nakato",
      email: "sarah.nakato@seed.getlab.test",
      phone: "+256700900001",
      status: "active",
      appAccessStatus: "none",
      departmentRoles: keyed(
        [
          {
            department: seedRef(IDS.department.laboratories),
            role: "Lab Manager",
          },
        ],
        "role"
      ),
    },
    {
      _id: IDS.personnel.engineer,
      _type: "personnel",
      internalId: "GET-90002",
      fullName: "Daniel Okello",
      email: "daniel.okello@seed.getlab.test",
      phone: "+256700900002",
      status: "active",
      appAccessStatus: "none",
      departmentRoles: keyed(
        [
          {
            department: seedRef(IDS.department.laboratories),
            role: "Senior Lab Engineer",
          },
        ],
        "role"
      ),
    },
    {
      _id: IDS.personnel.techSoilA,
      _type: "personnel",
      internalId: "GET-90003",
      fullName: "Grace Namara",
      email: "grace.namara@seed.getlab.test",
      phone: "+256700900003",
      status: "active",
      appAccessStatus: "none",
      departmentRoles: keyed(
        [
          {
            department: seedRef(IDS.department.laboratories),
            role: "Lab Technician",
          },
        ],
        "role"
      ),
    },
    {
      _id: IDS.personnel.techSoilB,
      _type: "personnel",
      internalId: "GET-90004",
      fullName: "Peter Kato",
      email: "peter.kato@seed.getlab.test",
      phone: "+256700900004",
      status: "active",
      appAccessStatus: "none",
      departmentRoles: keyed(
        [
          {
            department: seedRef(IDS.department.laboratories),
            role: "Lab Technician",
          },
        ],
        "role"
      ),
    },
    {
      _id: IDS.personnel.techConcrete,
      _type: "personnel",
      internalId: "GET-90005",
      fullName: "Joan Akyoo",
      email: "joan.akyoo@seed.getlab.test",
      phone: "+256700900005",
      status: "active",
      appAccessStatus: "none",
      departmentRoles: keyed(
        [
          {
            department: seedRef(IDS.department.laboratories),
            role: "Lab Engineer",
          },
        ],
        "role"
      ),
    },
    {
      _id: IDS.personnel.billing,
      _type: "personnel",
      internalId: "GET-90006",
      fullName: "Rita Nambi",
      email: "rita.nambi@seed.getlab.test",
      phone: "+256700900006",
      status: "active",
      appAccessStatus: "none",
      departmentRoles: keyed(
        [
          {
            department: seedRef(IDS.department.finance),
            role: "Billing Officer",
          },
        ],
        "role"
      ),
    },
  ];

  const clients: SeedDoc[] = [
    {
      _id: IDS.client.unra,
      _type: "client",
      internalId: "C2026-90001",
      name: "Uganda National Roads Authority",
    },
    {
      _id: IDS.client.kcca,
      _type: "client",
      internalId: "C2026-90002",
      name: "Kampala Capital City Authority",
    },
    {
      _id: IDS.client.crsg,
      _type: "client",
      internalId: "C2026-90003",
      name: "China Railway Seventh Group",
    },
    {
      _id: IDS.client.pearl,
      _type: "client",
      internalId: "C2026-90004",
      name: "Pearl Marina Estates",
    },
  ];

  const contacts: SeedDoc[] = [
    {
      _id: IDS.contact.unra,
      _type: "contactPerson",
      name: "James Mugisha",
      email: "j.mugisha@seed.unra.test",
      designation: "Materials Engineer",
      phone: "+256772100001",
      client: seedRef(IDS.client.unra),
      appAccessStatus: "none",
    },
    {
      _id: IDS.contact.kcca,
      _type: "contactPerson",
      name: "Doreen Atuhaire",
      email: "d.atuhaire@seed.kcca.test",
      designation: "Project Coordinator",
      phone: "+256772100002",
      client: seedRef(IDS.client.kcca),
      appAccessStatus: "none",
    },
    {
      _id: IDS.contact.crsg,
      _type: "contactPerson",
      name: "Wei Li",
      email: "wei.li@seed.crsg.test",
      designation: "Site Agent",
      phone: "+256772100003",
      client: seedRef(IDS.client.crsg),
      appAccessStatus: "none",
    },
    {
      _id: IDS.contact.pearl,
      _type: "contactPerson",
      name: "Andrew Ssali",
      email: "a.ssali@seed.pearl.test",
      designation: "Development Manager",
      phone: "+256772100004",
      client: seedRef(IDS.client.pearl),
      appAccessStatus: "none",
    },
  ];

  const quotations: SeedDoc[] = [
    quotationDoc({
      id: IDS.quotation.jinja,
      number: "Q2026-90001",
      status: "accepted",
      items: [
        {
          serviceId: IDS.service.psd,
          methodId: IDS.testMethod.psd,
          unitPrice: 180000,
          quantity: 12,
          unit: "number",
        },
        {
          serviceId: IDS.service.compaction,
          methodId: IDS.testMethod.compaction,
          unitPrice: 220000,
          quantity: 8,
          unit: "number",
        },
        {
          serviceId: IDS.service.cbr,
          methodId: IDS.testMethod.cbr,
          unitPrice: 260000,
          quantity: 8,
          unit: "number",
        },
      ],
      otherItems: [
        {
          type: "mobilization",
          activity: "Sample collection — Mukono camp",
          unitPrice: 1500000,
          quantity: 1,
        },
        {
          type: "reporting",
          activity: "Factual materials report",
          unitPrice: 800000,
          quantity: 1,
        },
      ],
    }),
    quotationDoc({
      id: IDS.quotation.entebbe,
      number: "Q2026-90002",
      status: "sent",
      items: [
        {
          serviceId: IDS.service.bitumen,
          methodId: IDS.testMethod.bitumen,
          unitPrice: 310000,
          quantity: 6,
          unit: "number",
        },
      ],
      otherItems: [
        {
          type: "reporting",
          activity: "Asphalt overlay test summary",
          unitPrice: 500000,
          quantity: 1,
        },
      ],
    }),
    quotationDoc({
      id: IDS.quotation.namanve,
      number: "Q2026-90003",
      status: "sent",
      items: [
        {
          serviceId: IDS.service.atterberg,
          methodId: IDS.testMethod.atterberg,
          unitPrice: 150000,
          quantity: 10,
          unit: "number",
        },
        {
          serviceId: IDS.service.psd,
          methodId: IDS.testMethod.psd,
          unitPrice: 180000,
          quantity: 10,
          unit: "number",
        },
      ],
    }),
    quotationDoc({
      id: IDS.quotation.gulu,
      number: "Q2026-90004",
      status: "rejected",
      items: [
        {
          serviceId: IDS.service.cbr,
          methodId: IDS.testMethod.cbr,
          unitPrice: 260000,
          quantity: 20,
          unit: "number",
        },
      ],
      rejectionNotes:
        "Client requested a revised scope covering only the northern lots.",
    }),
    ...Array.from(
      { length: PROJECT_COUNT - FEATURED_PROJECT_COUNT },
      (_, index) => {
        const seq = index + 1;
        if (seq > 48) return null;
        const kind = extraKinds[index] ?? "soil";
        const service = extraServiceFor(kind, seq);
        const statuses = ["accepted", "sent", "draft", "rejected"] as const;
        return quotationDoc({
          id: extraQuotationId(seq),
          number: `Q2026-${String(90004 + seq).padStart(5, "0")}`,
          status: statuses[(seq - 1) % statuses.length],
          items: [
            {
              serviceId: service.serviceId,
              methodId: service.methodId,
              unitPrice: 120000 + seq * 2500,
              quantity: 4 + (seq % 8),
              unit: "number",
            },
          ],
        });
      }
    ).filter((doc): doc is SeedDoc => Boolean(doc)),
  ];

  const extraProjects: SeedDoc[] = EXTRA_PROJECT_NAMES.slice(
    0,
    PROJECT_COUNT - FEATURED_PROJECT_COUNT
  ).map((name, index) => {
    const seq = index + 1;
    const party = CLIENTS[index % CLIENTS.length];
    const kind = extraKinds[index];
    const quoted = seq <= 48;
    return {
      _id: extraProjectId(seq),
      _type: "project",
      internalId: `P2026-${String(90006 + seq).padStart(5, "0")}`,
      name,
      priority: PRIORITIES[index % PRIORITIES.length],
      startDate: daysFromNow(-40 + (seq % 36)),
      endDate: daysFromNow(-12 + (seq % 50)),
      stagesCompleted: quoted && seq % 4 === 1 ? ["quotation"] : [],
      clients: [seedRef(party.client)],
      contactPersons: [seedRef(party.contact)],
      projectPersonnel: kind ? [seedRef(extraPersonnelId(kind))] : [],
      projectSupervisors: [seedRef(IDS.personnel.manager)],
      ...(quoted ? { quotation: seedRef(extraQuotationId(seq)) } : {}),
    };
  });

  const featuredProjects: SeedDoc[] = [
    {
      _id: IDS.project.jinja,
      _type: "project",
      internalId: "P2026-90001",
      name: "Kampala–Jinja Expressway Package 2 — materials testing",
      priority: "high",
      startDate: daysFromNow(-45),
      endDate: daysFromNow(18),
      stagesCompleted: ["quotation"],
      clients: [seedRef(IDS.client.unra)],
      contactPersons: [seedRef(IDS.contact.unra)],
      projectPersonnel: [
        seedRef(IDS.personnel.engineer),
        seedRef(IDS.personnel.techSoilA),
        seedRef(IDS.personnel.techSoilB),
      ],
      projectSupervisors: [seedRef(IDS.personnel.manager)],
      quotation: seedRef(IDS.quotation.jinja),
      sampleReceipt: seedRef(IDS.sampleReceipt.jinja),
      workOrder: seedRef(IDS.workOrder.jinja),
      report: seedRef(IDS.report.jinja),
    },
    {
      _id: IDS.project.entebbe,
      _type: "project",
      internalId: "P2026-90002",
      name: "Entebbe International Airport runway overlay",
      priority: "urgent",
      startDate: daysFromNow(-12),
      endDate: daysFromNow(8),
      stagesCompleted: [],
      clients: [seedRef(IDS.client.kcca)],
      contactPersons: [seedRef(IDS.contact.kcca)],
      projectPersonnel: [seedRef(IDS.personnel.engineer)],
      projectSupervisors: [seedRef(IDS.personnel.manager)],
      quotation: seedRef(IDS.quotation.entebbe),
    },
    {
      _id: IDS.project.namanve,
      _type: "project",
      internalId: "P2026-90003",
      name: "Namanve Industrial Park access roads",
      priority: "medium",
      startDate: daysFromNow(-20),
      endDate: daysFromNow(-3),
      stagesCompleted: [],
      clients: [seedRef(IDS.client.crsg)],
      contactPersons: [seedRef(IDS.contact.crsg)],
      projectPersonnel: [seedRef(IDS.personnel.techSoilA)],
      projectSupervisors: [seedRef(IDS.personnel.engineer)],
      quotation: seedRef(IDS.quotation.namanve),
    },
    {
      _id: IDS.project.gulu,
      _type: "project",
      internalId: "P2026-90004",
      name: "Gulu–Nimule Road reconstruction",
      priority: "medium",
      startDate: daysFromNow(-5),
      endDate: daysFromNow(40),
      stagesCompleted: [],
      clients: [seedRef(IDS.client.unra)],
      contactPersons: [seedRef(IDS.contact.unra)],
      projectPersonnel: [seedRef(IDS.personnel.techSoilB)],
      projectSupervisors: [seedRef(IDS.personnel.engineer)],
      quotation: seedRef(IDS.quotation.gulu),
    },
    {
      _id: IDS.project.kololo,
      _type: "project",
      internalId: "P2026-90005",
      name: "Kololo housing estate — concrete cubes",
      priority: "high",
      startDate: daysFromNow(-8),
      endDate: daysFromNow(21),
      stagesCompleted: [],
      clients: [seedRef(IDS.client.pearl)],
      contactPersons: [seedRef(IDS.contact.pearl)],
      projectPersonnel: [seedRef(IDS.personnel.techConcrete)],
      projectSupervisors: [seedRef(IDS.personnel.manager)],
      sampleReceipt: seedRef(IDS.sampleReceipt.kololo),
      workOrder: seedRef(IDS.workOrder.kololo),
    },
    {
      _id: IDS.project.marina,
      _type: "project",
      internalId: "P2026-90006",
      name: "Pearl Marina geotechnical investigation",
      priority: "low",
      startDate: daysFromNow(3),
      endDate: daysFromNow(60),
      stagesCompleted: [],
      clients: [seedRef(IDS.client.pearl)],
      contactPersons: [seedRef(IDS.contact.pearl)],
      projectPersonnel: [seedRef(IDS.personnel.engineer)],
      projectSupervisors: [seedRef(IDS.personnel.manager)],
    },
  ];

  const projects: SeedDoc[] = [...featuredProjects, ...extraProjects];

  const extraByLab = extraProjects.reduce(
    (acc, project, index) => {
      const kind = extraKinds[index];
      if (kind) acc[kind].push(project._id);
      return acc;
    },
    { soil: [] as string[], concrete: [] as string[], asphalt: [] as string[] }
  );

  const labProjects = assignProjectsWithinCapacity({
    soil: [...FEATURED_LAB_PROJECTS.soil, ...extraByLab.soil],
    concrete: [...FEATURED_LAB_PROJECTS.concrete, ...extraByLab.concrete],
    asphalt: [...FEATURED_LAB_PROJECTS.asphalt, ...extraByLab.asphalt],
  });

  const equipment: SeedDoc[] = [
    {
      _id: IDS.equipment.sieve,
      _type: "equipment",
      internalId: "EQ-90001",
      name: "Motorised sieve shaker",
      serialNumber: "MS-4401",
      category: "sieving_grading",
      manufacturer: "Controls",
      model: "15-D0415",
      status: "available",
      lastMaintenance: dateFromNow(-40),
      nextMaintenance: dateFromNow(50),
      assignedPersonnel: [seedRef(IDS.personnel.techSoilA)],
    },
    {
      _id: IDS.equipment.cbr,
      _type: "equipment",
      internalId: "EQ-90002",
      name: "CBR compression machine",
      serialNumber: "CBR-8821",
      category: "compression_testing",
      manufacturer: "ELE",
      model: "26-9050",
      status: "in_use",
      lastMaintenance: dateFromNow(-20),
      nextMaintenance: dateFromNow(70),
      assignedPersonnel: [seedRef(IDS.personnel.techSoilB)],
    },
    {
      _id: IDS.equipment.cube,
      _type: "equipment",
      internalId: "EQ-90003",
      name: "2000 kN cube crusher",
      serialNumber: "CC-2000-17",
      category: "compression_testing",
      manufacturer: "Matest",
      model: "C089-22N",
      status: "available",
      lastMaintenance: dateFromNow(-10),
      nextMaintenance: dateFromNow(80),
      assignedPersonnel: [seedRef(IDS.personnel.techConcrete)],
    },
    {
      _id: IDS.equipment.oven,
      _type: "equipment",
      internalId: "EQ-90004",
      name: "Drying oven 250 °C",
      serialNumber: "OV-1188",
      category: "moisture_density",
      manufacturer: "Memmert",
      model: "UN260",
      status: "under_maintenance",
      lastMaintenance: dateFromNow(-2),
      nextMaintenance: dateFromNow(5),
      assignedPersonnel: [seedRef(IDS.personnel.techSoilA)],
    },
  ];

  const labs: SeedDoc[] = [
    {
      _id: IDS.lab.soil,
      _type: "lab",
      internalId: "LAB-90001",
      name: "Soil Mechanics Laboratory",
      description: "Classification, compaction and CBR for highway materials.",
      labSection: "soil_testing",
      status: "available",
      location: "GETLAB Ntinda — Block A",
      capacity: LAB_CAPACITIES.soil,
      personnel: [
        seedRef(IDS.personnel.techSoilA),
        seedRef(IDS.personnel.techSoilB),
      ],
      labHead: seedRef(IDS.personnel.engineer),
      equipment: [seedRef(IDS.equipment.sieve), seedRef(IDS.equipment.cbr)],
      projects: labProjects.soil.map(seedRef),
      testCapabilities: [
        seedRef(IDS.service.psd),
        seedRef(IDS.service.atterberg),
        seedRef(IDS.service.compaction),
        seedRef(IDS.service.cbr),
      ],
    },
    {
      _id: IDS.lab.concrete,
      _type: "lab",
      internalId: "LAB-90002",
      name: "Concrete Testing Laboratory",
      description: "Cube crushing and fresh concrete properties.",
      labSection: "concrete_testing",
      status: "available",
      location: "GETLAB Ntinda — Block B",
      capacity: LAB_CAPACITIES.concrete,
      personnel: [seedRef(IDS.personnel.techConcrete)],
      labHead: seedRef(IDS.personnel.manager),
      equipment: [seedRef(IDS.equipment.cube)],
      projects: labProjects.concrete.map(seedRef),
      testCapabilities: [seedRef(IDS.service.cube)],
    },
    {
      _id: IDS.lab.asphalt,
      _type: "lab",
      internalId: "LAB-90003",
      name: "Asphalt and Bitumen Laboratory",
      description: "Binder and mix characterisation for overlays.",
      labSection: "asphalt_lab",
      status: "available",
      location: "GETLAB Ntinda — Block C",
      capacity: LAB_CAPACITIES.asphalt,
      personnel: [seedRef(IDS.personnel.engineer)],
      labHead: seedRef(IDS.personnel.manager),
      projects: labProjects.asphalt.map(seedRef),
      testCapabilities: [seedRef(IDS.service.bitumen)],
    },
  ];

  const maintenance: SeedDoc[] = [
    {
      _id: IDS.maintenance.sieve,
      _type: "maintenanceLog",
      equipment: seedRef(IDS.equipment.sieve),
      date: daysFromNow(-40),
      supervisedBy: seedRef(IDS.personnel.engineer),
      maintenanceType: "calibration",
      maintenanceNotes:
        "Sieve nest checked against reference beads. 75 µm pan replaced.",
      maintenanceCompany: {
        companyName: "UNBS Metrology",
        contactPerson: "Samuel Waiswa",
        contactEmail: "metrology@seed.unbs.test",
        contactPhone: "+256414100000",
      },
    },
    {
      _id: IDS.maintenance.cube,
      _type: "maintenanceLog",
      equipment: seedRef(IDS.equipment.oven),
      date: daysFromNow(-2),
      supervisedBy: seedRef(IDS.personnel.manager),
      maintenanceType: "repair",
      maintenanceNotes:
        "Thermostat replacement. Oven out of service until verification.",
    },
  ];

  const templates: SeedDoc[] = [
    {
      _id: IDS.templates.review,
      _type: "sampleReviewTemplate",
      name: "Standard Laboratory Review Template",
      version: "1.0",
      description: "Seeded review questions for sample receipt.",
      isActive: true,
      reviewItems: keyed(
        [
          {
            id: 1,
            label: "Is the test method adequately defined and understood?",
            category: "test_method",
            required: true,
          },
          {
            id: 2,
            label:
              "Does the laboratory have capability and resources to meet the request?",
            category: "lab_capability",
            required: true,
          },
          {
            id: 3,
            label: "Is the quantity of sample adequate for all requested tests?",
            category: "sample_adequacy",
            required: true,
          },
          {
            id: 4,
            label: "Are the parameters covered under the scope of accreditation?",
            category: "compliance",
            required: true,
          },
        ],
        "review"
      ),
    },
    {
      _id: IDS.templates.adequacy,
      _type: "sampleAdequacyTemplate",
      name: "Standard Sample Adequacy Checklist",
      version: "1.0",
      description: "Seeded adequacy checks for sample receipt.",
      isActive: true,
      adequacyChecks: keyed(
        [
          {
            id: 1,
            label: "Sample label present and legible",
            required: true,
            category: "sample_identification",
          },
          {
            id: 2,
            label: "Identification number on the sample",
            required: true,
            category: "sample_identification",
          },
          {
            id: 3,
            label: "Quantity adequate for the requested tests",
            required: true,
            category: "sample_condition",
          },
          {
            id: 4,
            label: "Sample is packed properly",
            required: true,
            category: "sample_condition",
          },
          {
            id: 5,
            label: "Terms of reference / test request attached",
            required: true,
            category: "documentation",
          },
        ],
        "check"
      ),
    },
  ];

  const sampleReceipts: SeedDoc[] = [
    {
      _id: IDS.sampleReceipt.jinja,
      _type: "sampleReceipt",
      project: seedRef(IDS.project.jinja),
      sampleReceiptNumber: "SR2026-90001",
      revisionNumber: "R2026-00",
      status: "approved",
      reviewTemplate: seedRef(IDS.templates.review),
      reviewItems: keyed(
        [
          {
            templateItemId: 1,
            label: "Is the test method adequately defined and understood?",
            status: "yes",
          },
          {
            templateItemId: 2,
            label:
              "Does the laboratory have capability and resources to meet the request?",
            status: "yes",
          },
          {
            templateItemId: 3,
            label: "Is the quantity of sample adequate for all requested tests?",
            status: "yes",
          },
          {
            templateItemId: 4,
            label: "Are the parameters covered under the scope of accreditation?",
            status: "yes",
          },
        ],
        "rev"
      ),
      adequacyTemplate: seedRef(IDS.templates.adequacy),
      adequacyChecks: keyed(
        [
          {
            templateItemId: 1,
            label: "Sample label present and legible",
            status: "adequate",
          },
          {
            templateItemId: 2,
            label: "Identification number on the sample",
            status: "adequate",
          },
          {
            templateItemId: 3,
            label: "Quantity adequate for the requested tests",
            status: "adequate",
          },
          {
            templateItemId: 4,
            label: "Sample is packed properly",
            status: "adequate",
          },
          {
            templateItemId: 5,
            label: "Terms of reference / test request attached",
            status: "adequate",
          },
        ],
        "adq"
      ),
      overallStatus: "satisfactory",
      overallComments:
        "Bulk soil from chainage 12+400 accepted for classification and CBR.",
    },
    {
      _id: IDS.sampleReceipt.kololo,
      _type: "sampleReceipt",
      project: seedRef(IDS.project.kololo),
      sampleReceiptNumber: "SR2026-90002",
      revisionNumber: "R2026-00",
      status: "sent_to_client",
      reviewTemplate: seedRef(IDS.templates.review),
      reviewItems: keyed(
        [
          {
            templateItemId: 1,
            label: "Is the test method adequately defined and understood?",
            status: "yes",
          },
          {
            templateItemId: 2,
            label:
              "Does the laboratory have capability and resources to meet the request?",
            status: "yes",
          },
          {
            templateItemId: 3,
            label: "Is the quantity of sample adequate for all requested tests?",
            status: "yes",
          },
          {
            templateItemId: 4,
            label: "Are the parameters covered under the scope of accreditation?",
            status: "not-applicable",
            comments: "Cube crushing is not on the current accreditation schedule.",
          },
        ],
        "rev"
      ),
      adequacyTemplate: seedRef(IDS.templates.adequacy),
      adequacyChecks: keyed(
        [
          {
            templateItemId: 1,
            label: "Sample label present and legible",
            status: "adequate",
          },
          {
            templateItemId: 2,
            label: "Identification number on the sample",
            status: "adequate",
          },
          {
            templateItemId: 3,
            label: "Quantity adequate for the requested tests",
            status: "adequate",
            comments: "12 cubes received.",
          },
          {
            templateItemId: 4,
            label: "Sample is packed properly",
            status: "adequate",
          },
          {
            templateItemId: 5,
            label: "Terms of reference / test request attached",
            status: "adequate",
          },
        ],
        "adq"
      ),
      overallStatus: "satisfactory",
      overallComments: "Cubes labelled Block A–C. Crushing at 7 and 28 days.",
    },
  ];

  const workOrders: SeedDoc[] = [
    {
      _id: IDS.workOrder.jinja,
      _type: "workOrder",
      project: seedRef(IDS.project.jinja),
      lab: seedRef(IDS.lab.soil),
      workOrderNumber: "WO-2026-90001",
      status: "sent",
      notes: "Priority CBR on chainage 12+400 fill. Report draft due in 10 days.",
      sentAt: daysFromNow(-6),
    },
    {
      _id: IDS.workOrder.kololo,
      _type: "workOrder",
      project: seedRef(IDS.project.kololo),
      lab: seedRef(IDS.lab.concrete),
      workOrderNumber: "WO-2026-90002",
      status: "acknowledged",
      notes: "7-day crush complete. Hold remaining cubes for 28-day.",
      sentAt: daysFromNow(-5),
      acknowledgedAt: daysFromNow(-4),
    },
  ];

  const reports: SeedDoc[] = [
    {
      _id: IDS.report.jinja,
      _type: "report",
      project: seedRef(IDS.project.jinja),
      reportNumber: "RPT-2026-90001",
      revisionNumber: "R2026-00",
      title: "Factual materials report — Kampala–Jinja Expressway Package 2",
      summary:
        "Classification and soaked CBR results for fill material sampled at chainage 12+400.",
      status: "draft",
      preparedBy: {
        personnel: seedRef(IDS.personnel.engineer),
        name: "Daniel Okello",
        email: "daniel.okello@seed.getlab.test",
        role: "Senior Lab Engineer",
      },
    },
  ];

  const rfis: SeedDoc[] = [
    {
      _id: IDS.rfi.labToLab,
      _type: "rfi",
      initiationType: "internal_internal",
      rfiManager: seedRef(IDS.personnel.manager),
      project: seedRef(IDS.project.jinja),
      labInitiator: seedRef(IDS.personnel.techSoilA),
      labReceivers: [seedRef(IDS.personnel.engineer)],
      subject: "CBR mould shortage for soaked set",
      description:
        "We have 8 soaked CBR specimens queued and only 5 moulds. Can concrete lab loan 3 moulds this week?",
      status: "in_progress",
      conversation: keyed(
        [
          {
            isOfficialResponse: false,
            message:
              "Soil lab is short of CBR moulds for the Jinja soaked set. Need three extra by Thursday.",
            sentByClient: false,
            labSender: seedRef(IDS.personnel.techSoilA),
          },
          {
            isOfficialResponse: false,
            message: "Concrete lab can spare three moulds after Friday's cube crush.",
            sentByClient: false,
            labSender: seedRef(IDS.personnel.techConcrete),
          },
        ],
        "msg"
      ),
    },
    {
      _id: IDS.rfi.labToClient,
      _type: "rfi",
      initiationType: "internal_external",
      rfiManager: seedRef(IDS.personnel.manager),
      project: seedRef(IDS.project.entebbe),
      client: seedRef(IDS.client.kcca),
      labInitiatorExternal: seedRef(IDS.personnel.engineer),
      clientReceivers: [seedRef(IDS.contact.kcca)],
      subject: "Confirm binder grade for overlay cores",
      description:
        "The request lists both 60/70 and 80/100 penetration. Which grade should we test against?",
      status: "open",
      conversation: keyed(
        [
          {
            isOfficialResponse: false,
            message:
              "Please confirm the specified bitumen grade for the runway overlay samples received 12 Aug.",
            sentByClient: false,
            labSender: seedRef(IDS.personnel.engineer),
          },
        ],
        "msg"
      ),
    },
    {
      _id: IDS.rfi.clientToLab,
      _type: "rfi",
      initiationType: "external_internal",
      rfiManager: seedRef(IDS.personnel.manager),
      project: seedRef(IDS.project.jinja),
      client: seedRef(IDS.client.unra),
      clientInitiator: seedRef(IDS.contact.unra),
      labReceiversExternal: [seedRef(IDS.personnel.engineer)],
      subject: "Request early CBR summary for chainage 12+400",
      description:
        "Can GETLAB share preliminary soaked CBR values before the full factual report?",
      status: "resolved",
      conversation: keyed(
        [
          {
            isOfficialResponse: false,
            message:
              "We need a preliminary CBR figure for the fill acceptance meeting on Friday.",
            sentByClient: true,
            clientSender: seedRef(IDS.contact.unra),
          },
          {
            isOfficialResponse: true,
            message:
              "Preliminary soaked CBR is 18% at 2.5 mm. Full certificate will follow with the factual report.",
            sentByClient: false,
            labSender: seedRef(IDS.personnel.engineer),
          },
        ],
        "msg"
      ),
    },
  ];

  const feedback: SeedDoc[] = [
    {
      _id: IDS.feedback.action,
      _type: "feedbackAction",
      action: "Shorten quotation turnaround for UNRA jobs",
      description:
        "Issue draft quotations within three working days of sample receipt.",
      assignedTo: [seedRef(IDS.personnel.billing)],
      dueDate: dateFromNow(14),
      status: "pending",
    },
    {
      _id: IDS.feedback.survey,
      _type: "clientFeedback",
      client: seedRef(IDS.client.unra),
      contactPerson: seedRef(IDS.contact.unra),
      date: daysFromNow(-9),
      actionNeeded: true,
      actions: [seedRef(IDS.feedback.action)],
      suggestions:
        "Share draft CBR tables ahead of the full report when meetings are scheduled.",
      feedback: keyed(
        [
          { category: "enquiry", rating: "Good", comments: "Responsive on RFIs." },
          {
            category: "sampleHandling",
            rating: "Excellent",
            comments: "Chain of custody was clear.",
          },
          {
            category: "deliveryTime",
            rating: "Average",
            comments: "Quotation took longer than expected.",
          },
          { category: "testQuality", rating: "Good", comments: "" },
        ],
        "fb"
      ),
    },
  ];

  const notifications: SeedDoc[] = [
    {
      _id: IDS.notification.invoiceIssued,
      _type: "notificationSubscription",
      eventType: "invoice.issued",
      enabled: true,
      departments: keyed([seedRef(IDS.department.finance)], "dept"),
    },
  ];

  return [
    ...standards,
    ...testMethods,
    ...sampleClasses,
    ...services,
    ...departments,
    ...personnel,
    ...clients,
    ...contacts,
    ...quotations,
    ...equipment,
    ...maintenance,
    ...templates,
    ...sampleReceipts,
    ...workOrders,
    ...reports,
    ...projects,
    ...labs,
    ...rfis,
    ...feedback,
    ...notifications,
  ];
}
