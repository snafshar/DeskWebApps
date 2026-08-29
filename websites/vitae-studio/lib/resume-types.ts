export type ResumeTemplate = "classic" | "modern" | "executive";

export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

export type Education = {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Language = {
  id: string;
  name: string;
  level: string;
};

export type ResumeContent = {
  personal: {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
};

export type ResumeRecord = {
  id: string;
  title: string;
  template: ResumeTemplate;
  content: ResumeContent;
  createdAt: string;
  updatedAt: string;
};

export function createEmptyResumeContent(name = "", email = ""): ResumeContent {
  return {
    personal: {
      fullName: name,
      headline: "",
      email,
      phone: "",
      location: "",
      website: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    languages: [],
  };
}

export function normalizeResumeContent(value: unknown): ResumeContent {
  const fallback = createEmptyResumeContent();
  if (!value || typeof value !== "object") return fallback;
  const source = value as Partial<ResumeContent>;
  return {
    personal: { ...fallback.personal, ...(source.personal ?? {}) },
    summary: typeof source.summary === "string" ? source.summary : "",
    experience: Array.isArray(source.experience) ? source.experience : [],
    education: Array.isArray(source.education) ? source.education : [],
    skills: Array.isArray(source.skills) ? source.skills.filter((item): item is string => typeof item === "string") : [],
    languages: Array.isArray(source.languages) ? source.languages : [],
  };
}

export function calculateCompletion(content: ResumeContent): number {
  const checks = [
    content.personal.fullName,
    content.personal.headline,
    content.personal.email,
    content.personal.phone || content.personal.location,
    content.summary,
    content.experience.length > 0,
    content.education.length > 0,
    content.skills.length >= 3,
    content.languages.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export const TEMPLATE_NAMES: Record<ResumeTemplate, string> = {
  classic: "Classic",
  modern: "Modern",
  executive: "Executive",
};
