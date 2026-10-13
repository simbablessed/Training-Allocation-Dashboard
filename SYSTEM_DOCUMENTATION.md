# TutorTrack Educator Training MIS — System Documentation & Operational Guidelines

**Document Reference:** MSU-BIS-2026-TT-DOC-V2.4  
**Academic Affiliation:** Midlands State University, Faculty of Business Sciences, Department of Marketing and Information Systems  
**Degree Qualification:** Bachelor of Commerce Honours Degree in Information Systems  
**Principal Investigators / System Architects:**  
- **Anesu Eunice Muchirewesi** (Reg. No: R2010578C) — *Project Co-Lead, System Architect & Teacher Training Manager*  
- **Ronald Macheka** (Reg. No: R257892M) — *Project Co-Lead & Technical Systems Analyst*  
**Date of Publication:** October 2026  
**System Status:** Production Prototype (Version 2.4.0)

---

## Executive Summary

The **TutorTrack Educator Training Allocation and Monitoring & Evaluation (M&E) Management Information System (MIS)** is an enterprise-grade digital platform engineered to coordinate modular in-service teacher ICT training, computer laboratory allocation, physical asset auditing, and real-time M&E indicator tracking across decentralized host school learning hubs in Zimbabwe.

Under Zimbabwe's **Heritage-Based Curriculum (HBC)** framework, primary school educators across Early Childhood Development (ECD) through Grade 7 are required to attain certified digital competency across eight foundational ICT modules. Prior to the deployment of this MIS, training delivery across decentralized satellite labs suffered from:
1. **Lab Scheduling Collisions:** Frequent double-booking between visiting adult teacher cohorts and host primary school pupils.
2. **Fragmented Data Pipelines:** Manual rosters, unlinked spreadsheets, and paper survey forms resulting in lost participant records and slow M&E reporting.
3. **Asset & Power Unreliability:** Unmonitored laptop hardware degradation, missing chargers, and unexpected solar power shutdowns during national grid (ZESA) load shedding.

TutorTrack consolidates these disparate workflows into a single, high-performance web platform featuring offline-first browser resilience, role-tailored operational dashboards, automated timetable conflict detection, quarterly hardware/solar asset audits, and real-time M&E scorecards.

---

## Table of Contents

1. [System Architecture & Technology Stack](#1-system-architecture--technology-stack)
2. [User Roles, Permissions & Organizational Hierarchy](#2-user-roles-permissions--organizational-hierarchy)
3. [Physical Laboratory Hub Profiles & Infrastructure](#3-physical-laboratory-hub-profiles--infrastructure)
4. [Standard Operating Procedures: Lab Asset & Solar Audits](#4-standard-operating-procedures-lab-asset--solar-audits)
5. [Lab Scheduling & Collision Prevention Engine](#5-lab-scheduling--collision-prevention-engine)
6. [Teacher Cohort Tracking & M&E Assessment Framework](#6-teacher-cohort-tracking--me-assessment-framework)
7. [Reports Generation & Cloudflare R2 Archive](#7-reports-generation--cloudflare-r2-archive)
8. [Installation, Database Setup & Deployment Guide](#8-installation-database-setup--deployment-guide)
9. [Operational Guidelines & Best Practices](#9-operational-guidelines--best-practices)
10. [Troubleshooting & Frequently Asked Questions](#10-troubleshooting--frequently-asked-questions)

---

## 1. System Architecture & Technology Stack

The TutorTrack system adopts a modern full-stack TypeScript architecture optimized for high reliability, fast edge delivery, and resilient offline capabilities in low-bandwidth environments.

```
+-----------------------------------------------------------------------------------+
|                                 Client Browser                                    |
|  +-----------------------------------------------------------------------------+  |
|  |                           React 19 / TanStack Start                         |  |
|  |  +--------------------+  +---------------------+  +----------------------+  |  |
|  |  | Executive Cockpit  |  | Lab Timetable Engine|  | Solar & Asset Center |  |  |
|  |  |    (/oversight)    |  |     (/schedule)     |  |       (/, /)         |  |  |
|  |  +--------------------+  +---------------------+  +----------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
|                                         |                                         |
|  +-----------------------------------------------------------------------------+  |
|  |              TrainingProvider In-Memory State & Reactivity Context          |  |
|  |  - Active Persona Switcher        - Timetable Collision Evaluator           |  |
|  |  - Cohort Progress Tracker        - Quarterly Lab & Solar Audits            |  |
|  +-----------------------------------------------------------------------------+  |
|              |                                                     |              |
|              v                                                     v              |
|  +-----------------------+                             +-----------------------+  |
|  | LocalStorage Snapshot |                             | Clerk Session Cache   |  |
|  | (tutortrack-v7 Cache) |                             | (Staff Ticket Auth)   |  |
|  +-----------------------+                             +-----------------------+  |
+-----------------------------------------------------------------------------------+
                               | Server Functions / RPC
                               v
+-----------------------------------------------------------------------------------+
|                        Serverless Backend & External Services                     |
|  +-------------------------+  +--------------------------+  +------------------+  |
|  | Neon Serverless Postgres|  |   Cloudflare R2 Bucket   |  | Clerk Auth Cloud |  |
|  | (ACID Relational Data)  |  | (Avatars, M&E CSV/PDFs)  |  | (RBAC & Tickets) |  |
|  +-------------------------+  +--------------------------+  +------------------+  |
+-----------------------------------------------------------------------------------+
```

### 1.1 Core Software Technologies

| Layer | Technology | Version | Operational Role |
| :--- | :--- | :--- | :--- |
| **Meta-Framework** | TanStack Start | `1.x` | Server-Side Rendering (SSR), file-based routing, and type-safe data loading. |
| **UI Library** | React | `19.x` | Component view layer with concurrent rendering and hooks. |
| **Styling & Design** | Tailwind CSS | `4.x` | Modern utility classes, CSS variables, and responsive breakpoints. |
| **Typography** | Plus Jakarta Sans | `@fontsource` | High-legibility Google geometric sans-serif typeface for enterprise readability. |
| **Iconography** | Lucide React | Latest | Clean, consistent, semantic stroke icons (zero non-standard or informal emojis). |
| **Relational Database** | Neon PostgreSQL | Serverless | Serverless ACID PostgreSQL storing cohorts, timetables, programme settings, and audits. |
| **Object Storage** | Cloudflare R2 | S3 API | S3-compatible, zero-egress bucket storing manager avatars and M&E CSV/PDF reports. |
| **Authentication** | Clerk | TanStack SDK | Multi-tenant auth, staff ticket fast switching, and route protection. |
| **Client State** | TrainingProvider | React Context | Browser-first centralized single source of truth with LocalStorage fail-safe caching. |

### 1.2 Browser-First Resilience Architecture
In compliance with project design requirements, the system operates flawlessly even during network outages. The `TrainingProvider` initializes from `localStorage` snapshot cache (`tutortrack-training-v7`) and seamlessly synchronizes with Neon PostgreSQL whenever an active internet connection is detected. All key performance indicators (KPIs), schedule conflict detections, and asset status updates recalculate instantly in browser memory.

---

## 2. User Roles, Permissions & Organizational Hierarchy

The system enforces clear separation of concerns aligned with the organizational structure of the educator training programme.

```
                     +---------------------------------------+
                     |            Program Manager            |
                     |      (Strategic Grant Compliance)     |
                     +---------------------------------------+
                                         |
                     +---------------------------------------+
                     |         Monitoring & Evaluation       |
                     |     (Audits, Scorecards, Indicator KPIs)|
                     +---------------------------------------+
                                         |
                     +---------------------------------------+
                     |       Teacher Training Manager        |
                     |       (Anesu Eunice Muchirewesi)      |
                     |  - Multi-Hub Performance Oversight    |
                     |  - Facilitator Comparative Audits     |
                     |  - High-Level Directives & Approvals  |
                     +---------------------------------------+
                                         |
         +-------------------------------+-------------------------------+
         |                               |                               |
+-------------------+           +-------------------+           +-------------------+
|  Warren Park Hub  |           |  Kuwadzana Hub    |           |  Chitungwiza Hub  |
|  Anesu Muchirewesi|           |  Simba            |           |  Diana Dumbu      |
|  (Dual Managerial |           |  (Resident Lead:  |           |  (Resident Lead:  |
|  & Resident Role) |           |  Coding & STEAM)  |           |  Infants ICT)     |
+-------------------+           +-------------------+           +-------------------+
         |                               |                               |
+-------------------+           +-------------------+           +-------------------+
| Upper Junior &    |           | Middle & Upper    |           | Infants Tier      |
| Middle Junior     |           | Junior Classes    |           | Classes B & D     |
| Classes C & E     |           | Classes A & F     |           | (ECD - Grade 2)   |
+-------------------+           +-------------------+           +-------------------+
```

### 2.1 Persona Specifications

#### 1. Anesu Eunice Muchirewesi — Teacher Training Manager & Warren Park Lead
- **Primary Responsibility:** Strategic executive leadership over all 3 computer laboratory hubs, supervisor of training facilitators, custodian of programmatic KPI targets.
- **Dual Role:** Operates additionally as the hands-on Resident Facilitator at **Warren Park Hub Lab**, directly delivering instruction to Upper Junior teacher cohorts (Modules M4 & M8).
- **Dedicated Dashboard View:**
  - Macro-level **Executive Oversight Cockpit** (`/oversight`) with comparative lab throughput, facilitator ranking, syllabus velocity, and directive broadcast tools.
  - Warren Park Resident Operations section with dedicated lab inventory and solar monitoring.

#### 2. Diana Dumbu — Resident Facilitator (Chitungwiza Hub Lab)
- **Primary Responsibility:** Resident operational lead for the Chitungwiza computer lab.
- **Pedagogical Specialization:** **Infants Tier** (Early Childhood Development to Grade 2 educators), focusing on foundational literacy tools (M1), digital learning aids (M2), and educational software (M3).
- **Dedicated Dashboard View:**
  - Micro-level facilitator operational dashboard showing Chitungwiza cohort metrics (54 educators across Infant Classes B & D).
  - Highlighting Chitungwiza's 98% LiFePO4 battery health and 35 HP All-in-One PC audit status.
  - Quick action to log quarterly equipment checks and manage local timetables.

#### 3. Simba — Resident Facilitator (Kuwadzana Hub Lab)
- **Primary Responsibility:** Resident operational lead for the Kuwadzana computer lab.
- **Pedagogical Specialization:** **STEAM & Introductory Programming** (Modules M6 and M7) for Middle and Upper Junior educators.
- **Dedicated Dashboard View:**
  - Micro-level facilitator operational dashboard showing Kuwadzana cohort metrics (62 educators across Classes A & F).
  - Monitoring Kuwadzana's 30 Dell desktop workstations and automated diesel generator transfer switch.
  - Active conflict warnings regarding afternoon primary school computer period clashes.

---

## 3. Physical Laboratory Hub Profiles & Infrastructure

Each computer laboratory hub operates under distinct electrical, network, and hardware configurations tailored to its physical environment.

| Specification | Kuwadzana Hub Lab | Chitungwiza Hub Lab | Warren Park Hub Lab |
| :--- | :--- | :--- | :--- |
| **Physical Location** | Kuwadzana Primary Cluster, Harare | Chitungwiza Community Learning Centre | Warren Park Educational Hub, Harare |
| **Resident Facilitator**| **Simba** | **Diana Dumbu** | **Anesu Muchirewesi** (Manager Dual-Role) |
| **Assigned Educator Tiers**| Middle Junior (Gr3-4), Upper Junior (Gr5-7) | Infants Tier (ECD to Grade 2) | Upper Junior (Gr5-7), Middle Junior (Gr3-4) |
| **Total Enrolled Educators**| 62 in-service teachers | 54 in-service teachers | 65 in-service teachers |
| **Workstation Hardware**| 30x Dell OptiPlex Desktops + LCDs | 35x HP All-in-One Workstations | 28x Lenovo ThinkCentre M70q PCs |
| **Primary Power Source**| 5kVA Hybrid Solar + Auto Generator ATS | 5kVA Solar Hybrid Microgrid | 5kVA Dedicated Solar Array |
| **Energy Storage (Battery)**| 48V Lead-Carbon Bank (6.2h runtime) | 48V LiFePO4 Lithium Iron 10.2kWh (7.5h) | 10kVA Lithium-Ion Bank (6.8h runtime) |
| **Connectivity** | 50 Mbps Dedicated Optical Fiber | High-Gain 4G/LTE Cellular Gateway | Low-Earth-Orbit Starlink Satellite |
| **Local LMS / Edge Server**| Ka-Lite Local Server (Offline LMS) | Synology DiskStation Local NAS | Starlink Gateway + Local Content Cache |

---

## 4. Standard Operating Procedures: Lab Asset & Solar Audits

To ensure continuous operational uptime during severe power outages and hardware wear, facilitators must conduct and record a **Quarterly Lab Equipment and Solar Audit** at the close of every academic term or quarter.

```
       QUARTERLY AUDIT CYCLE (END OF Q1, Q2, Q3, Q4)
       
  +-----------------------------------------------------------+
  | Step 1: Physical Laptop & Peripheral Inventory Check      |
  | Count baseline units. Tag broken screens, RAM, keyboards. |
  | Inspect AC adapters and power cables.                     |
  +-----------------------------------------------------------+
                               |
                               v
  +-----------------------------------------------------------+
  | Step 2: Solar Inverter & Battery Health Inspection       |
  | Record inverter LCD diagnostic codes (Optimal / Warning). |
  | Verify battery State of Charge (SOC) & Health (SOH %).    |
  | Check daily energy yield (kWh) & load shedding runtime.   |
  +-----------------------------------------------------------+
                               |
                               v
  +-----------------------------------------------------------+
  | Step 3: Preventive Maintenance Protocol                   |
  | Clean solar panel glass; vacuum inverter cooling vents;  |
  | check surge protectors and grounding circuits.            |
  +-----------------------------------------------------------+
                               |
                               v
  +-----------------------------------------------------------+
  | Step 4: Digital Logging in TutorTrack Dashboard          |
  | Open "Quarterly Equipment & Solar Audit" modal.          |
  | Enter counts, faults, yield, and submit.                  |
  | Data instantly reflects in M&E records & Executive View. |
  +-----------------------------------------------------------+
```

### 4.1 Data Structure for Quarterly Audits

Every quarterly audit record (`LabQuarterlyAudit`) tracks the following mandatory parameters:

```typescript
export type LabQuarterlyAudit = {
  id: string;
  center: "Kuwadzana Hub Lab" | "Chitungwiza Hub Lab" | "Warren Park Hub Lab";
  quarter: string;                  // e.g. "Q3 2026"
  auditDate: string;                // e.g. "08 Oct 2026"
  auditor: string;                  // Facilitator name
  // Laptops inventory & state
  initialLaptops: number;           // Baseline allocation (e.g. 35)
  functionalLaptops: number;        // Units ready for training
  faultyLaptops: number;            // Units requiring hardware repair
  missingLaptops: number;           // Missing / unaccounted units
  laptopFaultDetails: string;       // Precise engineering description of faults
  // Chargers & accessories
  initialChargers: number;          // Baseline power brick count
  functionalChargers: number;       // Verified working chargers
  faultyChargers: number;           // Broken cords / burnt adapters
  missingChargers: number;          // Unreturned chargers
  // Solar & energy performance
  solarSystemType: string;          // Technical spec of installed solar setup
  inverterStatus: "Optimal" | "Operational" | "Warning" | "Faulty";
  batteryHealthPct: number;         // Battery State of Health % (0-100)
  avgDailyYieldKwh: number;         // Average daily generation in kilowatt-hours
  backupRuntimeHours: number;       // Sustained run hours during load shedding
  solarFaults: string;              // Inverter fault codes or zero faults note
  cleaningAndMaintenanceDone: boolean; // Physical dust removal completed
  notes: string;                    // Operational observations & requisitions
  status: "Verified" | "Action Required" | "Pending Review";
};
```

### 4.2 Step-by-Step Audit Submission Guide

1. Log into the system using the staff credentials or select your persona on the dashboard header.
2. Navigate to the **Quarterly Lab Equipment & Solar Operations Center** on the home dashboard (`/`).
3. Locate your assigned Hub card (e.g., Kuwadzana Hub for Simba, Chitungwiza for Diana, Warren Park for Anesu).
4. Click the **Edit / Update Audit** button.
5. In the audit modal dialog:
   - Verify the **Initial Baseline Laptop Count** matches the institutional handover record.
   - Enter current **Functional**, **Faulty**, and **Missing** numbers. Note: The system automatically computes missing units if discrepancies exist.
   - In the **Hardware Fault Descriptions** field, specify exact failure symptoms (e.g., *"1 unit with faulty backlight; 1 unit RAM beeps upon startup"*).
   - Enter charger counts (**Functional**, **Faulty**, **Missing**).
   - Enter the solar inverter metrics: Select **Inverter Operational Status**, enter current **Battery Health %**, **Average Daily Yield (kWh)**, and **Backup Runtime (Hours)**.
   - Confirm if **Solar Panel Cleaning & Maintenance** was physically carried out.
   - Select overall audit audit sign-off: **Verified**, **Action Required**, or **Pending Review**.
6. Click **Save & Synchronize Audit**. The updated numbers will immediately update the local view, refresh programmatic KPIs, and become available in the Teacher Training Manager's oversight reports.

---

## 5. Lab Scheduling & Collision Prevention Engine

One of the central failure modes of legacy manual scheduling was the **collision** between teacher training sessions and host school computer periods.

### 5.1 Timetable Collision Detection Logic

The system executes a real-time validation engine over all scheduled workshop sessions (`/schedule`).

```
                    NEW / UPDATED SESSION REQUEST
                                  |
                                  v
         +------------------------------------------------+
         | Extract: Center, Day, Time Window, Facilitator |
         +------------------------------------------------+
                                  |
                                  v
         +------------------------------------------------+
         | Check 1: Venue Double-Booking                  |
         | Does another teacher workshop occupy the same  |
         | center at the exact same day & time slot?      |
         +------------------------------------------------+
                      |                        |
                     YES                       NO
                      |                        |
                      v                        v
            [ FLAG AS CONFLICT ]     +------------------------------------+
            "Center occupied"        | Check 2: Host School Timetable     |
                                     | Does this time window collide with |
                                     | mandatory pupil computer classes?  |
                                     +------------------------------------+
                                                  |                  |
                                                 YES                 NO
                                                  |                  |
                                                  v                  v
                                        [ FLAG AS CONFLICT ]  [ STATUS: CONFIRMED ]
                                        "School period clash"
```

### 5.2 Collision Status Lifecycle

Every session in `training_sessions` maintains one of three statuses:
- **`Confirmed` (Green Pill):** Validated session with reserved workstations, verified facilitator availability, and zero school conflicts.
- **`Conflict` (Red Pill):** Booking collision detected. Displays a prominent warning banner with an actionable explanation (e.g., *"Collision with Kuwadzana school computer period 14:00–15:00"* or *"Lab double-booked with Grade 4 teacher practical"*).
- **`Pending` (Amber Pill):** Proposed workshop awaiting facilitator confirmation or facility verification.

### 5.3 Schedule Visualizer Modes
The Schedule page (`/schedule`) provides three synchronized perspective views:
1. **Matrix View:** A weekly grid (Monday through Friday) mapping time slots (08:00 to 16:00) across days, highlighting collision slots in red.
2. **Center Column View:** A side-by-side comparison of Kuwadzana, Chitungwiza, and Warren Park hubs, ideal for the Training Manager to verify cross-center capacity.
3. **Agenda View:** A linear chronological roster with search filtering by module code, facilitator name, or status.

---

## 6. Teacher Cohort Tracking & M&E Assessment Framework

The monitoring and evaluation component evaluates teacher professional development across the three designated pedagogical tiers and eight national curriculum modules.

### 6.1 Pedagogical Tiers & Modules

```
PEDAGOGICAL TIERS:
+----------------------------------------------------------------------------+
| 1. Infants Tier        | Early Childhood Development (ECD) to Grade 2     |
| 2. Middle Junior Tier  | Grade 3 to Grade 4                                |
| 3. Upper Junior Tier   | Grade 5 to Grade 7                                |
+----------------------------------------------------------------------------+

CURRICULUM MODULES (Heritage-Based Curriculum):
+----------------------------------------------------------------------------+
| Code | Module Title                          | Primary Focus Area         |
+------+---------------------------------------+----------------------------+
| M1   | ICT Tools & Productivity              | Basic computing & typing   |
| M2   | Creating & Publishing Content         | Digital teaching aids      |
| M3   | Computer Software & Systems           | OS & educational apps      |
| M4   | Safety, Security & Ethics             | Child protection & cyber   |
| M5   | Web & Online Collaboration            | Remote pedagogical tools   |
| M6   | ICT Enterprise & STEAM                | Innovation & school kits   |
| M7   | Introductory Programming              | Visual block coding        |
| M8   | Communication & Networks              | School LAN & offline LMS   |
+----------------------------------------------------------------------------+
```

### 6.2 Key M&E Formulas & Computation Logic

All indicators are calculated dynamically from active cohort records in `TrainingProvider`:

$$\text{Average Attendance Rate (\%)} = \frac{\sum_{i=1}^{N} \text{Attendance}_i \times \text{Educators}_i}{\sum_{i=1}^{N} \text{Educators}_i}$$

$$\text{Average Diagnostic Pre-Score} = \frac{\sum_{i=1}^{N} \text{PreScore}_i \times \text{Educators}_i}{\sum_{i=1}^{N} \text{Educators}_i}$$

$$\text{Average Post-Training Score} = \frac{\sum_{i=1}^{N} \text{PostScore}_i \times \text{Educators}_i}{\sum_{i=1}^{N} \text{Educators}_i}$$

$$\text{Net Competency Uplift (\%)} = \text{Average Post-Score} - \text{Average Pre-Score}$$

$$\text{Syllabus Completion Index} = \frac{\sum_{i=1}^{N} \text{ModulesDone}_i}{N \times 8} \times 100$$

### 6.3 Target Benchmarks & Programmatic Scorecard

The system measures real-time performance against institutional grant targets (editable in `/settings`):
- **Attendance Target:** $\ge 85\%$ attendance threshold.
- **Competency Mastery Target:** $\ge 70$ post-test score threshold.
- **Modular Target:** $\ge 6$ completed modules per cohort.

Classes that meet all three thresholds receive the **`On Target`** badge, while underperforming cohorts are flagged for remedial facilitator clinics.

---

## 7. Reports Generation & Cloudflare R2 Archive

The Reports center (`/reports`) equips the Monitoring & Evaluation team and the Training Manager with one-click audit generation and cloud archiving.

```
       M&E REPORT GENERATION & CLOUD ARCHIVE PIPELINE
       
  +---------------------------------------------------------+
  | 1. Select Report Type                                   |
  | - Q3 Programme Scorecard                                |
  | - Class Progress Matrix                                 |
  | - Lab Utilisation & Conflict Audit                      |
  | - Pre/Post Competency Deltas                            |
  | - Trainer Facilitation Log                              |
  +---------------------------------------------------------+
                             |
                             v
  +---------------------------------------------------------+
  | 2. Client-Side Data Serialization & CSV Generation      |
  | Real-time extraction from TrainingProvider context.     |
  | Escape RFC-4180 CSV strings and metadata headers.       |
  +---------------------------------------------------------+
                             |
         +-------------------+-------------------+
         |                                       |
         v                                       v
+-------------------------------+   +-------------------------------+
| 3A. Browser Direct Download   |   | 3B. Cloudflare R2 Archival    |
| Prompt local CSV file save    |   | POST to server function       |
| for local spreadsheet analysis|   | Store in S3 bucket            |
| (MS Excel / LibreOffice).     |   | Record audit entry in Neon.   |
+-------------------------------+   +-------------------------------+
```

### 7.1 Available Report Templates

1. **Q3 Programme Scorecard (`scores`):** High-level summary of all six cohorts, aggregate attendance, average post-test gains, and active lab conflicts against targets.
2. **Class Progress Matrix (`cohorts`):** Detailed breakdown per class displaying tier, lab hub, educator headcount, module progression, and pre/post marks.
3. **Lab Utilisation & Conflicts (`sessions`):** Comprehensive log of all confirmed and conflicting timetable slots across Kuwadzana, Chitungwiza, and Warren Park.
4. **Pre / Post Competency Deltas:** Diagnostic learning gains per curriculum module across foundational domains.
5. **Trainer Facilitation Log:** Detailed delivery hours, punctuality rates, and educator satisfaction feedback for Anesu Muchirewesi, Diana Dumbu, and Simba.

---

## 8. Installation, Database Setup & Deployment Guide

### 8.1 System Prerequisites
- **Node.js:** Version 20.x or higher (or **Bun** 1.1+)
- **Package Manager:** `npm` or `bun`
- **Neon PostgreSQL Account:** Active database connection string
- **Cloudflare Account:** Cloudflare R2 bucket with Access Key ID and Secret Access Key
- **Clerk Account:** Application Publishable Key and Secret Key

### 8.2 Environment Configuration (`.env`)
Create a `.env` file in the root directory with the following variables:

```bash
# Serverless PostgreSQL (Neon)
DATABASE_URL=postgresql://user:password@ep-sample-pooler.region.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@ep-sample.region.neon.tech/neondb?sslmode=require

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Cloudflare R2 Object Storage
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=tutortrack-assets
R2_PUBLIC_URL=https://pub-your-bucket.r2.dev
```

### 8.3 Database Provisioning
Run the database setup script to create relational tables and seed initial cohorts, timetable sessions, and quarterly lab audits:

```bash
# Using Node
node scripts/setup-db.mjs

# Or using Bun
bun run scripts/setup-db.mjs
```

### 8.4 Verification of External Services
Verify connectivity to Neon PostgreSQL and Cloudflare R2:

```bash
node scripts/test-services.mjs
```

### 8.5 Local Development Server
To launch the development server with Hot Module Replacement (HMR):

```bash
npm run dev
# Server will start on http://localhost:3000
```

### 8.6 Production Build
To create a production-ready SSR build:

```bash
npm run build
npm run start
```

### 8.7 Version Control & Lovable Integration Guidelines
> [!IMPORTANT]
> This repository is synchronized with **Lovable** (`https://lovable.dev`).
> - **Never rewrite published git history:** Strictly avoid `git push --force`, `git rebase`, or modifying published commits.
> - **Branch Parity:** Keep both `main` and `master` branches synchronized whenever deploying new features:
>   ```bash
>   git push origin main
>   git push origin main:master
>   ```

---

## 9. Operational Guidelines & Best Practices

### 9.1 For the Teacher Training Manager (Anesu Muchirewesi)
1. **Daily Operational Routine:**
   - Open the **Executive Oversight Cockpit** (`/oversight`) to review active lab throughput and system alerts.
   - Inspect the **Active Conflicts** indicator. If conflicts are reported, coordinate with the affected host school headmaster to adjust class times.
2. **Weekly Directives:**
   - Use the **Directives Broadcast** widget on `/oversight` to transmit operational instructions to resident facilitators.
3. **Quarterly Audit Sign-off:**
   - Review submitted quarterly audits from Simba (Kuwadzana) and Diana (Chitungwiza).
   - Verify that any reported faulty laptops have maintenance tickets dispatched to the IT maintenance team.

### 9.2 For Resident Facilitators (Simba & Diana Dumbu)
1. **Attendance Logging:**
   - Mark workshop attendance immediately upon commencement of each modular block. Ensure no attendance registers are kept on paper.
2. **Diagnostic Pre/Post-Tests:**
   - Administer pre-tests prior to opening Module M1 and administer post-tests upon completion of Module M8. Enter final class percentages into the Cohorts table.
3. **Solar & Power Management:**
   - During morning load shedding, ensure non-essential lab appliances (e.g., printers, high-draw air conditioning) remain switched off so battery runtime stays above 6.5 hours.
   - If the solar inverter emits an audible beep or displays a warning code, switch the master breaker to grid bypass or generator mode and log the incident in the audit tool.

---

## 10. Troubleshooting & Frequently Asked Questions

### Q1: What happens if the internet connection goes down during a workshop session?
**Answer:** The application utilizes an offline-first browser architecture. All changes made to attendance, timetable sessions, and lab audits are immediately persisted to the browser's `localStorage`. As soon as connectivity returns, click the **Sync with Database** button in the header or in `/settings` to upload the queued records to Neon PostgreSQL.

### Q2: Why is a session highlighted in red on the Schedule page?
**Answer:** The session has collided with either:
1. Another teacher training session booked in the same laboratory room at the same time.
2. The host school's pupil computer period.  
*Resolution:* Click the session card, adjust the time slot or day, and save to re-run collision verification.

### Q3: How do I switch between the Manager and Facilitator views?
**Answer:** Use the segmented perspective switcher located at the top of the dashboard (`/`). Click **Anesu Muchirewesi (Manager)**, **Diana Dumbu (Chitungwiza)**, or **Simba (Kuwadzana)** to immediately view role-tailored metrics.

### Q4: How do I export an official grant report for the Monitoring & Evaluation Unit?
**Answer:** Navigate to `/reports`. Click the **Download CSV** or **Archive to R2** button next to the desired report (e.g., *Q3 Programme Scorecard*). You can also click the printer icon to generate a formatted PDF via your browser's print dialog.

---

**© 2026 TutorTrack / Midlands State University. All Rights Reserved.**  
*Educator Training Allocation and Monitoring & Evaluation Management Information System.*
