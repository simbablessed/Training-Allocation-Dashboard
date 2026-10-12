import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  cohorts as defaultCohorts,
  sessions as defaultSessions,
  initialLabAudits,
  type Cohort,
  type Session,
  type Tier,
  type LabQuarterlyAudit,
} from "@/data/mis";
import { useAppAuth } from "@/lib/clerk/provider";
import {
  fetchTrainingDataFn,
  updateCohortFn,
  addCohortFn,
  addSessionFn,
  updateSessionStatusFn,
  updateSessionFn,
  deleteSessionFn,
  saveProgrammeSettingsFn,
  uploadPhotoToR2Fn,
  uploadReportToR2Fn,
} from "@/lib/functions";

export type PersonaType = "Anesu Muchirewesi" | "Diana Dumbu" | "Simba";

export type ProgrammeSettings = {
  name: string;
  role: string;
  photo: string;
  attendanceTarget: number;
  scoreTarget: number;
  completionTarget: number;
};

type TrainingState = {
  cohorts: Cohort[];
  sessions: Session[];
  settings: ProgrammeSettings;
  labAudits: LabQuarterlyAudit[];
};

const initial: TrainingState = {
  cohorts: defaultCohorts,
  sessions: defaultSessions,
  settings: {
    name: "Anesu Muchirewesi",
    role: "Teacher Training Manager",
    photo: "",
    attendanceTarget: 85,
    scoreTarget: 70,
    completionTarget: 6,
  },
  labAudits: initialLabAudits,
};

export type Store = TrainingState & {
  activePersona: PersonaType;
  setActivePersona: (persona: PersonaType) => void;
  setCohorts: React.Dispatch<React.SetStateAction<Cohort[]>>;
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  setSettings: React.Dispatch<React.SetStateAction<ProgrammeSettings>>;
  setLabAudits: React.Dispatch<React.SetStateAction<LabQuarterlyAudit[]>>;
  updateLabAudit: (id: string, updates: Partial<LabQuarterlyAudit>) => void;
  addLabAudit: (audit: Omit<LabQuarterlyAudit, "id">) => LabQuarterlyAudit;
  updateCohort: (
    id: string,
    updates: Partial<{
      attendance: number;
      pre: number;
      post: number;
      modulesDone: number;
      educators: number;
      facilitator: string;
    }>
  ) => Promise<void>;
  addCohort: (cohort: {
    name: string;
    tier: Tier;
    center: string;
    educators: number;
    facilitator?: string;
  }) => Promise<Cohort>;
  createSession: (session: {
    day: string;
    time: string;
    module: string;
    title: string;
    center: string;
    tier: Tier;
    facilitator: string;
  }) => Promise<Session>;
  updateSession: (id: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  changeSessionStatus: (id: string, status: Session["status"], note?: string) => Promise<void>;
  updateProgrammeSettings: (newSettings: Partial<ProgrammeSettings>) => Promise<void>;
  uploadAvatarToR2: (file: File) => Promise<string>;
  uploadReportToR2: (
    reportId: string,
    reportName: string,
    period: string,
    type: string,
    csvContent: string
  ) => Promise<string>;
  refreshFromDatabase: () => Promise<void>;
  reset: () => void;
  isNeonConnected: boolean;
  isSyncing: boolean;
};

const TrainingContext = createContext<Store | null>(null);
const KEY = "tutortrack-training-v7";

export function TrainingProvider({ children }: { children: ReactNode }) {
  const auth = useAppAuth();
  const [activePersona, setActivePersona] = useState<PersonaType>("Anesu Muchirewesi");

  useEffect(() => {
    if (auth.userName?.toLowerCase().includes("diana")) {
      setActivePersona("Diana Dumbu");
    } else if (auth.userName?.toLowerCase().includes("simba")) {
      setActivePersona("Simba");
    } else if (auth.userName?.toLowerCase().includes("anesu")) {
      setActivePersona("Anesu Muchirewesi");
    }
  }, [auth.userName]);

  const [cohortRows, setCohorts] = useState<Cohort[]>(initial.cohorts);
  const [sessionRows, setSessions] = useState<Session[]>(initial.sessions);
  const [settings, setSettings] = useState<ProgrammeSettings>(initial.settings);
  const [labAudits, setLabAudits] = useState<LabQuarterlyAudit[]>(initial.labAudits);
  const [isNeonConnected, setIsNeonConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [ready, setReady] = useState(false);

  // 1. Initial hydration: Load from Neon, fallback to localStorage/initial
  const refreshFromDatabase = useCallback(async () => {
    setIsSyncing(true);
    try {
      const data = await fetchTrainingDataFn();
      if (data && Array.isArray(data.cohorts) && data.cohorts.length > 0) {
        setCohorts(data.cohorts);
      }
      if (data && Array.isArray(data.sessions) && data.sessions.length > 0) {
        setSessions(data.sessions);
      }
      if (data && data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
      setIsNeonConnected(true);
    } catch (err) {
      console.warn("Could not fetch latest data from Neon; using local cache:", err);
      setIsNeonConnected(false);
    } finally {
      setIsSyncing(false);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    // Try restoring local cache first so initial paint is fast
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<TrainingState>;
        if (Array.isArray(saved.cohorts)) setCohorts(saved.cohorts);
        if (Array.isArray(saved.sessions)) setSessions(saved.sessions);
        if (saved.settings) setSettings({ ...initial.settings, ...saved.settings });
        if (Array.isArray(saved.labAudits) && saved.labAudits.length > 0) setLabAudits(saved.labAudits);
      }
    } catch {
      // Fallback
    }

    // Then pull live source of truth from Neon
    refreshFromDatabase();
  }, [refreshFromDatabase]);

  // Keep local storage synchronized for instant restarts
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ cohorts: cohortRows, sessions: sessionRows, settings, labAudits })
      );
    } catch {
      // Private browsing quota guard
    }
  }, [cohortRows, sessionRows, settings, labAudits, ready]);

  const updateLabAudit = useCallback(
    (id: string, updates: Partial<LabQuarterlyAudit>) => {
      setLabAudits((prev) => {
        const next = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
        try {
          localStorage.setItem(
            KEY,
            JSON.stringify({ cohorts: cohortRows, sessions: sessionRows, settings, labAudits: next })
          );
        } catch {}
        return next;
      });
    },
    [cohortRows, sessionRows, settings]
  );

  const addLabAudit = useCallback(
    (audit: Omit<LabQuarterlyAudit, "id">) => {
      const newRecord: LabQuarterlyAudit = {
        ...audit,
        id: `la-${Date.now()}`,
      };
      setLabAudits((prev) => {
        const next = [newRecord, ...prev];
        try {
          localStorage.setItem(
            KEY,
            JSON.stringify({ cohorts: cohortRows, sessions: sessionRows, settings, labAudits: next })
          );
        } catch {}
        return next;
      });
      return newRecord;
    },
    [cohortRows, sessionRows, settings]
  );

  // Mutation: Update cohort in Neon
  const updateCohort = useCallback(
    async (
      id: string,
      updates: Partial<{
        attendance: number;
        pre: number;
        post: number;
        modulesDone: number;
        educators: number;
        facilitator: string;
      }>
    ) => {
      // Optimistic update
      setCohorts((current) =>
        current.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );

      setIsSyncing(true);
      try {
        await updateCohortFn({
          data: {
            id,
            attendance: updates.attendance,
            pre: updates.pre,
            post: updates.post,
            modulesDone: updates.modulesDone,
            educators: updates.educators,
            facilitator: updates.facilitator,
          },
        });
        setIsNeonConnected(true);
      } catch (err) {
        console.error("Failed to update cohort in Neon:", err);
        setIsNeonConnected(false);
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Mutation: Add new cohort in Neon
  const addCohort = useCallback(
    async (cohortData: {
      name: string;
      tier: Tier;
      center: string;
      educators: number;
      facilitator?: string;
    }) => {
      setIsSyncing(true);
      try {
        const res = await addCohortFn({ data: cohortData });
        const created = res.cohort as Cohort;
        setCohorts((current) => [...current, created]);
        setIsNeonConnected(true);
        return created;
      } catch (err) {
        console.error("Failed to add cohort in Neon, adding locally:", err);
        const fallback: Cohort = {
          id: `c_local_${Date.now()}`,
          name: cohortData.name,
          tier: cohortData.tier,
          center: cohortData.center,
          educators: cohortData.educators,
          modulesDone: 0,
          attendance: 100,
          pre: 40,
          post: 70,
          facilitator: cohortData.facilitator || "Simba",
        };
        setCohorts((current) => [...current, fallback]);
        setIsNeonConnected(false);
        return fallback;
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Mutation: Create session in Neon with collision detection
  const createSession = useCallback(
    async (sessionData: {
      day: string;
      time: string;
      module: string;
      title: string;
      center: string;
      tier: Tier;
      facilitator: string;
    }) => {
      setIsSyncing(true);
      try {
        const res = await addSessionFn({
          data: sessionData,
        });
        const created = res.session as Session;
        setSessions((current) => [...current, created]);
        setIsNeonConnected(true);
        return created;
      } catch (err) {
        console.error("Failed to add session in Neon, falling back locally:", err);
        // Fallback local creation
        const clashes = sessionRows.some(
          (s) =>
            s.day === sessionData.day &&
            s.time === sessionData.time &&
            s.center === sessionData.center
        );
        const fallback: Session = {
          id: `local-${Date.now()}`,
          ...sessionData,
          status: clashes ? "Conflict" : "Pending",
          note: clashes ? "Another workshop already uses this lab and time" : "",
        };
        setSessions((current) => [...current, fallback]);
        setIsNeonConnected(false);
        return fallback;
      } finally {
        setIsSyncing(false);
      }
    },
    [sessionRows]
  );

  // Mutation: Update session status in Neon
  const changeSessionStatus = useCallback(
    async (id: string, status: Session["status"], note?: string) => {
      // Optimistic update
      setSessions((current) =>
        current.map((s) => (s.id === id ? { ...s, status, note: note ?? s.note } : s))
      );

      setIsSyncing(true);
      try {
        await updateSessionStatusFn({
          data: { id, status, note },
        });
        setIsNeonConnected(true);
      } catch (err) {
        console.error("Failed to update session status in Neon:", err);
        setIsNeonConnected(false);
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Mutation: Update full session details in Neon
  const updateSession = useCallback(
    async (id: string, updates: Partial<Session>) => {
      setSessions((current) =>
        current.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
      setIsSyncing(true);
      try {
        const existing = sessionRows.find((s) => s.id === id);
        if (existing) {
          const merged = { ...existing, ...updates };
          await updateSessionFn({
            data: {
              id: merged.id,
              time: merged.time,
              day: merged.day,
              module: merged.module,
              title: merged.title,
              center: merged.center,
              tier: merged.tier,
              facilitator: merged.facilitator,
              status: merged.status,
              note: merged.note,
            },
          });
        }
        setIsNeonConnected(true);
      } catch (err) {
        console.error("Failed to update session in Neon:", err);
        setIsNeonConnected(false);
      } finally {
        setIsSyncing(false);
      }
    },
    [sessionRows]
  );

  // Mutation: Delete session from Neon
  const deleteSession = useCallback(
    async (id: string) => {
      setSessions((current) => current.filter((s) => s.id !== id));
      setIsSyncing(true);
      try {
        await deleteSessionFn({ data: { id } });
        setIsNeonConnected(true);
      } catch (err) {
        console.error("Failed to delete session from Neon:", err);
        setIsNeonConnected(false);
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Mutation: Save Programme settings in Neon
  const updateProgrammeSettings = useCallback(
    async (newSettings: Partial<ProgrammeSettings>) => {
      const merged = { ...settings, ...newSettings };
      setSettings(merged);

      setIsSyncing(true);
      try {
        await saveProgrammeSettingsFn({
          data: {
            name: merged.name,
            role: merged.role,
            photo: merged.photo,
            attendanceTarget: merged.attendanceTarget,
            scoreTarget: merged.scoreTarget,
            completionTarget: merged.completionTarget,
          },
        });
        setIsNeonConnected(true);
      } catch (err) {
        console.error("Failed to persist settings to Neon:", err);
        setIsNeonConnected(false);
      } finally {
        setIsSyncing(false);
      }
    },
    [settings]
  );

  // Mutation: Upload profile avatar to Cloudflare R2
  const uploadAvatarToR2 = useCallback(
    async (file: File): Promise<string> => {
      setIsSyncing(true);
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const commaIdx = result.indexOf(",");
            resolve(commaIdx !== -1 ? result.slice(commaIdx + 1) : result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await uploadPhotoToR2Fn({
          data: {
            dataBase64: base64,
            mimeType: file.type,
            filename: file.name,
          },
        });

        setSettings((prev) => ({ ...prev, photo: res.url }));
        return res.url;
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Mutation: Upload M&E Report to Cloudflare R2
  const uploadReportToR2 = useCallback(
    async (
      reportId: string,
      reportName: string,
      period: string,
      type: string,
      csvContent: string
    ): Promise<string> => {
      setIsSyncing(true);
      try {
        const res = await uploadReportToR2Fn({
          data: {
            reportId,
            reportName,
            period,
            type,
            csvContent,
          },
        });
        return res.url;
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setCohorts(defaultCohorts);
    setSessions(defaultSessions);
    setSettings(initial.settings);
    localStorage.removeItem(KEY);
  }, []);

  return (
    <TrainingContext.Provider
      value={{
        activePersona,
        setActivePersona,
        cohorts: cohortRows,
        sessions: sessionRows,
        settings,
        labAudits,
        setLabAudits,
        updateLabAudit,
        addLabAudit,
        setCohorts,
        setSessions,
        setSettings,
        updateCohort,
        addCohort,
        createSession,
        updateSession,
        deleteSession,
        changeSessionStatus,
        updateProgrammeSettings,
        uploadAvatarToR2,
        uploadReportToR2,
        refreshFromDatabase,
        reset,
        isNeonConnected,
        isSyncing,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const value = useContext(TrainingContext);
  if (!value) throw new Error("TrainingProvider is missing");
  return value;
}

export function getKpis(rows: Cohort[], bookings: Session[], targets: ProgrammeSettings) {
  const count = rows.length;
  const attendance = count ? Math.round(rows.reduce((sum, c) => sum + c.attendance, 0) / count) : 0;
  const post = count ? Math.round(rows.reduce((sum, c) => sum + c.post, 0) / count) : 0;
  const pre = count ? Math.round(rows.reduce((sum, c) => sum + c.pre, 0) / count) : 0;
  return {
    attendance,
    post,
    pre,
    conflicts: bookings.filter((s) => s.status === "Conflict").length,
    meetingAttendance: rows.filter((c) => c.attendance >= targets.attendanceTarget).length,
    meetingScore: rows.filter((c) => c.post >= targets.scoreTarget).length,
    meetingCompletion: rows.filter((c) => c.modulesDone >= targets.completionTarget).length,
    total: count,
  };
}
