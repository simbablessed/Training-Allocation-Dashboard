# Educator Connect

Teacher Training Dashboard Project Proposal

 

Anesu Eunice Muchirewesi (R2010578C)

Ronald Macheka 

(R257892M)

BIS 2.2

Educator Training Allocation and Monitoring & Evaluation Management Information System

By

Anesu Eunice Muchirewesi 

And

 Ronald Macheka

Submitted in partial fulfilment of the requirements for the

 BCOM. Honours Degree in Information Systems, 

Department of Marketing and Information Systems in the 

Faculty of Business Sciences at the 

Midlands State University 

Gweru 

Zimbabwe 

November 2026 

Supervisor: ……………………………………….

TABLE OF CONTENTS 

CHAPTER ONE: INTRODUCTION	4

1.1 Introduction	4

1.2 Background of the Study	4

1.2.1 Background of the Organisation	5

1.2.2 Organisational Structure	5

1.2.3 Vision	6

1.2.4 Mission Statement	6

1.3 Problem Statement	6

1.4 Project Aim	6

1.5 Objectives	6

1.6 Methods and Instruments	7

1.6.1 Software Development Methodology	7

1.6.2 Data Gathering Techniques	7

1.6.3 Software Tools and Technologies	7

1.7 Project Justification	8

1.8 Conclusion	8

CHAPTER ONE: INTRODUCTION  

1.1 Introduction 

This project details the design and implementation of a centralized, web-based Educator Training Allocation and Monitoring & Evaluation (M&E) Management Information System (MIS). Educational capacity-building organizations and digital development initiatives frequently conduct modular in-service training workshops across decentralized computer laboratory hubs. Administering these initiatives demands structured human resource allocation, lab capacity scheduling, participant attendance validation, and real-time computation of programmatic Key Performance Indicators (KPIs). This chapter introduces the study's contextual background, profiles the target organization, defines the core operational challenge, specifies the project aim and functional SMART objectives, and outlines the system's technical methodology, justification, and operational scope.

1.2 Background of the Study

Continuous professional development in digital literacy and information communication technology (ICT) has become fundamental to primary education under the national Heritage-Based Curriculum (HBC) framework. To ensure effective curriculum delivery, educational outreach bodies deploy specialized training teams to host training programs across distributed primary school computer labs and regional learning hubs.

Under current institutional capacity-building grants, the organization executes continuous training cohorts divided into three distinct pedagogical bands:

Infants Tier: Early Childhood Development (ECD) to Grade 2 educators.

Middle Junior Tier: Grade 3 to Grade 4 educators.

Upper Junior Tier: Grade 5 to Grade 7 educators.

Training delivery is structured around eight standardized national curriculum modules: ICT Tools (M1), Creating and Publishing (M2), Computer Software (M3), Safety and Security (M4), The World Wide Web and Online Collaboration (M5), ICT Enterprise (M6), Programming (M7), and Communication and Networks (M8).

Despite this clear instructional structure, the operational and administrative infrastructure remains fragmented. Program coordinators must schedule training sessions while balancing the host school's daily routine, ensuring that teacher workshops do not displace standard primary learner access to the computer lab. Concurrently, field data collection relies on disconnected tools: diagnostic surveys collected via mobile survey platforms, instructional materials managed through digital note spaces, and participant performance compiled in standalone spreadsheets. Coordinating team schedules across decentralized locations via instant messaging channels leads to data silos, duplicate entries, and delayed indicator reporting. An integrated MIS is required to unify lab scheduling, cohort attendance verification, and automated M&E performance reporting into an auditable data pipeline.

1.2.1 Background of the Organisation

The target organization is an educational development body dedicated to building digital capacity and computational skills among educators in primary and secondary learning institutions. The organization establishes specialized computer laboratories, provides continuous professional development aligned with national curriculum mandates, and facilitates learner digital literacy and coding bootcamps across metropolitan and provincial educational centers.

1.2.2 Organisational Structure

The operational workflow of the training division is organized as follows:

Program Manager: Directs strategic initiatives, manages grant compliance, and evaluates programmatic expansion.

Monitoring & Evaluation (M&E) Unit: Establishes evaluation frameworks, verifies field data pipelines, monitors programmatic scorecards, and produces donor-mandated reporting summaries.

Training Manager: Oversees program implementation aligned with organisational goals and supervises the coordinators and facilitators.

Training Coordinators & Facilitators: Formulate centre timetables, deliver instruction across the eight modular tracks, record participant assessments, and provide ongoing distance support.

Participating Host Centers & In-Service Teachers: Host institutions providing physical lab facilities, alongside educators undergoing modular skill acquisition.

The organogram chart is still under development, considering the company restructured recently.

1.2.3 Vision

To foster an inclusive, digitally empowered educational environment where primary educators independently leverage modern computing tools to enrich classroom pedagogy.

1.2.4 Mission Statement

To deliver structured, curriculum-aligned ICT training interventions, sustainable lab environments, and data-driven continuous support mechanisms that enhance educator digital competency across diverse learning communities.

As the organization scales its footprint across multiple satellite computer labs to meet annual cohort targets, relying on manual rosters and unlinked spreadsheets introduces operational gridlock. Center coordinators struggle to prevent venue scheduling conflicts between teacher cohorts and regular learners, while M&E personnel expend days manually reconciling disparate records. This structural disconnect diminishes operational efficiency and threatens audit compliance.

1.3 Problem Statement

Manual scheduling of modular workshop sessions and fragmented participant tracking across unlinked spreadsheets and external survey instruments result in computer lab scheduling conflicts, unverified attendance records, and delayed reporting of institutional training indicators.

1.4 Project Aim

To develop a web-based Management Information System that automates multi-cohort educator training allocation, standardizes modular competency tracking, and aggregates monitoring and evaluation indicators in real time.

1.5 Objectives

The system should be able to:

To capture and validate facilitator schedules, tier-based educator cohorts (Infants, Middle Junior, Upper Junior), and lab venue availability to prevent booking collisions with learner timetables.

To authenticate and profile educators, facilitators, and student groups mapped directly to designated host school centers and relevant curriculum modules.

To record and compute daily workshop attendance, diagnostic pre-/post-training scores, and modular practical assessments through role-based access control.

To aggregate and track departmental Key Performance Indicators and weekly operational scorecard metrics against institutional targets in real time.

To generate and export standardized M&E audit summaries, cohort progress matrices, and auditable PDF project performance reports.

1.6 Methods and Instruments

1.6.1 Software Development Methodology

The project will follow the Agile Development Methodology, specifically utilizing an iterative Scrum framework. Agile development accommodates iterative module delivery, allowing core scheduling and conflict-detection components to be validated before integrating the M&E aggregation and export pipelines. Feedback from coordinators and M&E personnel will guide sprint refinement.

1.6.2 Data Gathering Techniques

Primary requirements elicitation will employ four standard techniques:

Interviews: Structured interviews with the Program Manager and M&E Lead to capture KPI calculation logic, reporting intervals, and scorecard benchmarks.

Questionnaires: Closed- and open-ended questionnaires administered to training facilitators to identify operational challenges encountered during manual data entry and venue coordination.

Document Analysis: Comprehensive evaluation of national curriculum module guides, historical master spreadsheets, diagnostic survey forms, and external grant evaluation matrices.

Direct Observation: Observation of computer laboratory operational routines at partner primary schools to document how time slots are shared between adult training cohorts and pupil classes.

1.6.3 Software Tools and Technologies

Front-End Interface: React.js integrated with modern component libraries to build a responsive interface functional on lab workstations and mobile devices.

Back-End Application Logic: Python utilizing Django REST Framework (or Node.js/Express) to implement relational business rules, access control, and scheduling validation logic.

Database Management System: PostgreSQL to deliver structured, ACID-compliant relational storage for nested cohort, center, and assessment schemas.

Visualization & Reporting: Chart.js for real-time KPI trend dashboards, alongside automated server-side PDF generation tools (e.g., ReportLab) for grant report outputs.

1.7 Project Justification

The deployment of the Educator Training MIS delivers tangible institutional, operational, and academic value:

Operational Coordination: Eliminates double-booking and venue clashes between teacher workshops and learner lab access through an automated reservation rules engine.

Data Integrity and Governance: Replaces multiple unlinked spreadsheets with an authenticated, role-governed relational database, preventing record overwrites, orphan entries, and data duplication.

Executive Decision Support: Automates data aggregation for monitoring and evaluation, transforming periodic manual audits into real-time KPI dashboards and downloadable performance reports.

Academic Relevance: Implements core principles of Business Information Systems, including relational data modeling, transaction integrity, automated conflict resolution, and executive reporting pipelines.

1.8 Conclusion

This chapter introduced the background, operational structure, and foundational concepts of the Educator Training Allocation and M&E Management Information System. It identified the structural problems associated with manual multi-center coordination, presented a concise problem statement and project aim, and defined five SMART functional objectives. It also detailed the Agile implementation approach, data collection instruments, technology stack, and business justifications. Chapter Two will review relevant literature on educational MIS implementations to inform the planning phase, feasibility assessments of items such as scheduling optimization algorithms, and the implementation of automated monitoring systems, risk analysis, business value of the project, and the work plan to establish the theoretical foundation for the proposed design.

create a system for this dont connect backend ill do it myself

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5ca65dd8-4b31-4aa2-954d-d4328bd57e29).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
