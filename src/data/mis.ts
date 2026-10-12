export type Tier = "Infants" | "Middle Junior" | "Upper Junior";
export type SessionStatus = "Confirmed" | "Pending" | "Conflict";

export const LAB_CENTERS = [
  "Kuwadzana Hub Lab",
  "Chitungwiza Hub Lab",
  "Warren Park Hub Lab",
] as const;

export const modules = [
  { code: "M1", name: "ICT Tools & Productivity", completion: 94 },
  { code: "M2", name: "Creating and Publishing Content", completion: 82 },
  { code: "M3", name: "Computer Software & Systems", completion: 88 },
  { code: "M4", name: "Safety, Security & Ethics", completion: 79 },
  { code: "M5", name: "Web & Online Collaboration", completion: 71 },
  { code: "M6", name: "ICT Enterprise & STEAM", completion: 68 },
  { code: "M7", name: "Introductory Programming", completion: 76 },
  { code: "M8", name: "Communication & Networks", completion: 63 },
];

export const kpiTrend = [
  { week: "W8", attendance: 62, postScore: 48, projected: false },
  { week: "W9", attendance: 68, postScore: 54, projected: false },
  { week: "W10", attendance: 71, postScore: 59, projected: false },
  { week: "W11", attendance: 79, postScore: 66, projected: false },
  { week: "W12", attendance: 89, postScore: 74, projected: false },
  { week: "W13", attendance: 84, postScore: 79, projected: true },
  { week: "W14", attendance: 88, postScore: 83, projected: true },
];

export const tiers: { tier: Tier; range: string; educators: number; facilitators: number; centers: number }[] = [
  { tier: "Infants", range: "ECD–Gr2", educators: 84, facilitators: 3, centers: 3 },
  { tier: "Middle Junior", range: "Gr3–Gr4", educators: 96, facilitators: 3, centers: 3 },
  { tier: "Upper Junior", range: "Gr5–Gr7", educators: 92, facilitators: 3, centers: 3 },
];

export type Session = {
  id: string;
  time: string;
  day: string;
  module: string;
  title: string;
  center: string;
  tier: Tier;
  facilitator: string;
  status: SessionStatus;
  note?: string;
};

export const sessions: Session[] = [
  // Kuwadzana Hub Lab (Resident Facilitator: Simba)
  { id: "s1", time: "08:30", day: "Mon", module: "M6", title: "ICT Enterprise Workshop", center: "Kuwadzana Hub Lab", tier: "Upper Junior", facilitator: "Simba", status: "Confirmed" },
  { id: "s3", time: "13:30", day: "Tue", module: "M7", title: "Programming Logic & Scratch", center: "Kuwadzana Hub Lab", tier: "Middle Junior", facilitator: "Simba", status: "Confirmed" },
  { id: "s6", time: "14:00", day: "Thu", module: "M5", title: "Web & Collaborative Tools", center: "Kuwadzana Hub Lab", tier: "Middle Junior", facilitator: "Simba", status: "Conflict", note: "Collision with Kuwadzana school computer period 14:00–15:00" },

  // Chitungwiza Hub Lab (Resident Facilitator: Diana Dumbu)
  { id: "s2", time: "10:00", day: "Mon", module: "M1", title: "ICT Tools Refresher", center: "Chitungwiza Hub Lab", tier: "Infants", facilitator: "Diana Dumbu", status: "Conflict", note: "Lab double-booked with Grade 4 teacher practical" },
  { id: "s5", time: "11:00", day: "Wed", module: "M2", title: "Creating Digital Learning Aids", center: "Chitungwiza Hub Lab", tier: "Middle Junior", facilitator: "Diana Dumbu", status: "Confirmed" },
  { id: "s8", time: "14:30", day: "Fri", module: "M3", title: "Educational Software Clinic", center: "Chitungwiza Hub Lab", tier: "Infants", facilitator: "Diana Dumbu", status: "Confirmed" },

  // Warren Park Hub Lab (Facilitator: Anesu Muchirewesi - Manager Dual-Role)
  { id: "s4", time: "09:00", day: "Wed", module: "M4", title: "Safety & Ethics in Classrooms", center: "Warren Park Hub Lab", tier: "Upper Junior", facilitator: "Anesu Muchirewesi", status: "Confirmed" },
  { id: "s7", time: "08:00", day: "Fri", module: "M8", title: "Network Setup & Offline LMS", center: "Warren Park Hub Lab", tier: "Upper Junior", facilitator: "Anesu Muchirewesi", status: "Pending" },
];

export type Cohort = {
  id: string;
  name: string;
  tier: Tier;
  center: string;
  educators: number;
  modulesDone: number;
  attendance: number;
  pre: number;
  post: number;
  facilitator?: string;
};

export const cohorts: Cohort[] = [
  // Kuwadzana Hub Lab (Resident Facilitator: Simba)
  { id: "c1", name: "Middle Junior Class A (Gr3–Gr4)", tier: "Middle Junior", center: "Kuwadzana Hub Lab", educators: 32, modulesDone: 6, attendance: 91, pre: 46, post: 79, facilitator: "Simba" },
  { id: "c6", name: "Upper Junior Class F (Gr5–Gr7)", tier: "Upper Junior", center: "Kuwadzana Hub Lab", educators: 30, modulesDone: 5, attendance: 88, pre: 44, post: 75, facilitator: "Simba" },

  // Chitungwiza Hub Lab (Resident Facilitator: Diana Dumbu)
  { id: "c2", name: "Infants Class B (ECD–Gr2)", tier: "Infants", center: "Chitungwiza Hub Lab", educators: 28, modulesDone: 5, attendance: 95, pre: 42, post: 78, facilitator: "Diana Dumbu" },
  { id: "c4", name: "Infants Class D (ECD–Gr2)", tier: "Infants", center: "Chitungwiza Hub Lab", educators: 26, modulesDone: 4, attendance: 92, pre: 39, post: 74, facilitator: "Diana Dumbu" },

  // Warren Park Hub Lab (Facilitator: Anesu Muchirewesi - Manager Dual-Role)
  { id: "c3", name: "Upper Junior Class C (Gr5–Gr7)", tier: "Upper Junior", center: "Warren Park Hub Lab", educators: 34, modulesDone: 7, attendance: 90, pre: 51, post: 84, facilitator: "Anesu Muchirewesi" },
  { id: "c5", name: "Middle Junior Class E (Gr3–Gr4)", tier: "Middle Junior", center: "Warren Park Hub Lab", educators: 31, modulesDone: 5, attendance: 87, pre: 48, post: 77, facilitator: "Anesu Muchirewesi" },
];

export const scorecard = [
  { label: "Classes on target", value: "5 / 6", tone: "accent" as const },
  { label: "Attendance ≥ 85%", value: "5 / 6", tone: "accent" as const },
  { label: "Post-score ≥ 70", value: "5 / 6", tone: "amber" as const },
  { label: "Conflicts resolved", value: "8 / 10", tone: "brand" as const },
];

export const reports = [
  { id: "r1", name: "Q3 Programme Scorecard", period: "Jul–Sep 2026", type: "M&E Audit Summary", generated: "12 Oct 2026" },
  { id: "r2", name: "Class Progress Matrix", period: "Term 3 2026", type: "Class Matrix", generated: "08 Nov 2026" },
  { id: "r3", name: "Lab Utilisation & Conflicts", period: "Week 8–12", type: "Operations Report", generated: "10 Nov 2026" },
  { id: "r4", name: "Pre / Post Competency Deltas", period: "Term 3 2026", type: "Assessment Report", generated: "11 Nov 2026" },
  { id: "r5", name: "Trainer Facilitation Log", period: "Term 3 2026", type: "Facilitator Audit", generated: "15 Nov 2026" },
];

export type LabQuarterlyAudit = {
  id: string;
  center: (typeof LAB_CENTERS)[number];
  quarter: string;
  auditDate: string;
  auditor: string;
  // Laptops inventory & state
  initialLaptops: number;
  functionalLaptops: number;
  faultyLaptops: number;
  missingLaptops: number;
  laptopFaultDetails: string;
  // Chargers & accessories
  initialChargers: number;
  functionalChargers: number;
  faultyChargers: number;
  missingChargers: number;
  // Solar & energy performance
  solarSystemType: string;
  inverterStatus: "Optimal" | "Operational" | "Warning" | "Faulty";
  batteryHealthPct: number;
  avgDailyYieldKwh: number;
  backupRuntimeHours: number;
  solarFaults: string;
  cleaningAndMaintenanceDone: boolean;
  notes: string;
  status: "Verified" | "Action Required" | "Pending Review";
};

export const initialLabAudits: LabQuarterlyAudit[] = [
  {
    id: "la-kwd-q3",
    center: "Kuwadzana Hub Lab",
    quarter: "Q3 2026",
    auditDate: "06 Oct 2026",
    auditor: "Simba",
    initialLaptops: 30,
    functionalLaptops: 28,
    faultyLaptops: 2,
    missingLaptops: 0,
    laptopFaultDetails: "1 Dell unit with RAM seat error (beeps on boot); 1 laptop with sticky enter key. Both tagged for IT repair.",
    initialChargers: 30,
    functionalChargers: 29,
    faultyChargers: 1,
    missingChargers: 0,
    solarSystemType: "5kVA Hybrid Solar Inverter + ZESA Auto Generator ATS",
    inverterStatus: "Optimal",
    batteryHealthPct: 94,
    avgDailyYieldKwh: 19.4,
    backupRuntimeHours: 6.2,
    solarFaults: "Inverter operating without error. Generator auto-start relay tested Oct 2.",
    cleaningAndMaintenanceDone: true,
    notes: "Lab clean and fully organized. Replacement 65W Dell adapter requested.",
    status: "Verified",
  },
  {
    id: "la-cht-q3",
    center: "Chitungwiza Hub Lab",
    quarter: "Q3 2026",
    auditDate: "08 Oct 2026",
    auditor: "Diana Dumbu",
    initialLaptops: 35,
    functionalLaptops: 34,
    faultyLaptops: 1,
    missingLaptops: 0,
    laptopFaultDetails: "1 HP unit trackpad unresponsive; currently connected to external USB optical mouse, fully usable.",
    initialChargers: 35,
    functionalChargers: 34,
    faultyChargers: 1,
    missingChargers: 0,
    solarSystemType: "5kVA Solar Hybrid + 48V Lithium Iron Phosphate (LiFePO4) 10.2kWh",
    inverterStatus: "Optimal",
    batteryHealthPct: 98,
    avgDailyYieldKwh: 22.8,
    backupRuntimeHours: 7.5,
    solarFaults: "Zero fault codes logged. Solar arrays cleaned and inverter heat sink vacuumed Oct 1.",
    cleaningAndMaintenanceDone: true,
    notes: "Excellent power stability. Batteries remained above 72% throughout 4-hour morning load shedding.",
    status: "Verified",
  },
  {
    id: "la-wp-q3",
    center: "Warren Park Hub Lab",
    quarter: "Q3 2026",
    auditDate: "05 Oct 2026",
    auditor: "Anesu Muchirewesi",
    initialLaptops: 28,
    functionalLaptops: 27,
    faultyLaptops: 1,
    missingLaptops: 0,
    laptopFaultDetails: "1 Lenovo ThinkCentre station CMOS battery expired (losing bios time upon power off). Replacement battery ordered.",
    initialChargers: 28,
    functionalChargers: 28,
    faultyChargers: 0,
    missingChargers: 0,
    solarSystemType: "5kVA Starlink-Dedicated Solar Array + 10kVA Lithium Battery Bank",
    inverterStatus: "Optimal",
    batteryHealthPct: 96,
    avgDailyYieldKwh: 18.2,
    backupRuntimeHours: 6.8,
    solarFaults: "String circuit breakers and surge protection modules inspected and certified.",
    cleaningAndMaintenanceDone: true,
    notes: "High reliability. Starlink satellite connection runs 24/7 without interruption.",
    status: "Verified",
  },
];
