export const CLERK_PUBLISHABLE_KEY =
  (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined)?.trim() ||
  "pk_test_b3B0aW11bS1tb2xsdXNrLTY1MjcuY2xlcmsuYWNjb3VudHMuZGV2JA";

export function isClerkConfigured(): boolean {
  return Boolean(
    CLERK_PUBLISHABLE_KEY &&
    (CLERK_PUBLISHABLE_KEY.startsWith("pk_test_") || CLERK_PUBLISHABLE_KEY.startsWith("pk_live_"))
  );
}

export const TEST_ACCOUNTS = [
  {
    name: "Anesu Muchirewesi",
    email: "anesu.muchirewesi@uncommon.org",
    role: "Teacher Training Manager",
    lab: "Warren Park Hub Lab (Dual-Role)",
    password: "Uncomm0n@26",
  },
  {
    name: "Simba",
    email: "simbarashe@uncommon.org",
    role: "Resident Facilitator",
    lab: "Kuwadzana Hub Lab",
    password: "Uncomm0n@26",
  },
  {
    name: "Diana Dumbu",
    email: "diana@uncommon.org",
    role: "Resident Facilitator",
    lab: "Chitungwiza Hub Lab",
    password: "Uncomm0n@26",
  },
];
