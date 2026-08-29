export type ResumeTemplate = "classic" | "modern" | "executive" | "europass";

export type LinkItem = { id: string; label: string; url: string };
export type Experience = { id: string; role: string; company: string; location: string; startDate: string; endDate: string; current: boolean; description: string };
export type Education = { id: string; degree: string; school: string; location: string; startDate: string; endDate: string; description: string };
export type Language = { id: string; name: string; level: string; listening: string; reading: string; spokenInteraction: string; spokenProduction: string; writing: string; certificate: string };
export type Publication = { id: string; title: string; authors: string; venue: string; year: string; doi: string; url: string; description: string };
export type Project = { id: string; title: string; role: string; startDate: string; endDate: string; url: string; technologies: string; description: string };
export type TeachingExperience = { id: string; role: string; institution: string; location: string; startDate: string; endDate: string; description: string };
export type Certification = { id: string; name: string; issuer: string; date: string; credentialId: string; url: string; description: string };
export type Award = { id: string; title: string; issuer: string; date: string; description: string };
export type Volunteering = { id: string; role: string; organization: string; startDate: string; endDate: string; description: string };
export type Membership = { id: string; organization: string; role: string; startDate: string; endDate: string; url: string };
export type ReferenceContact = { id: string; name: string; role: string; organization: string; email: string; phone: string };
export type SkillGroup = { id: string; category: string; skills: string };
export type CustomItem = { id: string; title: string; subtitle: string; date: string; url: string; description: string };
export type CustomSection = { id: string; title: string; items: CustomItem[] };

export type ResumeContent = {
  personal: {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    address: string;
    nationality: string;
    dateOfBirth: string;
    gender: string;
    photoUrl: string;
    links: LinkItem[];
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  skillGroups: SkillGroup[];
  languages: Language[];
  researchInterests: string[];
  publications: Publication[];
  projects: Project[];
  teaching: TeachingExperience[];
  certifications: Certification[];
  awards: Award[];
  volunteering: Volunteering[];
  memberships: Membership[];
  references: ReferenceContact[];
  interests: string[];
  customSections: CustomSection[];
};

export type ResumeRecord = { id: string; title: string; template: ResumeTemplate; content: ResumeContent; createdAt: string; updatedAt: string };

const id = () => crypto.randomUUID();
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object";
const stringArray = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

function records<T>(value: unknown, empty: () => T): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isObject).map((item) => ({ ...empty(), ...item, id: typeof item.id === "string" ? item.id : id() }));
}

export const emptyLink = (): LinkItem => ({ id: id(), label: "", url: "" });
export const emptyExperience = (): Experience => ({ id: id(), role: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" });
export const emptyEducation = (): Education => ({ id: id(), degree: "", school: "", location: "", startDate: "", endDate: "", description: "" });
export const emptyLanguage = (): Language => ({ id: id(), name: "", level: "", listening: "", reading: "", spokenInteraction: "", spokenProduction: "", writing: "", certificate: "" });
export const emptyPublication = (): Publication => ({ id: id(), title: "", authors: "", venue: "", year: "", doi: "", url: "", description: "" });
export const emptyProject = (): Project => ({ id: id(), title: "", role: "", startDate: "", endDate: "", url: "", technologies: "", description: "" });
export const emptyTeaching = (): TeachingExperience => ({ id: id(), role: "", institution: "", location: "", startDate: "", endDate: "", description: "" });
export const emptyCertification = (): Certification => ({ id: id(), name: "", issuer: "", date: "", credentialId: "", url: "", description: "" });
export const emptyAward = (): Award => ({ id: id(), title: "", issuer: "", date: "", description: "" });
export const emptyVolunteering = (): Volunteering => ({ id: id(), role: "", organization: "", startDate: "", endDate: "", description: "" });
export const emptyMembership = (): Membership => ({ id: id(), organization: "", role: "", startDate: "", endDate: "", url: "" });
export const emptyReference = (): ReferenceContact => ({ id: id(), name: "", role: "", organization: "", email: "", phone: "" });
export const emptySkillGroup = (): SkillGroup => ({ id: id(), category: "", skills: "" });
export const emptyCustomItem = (): CustomItem => ({ id: id(), title: "", subtitle: "", date: "", url: "", description: "" });
export const emptyCustomSection = (): CustomSection => ({ id: id(), title: "", items: [] });

export function createEmptyResumeContent(name = "", email = ""): ResumeContent {
  return {
    personal: { fullName: name, headline: "", email, phone: "", location: "", address: "", nationality: "", dateOfBirth: "", gender: "", photoUrl: "", links: [] },
    summary: "", experience: [], education: [], skills: [], skillGroups: [], languages: [], researchInterests: [], publications: [], projects: [], teaching: [], certifications: [], awards: [], volunteering: [], memberships: [], references: [], interests: [], customSections: [],
  };
}

export function normalizeResumeContent(value: unknown): ResumeContent {
  const fallback = createEmptyResumeContent();
  if (!isObject(value)) return fallback;
  const source = value as Partial<ResumeContent> & { personal?: Record<string, unknown> & { website?: string } };
  const sourcePersonal = isObject(source.personal) ? source.personal : {};
  const links = records(sourcePersonal.links, emptyLink);
  if (!links.length && typeof sourcePersonal.website === "string" && sourcePersonal.website) links.push({ id: "legacy-website", label: "Website", url: sourcePersonal.website });
  return {
    personal: { ...fallback.personal, ...sourcePersonal, links },
    summary: typeof source.summary === "string" ? source.summary : "",
    experience: records(source.experience, emptyExperience), education: records(source.education, emptyEducation), skills: stringArray(source.skills), skillGroups: records(source.skillGroups, emptySkillGroup), languages: records(source.languages, emptyLanguage), researchInterests: stringArray(source.researchInterests), publications: records(source.publications, emptyPublication), projects: records(source.projects, emptyProject), teaching: records(source.teaching, emptyTeaching), certifications: records(source.certifications, emptyCertification), awards: records(source.awards, emptyAward), volunteering: records(source.volunteering, emptyVolunteering), memberships: records(source.memberships, emptyMembership), references: records(source.references, emptyReference), interests: stringArray(source.interests),
    customSections: records(source.customSections, emptyCustomSection).map((section) => ({ ...section, items: records(section.items, emptyCustomItem) })),
  };
}

export function calculateCompletion(content: ResumeContent): number {
  const checks = [content.personal.fullName, content.personal.headline, content.personal.email, content.personal.phone || content.personal.location, content.summary, content.experience.length > 0, content.education.length > 0, content.skills.length >= 3 || content.skillGroups.length > 0, content.languages.length > 0, content.personal.links.length > 0, content.projects.length + content.publications.length + content.certifications.length > 0];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export const TEMPLATE_NAMES: Record<ResumeTemplate, string> = { classic: "Classic", modern: "Modern", executive: "Executive", europass: "Europass" };
