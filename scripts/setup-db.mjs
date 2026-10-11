import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

// Load .env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = loadEnv();
const dbUrl = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;

if (!dbUrl) {
  console.error("Missing DATABASE_URL in .env");
  process.exit(1);
}

const sql = neon(dbUrl);

async function setup() {
  console.log("Connecting to Neon Postgres...");

  // 1. Create tables
  console.log("Creating tables...");
  await sql`
    CREATE TABLE IF NOT EXISTS educator_cohorts (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      tier VARCHAR(64) NOT NULL,
      center VARCHAR(255) NOT NULL,
      educators INT NOT NULL DEFAULT 0,
      modules_done INT NOT NULL DEFAULT 0,
      attendance INT NOT NULL DEFAULT 0,
      pre INT NOT NULL DEFAULT 0,
      post INT NOT NULL DEFAULT 0,
      facilitator VARCHAR(255) DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    ALTER TABLE educator_cohorts ADD COLUMN IF NOT EXISTS facilitator VARCHAR(255) DEFAULT '';
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS training_sessions (
      id VARCHAR(64) PRIMARY KEY,
      time VARCHAR(10) NOT NULL,
      day VARCHAR(10) NOT NULL,
      module VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      center VARCHAR(255) NOT NULL,
      tier VARCHAR(64) NOT NULL,
      facilitator VARCHAR(255) NOT NULL,
      status VARCHAR(20) NOT NULL,
      note TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS programme_settings (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(128),
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      photo TEXT DEFAULT '',
      attendance_target INT NOT NULL DEFAULT 85,
      score_target INT NOT NULL DEFAULT 70,
      completion_target INT NOT NULL DEFAULT 6,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS curriculum_modules (
      code VARCHAR(10) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      completion INT NOT NULL DEFAULT 0
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS me_reports (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      period VARCHAR(100) NOT NULL,
      type VARCHAR(100) NOT NULL,
      generated VARCHAR(50) NOT NULL,
      file_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  // 2. Clear existing demo rows and seed fresh actual data
  console.log("Seeding curriculum modules...");
  await sql`DELETE FROM curriculum_modules;`;
  const modules = [
    { code: "M1", name: "ICT Tools & Productivity", completion: 94 },
    { code: "M2", name: "Creating and Publishing Digital Content", completion: 82 },
    { code: "M3", name: "Computer Software & Operating Systems", completion: 88 },
    { code: "M4", name: "Safety, Ethics and Child Online Protection", completion: 79 },
    { code: "M5", name: "Web & Online Collaboration in Classrooms", completion: 71 },
    { code: "M6", name: "ICT Enterprise & STEAM Pedagogies", completion: 68 },
    { code: "M7", name: "Introductory Programming & Logic", completion: 76 },
    { code: "M8", name: "Communication, School Networks & LMS", completion: 63 },
  ];
  for (const m of modules) {
    await sql`INSERT INTO curriculum_modules (code, name, completion) VALUES (${m.code}, ${m.name}, ${m.completion});`;
  }

  console.log("Seeding classes...");
  await sql`DELETE FROM educator_cohorts;`;
  const cohorts = [
    { id: "c1", name: "Infants Class A (ECD–Gr2)", tier: "Infants", center: "Kuwadzana Hub Lab", educators: 28, modules_done: 5, attendance: 95, pre: 42, post: 76, facilitator: "Diana Dumbu" },
    { id: "c2", name: "Middle Junior Class B (Gr3–Gr4)", tier: "Middle Junior", center: "Chitungwiza Hub Lab", educators: 32, modules_done: 6, attendance: 91, pre: 46, post: 79, facilitator: "Simba" },
    { id: "c3", name: "Upper Junior Class C (Gr5–Gr7)", tier: "Upper Junior", center: "Warren Park Hub Lab", educators: 34, modules_done: 7, attendance: 88, pre: 51, post: 82, facilitator: "Anesu Muchirewesi" },
    { id: "c4", name: "Infants Class D (ECD–Gr2)", tier: "Infants", center: "Chitungwiza Hub Lab", educators: 26, modules_done: 4, attendance: 86, pre: 39, post: 68, facilitator: "Diana Dumbu" },
    { id: "c5", name: "Middle Junior Class E (Gr3–Gr4)", tier: "Middle Junior", center: "Warren Park Hub Lab", educators: 31, modules_done: 5, attendance: 84, pre: 44, post: 72, facilitator: "Simba" },
    { id: "c6", name: "Upper Junior Class F (Gr5–Gr7)", tier: "Upper Junior", center: "Kuwadzana Hub Lab", educators: 30, modules_done: 6, attendance: 92, pre: 50, post: 80, facilitator: "Anesu Muchirewesi" },
  ];
  for (const c of cohorts) {
    await sql`
      INSERT INTO educator_cohorts (id, name, tier, center, educators, modules_done, attendance, pre, post, facilitator)
      VALUES (${c.id}, ${c.name}, ${c.tier}, ${c.center}, ${c.educators}, ${c.modules_done}, ${c.attendance}, ${c.pre}, ${c.post}, ${c.facilitator});
    `;
  }

  console.log("Seeding training sessions...");
  await sql`DELETE FROM training_sessions;`;
  const sessions = [
    { id: "s1", time: "08:30", day: "Mon", module: "M6", title: "ICT Enterprise Workshop", center: "Kuwadzana Hub Lab", tier: "Upper Junior", facilitator: "Simba", status: "Confirmed", note: "" },
    { id: "s2", time: "10:00", day: "Mon", module: "M1", title: "ICT Tools Refresher", center: "Chitungwiza Hub Lab", tier: "Infants", facilitator: "Diana Dumbu", status: "Conflict", note: "Lab double-booked with Grade 4 teacher practical" },
    { id: "s3", time: "13:30", day: "Tue", module: "M7", title: "Programming Logic & Scratch", center: "Warren Park Hub Lab", tier: "Middle Junior", facilitator: "Simba", status: "Pending", note: "" },
    { id: "s4", time: "09:00", day: "Wed", module: "M4", title: "Safety & Ethics in Classrooms", center: "Kuwadzana Hub Lab", tier: "Upper Junior", facilitator: "Anesu Muchirewesi", status: "Confirmed", note: "" },
    { id: "s5", time: "11:00", day: "Wed", module: "M2", title: "Creating Digital Learning Aids", center: "Chitungwiza Hub Lab", tier: "Middle Junior", facilitator: "Diana Dumbu", status: "Confirmed", note: "" },
    { id: "s6", time: "14:00", day: "Thu", module: "M5", title: "Web & Collaborative Tools", center: "Warren Park Hub Lab", tier: "Infants", facilitator: "Simba", status: "Conflict", note: "Collision with school computer period 14:00–15:00" },
    { id: "s7", time: "08:00", day: "Fri", module: "M8", title: "Network Setup & Offline LMS", center: "Kuwadzana Hub Lab", tier: "Upper Junior", facilitator: "Anesu Muchirewesi", status: "Pending", note: "" },
    { id: "s8", time: "14:30", day: "Fri", module: "M3", title: "Educational Software Clinic", center: "Chitungwiza Hub Lab", tier: "Middle Junior", facilitator: "Diana Dumbu", status: "Confirmed", note: "" },
  ];
  for (const s of sessions) {
    await sql`
      INSERT INTO training_sessions (id, time, day, module, title, center, tier, facilitator, status, note)
      VALUES (${s.id}, ${s.time}, ${s.day}, ${s.module}, ${s.title}, ${s.center}, ${s.tier}, ${s.facilitator}, ${s.status}, ${s.note});
    `;
  }

  console.log("Seeding programme settings...");
  await sql`DELETE FROM programme_settings WHERE id = 'default';`;
  await sql`
    INSERT INTO programme_settings (id, user_id, name, role, photo, attendance_target, score_target, completion_target)
    VALUES ('default', 'system', 'Anesu Muchirewesi', 'Teacher Training Manager', '', 85, 70, 6)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      attendance_target = EXCLUDED.attendance_target,
      score_target = EXCLUDED.score_target,
      completion_target = EXCLUDED.completion_target;
  `;

  console.log("Seeding M&E reports...");
  await sql`DELETE FROM me_reports;`;
  const reports = [
    { id: "r1", name: "Q3 Programme Scorecard", period: "Jul–Sep 2026", type: "M&E Audit Summary", generated: "12 Oct 2026", file_url: "" },
    { id: "r2", name: "Class Progress Matrix", period: "Term 3 2026", type: "Class Matrix", generated: "08 Nov 2026", file_url: "" },
    { id: "r3", name: "Lab Utilisation & Conflicts", period: "Week 8–12", type: "Operations Report", generated: "10 Nov 2026", file_url: "" },
    { id: "r4", name: "Pre / Post Competency Deltas", period: "Term 3 2026", type: "Assessment Report", generated: "11 Nov 2026", file_url: "" },
    { id: "r5", name: "Trainer Facilitation Log", period: "Term 3 2026", type: "Facilitator Audit", generated: "15 Nov 2026", file_url: "" },
  ];
  for (const r of reports) {
    await sql`
      INSERT INTO me_reports (id, name, period, type, generated, file_url)
      VALUES (${r.id}, ${r.name}, ${r.period}, ${r.type}, ${r.generated}, ${r.file_url});
    `;
  }

  console.log("Database schema created and populated with actual data successfully!");
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
