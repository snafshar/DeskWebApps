/* eslint-disable @next/next/no-img-element */
import { Globe2, Mail, MapPin, Phone } from "lucide-react";
import type { ResumeContent, ResumeTemplate } from "@/lib/resume-types";

type ResumePreviewProps = { content: ResumeContent; template: ResumeTemplate };
type Entry = { id: string; dates?: string; title: string; meta?: string; description?: string; url?: string; extra?: string };

function dateRange(start: string, end: string, current = false) {
  if (!start && !end && !current) return "";
  return [start, current ? "Present" : end].filter(Boolean).join(" — ");
}

function href(value: string) {
  if (!value) return "#";
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  return `https://${value}`;
}

function EntryList({ items }: { items: Entry[] }) {
  if (!items.length) return <p className="resume-empty">Add entries in the editor.</p>;
  return <div className="resume-section-list">{items.map((item) => (
    <div className="resume-document-entry" key={item.id}>
      <div className="resume-entry-dates">{item.dates}</div>
      <div>
        <h3>{item.url ? <a href={href(item.url)} target="_blank" rel="noreferrer">{item.title || "Untitled entry"}</a> : item.title || "Untitled entry"}</h3>
        {item.meta && <p className="resume-entry-meta">{item.meta}</p>}
        {item.extra && <p className="resume-entry-extra">{item.extra}</p>}
        {item.description && <p className="resume-entry-description">{item.description}</p>}
      </div>
    </div>
  ))}</div>;
}

function StandardSection({ title, items }: { title: string; items: Entry[] }) {
  if (!items.length) return null;
  return <section className="resume-document-section"><h2>{title}</h2><EntryList items={items} /></section>;
}

function asEntries(content: ResumeContent) {
  return {
    experience: content.experience.map((item) => ({ id: item.id, dates: dateRange(item.startDate, item.endDate, item.current), title: item.role, meta: [item.company, item.location].filter(Boolean).join(" · "), description: item.description })),
    education: content.education.map((item) => ({ id: item.id, dates: dateRange(item.startDate, item.endDate), title: item.degree, meta: [item.school, item.location].filter(Boolean).join(" · "), description: item.description })),
    publications: content.publications.map((item) => ({ id: item.id, dates: item.year, title: item.title, meta: [item.authors, item.venue].filter(Boolean).join(" · "), extra: item.doi ? `DOI: ${item.doi}` : "", description: item.description, url: item.url || (item.doi ? `https://doi.org/${item.doi.replace(/^https?:\/\/doi\.org\//, "")}` : "") })),
    projects: content.projects.map((item) => ({ id: item.id, dates: dateRange(item.startDate, item.endDate), title: item.title, meta: [item.role, item.technologies].filter(Boolean).join(" · "), description: item.description, url: item.url })),
    teaching: content.teaching.map((item) => ({ id: item.id, dates: dateRange(item.startDate, item.endDate), title: item.role, meta: [item.institution, item.location].filter(Boolean).join(" · "), description: item.description })),
    certifications: content.certifications.map((item) => ({ id: item.id, dates: item.date, title: item.name, meta: [item.issuer, item.credentialId].filter(Boolean).join(" · "), description: item.description, url: item.url })),
    awards: content.awards.map((item) => ({ id: item.id, dates: item.date, title: item.title, meta: item.issuer, description: item.description })),
    volunteering: content.volunteering.map((item) => ({ id: item.id, dates: dateRange(item.startDate, item.endDate), title: item.role, meta: item.organization, description: item.description })),
    memberships: content.memberships.map((item) => ({ id: item.id, dates: dateRange(item.startDate, item.endDate), title: item.organization, meta: item.role, url: item.url })),
  };
}

function EuropassPreview({ content }: { content: ResumeContent }) {
  const entries = asEntries(content);
  const initials = content.personal.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("") || "CV";
  return (
    <article className="resume-document resume-document-europass" id="resume-print-area">
      <aside className="europass-rail">
        <img className="europass-brand" src="https://europa.eu/europass/sites/default/files/2023-11/Europass-Colour-Purple-Brand-Mark.png" alt="Europass" />
        {content.personal.photoUrl ? <img className="europass-photo" src={href(content.personal.photoUrl)} alt={content.personal.fullName || "Profile"} /> : <div className="europass-photo-placeholder">{initials}</div>}
        <div className="europass-side-section"><h2>Personal information</h2>
          {[content.personal.email, content.personal.phone, content.personal.address || content.personal.location, content.personal.nationality && `Nationality: ${content.personal.nationality}`, content.personal.dateOfBirth && `Born: ${content.personal.dateOfBirth}`].filter(Boolean).map((item) => <p key={item}>{item}</p>)}
        </div>
        {content.personal.links.length > 0 && <div className="europass-side-section"><h2>Links</h2>{content.personal.links.map((item) => <a key={item.id} href={href(item.url)} target="_blank" rel="noreferrer">{item.label || item.url}</a>)}</div>}
        {(content.skills.length > 0 || content.skillGroups.length > 0) && <div className="europass-side-section"><h2>Digital & technical skills</h2>{content.skills.length > 0 && <p>{content.skills.join(" · ")}</p>}{content.skillGroups.map((item) => <p key={item.id}><strong>{item.category}</strong>{item.category && item.skills ? ": " : ""}{item.skills}</p>)}</div>}
        {content.languages.length > 0 && <div className="europass-side-section"><h2>Language skills</h2>{content.languages.map((item) => <div className="europass-language" key={item.id}><strong>{item.name}</strong><span>{item.level || [item.listening, item.reading, item.spokenInteraction, item.spokenProduction, item.writing].filter(Boolean).join(" / ")}</span></div>)}</div>}
        {content.interests.length > 0 && <div className="europass-side-section"><h2>Interests</h2><p>{content.interests.join(" · ")}</p></div>}
      </aside>
      <div className="europass-main">
        <header className="europass-header"><p>{content.personal.headline || "Professional title"}</p><h1>{content.personal.fullName || "Your Name"}</h1></header>
        {content.summary && <section className="europass-section"><h2>About me</h2><p className="resume-summary">{content.summary}</p></section>}
        <section className="europass-section"><h2>Work experience</h2><EntryList items={entries.experience} /></section>
        <section className="europass-section"><h2>Education and training</h2><EntryList items={entries.education} /></section>
        {content.researchInterests.length > 0 && <section className="europass-section"><h2>Research interests</h2><p className="resume-summary">{content.researchInterests.join(" · ")}</p></section>}
        <StandardSection title="Publications" items={entries.publications} />
        <StandardSection title="Projects" items={entries.projects} />
        <StandardSection title="Teaching experience" items={entries.teaching} />
        <StandardSection title="Certifications" items={entries.certifications} />
        <StandardSection title="Honours and awards" items={entries.awards} />
        <StandardSection title="Volunteering" items={entries.volunteering} />
        <StandardSection title="Networks and memberships" items={entries.memberships} />
        {content.customSections.map((section) => <StandardSection key={section.id} title={section.title || "Additional information"} items={section.items.map((item) => ({ id: item.id, dates: item.date, title: item.title, meta: item.subtitle, description: item.description, url: item.url }))} />)}
      </div>
    </article>
  );
}

export function ResumePreview({ content, template }: ResumePreviewProps) {
  if (template === "europass") return <EuropassPreview content={content} />;
  const { personal } = content;
  const entries = asEntries(content);
  const contacts = [
    { value: personal.email, icon: Mail }, { value: personal.phone, icon: Phone }, { value: personal.location, icon: MapPin }, ...personal.links.map((item) => ({ value: item.label || item.url, icon: Globe2 })),
  ].filter((item) => item.value);

  return (
    <article className={`resume-document resume-document-${template}`} id="resume-print-area">
      <header className="resume-document-header"><div><p className="resume-profession">{personal.headline || "YOUR PROFESSIONAL TITLE"}</p><h1>{personal.fullName || "Your Name"}</h1></div><div className="resume-contact-list">{contacts.map(({ value, icon: Icon }, index) => <span key={`${value}-${index}`}><Icon />{value}</span>)}{!contacts.length && <span className="resume-empty">Your contact details</span>}</div></header>
      <div className="resume-document-rule" />
      <section className="resume-document-section"><h2>Profile</h2>{content.summary ? <p className="resume-summary">{content.summary}</p> : <p className="resume-empty">Add a concise professional summary.</p>}</section>
      <section className="resume-document-section"><h2>Professional experience</h2><EntryList items={entries.experience} /></section>
      <section className="resume-document-section"><h2>Education and training</h2><EntryList items={entries.education} /></section>
      {content.researchInterests.length > 0 && <section className="resume-document-section"><h2>Research interests</h2><p className="resume-summary">{content.researchInterests.join(" · ")}</p></section>}
      <StandardSection title="Publications" items={entries.publications} />
      <StandardSection title="Projects" items={entries.projects} />
      <StandardSection title="Teaching experience" items={entries.teaching} />
      <div className="resume-document-columns"><section className="resume-document-section"><h2>Technical & digital skills</h2>{content.skills.length ? <div className="resume-skill-list">{content.skills.map((skill) => <span key={skill}>{skill}</span>)}</div> : <p className="resume-empty">Add your core skills.</p>}{content.skillGroups.map((item) => <p className="resume-grouped-skill" key={item.id}><strong>{item.category}</strong>{item.category && item.skills ? ": " : ""}{item.skills}</p>)}</section><section className="resume-document-section"><h2>Languages</h2>{content.languages.length ? <div className="resume-language-list">{content.languages.map((language) => <span key={language.id}><strong>{language.name}</strong>{language.level || [language.listening, language.reading, language.spokenInteraction, language.spokenProduction, language.writing].filter(Boolean).join(" / ")}</span>)}</div> : <p className="resume-empty">Add languages.</p>}</section></div>
      <StandardSection title="Certifications & professional development" items={entries.certifications} />
      <StandardSection title="Honours & awards" items={entries.awards} />
      <StandardSection title="Volunteering" items={entries.volunteering} />
      <StandardSection title="Networks & memberships" items={entries.memberships} />
      {content.interests.length > 0 && <section className="resume-document-section"><h2>Interests</h2><p className="resume-summary">{content.interests.join(" · ")}</p></section>}
      {content.references.length > 0 && <section className="resume-document-section"><h2>References</h2><div className="resume-reference-grid">{content.references.map((item) => <div key={item.id}><strong>{item.name}</strong><span>{[item.role, item.organization, item.email, item.phone].filter(Boolean).join(" · ")}</span></div>)}</div></section>}
      {content.customSections.map((section) => <StandardSection key={section.id} title={section.title || "Additional information"} items={section.items.map((item) => ({ id: item.id, dates: item.date, title: item.title, meta: item.subtitle, description: item.description, url: item.url }))} />)}
    </article>
  );
}
