import { createServerFn } from "@tanstack/react-start";
import type { DbCohort, DbSession, DbSettings, DbModule, DbReport } from "@/server/db";

export interface FullTrainingPayload {
  cohorts: Array<{
    id: string;
    name: string;
    tier: "Infants" | "Middle Junior" | "Upper Junior";
    center: string;
    educators: number;
    modulesDone: number;
    attendance: number;
    pre: number;
    post: number;
    facilitator?: string;
  }>;
  sessions: Array<{
    id: string;
    time: string;
    day: string;
    module: string;
    title: string;
    center: string;
    tier: "Infants" | "Middle Junior" | "Upper Junior";
    facilitator: string;
    status: "Confirmed" | "Pending" | "Conflict";
    note?: string;
  }>;
  settings: {
    name: string;
    role: string;
    photo: string;
    attendanceTarget: number;
    scoreTarget: number;
    completionTarget: number;
  };
  modules: Array<{
    code: string;
    name: string;
    completion: number;
  }>;
  reports: Array<{
    id: string;
    name: string;
    period: string;
    type: string;
    generated: string;
    fileUrl?: string;
  }>;
}

// Fetch all live data from Neon
export const fetchTrainingDataFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<FullTrainingPayload> => {
    const { getDb } = await import("@/server/db");
    const sql = getDb();

    const [cohortRows, sessionRows, settingRows, moduleRows, reportRows] = await Promise.all([
      sql`SELECT * FROM educator_cohorts ORDER BY id ASC;` as Promise<DbCohort[]>,
      sql`SELECT * FROM training_sessions ORDER BY id ASC;` as Promise<DbSession[]>,
      sql`SELECT * FROM programme_settings LIMIT 1;` as Promise<DbSettings[]>,
      sql`SELECT * FROM curriculum_modules ORDER BY code ASC;` as Promise<DbModule[]>,
      sql`SELECT * FROM me_reports ORDER BY id ASC;` as Promise<DbReport[]>,
    ]);

    const activeSettings = settingRows[0] || {
      name: "Anesu Muchirewesi",
      role: "Teacher Training Manager",
      photo: "",
      attendance_target: 85,
      score_target: 70,
      completion_target: 6,
    };

    return {
      cohorts: cohortRows.map((c) => ({
        id: c.id,
        name: c.name,
        tier: c.tier,
        center: c.center,
        educators: Number(c.educators),
        modulesDone: Number(c.modules_done),
        attendance: Number(c.attendance),
        pre: Number(c.pre),
        post: Number(c.post),
        facilitator: c.facilitator || "Simba",
      })),
      sessions: sessionRows.map((s) => ({
        id: s.id,
        time: s.time,
        day: s.day,
        module: s.module,
        title: s.title,
        center: s.center,
        tier: s.tier,
        facilitator: s.facilitator,
        status: s.status,
        note: s.note || "",
      })),
      settings: {
        name: activeSettings.name,
        role: activeSettings.role,
        photo: activeSettings.photo || "",
        attendanceTarget: Number(activeSettings.attendance_target),
        scoreTarget: Number(activeSettings.score_target),
        completionTarget: Number(activeSettings.completion_target),
      },
      modules: moduleRows.map((m) => ({
        code: m.code,
        name: m.name,
        completion: Number(m.completion),
      })),
      reports: reportRows.map((r) => ({
        id: r.id,
        name: r.name,
        period: r.period,
        type: r.type,
        generated: r.generated,
        fileUrl: r.file_url || undefined,
      })),
    };
  }
);

// Update a cohort in Neon
export const updateCohortFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id: string;
      attendance?: number;
      pre?: number;
      post?: number;
      modulesDone?: number;
      educators?: number;
      facilitator?: string;
    }) => input
  )
  .handler(async ({ data }) => {
    const { getDb } = await import("@/server/db");
    const sql = getDb();
    await sql`
      UPDATE educator_cohorts
      SET attendance = COALESCE(${data.attendance ?? null}, attendance),
          pre = COALESCE(${data.pre ?? null}, pre),
          post = COALESCE(${data.post ?? null}, post),
          modules_done = COALESCE(${data.modulesDone ?? null}, modules_done),
          educators = COALESCE(${data.educators ?? null}, educators),
          facilitator = COALESCE(${data.facilitator ?? null}, facilitator),
          updated_at = NOW()
      WHERE id = ${data.id};
    `;
    return { success: true };
  });

// Add a cohort in Neon
export const addCohortFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      name: string;
      tier: "Infants" | "Middle Junior" | "Upper Junior";
      center: string;
      educators: number;
      facilitator?: string;
    }) => input
  )
  .handler(async ({ data }) => {
    const { getDb } = await import("@/server/db");
    const sql = getDb();
    const id = `c_${Date.now()}`;
    const facilitator = data.facilitator || "Simba";

    await sql`
      INSERT INTO educator_cohorts (id, name, tier, center, educators, modules_done, attendance, pre, post, facilitator, created_at, updated_at)
      VALUES (${id}, ${data.name}, ${data.tier}, ${data.center}, ${data.educators}, 0, 100, 40, 70, ${facilitator}, NOW(), NOW());
    `;

    return {
      cohort: {
        id,
        name: data.name,
        tier: data.tier,
        center: data.center,
        educators: data.educators,
        modulesDone: 0,
        attendance: 100,
        pre: 40,
        post: 70,
        facilitator,
      },
    };
  });

// Add a session in Neon
export const addSessionFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id?: string;
      time: string;
      day: string;
      module: string;
      title: string;
      center: string;
      tier: "Infants" | "Middle Junior" | "Upper Junior";
      facilitator: string;
    }) => input
  )
  .handler(async ({ data }) => {
    const { getDb } = await import("@/server/db");
    const sql = getDb();
    const id = data.id || `s_${Date.now()}`;

    // Conflict detection against Neon database
    const collisions = (await sql`
      SELECT id, title, center FROM training_sessions
      WHERE day = ${data.day} AND time = ${data.time} AND center = ${data.center};
    `) as DbSession[];

    const isConflict = collisions.length > 0;
    const status = isConflict ? "Conflict" : "Pending";
    const note = isConflict
      ? `Clashes with ${collisions[0].title} in the same lab`
      : "";

    await sql`
      INSERT INTO training_sessions (id, time, day, module, title, center, tier, facilitator, status, note, created_at, updated_at)
      VALUES (${id}, ${data.time}, ${data.day}, ${data.module}, ${data.title}, ${data.center}, ${data.tier}, ${data.facilitator}, ${status}, ${note}, NOW(), NOW());
    `;

    return {
      session: {
        id,
        time: data.time,
        day: data.day,
        module: data.module,
        title: data.title,
        center: data.center,
        tier: data.tier,
        facilitator: data.facilitator,
        status: status as "Confirmed" | "Pending" | "Conflict",
        note,
      },
    };
  });

// Update session status in Neon
export const updateSessionStatusFn = createServerFn({ method: "POST" })
  .validator((input: { id: string; status: "Confirmed" | "Pending" | "Conflict"; note?: string }) => input)
  .handler(async ({ data }) => {
    const { getDb } = await import("@/server/db");
    const sql = getDb();
    await sql`
      UPDATE training_sessions
      SET status = ${data.status},
          note = ${data.note || ""},
          updated_at = NOW()
      WHERE id = ${data.id};
    `;
    return { success: true };
  });

// Update full session details in Neon
export const updateSessionFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id: string;
      time: string;
      day: string;
      module: string;
      title: string;
      center: string;
      tier: "Infants" | "Middle Junior" | "Upper Junior";
      facilitator: string;
      status: "Confirmed" | "Pending" | "Conflict";
      note?: string;
    }) => input
  )
  .handler(async ({ data }) => {
    const { getDb } = await import("@/server/db");
    const sql = getDb();
    await sql`
      UPDATE training_sessions
      SET time = ${data.time},
          day = ${data.day},
          module = ${data.module},
          title = ${data.title},
          center = ${data.center},
          tier = ${data.tier},
          facilitator = ${data.facilitator},
          status = ${data.status},
          note = ${data.note || ""},
          updated_at = NOW()
      WHERE id = ${data.id};
    `;
    return { success: true };
  });

// Delete session from Neon
export const deleteSessionFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { getDb } = await import("@/server/db");
    const sql = getDb();
    await sql`
      DELETE FROM training_sessions
      WHERE id = ${data.id};
    `;
    return { success: true };
  });


// Save Programme settings in Neon
export const saveProgrammeSettingsFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      name: string;
      role: string;
      photo?: string;
      attendanceTarget: number;
      scoreTarget: number;
      completionTarget: number;
    }) => input
  )
  .handler(async ({ data }) => {
    const { getDb } = await import("@/server/db");
    const sql = getDb();
    await sql`
      INSERT INTO programme_settings (id, user_id, name, role, photo, attendance_target, score_target, completion_target, updated_at)
      VALUES ('default', 'system', ${data.name}, ${data.role}, ${data.photo || ""}, ${data.attendanceTarget}, ${data.scoreTarget}, ${data.completionTarget}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        photo = EXCLUDED.photo,
        attendance_target = EXCLUDED.attendance_target,
        score_target = EXCLUDED.score_target,
        completion_target = EXCLUDED.completion_target,
        updated_at = NOW();
    `;
    return { success: true };
  });

// Upload profile photo to Cloudflare R2
export const uploadPhotoToR2Fn = createServerFn({ method: "POST" })
  .validator((input: { dataBase64: string; mimeType: string; filename: string }) => input)
  .handler(async ({ data }) => {
    const { uploadToR2 } = await import("@/server/r2");
    const buffer = Buffer.from(data.dataBase64, "base64");
    const safeName = data.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `educator-connect/avatars/${Date.now()}-${safeName}`;

    const { url } = await uploadToR2({
      key,
      data: buffer,
      contentType: data.mimeType || "image/jpeg",
    });

    // Also update settings photo in Neon
    const { getDb } = await import("@/server/db");
    const sql = getDb();
    await sql`
      UPDATE programme_settings
      SET photo = ${url}, updated_at = NOW()
      WHERE id = 'default';
    `;

    return { url, key };
  });

// Upload M&E Report CSV/file to Cloudflare R2 and record in Neon
export const uploadReportToR2Fn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      reportId: string;
      csvContent: string;
      reportName: string;
      period: string;
      type: string;
    }) => input
  )
  .handler(async ({ data }) => {
    const { uploadToR2 } = await import("@/server/r2");
    const key = `educator-connect/reports/${data.reportId}-${Date.now()}.csv`;
    const { url } = await uploadToR2({
      key,
      data: data.csvContent,
      contentType: "text/csv; charset=utf-8",
    });

    const { getDb } = await import("@/server/db");
    const sql = getDb();
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    await sql`
      INSERT INTO me_reports (id, name, period, type, generated, file_url, created_at)
      VALUES (${data.reportId}, ${data.reportName}, ${data.period}, ${data.type}, ${today}, ${url}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        generated = EXCLUDED.generated,
        file_url = EXCLUDED.file_url;
    `;

    return { url, key };
  });

// Generate Clerk single-use authentication ticket (bypasses 2FA / OTP prompts completely)
export const createSignInTicketFn = createServerFn({ method: "POST" })
  .validator((input: { email: string; password?: string }) => input)
  .handler(async ({ data }) => {
    const { createSignInTicket } = await import("@/server/clerk");
    return createSignInTicket(data.email, data.password);
  });
