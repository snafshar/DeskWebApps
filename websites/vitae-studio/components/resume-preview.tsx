import { Globe2, Mail, MapPin, Phone } from "lucide-react";
import type { ResumeContent, ResumeTemplate } from "@/lib/resume-types";

type ResumePreviewProps = {
  content: ResumeContent;
  template: ResumeTemplate;
};

function dateRange(start: string, end: string, current = false) {
  if (!start && !end && !current) return "";
  return [start, current ? "Present" : end].filter(Boolean).join(" — ");
}

export function ResumePreview({ content, template }: ResumePreviewProps) {
  const { personal } = content;
  const contacts = [
    { value: personal.email, icon: Mail },
    { value: personal.phone, icon: Phone },
    { value: personal.location, icon: MapPin },
    { value: personal.website, icon: Globe2 },
  ].filter((item) => item.value);

  return (
    <article className={`resume-document resume-document-${template}`} id="resume-print-area">
      <header className="resume-document-header">
        <div>
          <p className="resume-profession">{personal.headline || "YOUR PROFESSIONAL TITLE"}</p>
          <h1>{personal.fullName || "Your Name"}</h1>
        </div>
        <div className="resume-contact-list">
          {contacts.map(({ value, icon: Icon }) => <span key={value}><Icon />{value}</span>)}
          {!contacts.length && <span className="resume-empty">Your contact details</span>}
        </div>
      </header>

      <div className="resume-document-rule" />

      <section className="resume-document-section">
        <h2>Profile</h2>
        {content.summary ? <p className="resume-summary">{content.summary}</p> : <p className="resume-empty">Add a concise professional summary that introduces your strengths and direction.</p>}
      </section>

      <section className="resume-document-section">
        <h2>Experience</h2>
        {content.experience.length ? (
          <div className="resume-section-list">
            {content.experience.map((item) => (
              <div className="resume-document-entry" key={item.id}>
                <div className="resume-entry-dates">{dateRange(item.startDate, item.endDate, item.current)}</div>
                <div>
                  <h3>{item.role || "Role"}</h3>
                  <p className="resume-entry-meta">{[item.company, item.location].filter(Boolean).join(" · ")}</p>
                  {item.description && <p className="resume-entry-description">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : <p className="resume-empty">Your work experience will appear here.</p>}
      </section>

      <section className="resume-document-section">
        <h2>Education</h2>
        {content.education.length ? (
          <div className="resume-section-list">
            {content.education.map((item) => (
              <div className="resume-document-entry" key={item.id}>
                <div className="resume-entry-dates">{dateRange(item.startDate, item.endDate)}</div>
                <div>
                  <h3>{item.degree || "Degree"}</h3>
                  <p className="resume-entry-meta">{[item.school, item.location].filter(Boolean).join(" · ")}</p>
                  {item.description && <p className="resume-entry-description">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : <p className="resume-empty">Your education will appear here.</p>}
      </section>

      <div className="resume-document-columns">
        <section className="resume-document-section">
          <h2>Skills</h2>
          {content.skills.length ? <div className="resume-skill-list">{content.skills.map((skill) => <span key={skill}>{skill}</span>)}</div> : <p className="resume-empty">Add your core skills.</p>}
        </section>
        <section className="resume-document-section">
          <h2>Languages</h2>
          {content.languages.length ? <div className="resume-language-list">{content.languages.map((language) => <span key={language.id}><strong>{language.name}</strong>{language.level}</span>)}</div> : <p className="resume-empty">Add languages.</p>}
        </section>
      </div>
    </article>
  );
}
