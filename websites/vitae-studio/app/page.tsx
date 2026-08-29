import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileCheck2,
  LayoutDashboard,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  chatGPTSignInPath,
  chatGPTSignOutPath,
  getChatGPTUser,
} from "./chatgpt-auth";

const features = [
  {
    icon: FileCheck2,
    title: "A format recruiters know",
    copy: "Build a clear, ATS-friendly CV with the sections hiring teams expect.",
  },
  {
    icon: LayoutDashboard,
    title: "One focused workspace",
    copy: "Write, reorder, preview, and manage every version from your dashboard.",
  },
  {
    icon: LockKeyhole,
    title: "Private by design",
    copy: "Your saved CVs belong to your account and stay protected behind sign-in.",
  },
];

const templates = [
  { name: "Classic", note: "Precise & traditional", accent: "#173f3a" },
  { name: "Modern", note: "Fresh & balanced", accent: "#c75738" },
  { name: "Executive", note: "Confident & refined", accent: "#24344d" },
];

export default async function Home() {
  const user = await getChatGPTUser();
  const primaryHref = user ? "/dashboard" : chatGPTSignInPath("/dashboard");

  return (
    <main className="landing-shell">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link className="brand-lockup" href="/" aria-label="Vitae Studio home">
          <span className="brand-mark">V</span>
          <span>Vitae Studio</span>
        </Link>
        <div className="nav-links">
          <a href="#templates">Templates</a>
          <a href="#how-it-works">How it works</a>
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-user" title={user.email}>
                {user.displayName}
              </span>
              <Button variant="ghost" asChild>
                <a href={chatGPTSignOutPath("/")} target="_top">
                  Sign out
                </a>
              </Button>
            </>
          ) : (
            <Button variant="ghost" asChild>
              <a href={chatGPTSignInPath("/dashboard")} target="_top">
                Sign in
              </a>
            </Button>
          )}
          <Button className="nav-cta" asChild>
            <a href={primaryHref} target="_top">
              {user ? "Open dashboard" : "Create my CV"}
            </a>
          </Button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <Badge variant="outline" className="hero-badge">
            <Sparkles /> Thoughtful CV building, minus the clutter
          </Badge>
          <h1>
            Your experience,
            <br />
            <em>beautifully structured.</em>
          </h1>
          <p className="hero-lede">
            Create a polished, standard-format resume that reads clearly, looks
            considered, and is ready for your next application.
          </p>
          <div className="hero-actions">
            <Button size="lg" className="primary-action" asChild>
              <a href={primaryHref} target="_top">
                Build your CV <ArrowRight />
              </a>
            </Button>
            <span>Free to start · Saved securely</span>
          </div>
          <div className="trust-row" aria-label="Product benefits">
            <span><Check /> Live preview</span>
            <span><Check /> Standard sections</span>
            <span><Check /> PDF-ready</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Example resume preview">
          <div className="orbit-note note-one">01 · Clear hierarchy</div>
          <div className="orbit-note note-two">02 · Recruiter ready</div>
          <div className="resume-page resume-shadow" aria-hidden="true" />
          <article className="resume-page sample-resume">
            <header>
              <div>
                <p className="sample-kicker">PRODUCT DESIGNER</p>
                <h2>Amelia Hart</h2>
              </div>
              <div className="sample-contact">
                <span>amelia@example.com</span>
                <span>Helsinki, Finland</span>
              </div>
            </header>
            <div className="sample-rule" />
            <section>
              <p className="sample-label">PROFILE</p>
              <p className="sample-body">
                Product designer focused on simple, accessible digital
                experiences and thoughtful systems.
              </p>
            </section>
            <section>
              <p className="sample-label">EXPERIENCE</p>
              <div className="sample-entry">
                <span>2023—NOW</span>
                <div><strong>Senior Product Designer</strong><small>Northstar Studio</small></div>
              </div>
              <div className="sample-entry">
                <span>2020—2023</span>
                <div><strong>Product Designer</strong><small>Field & Form</small></div>
              </div>
            </section>
            <section>
              <p className="sample-label">EDUCATION</p>
              <div className="sample-entry">
                <span>2018—2020</span>
                <div><strong>MA Interaction Design</strong><small>Aalto University</small></div>
              </div>
            </section>
            <footer>
              <span>Figma</span><span>Research</span><span>Prototyping</span><span>Design systems</span>
            </footer>
          </article>
        </div>
      </section>

      <section className="feature-strip" id="how-it-works">
        {features.map(({ icon: Icon, title, copy }, index) => (
          <article key={title}>
            <div className="feature-index">0{index + 1}</div>
            <Icon />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <section className="template-section" id="templates">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FORMATS WITH PURPOSE</p>
            <h2>Start with a strong structure.</h2>
          </div>
          <p>
            Every template keeps typography quiet and information easy to scan,
            while giving your CV a distinct point of view.
          </p>
        </div>
        <div className="template-grid">
          {templates.map((template, index) => (
            <article className="template-card" key={template.name}>
              <div
                className={`template-sheet template-${index + 1}`}
                style={{ "--template-accent": template.accent } as CSSProperties}
              >
                <span className="template-name-block" />
                <span className="template-sub-block" />
                <span className="template-line wide" />
                <span className="template-line" />
                <span className="template-line wide" />
                <span className="template-line short" />
              </div>
              <div className="template-meta">
                <div><h3>{template.name}</h3><p>{template.note}</p></div>
                <Button variant="outline" size="icon-sm" asChild aria-label={`Use ${template.name} template`}>
                  <a href={primaryHref} target="_top"><ArrowRight /></a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-banner">
        <div>
          <p className="eyebrow">YOUR NEXT APPLICATION</p>
          <h2>Make the first page count.</h2>
        </div>
        <Button size="lg" className="closing-action" asChild>
          <a href={primaryHref} target="_top">Start building <ArrowRight /></a>
        </Button>
      </section>

      <footer className="site-footer">
        <Link className="brand-lockup" href="/"><span className="brand-mark">V</span><span>Vitae Studio</span></Link>
        <p>Structured for clarity. Designed for people.</p>
        <p>© 2026 Vitae Studio</p>
      </footer>
    </main>
  );
}
