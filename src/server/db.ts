import { neon } from "@neondatabase/serverless";

function getDatabaseUrl(): string {
  // Check process.env (Node / Nitro environment) or Vite env
  const envUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (envUrl) return envUrl;

  // Fallback to pooler URL from environment
  return "postgresql://neondb_owner:npg_Pgy6lrw2VmNR@ep-spring-dream-ay6u3xt3-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
}

export function getDb() {
  const url = getDatabaseUrl();
  return neon(url);
}

export interface DbCohort {
  id: string;
  name: string;
  tier: "Infants" | "Middle Junior" | "Upper Junior";
  center: string;
  educators: number;
  modules_done: number;
  attendance: number;
  pre: number;
  post: number;
  facilitator?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbSession {
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
  created_at?: string;
  updated_at?: string;
}

export interface DbSettings {
  id: string;
  user_id?: string;
  name: string;
  role: string;
  photo: string;
  attendance_target: number;
  score_target: number;
  completion_target: number;
  updated_at?: string;
}

export interface DbModule {
  code: string;
  name: string;
  completion: number;
}

export interface DbReport {
  id: string;
  name: string;
  period: string;
  type: string;
  generated: string;
  file_url?: string;
  created_at?: string;
}
