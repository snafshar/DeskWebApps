"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  FilePlus2,
  Files,
  LayoutGrid,
  LogOut,
  MoreHorizontal,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  calculateCompletion,
  TEMPLATE_NAMES,
  type ResumeRecord,
  type ResumeTemplate,
} from "@/lib/resume-types";

type DashboardProps = {
  user: { displayName: string; email: string };
  signOutHref: string;
};

function formatDate(value: string) {
  const parsed = new Date(value.replace(" ", "T") + (value.includes("Z") ? "" : "Z"));
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "VS";
}

export function DashboardClient({ user, signOutHref }: DashboardProps) {
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("My professional CV");
  const [template, setTemplate] = useState<ResumeTemplate>("classic");

  const loadResumes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/resumes", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load your CVs.");
      const data = (await response.json()) as { resumes: ResumeRecord[] };
      setResumes(data.resumes);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load your CVs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadResumes(), 0);
    return () => window.clearTimeout(timer);
  }, [loadResumes]);

  const averageCompletion = useMemo(() => {
    if (!resumes.length) return 0;
    return Math.round(resumes.reduce((total, resume) => total + calculateCompletion(resume.content), 0) / resumes.length);
  }, [resumes]);

  async function createResume() {
    setCreating(true);
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, template }),
      });
      if (!response.ok) throw new Error("Could not create the CV.");
      const data = (await response.json()) as { resume: ResumeRecord };
      window.location.href = template === "europass" ? `/europass/${data.resume.id}` : `/builder/${data.resume.id}`;
    } catch (createError) {
      toast.error(createError instanceof Error ? createError.message : "Could not create the CV.");
      setCreating(false);
    }
  }

  async function deleteResume(id: string) {
    const response = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("The CV could not be deleted.");
      return;
    }
    setResumes((current) => current.filter((resume) => resume.id !== id));
    toast.success("CV deleted");
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" href="/">
          <span className="brand-mark dashboard-brand-mark">V</span>
          <span>Vitae Studio</span>
        </Link>
        <nav aria-label="Dashboard navigation">
          <a className="active" href="#overview"><LayoutGrid /> Overview</a>
          <a href="#my-cvs"><Files /> My CVs</a>
          <button type="button" onClick={() => setCreateOpen(true)}><Sparkles /> Templates</button>
        </nav>
        <div className="sidebar-account">
          <div className="sidebar-avatar">{initials(user.displayName)}</div>
          <div><strong>{user.displayName}</strong><span>{user.email}</span></div>
          <Button variant="ghost" size="icon-sm" asChild aria-label="Sign out">
            <a href={signOutHref} target="_top"><LogOut /></a>
          </Button>
        </div>
      </aside>

      <main className="dashboard-main" id="overview">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">YOUR WORKSPACE</p>
            <h1>Good to see you, {user.displayName.split(" ")[0]}.</h1>
            <p>Build a clear CV, keep each version organised, and stay ready to apply.</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="dashboard-new"><Plus /> New CV</Button>
            </DialogTrigger>
            <DialogContent className="create-dialog">
              <DialogHeader>
                <DialogTitle>Create a new CV</DialogTitle>
                <DialogDescription>Give this version a useful name and choose its starting style.</DialogDescription>
              </DialogHeader>
              <div className="create-fields">
                <div className="field-stack">
                  <Label htmlFor="resume-title">CV name</Label>
                  <Input id="resume-title" value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} />
                </div>
                <div className="field-stack">
                  <Label>Template</Label>
                  <RadioGroup value={template} onValueChange={(value) => setTemplate(value as ResumeTemplate)} className="template-radio-grid">
                    {(["classic", "modern", "executive", "europass"] as ResumeTemplate[]).map((choice) => (
                      <label className={`template-radio ${template === choice ? "selected" : ""}`} key={choice}>
                        <RadioGroupItem value={choice} />
                        <span className={`mini-template mini-${choice}`}><i /><i /><i /><i /></span>
                        <strong>{TEMPLATE_NAMES[choice]}</strong>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={createResume} disabled={creating || !title.trim()}>{creating ? "Creating…" : "Create CV"}<ArrowRight /></Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <section className="dashboard-stats" aria-label="CV overview">
          <article>
            <div className="stat-icon"><Files /></div>
            <div><span>Saved CVs</span><strong>{loading ? "—" : resumes.length}</strong></div>
          </article>
          <article>
            <div className="stat-icon coral"><BriefcaseBusiness /></div>
            <div><span>Average completeness</span><strong>{loading ? "—" : `${averageCompletion}%`}</strong></div>
          </article>
          <article>
            <div className="stat-icon sand"><Clock3 /></div>
            <div><span>Last edited</span><strong>{loading ? "—" : resumes[0] ? formatDate(resumes[0].updatedAt) : "No activity yet"}</strong></div>
          </article>
        </section>

        <section className="resume-library" id="my-cvs">
          <div className="library-heading">
            <div><p className="dashboard-eyebrow">MY DOCUMENTS</p><h2>Your CVs</h2></div>
            {resumes.length > 0 && <Badge variant="outline">{resumes.length} {resumes.length === 1 ? "version" : "versions"}</Badge>}
          </div>

          {loading ? (
            <div className="resume-card-grid">
              {[0, 1, 2].map((item) => <Skeleton key={item} className="dashboard-skeleton" />)}
            </div>
          ) : error ? (
            <div className="dashboard-message"><p>{error}</p><Button variant="outline" onClick={() => void loadResumes()}>Try again</Button></div>
          ) : resumes.length === 0 ? (
            <div className="empty-library">
              <div className="empty-symbol"><FilePlus2 /></div>
              <p className="dashboard-eyebrow">A CLEAN START</p>
              <h3>Create your first CV</h3>
              <p>Choose a structure, add your experience, and see the finished page take shape beside you.</p>
              <Button onClick={() => setCreateOpen(true)}><Plus /> Create my first CV</Button>
            </div>
          ) : (
            <div className="resume-card-grid">
              {resumes.map((resume) => {
                const completion = calculateCompletion(resume.content);
                return (
                  <article className="resume-dashboard-card" key={resume.id}>
                    <div className={`dashboard-resume-preview preview-${resume.template}`}>
                      <i className="preview-heading" />
                      <i className="preview-subheading" />
                      <i /><i /><i /><i className="short" />
                      <span>{completion}%</span>
                    </div>
                    <div className="resume-card-info">
                      <div className="resume-card-title">
                        <div><h3>{resume.title}</h3><p>{TEMPLATE_NAMES[resume.template]} · Edited {formatDate(resume.updatedAt)}</p></div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`More actions for ${resume.title}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><a href={resume.template === "europass" ? `/europass/${resume.id}` : `/builder/${resume.id}`}>Edit CV</a></DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="text-destructive"><Trash2 /> Delete</DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Delete this CV?</AlertDialogTitle><AlertDialogDescription>“{resume.title}” will be permanently removed. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Keep it</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => void deleteResume(resume.id)}>Delete CV</AlertDialogAction></AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="completion-row"><span>Profile completeness</span><strong>{completion}%</strong></div>
                      <Progress value={completion} />
                      <Button variant="outline" className="edit-resume" asChild><a href={resume.template === "europass" ? `/europass/${resume.id}` : `/builder/${resume.id}`}>Continue editing <ArrowRight /></a></Button>
                    </div>
                  </article>
                );
              })}
              <button className="quick-create-card" type="button" onClick={() => setCreateOpen(true)}>
                <span><Plus /></span><strong>Create another CV</strong><small>Start from a standard template</small>
              </button>
            </div>
          )}
        </section>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
