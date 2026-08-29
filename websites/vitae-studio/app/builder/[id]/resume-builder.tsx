"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  FileText,
  GraduationCap,
  Languages,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  UserRound,
  WandSparkles,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResumePreview } from "@/components/resume-preview";
import {
  calculateCompletion,
  TEMPLATE_NAMES,
  type Education,
  type Experience,
  type Language,
  type ResumeRecord,
  type ResumeTemplate,
} from "@/lib/resume-types";

type SaveState = "saved" | "saving" | "unsaved" | "error";
type BuilderProps = {
  resumeId: string;
  user: { displayName: string; email: string };
  signOutHref: string;
};

const blankExperience = (): Experience => ({ id: crypto.randomUUID(), role: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" });
const blankEducation = (): Education => ({ id: crypto.randomUUID(), degree: "", school: "", location: "", startDate: "", endDate: "", description: "" });
const blankLanguage = (): Language => ({ id: crypto.randomUUID(), name: "", level: "" });

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <div className="builder-field"><Label>{label}</Label>{children}{hint && <small>{hint}</small>}</div>;
}

export function ResumeBuilder({ resumeId, user, signOutHref }: BuilderProps) {
  const [resume, setResume] = useState<ResumeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [mobilePreview, setMobilePreview] = useState(false);
  const lastSaved = useRef("");
  const saveRequest = useRef<AbortController | null>(null);

  const loadResume = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 404 ? "This CV could not be found." : "Your CV could not be loaded.");
      const data = (await response.json()) as { resume: ResumeRecord };
      setResume(data.resume);
      lastSaved.current = JSON.stringify({ title: data.resume.title, template: data.resume.template, content: data.resume.content });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Your CV could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadResume(), 0);
    return () => window.clearTimeout(timer);
  }, [loadResume]);

  const saveResume = useCallback(async (current: ResumeRecord, notify = false) => {
    const snapshot = JSON.stringify({ title: current.title, template: current.template, content: current.content });
    if (snapshot === lastSaved.current) {
      setSaveState("saved");
      if (notify) toast.success("Everything is already saved");
      return;
    }
    saveRequest.current?.abort();
    const controller = new AbortController();
    saveRequest.current = controller;
    setSaveState("saving");
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: snapshot,
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Changes could not be saved.");
      const data = (await response.json()) as { resume: ResumeRecord };
      lastSaved.current = JSON.stringify({ title: data.resume.title, template: data.resume.template, content: data.resume.content });
      setSaveState("saved");
      if (notify) toast.success("CV saved");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setSaveState("error");
      if (notify) toast.error(error instanceof Error ? error.message : "Changes could not be saved.");
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

  function updatePersonal(key: keyof ResumeRecord["content"]["personal"], value: string) {
    setResume((current) => current ? ({ ...current, content: { ...current.content, personal: { ...current.content.personal, [key]: value } } }) : current);
  }

  function updateExperience(id: string, changes: Partial<Experience>) {
    setResume((current) => current ? ({ ...current, content: { ...current.content, experience: current.content.experience.map((item) => item.id === id ? { ...item, ...changes } : item) } }) : current);
  }

  function updateEducation(id: string, changes: Partial<Education>) {
    setResume((current) => current ? ({ ...current, content: { ...current.content, education: current.content.education.map((item) => item.id === id ? { ...item, ...changes } : item) } }) : current);
  }

  function updateLanguage(id: string, changes: Partial<Language>) {
    setResume((current) => current ? ({ ...current, content: { ...current.content, languages: current.content.languages.map((item) => item.id === id ? { ...item, ...changes } : item) } }) : current);
  }

  if (loading) return <div className="builder-loading"><Loader2 className="animate-spin" /><p>Opening your workspace…</p></div>;
  if (!resume || loadError) return <div className="builder-loading"><FileText /><h1>We could not open this CV</h1><p>{loadError}</p><Button asChild><a href="/dashboard"><ArrowLeft /> Back to dashboard</a></Button></div>;

  const saveLabel = saveState === "saving" ? "Saving…" : saveState === "unsaved" ? "Unsaved" : saveState === "error" ? "Save failed" : "Saved";

  return (
    <main className="builder-shell">
      <header className="builder-topbar no-print">
        <div className="builder-top-left">
          <Button variant="ghost" size="icon" asChild aria-label="Back to dashboard"><a href="/dashboard"><ArrowLeft /></a></Button>
          <Link className="builder-wordmark" href="/"><span className="brand-mark">V</span><span>Vitae Studio</span></Link>
          <span className="topbar-separator" />
          <Input className="resume-title-input" aria-label="CV name" value={resume.title} maxLength={80} onChange={(event) => setResume({ ...resume, title: event.target.value })} />
        </div>
        <div className="builder-top-actions">
          <span className={`save-indicator save-${saveState}`}>{saveState === "saved" && <Check />}{saveState === "saving" && <Loader2 className="animate-spin" />}{saveLabel}</span>
          <Select value={resume.template} onValueChange={(value) => setResume({ ...resume, template: value as ResumeTemplate })}>
            <SelectTrigger className="template-select"><SelectValue /></SelectTrigger>
            <SelectContent>{(Object.keys(TEMPLATE_NAMES) as ResumeTemplate[]).map((key) => <SelectItem key={key} value={key}>{TEMPLATE_NAMES[key]}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" onClick={() => void saveResume(resume, true)}><Save /> Save</Button>
          <Button className="download-button" onClick={() => window.print()}><Download /> Download PDF</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="builder-account"><span>{user.displayName.slice(0, 1).toUpperCase()}</span><ChevronDown /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.displayName}<small>{user.email}</small></DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><a href={signOutHref} target="_top">Sign out</a></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className={`builder-workspace ${mobilePreview ? "show-mobile-preview" : ""}`}>
        <section className="builder-control-panel no-print">
          <div className="builder-progress-card">
            <div><span>CV completeness</span><strong>{completion}%</strong></div>
            <div className="builder-progress-track"><i style={{ width: `${completion}%` }} /></div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="builder-tabs">
            <TabsList className="builder-tab-list" aria-label="CV sections">
              <TabsTrigger value="personal"><UserRound /> Personal</TabsTrigger>
              <TabsTrigger value="summary"><WandSparkles /> Profile</TabsTrigger>
              <TabsTrigger value="experience"><FileText /> Experience</TabsTrigger>
              <TabsTrigger value="education"><GraduationCap /> Education</TabsTrigger>
              <TabsTrigger value="skills"><Languages /> Skills & languages</TabsTrigger>
            </TabsList>

            <div className="builder-tab-content">
              <TabsContent value="personal">
                <div className="panel-heading"><p>01 · THE BASICS</p><h2>Personal details</h2><span>This information appears at the top of your CV.</span></div>
                <div className="builder-form-grid">
                  <Field label="Full name"><Input value={resume.content.personal.fullName} onChange={(event) => updatePersonal("fullName", event.target.value)} placeholder="e.g. Sina Afshar" /></Field>
                  <Field label="Professional title"><Input value={resume.content.personal.headline} onChange={(event) => updatePersonal("headline", event.target.value)} placeholder="e.g. Software Engineer" /></Field>
                  <Field label="Email"><Input type="email" value={resume.content.personal.email} onChange={(event) => updatePersonal("email", event.target.value)} placeholder="name@example.com" /></Field>
                  <Field label="Phone"><Input value={resume.content.personal.phone} onChange={(event) => updatePersonal("phone", event.target.value)} placeholder="+39 000 000 0000" /></Field>
                  <Field label="Location"><Input value={resume.content.personal.location} onChange={(event) => updatePersonal("location", event.target.value)} placeholder="City, Country" /></Field>
                  <Field label="Website or LinkedIn"><Input value={resume.content.personal.website} onChange={(event) => updatePersonal("website", event.target.value)} placeholder="linkedin.com/in/yourname" /></Field>
                </div>
              </TabsContent>

              <TabsContent value="summary">
                <div className="panel-heading"><p>02 · YOUR DIRECTION</p><h2>Professional profile</h2><span>Write three to five lines that connect your experience to the role you want.</span></div>
                <Field label="Profile summary" hint={`${resume.content.summary.length}/700 characters`}>
                  <Textarea className="summary-textarea" value={resume.content.summary} maxLength={700} onChange={(event) => setResume({ ...resume, content: { ...resume.content, summary: event.target.value } })} placeholder="I am a software engineer with experience in…" />
                </Field>
                <div className="writing-tip"><WandSparkles /><div><strong>Keep it specific</strong><p>Lead with your area, strongest evidence, and the kind of work you are ready to do next.</p></div></div>
              </TabsContent>

              <TabsContent value="experience">
                <div className="panel-heading"><p>03 · YOUR IMPACT</p><h2>Work experience</h2><span>Start with your most recent role and focus on outcomes.</span></div>
                <div className="repeatable-list">
                  {resume.content.experience.map((item, index) => (
                    <div className="repeatable-card" key={item.id}>
                      <div className="repeatable-card-header"><strong>Position {index + 1}</strong><Button variant="ghost" size="icon-sm" aria-label="Remove position" onClick={() => setResume({ ...resume, content: { ...resume.content, experience: resume.content.experience.filter((entry) => entry.id !== item.id) } })}><Trash2 /></Button></div>
                      <div className="builder-form-grid two-col">
                        <Field label="Role"><Input value={item.role} onChange={(event) => updateExperience(item.id, { role: event.target.value })} placeholder="Software Engineer" /></Field>
                        <Field label="Company"><Input value={item.company} onChange={(event) => updateExperience(item.id, { company: event.target.value })} placeholder="Company name" /></Field>
                        <Field label="Location"><Input value={item.location} onChange={(event) => updateExperience(item.id, { location: event.target.value })} placeholder="City, Country" /></Field>
                        <span />
                        <Field label="Start date"><Input value={item.startDate} onChange={(event) => updateExperience(item.id, { startDate: event.target.value })} placeholder="Jan 2023" /></Field>
                        <Field label="End date"><Input disabled={item.current} value={item.current ? "Present" : item.endDate} onChange={(event) => updateExperience(item.id, { endDate: event.target.value })} placeholder="Dec 2025" /></Field>
                      </div>
                      <label className="current-role"><Checkbox checked={item.current} onCheckedChange={(checked) => updateExperience(item.id, { current: checked === true })} /> I currently work here</label>
                      <Field label="Achievements and responsibilities"><Textarea value={item.description} onChange={(event) => updateExperience(item.id, { description: event.target.value })} placeholder="Describe your impact with clear, concise points." /></Field>
                    </div>
                  ))}
                  <Button variant="outline" className="add-entry" onClick={() => setResume({ ...resume, content: { ...resume.content, experience: [...resume.content.experience, blankExperience()] } })}><Plus /> Add experience</Button>
                </div>
              </TabsContent>

              <TabsContent value="education">
                <div className="panel-heading"><p>04 · YOUR FOUNDATION</p><h2>Education</h2><span>Add degrees, diplomas, and relevant academic programmes.</span></div>
                <div className="repeatable-list">
                  {resume.content.education.map((item, index) => (
                    <div className="repeatable-card" key={item.id}>
                      <div className="repeatable-card-header"><strong>Education {index + 1}</strong><Button variant="ghost" size="icon-sm" aria-label="Remove education" onClick={() => setResume({ ...resume, content: { ...resume.content, education: resume.content.education.filter((entry) => entry.id !== item.id) } })}><Trash2 /></Button></div>
                      <div className="builder-form-grid two-col">
                        <Field label="Degree or programme"><Input value={item.degree} onChange={(event) => updateEducation(item.id, { degree: event.target.value })} placeholder="MSc Computer Science" /></Field>
                        <Field label="School or university"><Input value={item.school} onChange={(event) => updateEducation(item.id, { school: event.target.value })} placeholder="University name" /></Field>
                        <Field label="Location"><Input value={item.location} onChange={(event) => updateEducation(item.id, { location: event.target.value })} placeholder="City, Country" /></Field>
                        <span />
                        <Field label="Start date"><Input value={item.startDate} onChange={(event) => updateEducation(item.id, { startDate: event.target.value })} placeholder="2023" /></Field>
                        <Field label="End date"><Input value={item.endDate} onChange={(event) => updateEducation(item.id, { endDate: event.target.value })} placeholder="2026" /></Field>
                      </div>
                      <Field label="Details (optional)"><Textarea value={item.description} onChange={(event) => updateEducation(item.id, { description: event.target.value })} placeholder="Relevant coursework, thesis, honours…" /></Field>
                    </div>
                  ))}
                  <Button variant="outline" className="add-entry" onClick={() => setResume({ ...resume, content: { ...resume.content, education: [...resume.content.education, blankEducation()] } })}><Plus /> Add education</Button>
                </div>
              </TabsContent>

              <TabsContent value="skills">
                <div className="panel-heading"><p>05 · THE DETAILS</p><h2>Skills & languages</h2><span>Add the tools and languages most relevant to your target role.</span></div>
                <Field label="Skills" hint="Separate skills with commas">
                  <Textarea value={resume.content.skills.join(", ")} onChange={(event) => setResume({ ...resume, content: { ...resume.content, skills: event.target.value.split(",").map((skill) => skill.trim()).filter(Boolean) } })} placeholder="C++, Python, Java, OpenMP, MPI" />
                </Field>
                <div className="language-editor">
                  <Label>Languages</Label>
                  {resume.content.languages.map((item) => (
                    <div className="language-row" key={item.id}>
                      <Input value={item.name} onChange={(event) => updateLanguage(item.id, { name: event.target.value })} placeholder="Language" />
                      <Select value={item.level} onValueChange={(value) => updateLanguage(item.id, { level: value })}>
                        <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                        <SelectContent>{["Native", "Fluent", "Advanced", "Intermediate", "Basic"].map((level) => <SelectItem value={level} key={level}>{level}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" aria-label="Remove language" onClick={() => setResume({ ...resume, content: { ...resume.content, languages: resume.content.languages.filter((language) => language.id !== item.id) } })}><Trash2 /></Button>
                    </div>
                  ))}
                  <Button variant="outline" className="add-entry" onClick={() => setResume({ ...resume, content: { ...resume.content, languages: [...resume.content.languages, blankLanguage()] } })}><Plus /> Add language</Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </section>

        <section className="builder-preview-panel">
          <div className="preview-toolbar no-print"><Badge variant="outline">Live preview</Badge><span>A4 · {TEMPLATE_NAMES[resume.template]}</span></div>
          <div className="resume-preview-stage"><ResumePreview content={resume.content} template={resume.template} /></div>
        </section>
      </div>

      <div className="mobile-builder-bar no-print">
        <Button variant={!mobilePreview ? "default" : "outline"} onClick={() => setMobilePreview(false)}>Edit</Button>
        <Button variant={mobilePreview ? "default" : "outline"} onClick={() => setMobilePreview(true)}>Preview</Button>
        <Button variant="outline" size="icon" onClick={() => void saveResume(resume, true)} aria-label="Save CV"><RotateCcw className={saveState === "saving" ? "animate-spin" : ""} /></Button>
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
}
