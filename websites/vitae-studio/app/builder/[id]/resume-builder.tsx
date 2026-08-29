/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, BriefcaseBusiness, Check, ChevronDown, Code2, Copy, Download,
  FileCode2, FileText, GraduationCap, Languages, Link2, Loader2, Medal, Plus, Printer,
  RotateCcw, Save, Trash2, UserRound, WandSparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ResumePreview } from "@/components/resume-preview";
import { generateLatexResume } from "@/lib/latex";
import {
  calculateCompletion, emptyAward, emptyCertification, emptyCustomItem, emptyCustomSection,
  emptyEducation, emptyExperience, emptyLanguage, emptyLink, emptyMembership, emptyProject,
  emptyPublication, emptyReference, emptySkillGroup, emptyTeaching, emptyVolunteering,
  TEMPLATE_NAMES, type ResumeContent, type ResumeRecord, type ResumeTemplate,
} from "@/lib/resume-types";

type SaveState = "saved" | "saving" | "unsaved" | "error";
type ViewMode = "preview" | "latex";
type BuilderProps = { resumeId: string; user: { displayName: string; email: string }; signOutHref: string; europassMode?: boolean };
type CollectionKey = "experience" | "education" | "languages" | "publications" | "projects" | "teaching" | "certifications" | "awards" | "volunteering" | "memberships" | "references" | "skillGroups";
type StringPersonalKey = Exclude<keyof ResumeContent["personal"], "links">;

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <div className="builder-field"><Label>{label}</Label>{children}{hint && <small>{hint}</small>}</div>;
}

function PanelHeading({ index, eyebrow, title, copy }: { index: string; eyebrow: string; title: string; copy: string }) {
  return <div className="panel-heading"><p>{index} · {eyebrow}</p><h2>{title}</h2><span>{copy}</span></div>;
}

function EntryCard({ title, onRemove, children }: { title: string; onRemove: () => void; children: React.ReactNode }) {
  return <div className="repeatable-card"><div className="repeatable-card-header"><strong>{title}</strong><Button variant="ghost" size="icon-sm" aria-label={`Remove ${title}`} onClick={onRemove}><Trash2 /></Button></div>{children}</div>;
}

const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2", "Native"];

export function ResumeBuilder({ resumeId, user, signOutHref, europassMode = false }: BuilderProps) {
  const [resume, setResume] = useState<ResumeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [desiredLinks, setDesiredLinks] = useState(2);
  const lastSaved = useRef("");
  const saveRequest = useRef<AbortController | null>(null);

  const loadResume = useCallback(async () => {
    setLoading(true); setLoadError("");
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 404 ? "This CV could not be found." : "Your CV could not be loaded.");
      const data = (await response.json()) as { resume: ResumeRecord };
      const loaded = europassMode ? { ...data.resume, template: "europass" as const } : data.resume;
      setResume(loaded);
      setDesiredLinks(Math.max(2, loaded.content.personal.links.length));
      lastSaved.current = JSON.stringify({ title: loaded.title, template: loaded.template, content: loaded.content });
    } catch (error) { setLoadError(error instanceof Error ? error.message : "Your CV could not be loaded."); }
    finally { setLoading(false); }
  }, [europassMode, resumeId]);

  useEffect(() => { const timer = window.setTimeout(() => void loadResume(), 0); return () => window.clearTimeout(timer); }, [loadResume]);

  const saveResume = useCallback(async (current: ResumeRecord, notify = false) => {
    const snapshot = JSON.stringify({ title: current.title, template: current.template, content: current.content });
    if (snapshot === lastSaved.current) { setSaveState("saved"); if (notify) toast.success("Everything is already saved"); return; }
    saveRequest.current?.abort();
    const controller = new AbortController(); saveRequest.current = controller; setSaveState("saving");
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, { method: "PUT", headers: { "content-type": "application/json" }, body: snapshot, signal: controller.signal });
      if (!response.ok) throw new Error("Changes could not be saved.");
      const data = (await response.json()) as { resume: ResumeRecord };
      lastSaved.current = JSON.stringify({ title: data.resume.title, template: data.resume.template, content: data.resume.content });
      setSaveState("saved"); if (notify) toast.success("CV saved");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setSaveState("error"); if (notify) toast.error(error instanceof Error ? error.message : "Changes could not be saved.");
    }
  }, [resumeId]);

  useEffect(() => {
    if (!resume) return;
    const snapshot = JSON.stringify({ title: resume.title, template: resume.template, content: resume.content });
    if (snapshot === lastSaved.current) return;
    setSaveState("unsaved");
    const timer = window.setTimeout(() => void saveResume(resume), 1100);
    return () => window.clearTimeout(timer);
  }, [resume, saveResume]);

  const completion = useMemo(() => resume ? calculateCompletion(resume.content) : 0, [resume]);
  const latex = useMemo(() => resume ? generateLatexResume(resume.content, resume.template) : "", [resume]);

  function updatePersonal(key: StringPersonalKey, value: string) {
    setResume((current) => current ? ({ ...current, content: { ...current.content, personal: { ...current.content.personal, [key]: value } } }) : current);
  }

  function updateCollection(key: CollectionKey, itemId: string, changes: Record<string, unknown>) {
    setResume((current) => {
      if (!current) return current;
      const items = current.content[key] as unknown as Array<{ id: string }>;
      return { ...current, content: { ...current.content, [key]: items.map((item) => item.id === itemId ? { ...item, ...changes } : item) } } as ResumeRecord;
    });
  }

  function removeCollection(key: CollectionKey, itemId: string) {
    setResume((current) => {
      if (!current) return current;
      const items = current.content[key] as unknown as Array<{ id: string }>;
      return { ...current, content: { ...current.content, [key]: items.filter((item) => item.id !== itemId) } } as ResumeRecord;
    });
  }

  function addCollection(key: CollectionKey, item: { id: string }) {
    setResume((current) => current ? ({ ...current, content: { ...current.content, [key]: [...(current.content[key] as unknown as Array<{ id: string }>), item] } } as ResumeRecord) : current);
  }

  function setLinkCount() {
    if (!resume) return;
    const count = Math.min(12, Math.max(0, desiredLinks));
    const links = resume.content.personal.links.slice(0, count);
    while (links.length < count) links.push(emptyLink());
    setResume({ ...resume, content: { ...resume.content, personal: { ...resume.content.personal, links } } });
  }

  function updateLink(itemId: string, changes: { label?: string; url?: string }) {
    setResume((current) => current ? ({ ...current, content: { ...current.content, personal: { ...current.content.personal, links: current.content.personal.links.map((item) => item.id === itemId ? { ...item, ...changes } : item) } } }) : current);
  }

  async function changeTemplate(value: ResumeTemplate) {
    if (!resume) return;
    const updated = { ...resume, template: value };
    setResume(updated);
    if (value === "europass") { await saveResume(updated); window.location.href = `/europass/${resume.id}`; }
  }

  function downloadLatex() {
    if (!resume) return;
    const blob = new Blob([latex], { type: "application/x-tex;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl; anchor.download = `${resume.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "resume"}.tex`; anchor.click();
    URL.revokeObjectURL(objectUrl); toast.success("LaTeX source downloaded");
  }

  async function copyLatex() { await navigator.clipboard.writeText(latex); toast.success("LaTeX source copied"); }

  if (loading) return <div className="builder-loading"><Loader2 className="animate-spin" /><p>Opening your workspace…</p></div>;
  if (!resume || loadError) return <div className="builder-loading"><FileText /><h1>We could not open this CV</h1><p>{loadError}</p><Button asChild><a href="/dashboard"><ArrowLeft /> Back to dashboard</a></Button></div>;
  const saveLabel = saveState === "saving" ? "Saving…" : saveState === "unsaved" ? "Unsaved" : saveState === "error" ? "Save failed" : "Saved";

  return (
    <main className={`builder-shell ${europassMode ? "europass-builder-shell" : ""}`}>
      <header className="builder-topbar no-print">
        <div className="builder-top-left">
          <Button variant="ghost" size="icon" asChild aria-label="Back to dashboard"><a href="/dashboard"><ArrowLeft /></a></Button>
          {europassMode ? <Link className="builder-wordmark europass-editor-brand" href="/"><img src="https://europa.eu/europass/sites/default/files/2023-11/Europass-Colour-Purple-Brand-Mark.png" alt="Europass" /><span>Dedicated workspace</span></Link> : <Link className="builder-wordmark" href="/"><span className="brand-mark">V</span><span>Vitae Studio</span></Link>}
          <span className="topbar-separator" /><Input className="resume-title-input" aria-label="CV name" value={resume.title} maxLength={80} onChange={(event) => setResume({ ...resume, title: event.target.value })} />
        </div>
        <div className="builder-top-actions">
          <span className={`save-indicator save-${saveState}`}>{saveState === "saved" && <Check />}{saveState === "saving" && <Loader2 className="animate-spin" />}{saveLabel}</span>
          {europassMode ? <Badge className="europass-mode-badge">Europass format</Badge> : <Select value={resume.template} onValueChange={(value) => void changeTemplate(value as ResumeTemplate)}><SelectTrigger className="template-select"><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(TEMPLATE_NAMES) as ResumeTemplate[]).map((key) => <SelectItem key={key} value={key}>{TEMPLATE_NAMES[key]}</SelectItem>)}</SelectContent></Select>}
          <Button variant="outline" onClick={() => void saveResume(resume, true)}><Save /> Save</Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button className="download-button"><Download /> Export <ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Document output</DropdownMenuLabel><DropdownMenuItem onClick={downloadLatex}><FileCode2 /> Download LaTeX (.tex)</DropdownMenuItem><DropdownMenuItem onClick={() => void copyLatex()}><Copy /> Copy LaTeX source</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => window.print()}><Printer /> Print / save PDF</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="builder-account"><span>{user.displayName.slice(0, 1).toUpperCase()}</span><ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>{user.displayName}<small>{user.email}</small></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem asChild><a href={signOutHref} target="_top">Sign out</a></DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
      </header>

      {europassMode && <div className="europass-editor-notice no-print"><strong>Europass workspace</strong><span>Complete the standard Europass fields, then export the editable LaTeX source or save the A4 preview as PDF.</span></div>}

      <div className={`builder-workspace ${mobilePreview ? "show-mobile-preview" : ""}`}>
        <section className="builder-control-panel no-print">
          <div className="builder-progress-card"><div><span>CV completeness</span><strong>{completion}%</strong></div><div className="builder-progress-track"><i style={{ width: `${completion}%` }} /></div></div>
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="builder-tabs">
            <TabsList className="builder-tab-list" aria-label="CV sections">
              <TabsTrigger value="personal"><UserRound /> Personal</TabsTrigger><TabsTrigger value="summary"><WandSparkles /> Profile</TabsTrigger><TabsTrigger value="career"><BriefcaseBusiness /> Career</TabsTrigger><TabsTrigger value="education"><GraduationCap /> Education</TabsTrigger><TabsTrigger value="research"><BookOpen /> Research</TabsTrigger><TabsTrigger value="skills"><Languages /> Skills</TabsTrigger><TabsTrigger value="achievements"><Medal /> Achievements</TabsTrigger><TabsTrigger value="custom"><Plus /> More sections</TabsTrigger>
            </TabsList>
            <div className="builder-tab-content">
              <TabsContent value="personal">
                <PanelHeading index="01" eyebrow="IDENTITY & CONTACT" title="Personal information" copy="Use only the personal details appropriate for the role and country." />
                <div className="builder-form-grid two-col">
                  <Field label="Full name"><Input value={resume.content.personal.fullName} onChange={(e) => updatePersonal("fullName", e.target.value)} placeholder="e.g. Sina Afshar" /></Field><Field label="Professional title"><Input value={resume.content.personal.headline} onChange={(e) => updatePersonal("headline", e.target.value)} placeholder="e.g. Software & HPC Engineer" /></Field>
                  <Field label="Email"><Input type="email" value={resume.content.personal.email} onChange={(e) => updatePersonal("email", e.target.value)} placeholder="name@example.com" /></Field><Field label="Phone"><Input value={resume.content.personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} placeholder="+39 000 000 0000" /></Field>
                  <Field label="City / country"><Input value={resume.content.personal.location} onChange={(e) => updatePersonal("location", e.target.value)} placeholder="Pisa, Italy" /></Field><Field label="Full address (optional)"><Input value={resume.content.personal.address} onChange={(e) => updatePersonal("address", e.target.value)} placeholder="Street, postal code, city, country" /></Field>
                  <Field label="Nationality (optional)"><Input value={resume.content.personal.nationality} onChange={(e) => updatePersonal("nationality", e.target.value)} /></Field><Field label="Date of birth (optional)"><Input value={resume.content.personal.dateOfBirth} onChange={(e) => updatePersonal("dateOfBirth", e.target.value)} placeholder="DD/MM/YYYY" /></Field>
                  <Field label="Gender / pronouns (optional)"><Input value={resume.content.personal.gender} onChange={(e) => updatePersonal("gender", e.target.value)} /></Field><Field label="Profile photo URL (optional)"><Input value={resume.content.personal.photoUrl} onChange={(e) => updatePersonal("photoUrl", e.target.value)} placeholder="https://…" /></Field>
                </div>
                <div className="subsection-heading"><div><h3>Links</h3><p>Add the exact number of professional links you want—portfolio, LinkedIn, GitHub, ORCID, Google Scholar, or another profile.</p></div></div>
                <div className="desired-links"><Field label="Desired number of links"><Input type="number" min={0} max={12} value={desiredLinks} onChange={(e) => setDesiredLinks(Number(e.target.value))} /></Field><Button variant="outline" onClick={setLinkCount}><Link2 /> Add link fields</Button></div>
                <div className="repeatable-list compact-list">{resume.content.personal.links.map((item, index) => <div className="link-row" key={item.id}><Input aria-label={`Link ${index + 1} label`} value={item.label} onChange={(e) => updateLink(item.id, { label: e.target.value })} placeholder="Label (e.g. ORCID)" /><Input aria-label={`Link ${index + 1} URL`} value={item.url} onChange={(e) => updateLink(item.id, { url: e.target.value })} placeholder="https://…" /><Button variant="ghost" size="icon" aria-label="Remove link" onClick={() => setResume({ ...resume, content: { ...resume.content, personal: { ...resume.content.personal, links: resume.content.personal.links.filter((link) => link.id !== item.id) } } })}><Trash2 /></Button></div>)}</div>
              </TabsContent>

              <TabsContent value="summary">
                <PanelHeading index="02" eyebrow="PROFILE" title={europassMode ? "About me" : "Professional profile"} copy="Connect your strongest evidence to the role, field, or programme you are targeting." />
                <Field label="Profile summary" hint={`${resume.content.summary.length}/1,200 characters`}><Textarea className="summary-textarea" value={resume.content.summary} maxLength={1200} onChange={(e) => setResume({ ...resume, content: { ...resume.content, summary: e.target.value } })} placeholder="I am a…" /></Field>
                <div className="writing-tip"><WandSparkles /><div><strong>Write for the reader</strong><p>Lead with your specialism, show the evidence behind it, and close with the direction you want to take next.</p></div></div>
              </TabsContent>

              <TabsContent value="career">
                <PanelHeading index="03" eyebrow="EXPERIENCE" title="Career and contribution" copy="Capture paid work, teaching, and volunteering without forcing everything into one category." />
                <div className="subsection-heading"><h3>Work experience</h3></div><div className="repeatable-list">{resume.content.experience.map((item, index) => <EntryCard title={`Position ${index + 1}`} key={item.id} onRemove={() => removeCollection("experience", item.id)}><div className="builder-form-grid two-col"><Field label="Role"><Input value={item.role} onChange={(e) => updateCollection("experience", item.id, { role: e.target.value })} /></Field><Field label="Organisation"><Input value={item.company} onChange={(e) => updateCollection("experience", item.id, { company: e.target.value })} /></Field><Field label="Location"><Input value={item.location} onChange={(e) => updateCollection("experience", item.id, { location: e.target.value })} /></Field><span /><Field label="Start date"><Input value={item.startDate} onChange={(e) => updateCollection("experience", item.id, { startDate: e.target.value })} /></Field><Field label="End date"><Input disabled={item.current} value={item.current ? "Present" : item.endDate} onChange={(e) => updateCollection("experience", item.id, { endDate: e.target.value })} /></Field></div><label className="current-role"><Checkbox checked={item.current} onCheckedChange={(checked) => updateCollection("experience", item.id, { current: checked === true })} /> I currently work here</label><Field label="Impact and responsibilities"><Textarea value={item.description} onChange={(e) => updateCollection("experience", item.id, { description: e.target.value })} /></Field></EntryCard>)}<Button variant="outline" className="add-entry" onClick={() => addCollection("experience", emptyExperience())}><Plus /> Add work experience</Button></div>
                <div className="subsection-heading"><h3>Teaching experience</h3></div><div className="repeatable-list">{resume.content.teaching.map((item, index) => <EntryCard title={`Teaching role ${index + 1}`} key={item.id} onRemove={() => removeCollection("teaching", item.id)}><div className="builder-form-grid two-col"><Field label="Role"><Input value={item.role} onChange={(e) => updateCollection("teaching", item.id, { role: e.target.value })} /></Field><Field label="Institution"><Input value={item.institution} onChange={(e) => updateCollection("teaching", item.id, { institution: e.target.value })} /></Field><Field label="Location"><Input value={item.location} onChange={(e) => updateCollection("teaching", item.id, { location: e.target.value })} /></Field><Field label="Dates"><Input value={[item.startDate, item.endDate].filter(Boolean).join(" — ")} onChange={(e) => updateCollection("teaching", item.id, { startDate: e.target.value, endDate: "" })} placeholder="2023 — 2025" /></Field></div><Field label="Courses and contribution"><Textarea value={item.description} onChange={(e) => updateCollection("teaching", item.id, { description: e.target.value })} /></Field></EntryCard>)}<Button variant="outline" className="add-entry" onClick={() => addCollection("teaching", emptyTeaching())}><Plus /> Add teaching</Button></div>
                <div className="subsection-heading"><h3>Volunteering</h3></div><div className="repeatable-list">{resume.content.volunteering.map((item, index) => <EntryCard title={`Volunteering ${index + 1}`} key={item.id} onRemove={() => removeCollection("volunteering", item.id)}><div className="builder-form-grid two-col"><Field label="Role"><Input value={item.role} onChange={(e) => updateCollection("volunteering", item.id, { role: e.target.value })} /></Field><Field label="Organisation"><Input value={item.organization} onChange={(e) => updateCollection("volunteering", item.id, { organization: e.target.value })} /></Field><Field label="Start date"><Input value={item.startDate} onChange={(e) => updateCollection("volunteering", item.id, { startDate: e.target.value })} /></Field><Field label="End date"><Input value={item.endDate} onChange={(e) => updateCollection("volunteering", item.id, { endDate: e.target.value })} /></Field></div><Field label="Contribution"><Textarea value={item.description} onChange={(e) => updateCollection("volunteering", item.id, { description: e.target.value })} /></Field></EntryCard>)}<Button variant="outline" className="add-entry" onClick={() => addCollection("volunteering", emptyVolunteering())}><Plus /> Add volunteering</Button></div>
              </TabsContent>

              <TabsContent value="education">
                <PanelHeading index="04" eyebrow="LEARNING" title="Education and professional development" copy="Include degrees, training, licences, credentials, and relevant thesis information." />
                <div className="subsection-heading"><h3>Education and training</h3></div><div className="repeatable-list">{resume.content.education.map((item, index) => <EntryCard title={`Education ${index + 1}`} key={item.id} onRemove={() => removeCollection("education", item.id)}><div className="builder-form-grid two-col"><Field label="Degree or programme"><Input value={item.degree} onChange={(e) => updateCollection("education", item.id, { degree: e.target.value })} /></Field><Field label="School or university"><Input value={item.school} onChange={(e) => updateCollection("education", item.id, { school: e.target.value })} /></Field><Field label="Location"><Input value={item.location} onChange={(e) => updateCollection("education", item.id, { location: e.target.value })} /></Field><span /><Field label="Start date"><Input value={item.startDate} onChange={(e) => updateCollection("education", item.id, { startDate: e.target.value })} /></Field><Field label="End date"><Input value={item.endDate} onChange={(e) => updateCollection("education", item.id, { endDate: e.target.value })} /></Field></div><Field label="Thesis, coursework, grade, or details"><Textarea value={item.description} onChange={(e) => updateCollection("education", item.id, { description: e.target.value })} /></Field></EntryCard>)}<Button variant="outline" className="add-entry" onClick={() => addCollection("education", emptyEducation())}><Plus /> Add education</Button></div>
                <div className="subsection-heading"><h3>Certifications, licences, and courses</h3></div><div className="repeatable-list">{resume.content.certifications.map((item, index) => <EntryCard title={`Credential ${index + 1}`} key={item.id} onRemove={() => removeCollection("certifications", item.id)}><div className="builder-form-grid two-col"><Field label="Name"><Input value={item.name} onChange={(e) => updateCollection("certifications", item.id, { name: e.target.value })} /></Field><Field label="Issuer"><Input value={item.issuer} onChange={(e) => updateCollection("certifications", item.id, { issuer: e.target.value })} /></Field><Field label="Date"><Input value={item.date} onChange={(e) => updateCollection("certifications", item.id, { date: e.target.value })} /></Field><Field label="Credential ID"><Input value={item.credentialId} onChange={(e) => updateCollection("certifications", item.id, { credentialId: e.target.value })} /></Field><Field label="Verification URL"><Input value={item.url} onChange={(e) => updateCollection("certifications", item.id, { url: e.target.value })} /></Field></div><Field label="Details"><Textarea value={item.description} onChange={(e) => updateCollection("certifications", item.id, { description: e.target.value })} /></Field></EntryCard>)}<Button variant="outline" className="add-entry" onClick={() => addCollection("certifications", emptyCertification())}><Plus /> Add credential</Button></div>
              </TabsContent>

              <TabsContent value="research">
                <PanelHeading index="05" eyebrow="RESEARCH & OUTPUT" title="Research, publications, and projects" copy="Document scholarly work and practical output with verifiable DOI, repository, or project links." />
                <Field label="Research interests" hint="Separate topics with commas"><Textarea value={resume.content.researchInterests.join(", ")} onChange={(e) => setResume({ ...resume, content: { ...resume.content, researchInterests: e.target.value.split(",").map((value) => value.trim()).filter(Boolean) } })} placeholder="Parallel computing, machine learning, numerical methods" /></Field>
                <div className="subsection-heading"><h3>Publications</h3></div><div className="repeatable-list">{resume.content.publications.map((item, index) => <EntryCard title={`Publication ${index + 1}`} key={item.id} onRemove={() => removeCollection("publications", item.id)}><div className="builder-form-grid two-col"><Field label="Title"><Input value={item.title} onChange={(e) => updateCollection("publications", item.id, { title: e.target.value })} /></Field><Field label="Authors"><Input value={item.authors} onChange={(e) => updateCollection("publications", item.id, { authors: e.target.value })} /></Field><Field label="Journal, conference, or venue"><Input value={item.venue} onChange={(e) => updateCollection("publications", item.id, { venue: e.target.value })} /></Field><Field label="Year"><Input value={item.year} onChange={(e) => updateCollection("publications", item.id, { year: e.target.value })} /></Field><Field label="DOI"><Input value={item.doi} onChange={(e) => updateCollection("publications", item.id, { doi: e.target.value })} placeholder="10.xxxx/…" /></Field><Field label="Publication URL"><Input value={item.url} onChange={(e) => updateCollection("publications", item.id, { url: e.target.value })} placeholder="https://…" /></Field></div><Field label="Abstract note or contribution"><Textarea value={item.description} onChange={(e) => updateCollection("publications", item.id, { description: e.target.value })} /></Field></EntryCard>)}<Button variant="outline" className="add-entry" onClick={() => addCollection("publications", emptyPublication())}><Plus /> Add publication</Button></div>
                <div className="subsection-heading"><h3>Projects</h3></div><div className="repeatable-list">{resume.content.projects.map((item, index) => <EntryCard title={`Project ${index + 1}`} key={item.id} onRemove={() => removeCollection("projects", item.id)}><div className="builder-form-grid two-col"><Field label="Project title"><Input value={item.title} onChange={(e) => updateCollection("projects", item.id, { title: e.target.value })} /></Field><Field label="Your role"><Input value={item.role} onChange={(e) => updateCollection("projects", item.id, { role: e.target.value })} /></Field><Field label="Start date"><Input value={item.startDate} onChange={(e) => updateCollection("projects", item.id, { startDate: e.target.value })} /></Field><Field label="End date"><Input value={item.endDate} onChange={(e) => updateCollection("projects", item.id, { endDate: e.target.value })} /></Field><Field label="Project or repository URL"><Input value={item.url} onChange={(e) => updateCollection("projects", item.id, { url: e.target.value })} /></Field><Field label="Technologies"><Input value={item.technologies} onChange={(e) => updateCollection("projects", item.id, { technologies: e.target.value })} /></Field></div><Field label="Problem, approach, and result"><Textarea value={item.description} onChange={(e) => updateCollection("projects", item.id, { description: e.target.value })} /></Field></EntryCard>)}<Button variant="outline" className="add-entry" onClick={() => addCollection("projects", emptyProject())}><Plus /> Add project</Button></div>
              </TabsContent>

              <TabsContent value="skills">
                <PanelHeading index="06" eyebrow="CAPABILITIES" title="Skills and languages" copy="Mix concise keywords with grouped technical, digital, organisational, and communication skills." />
                <Field label="Core skills" hint="Separate skills with commas"><Textarea value={resume.content.skills.join(", ")} onChange={(e) => setResume({ ...resume, content: { ...resume.content, skills: e.target.value.split(",").map((skill) => skill.trim()).filter(Boolean) } })} placeholder="C++, Python, MPI, OpenMP, Linux" /></Field>
                <div className="subsection-heading"><h3>Skill groups</h3></div><div className="repeatable-list compact-list">{resume.content.skillGroups.map((item, index) => <EntryCard title={`Skill group ${index + 1}`} key={item.id} onRemove={() => removeCollection("skillGroups", item.id)}><div className="builder-form-grid two-col"><Field label="Category"><Input value={item.category} onChange={(e) => updateCollection("skillGroups", item.id, { category: e.target.value })} placeholder="Digital skills" /></Field><Field label="Skills"><Input value={item.skills} onChange={(e) => updateCollection("skillGroups", item.id, { skills: e.target.value })} placeholder="Git, Docker, SLURM" /></Field></div></EntryCard>)}<Button variant="outline" className="add-entry" onClick={() => addCollection("skillGroups", emptySkillGroup())}><Plus /> Add skill group</Button></div>
                <div className="subsection-heading"><div><h3>Language skills</h3><p>Use the overall level for standard CVs; add all five CEFR dimensions when you need Europass detail.</p></div></div><div className="repeatable-list">{resume.content.languages.map((item, index) => <EntryCard title={`Language ${index + 1}`} key={item.id} onRemove={() => removeCollection("languages", item.id)}><div className="builder-form-grid two-col"><Field label="Language"><Input value={item.name} onChange={(e) => updateCollection("languages", item.id, { name: e.target.value })} /></Field><Field label="Overall level"><Select value={item.level} onValueChange={(value) => updateCollection("languages", item.id, { level: value })}><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger><SelectContent>{["Native", "Fluent", "Advanced", "Intermediate", "Basic"].map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent></Select></Field></div><div className="cefr-grid">{(["listening", "reading", "spokenInteraction", "spokenProduction", "writing"] as const).map((key) => <Field key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())}><Select value={item[key]} onValueChange={(value) => updateCollection("languages", item.id, { [key]: value })}><SelectTrigger><SelectValue placeholder="CEFR" /></SelectTrigger><SelectContent>{cefrLevels.map((level) => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent></Select></Field>)}</div><Field label="Language certificate (optional)"><Input value={item.certificate} onChange={(e) => updateCollection("languages", item.id, { certificate: e.target.value })} /></Field></EntryCard>)}<Button variant="outline" className="add-entry" onClick={() => addCollection("languages", emptyLanguage())}><Plus /> Add language</Button></div>
              </TabsContent>

              <TabsContent value="achievements">
                <PanelHeading index="07" eyebrow="RECOGNITION & COMMUNITY" title="Achievements and additional evidence" copy="Include awards, memberships, references, and interests when they strengthen the application." />
                <div className="subsection-heading"><h3>Honours and awards</h3></div><div className="repeatable-list">{resume.content.awards.map((item, index) => <EntryCard title={`Award ${index + 1}`} key={item.id} onRemove={() => removeCollection("awards", item.id)}><div className="builder-form-grid two-col"><Field label="Award"><Input value={item.title} onChange={(e) => updateCollection("awards", item.id, { title: e.target.value })} /></Field><Field label="Issuer"><Input value={item.issuer} onChange={(e) => updateCollection("awards", item.id, { issuer: e.target.value })} /></Field><Field label="Date"><Input value={item.date} onChange={(e) => updateCollection("awards", item.id, { date: e.target.value })} /></Field></div><Field label="Why it was awarded"><Textarea value={item.description} onChange={(e) => updateCollection("awards", item.id, { description: e.target.value })} /></Field></EntryCard>)}<Button variant="outline" className="add-entry" onClick={() => addCollection("awards", emptyAward())}><Plus /> Add award</Button></div>
                <div className="subsection-heading"><h3>Networks and memberships</h3></div><div className="repeatable-list compact-list">{resume.content.memberships.map((item, index) => <EntryCard title={`Membership ${index + 1}`} key={item.id} onRemove={() => removeCollection("memberships", item.id)}><div className="builder-form-grid two-col"><Field label="Organisation"><Input value={item.organization} onChange={(e) => updateCollection("memberships", item.id, { organization: e.target.value })} /></Field><Field label="Role or membership"><Input value={item.role} onChange={(e) => updateCollection("memberships", item.id, { role: e.target.value })} /></Field><Field label="Dates"><Input value={[item.startDate, item.endDate].filter(Boolean).join(" — ")} onChange={(e) => updateCollection("memberships", item.id, { startDate: e.target.value, endDate: "" })} /></Field><Field label="URL"><Input value={item.url} onChange={(e) => updateCollection("memberships", item.id, { url: e.target.value })} /></Field></div></EntryCard>)}<Button variant="outline" className="add-entry" onClick={() => addCollection("memberships", emptyMembership())}><Plus /> Add membership</Button></div>
                <Field label="Interests" hint="Separate interests with commas"><Textarea value={resume.content.interests.join(", ")} onChange={(e) => setResume({ ...resume, content: { ...resume.content, interests: e.target.value.split(",").map((value) => value.trim()).filter(Boolean) } })} /></Field>
                <div className="subsection-heading"><h3>References</h3></div><div className="repeatable-list compact-list">{resume.content.references.map((item, index) => <EntryCard title={`Reference ${index + 1}`} key={item.id} onRemove={() => removeCollection("references", item.id)}><div className="builder-form-grid two-col"><Field label="Name"><Input value={item.name} onChange={(e) => updateCollection("references", item.id, { name: e.target.value })} /></Field><Field label="Role"><Input value={item.role} onChange={(e) => updateCollection("references", item.id, { role: e.target.value })} /></Field><Field label="Organisation"><Input value={item.organization} onChange={(e) => updateCollection("references", item.id, { organization: e.target.value })} /></Field><Field label="Email"><Input value={item.email} onChange={(e) => updateCollection("references", item.id, { email: e.target.value })} /></Field><Field label="Phone"><Input value={item.phone} onChange={(e) => updateCollection("references", item.id, { phone: e.target.value })} /></Field></div></EntryCard>)}<Button variant="outline" className="add-entry" onClick={() => addCollection("references", emptyReference())}><Plus /> Add reference</Button></div>
              </TabsContent>

              <TabsContent value="custom">
                <PanelHeading index="08" eyebrow="FLEXIBLE SECTIONS" title="Add any section you need" copy="Create conference, portfolio, military service, international experience, driving licence, or other sections without changing the core CV." />
                <div className="repeatable-list">{resume.content.customSections.map((section, sectionIndex) => <div className="custom-section-card" key={section.id}><div className="repeatable-card-header"><strong>Custom section {sectionIndex + 1}</strong><Button variant="ghost" size="icon-sm" onClick={() => setResume({ ...resume, content: { ...resume.content, customSections: resume.content.customSections.filter((item) => item.id !== section.id) } })}><Trash2 /></Button></div><Field label="Section title"><Input value={section.title} onChange={(e) => setResume({ ...resume, content: { ...resume.content, customSections: resume.content.customSections.map((item) => item.id === section.id ? { ...item, title: e.target.value } : item) } })} placeholder="Conferences and seminars" /></Field><div className="custom-items">{section.items.map((item, itemIndex) => <EntryCard title={`Item ${itemIndex + 1}`} key={item.id} onRemove={() => setResume({ ...resume, content: { ...resume.content, customSections: resume.content.customSections.map((group) => group.id === section.id ? { ...group, items: group.items.filter((entry) => entry.id !== item.id) } : group) } })}><div className="builder-form-grid two-col">{(["title", "subtitle", "date", "url"] as const).map((key) => <Field key={key} label={key[0].toUpperCase() + key.slice(1)}><Input value={item[key]} onChange={(e) => setResume({ ...resume, content: { ...resume.content, customSections: resume.content.customSections.map((group) => group.id === section.id ? { ...group, items: group.items.map((entry) => entry.id === item.id ? { ...entry, [key]: e.target.value } : entry) } : group) } })} /></Field>)}</div><Field label="Description"><Textarea value={item.description} onChange={(e) => setResume({ ...resume, content: { ...resume.content, customSections: resume.content.customSections.map((group) => group.id === section.id ? { ...group, items: group.items.map((entry) => entry.id === item.id ? { ...entry, description: e.target.value } : entry) } : group) } })} /></Field></EntryCard>)}</div><Button variant="outline" className="add-entry" onClick={() => setResume({ ...resume, content: { ...resume.content, customSections: resume.content.customSections.map((group) => group.id === section.id ? { ...group, items: [...group.items, emptyCustomItem()] } : group) } })}><Plus /> Add item</Button></div>)}<Button className="add-custom-section" onClick={() => setResume({ ...resume, content: { ...resume.content, customSections: [...resume.content.customSections, emptyCustomSection()] } })}><Plus /> Add custom section</Button></div>
              </TabsContent>
            </div>
          </Tabs>
        </section>

        <section className="builder-preview-panel">
          <div className="preview-toolbar no-print"><div className="preview-mode-switch"><Button size="sm" variant={viewMode === "preview" ? "default" : "ghost"} onClick={() => setViewMode("preview")}><FileText /> Preview</Button><Button size="sm" variant={viewMode === "latex" ? "default" : "ghost"} onClick={() => setViewMode("latex")}><Code2 /> LaTeX</Button></div><span>A4 · {TEMPLATE_NAMES[resume.template]}</span></div>
          {viewMode === "preview" ? <div className="resume-preview-stage"><ResumePreview content={resume.content} template={resume.template} /></div> : <div className="latex-source-panel"><div><Badge variant="outline">Compilable .tex</Badge><Button variant="outline" size="sm" onClick={() => void copyLatex()}><Copy /> Copy</Button></div><pre>{latex}</pre></div>}
        </section>
      </div>

      <div className="mobile-builder-bar no-print"><Button variant={!mobilePreview ? "default" : "outline"} onClick={() => setMobilePreview(false)}>Edit</Button><Button variant={mobilePreview ? "default" : "outline"} onClick={() => setMobilePreview(true)}>Output</Button><Button variant="outline" size="icon" onClick={() => void saveResume(resume, true)} aria-label="Save CV"><RotateCcw className={saveState === "saving" ? "animate-spin" : ""} /></Button></div>
      <Toaster position="bottom-right" />
    </main>
  );
}
