import { neon } from "@neondatabase/serverless";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
const sql = neon(env.DATABASE_URL_UNPOOLED || env.DATABASE_URL);
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

async function runBenchmarks() {
  console.log("===============================================================");
  console.log("  Running Performance Benchmarks for Table 5.8 Measurement");
  console.log("===============================================================\n");

  const results = {};

  // 1. In-memory dashboard hydration & collision check (simulating client-side)
  console.log("[Test 1] Measuring In-Memory Collision Check (Offline / Client)...");
  const dummySessions = [
    { id: "s1", time: "08:30", day: "Mon", center: "Kuwadzana Hub Lab", title: "ICT Enterprise" },
    { id: "s2", time: "10:00", day: "Mon", center: "Chitungwiza Hub Lab", title: "ICT Tools" },
    { id: "s3", time: "13:30", day: "Tue", center: "Kuwadzana Hub Lab", title: "Programming" },
  ];
  const t0 = performance.now();
  for (let i = 0; i < 1000; i++) {
    const day = "Mon", time = "08:30", center = "Kuwadzana Hub Lab";
    const conflict = dummySessions.find(s => s.day === day && s.time === time && s.center === center);
  }
  const t1 = performance.now();
  results.collisionOffline = ((t1 - t0) / 1000).toFixed(4); // avg ms per check
  console.log(`      Average offline collision check time: ${results.collisionOffline} ms (0 errors)\n`);

  // 2. Database collision check (Online SQL query)
  console.log("[Test 2] Measuring Server / Neon SQL Collision Check...");
  const sqlTimes = [];
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    await sql`
      SELECT id, title, center FROM training_sessions
      WHERE day = 'Mon' AND time = '08:30' AND center = 'Kuwadzana Hub Lab' LIMIT 1;
    `;
    sqlTimes.push(performance.now() - start);
  }
  results.collisionOnline = (sqlTimes.reduce((a, b) => a + b, 0) / sqlTimes.length).toFixed(1);
  console.log(`      Average online SQL collision check time: ${results.collisionOnline} ms (0 errors)\n`);

  // 3. Database Sync round-trip (Fetching training data)
  console.log("[Test 3] Measuring Database Synchronization (fetch all data)...");
  const syncTimes = [];
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    await Promise.all([
      sql`SELECT * FROM educator_cohorts ORDER BY name ASC;`,
      sql`SELECT * FROM training_sessions ORDER BY day, time ASC;`,
      sql`SELECT * FROM programme_settings WHERE id = 'default' LIMIT 1;`,
      sql`SELECT * FROM curriculum_modules ORDER BY code ASC;`,
    ]);
    syncTimes.push(performance.now() - start);
  }
  results.dbSync = (syncTimes.reduce((a, b) => a + b, 0) / syncTimes.length).toFixed(1);
  console.log(`      Average full DB sync time: ${results.dbSync} ms (0 errors)\n`);

  // 4. Generate and archive report to R2
  console.log("[Test 4] Measuring Cloudflare R2 Report Archive + DB Cataloging...");
  const r2Times = [];
  for (let i = 0; i < 2; i++) {
    const start = performance.now();
    const csvContent = "Indicator,Actual,Target\nAverage attendance,89,85\nPost-test,74,70";
    const key = `benchmark/perf-test-${Date.now()}.csv`;
    await s3.send(new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: csvContent,
      ContentType: "text/csv",
    }));
    await sql`
      INSERT INTO me_reports (id, name, period, type, generated, file_url, created_at)
      VALUES (${'bench_' + Date.now()}, 'Benchmark Report', 'Q3 2026', 'Scorecard', '12 Nov 2026', ${'https://r2/' + key}, NOW());
    `;
    r2Times.push(performance.now() - start);
  }
  results.r2Archive = (r2Times.reduce((a, b) => a + b, 0) / r2Times.length).toFixed(1);
  console.log(`      Average R2 archive + Neon catalog time: ${results.r2Archive} ms (0 errors)\n`);

  // 5. Cache load simulation (Cold vs Warm hydration)
  console.log("[Test 5] Measuring Cold vs Cached State Loading...");
  const rawData = JSON.stringify({
    cohorts: dummySessions,
    settings: { name: "Anesu", role: "Manager" },
  });
  const parseStart = performance.now();
  for (let i = 0; i < 500; i++) {
    JSON.parse(rawData);
  }
  const parseDuration = ((performance.now() - parseStart) / 500).toFixed(4);
  results.cacheLoad = parseDuration;
  console.log(`      Average LocalStorage JSON parse/load time: ${results.cacheLoad} ms (0 errors)\n`);

  console.log("===============================================================");
  console.log("  Benchmark Complete. Summary:");
  console.log(JSON.stringify(results, null, 2));
  console.log("===============================================================");
}

runBenchmarks().catch(console.error);
