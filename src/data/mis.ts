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
  { id: "s1", time: "08:30", day: "Mon", module: "M6", title: "ICT Enterprise Workshop", center: "Kuwadzana Hub Lab", tier: "Upper Junior", facilitator: "Simba", status: "Confirmed" },
  { id: "s2", time: "10:00", day: "Mon", module: "M1", title: "ICT Tools Refresher", center: "Chitungwiza Hub Lab", tier: "Infants", facilitator: "Diana Dumbu", status: "Conflict", note: "Lab double-booked with Grade 4 teacher practical" },
  { id: "s3", time: "13:30", day: "Tue", module: "M7", title: "Programming Logic & Scratch", center: "Warren Park Hub Lab", tier: "Middle Junior", facilitator: "Simba", status: "Pending" },
  { id: "s4", time: "09:00", day: "Wed", module: "M4", title: "Safety & Ethics in Classrooms", center: "Kuwadzana Hub Lab", tier: "Upper Junior", facilitator: "Anesu Muchirewesi", status: "Confirmed" },
  { id: "s5", time: "11:00", day: "Wed", module: "M2", title: "Creating Digital Learning Aids", center: "Chitungwiza Hub Lab", tier: "Middle Junior", facilitator: "Diana Dumbu", status: "Confirmed" },
  { id: "s6", time: "14:00", day: "Thu", module: "M5", title: "Web & Collaborative Tools", center: "Warren Park Hub Lab", tier: "Infants", facilitator: "Simba", status: "Conflict", note: "Collision with school computer period 14:00–15:00" },
  { id: "s7", time: "08:00", day: "Fri", module: "M8", title: "Network Setup & Offline LMS", center: "Kuwadzana Hub Lab", tier: "Upper Junior", facilitator: "Anesu Muchirewesi", status: "Pending" },
  { id: "s8", time: "14:30", day: "Fri", module: "M3", title: "Educational Software Clinic", center: "Chitungwiza Hub Lab", tier: "Middle Junior", facilitator: "Diana Dumbu", status: "Confirmed" },
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
  { id: "c1", name: "Infants Class A (ECD–Gr2)", tier: "Infants", center: "Kuwadzana Hub Lab", educators: 28, modulesDone: 5, attendance: 95, pre: 42, post: 76, facilitator: "Diana Dumbu" },
  { id: "c2", name: "Middle Junior Class B (Gr3–Gr4)", tier: "Middle Junior", center: "Chitungwiza Hub Lab", educators: 32, modulesDone: 6, attendance: 91, pre: 46, post: 79, facilitator: "Simba" },
  { id: "c3", name: "Upper Junior Class C (Gr5–Gr7)", tier: "Upper Junior", center: "Warren Park Hub Lab", educators: 34, modulesDone: 7, attendance: 88, pre: 51, post: 82, facilitator: "Anesu Muchirewesi" },
  { id: "c4", name: "Infants Class D (ECD–Gr2)", tier: "Infants", center: "Chitungwiza Hub Lab", educators: 26, modulesDone: 4, attendance: 86, pre: 39, post: 68, facilitator: "Diana Dumbu" },
  { id: "c5", name: "Middle Junior Class E (Gr3–Gr4)", tier: "Middle Junior", center: "Warren Park Hub Lab", educators: 31, modulesDone: 5, attendance: 84, pre: 44, post: 72, facilitator: "Simba" },
  { id: "c6", name: "Upper Junior Class F (Gr5–Gr7)", tier: "Upper Junior", center: "Kuwadzana Hub Lab", educators: 30, modulesDone: 6, attendance: 92, pre: 50, post: 80, facilitator: "Anesu Muchirewesi" },
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
