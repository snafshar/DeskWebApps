import type { ResumeContent, ResumeTemplate } from "@/lib/resume-types";

function tex(value = "") {
  return value.replace(/\\/g, "\\textbackslash{}").replace(/([&%$#_{}])/g, "\\$1").replace(/~/g, "\\textasciitilde{}").replace(/\^/g, "\\textasciicircum{}");
}

function url(value = "") {
  return value.replace(/[{}]/g, "").replace(/%/g, "\\%").replace(/#/g, "\\#");
}

function linked(label: string, value: string) {
  return value ? `\\href{${url(value)}}{${tex(label)}}` : tex(label);
}

function dates(start: string, end: string, current = false) {
  return [start, current ? "Present" : end].filter(Boolean).join(" -- ");
}

function section(title: string, body: string) {
  return body.trim() ? `\n\\section{${tex(title)}}\n${body.trim()}\n` : "";
}

type DatedEntry = { date: string; title: string; meta?: string; description?: string; link?: string };

function datedEntries(items: DatedEntry[], europass: boolean) {
  return items.filter((item) => item.title || item.meta || item.description).map((item) => {
    const title = item.link ? linked(item.title, item.link) : tex(item.title);
    if (europass) return `\\begin{tabularx}{\\textwidth}{@{}p{0.20\\textwidth}X@{}}\n\\small ${tex(item.date)} & \\textbf{${title}}${item.meta ? ` \\\\ \\textit{${tex(item.meta)}}` : ""}${item.description ? ` \\\\ ${tex(item.description)}` : ""}\n\\end{tabularx}\\vspace{0.7em}`;
    return `\\cventry{${tex(item.date)}}{${title}}{${tex(item.meta ?? "")}}{${tex(item.description ?? "")}}`;
  }).join("\n\n");
}

export function generateLatexResume(content: ResumeContent, template: ResumeTemplate) {
  const europass = template === "europass";
  const accent = europass ? "5E2B97" : template === "modern" ? "C75738" : template === "executive" ? "24344D" : "173F3A";
  const links = content.personal.links.filter((item) => item.url).map((item) => linked(item.label || item.url, item.url)).join(" \\textbullet{} ");
  const contact = [content.personal.email ? linked(content.personal.email, `mailto:${content.personal.email}`) : "", content.personal.phone && tex(content.personal.phone), content.personal.location && tex(content.personal.location), links].filter(Boolean).join(" \\textbullet{} ");
  const experience = datedEntries(content.experience.map((item) => ({ date: dates(item.startDate, item.endDate, item.current), title: item.role, meta: [item.company, item.location].filter(Boolean).join(", "), description: item.description })), europass);
  const education = datedEntries(content.education.map((item) => ({ date: dates(item.startDate, item.endDate), title: item.degree, meta: [item.school, item.location].filter(Boolean).join(", "), description: item.description })), europass);
  const teaching = datedEntries(content.teaching.map((item) => ({ date: dates(item.startDate, item.endDate), title: item.role, meta: [item.institution, item.location].filter(Boolean).join(", "), description: item.description })), europass);
  const publications = datedEntries(content.publications.map((item) => ({ date: item.year, title: item.title, meta: [item.authors, item.venue].filter(Boolean).join(". "), description: [item.doi ? `DOI: ${item.doi}` : "", item.description].filter(Boolean).join(". "), link: item.url || (item.doi ? `https://doi.org/${item.doi.replace(/^https?:\/\/doi\.org\//, "")}` : "") })), europass);
  const projects = datedEntries(content.projects.map((item) => ({ date: dates(item.startDate, item.endDate), title: item.title, meta: [item.role, item.technologies].filter(Boolean).join(" · "), description: item.description, link: item.url })), europass);
  const certifications = datedEntries(content.certifications.map((item) => ({ date: item.date, title: item.name, meta: [item.issuer, item.credentialId].filter(Boolean).join(" · "), description: item.description, link: item.url })), europass);
  const awards = datedEntries(content.awards.map((item) => ({ date: item.date, title: item.title, meta: item.issuer, description: item.description })), europass);
  const volunteering = datedEntries(content.volunteering.map((item) => ({ date: dates(item.startDate, item.endDate), title: item.role, meta: item.organization, description: item.description })), europass);
  const memberships = datedEntries(content.memberships.map((item) => ({ date: dates(item.startDate, item.endDate), title: item.organization, meta: item.role, link: item.url })), europass);
  const references = content.references.filter((item) => item.name).map((item) => `\\textbf{${tex(item.name)}} — ${tex([item.role, item.organization, item.email, item.phone].filter(Boolean).join(" · "))}\\par`).join("\n");
  const languages = content.languages.filter((item) => item.name).map((item) => {
    const cefr = [item.listening, item.reading, item.spokenInteraction, item.spokenProduction, item.writing].filter(Boolean);
    const detail = cefr.length ? `Listening ${item.listening || "–"}; Reading ${item.reading || "–"}; Spoken interaction ${item.spokenInteraction || "–"}; Spoken production ${item.spokenProduction || "–"}; Writing ${item.writing || "–"}` : item.level;
    return `\\textbf{${tex(item.name)}}: ${tex(detail)}${item.certificate ? ` (${tex(item.certificate)})` : ""}\\par`;
  }).join("\n");
  const groupedSkills = content.skillGroups.filter((item) => item.category || item.skills).map((item) => `\\textbf{${tex(item.category)}}: ${tex(item.skills)}\\par`).join("\n");
  const custom = content.customSections.map((group) => section(group.title || "Additional information", datedEntries(group.items.map((item) => ({ date: item.date, title: item.title, meta: item.subtitle, description: item.description, link: item.url })), europass))).join("");
  const secondaryPersonal = [content.personal.address, content.personal.nationality && `Nationality: ${content.personal.nationality}`, content.personal.dateOfBirth && `Date of birth: ${content.personal.dateOfBirth}`].filter(Boolean);

  const preamble = `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=16mm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{lmodern,hyperref,tabularx,array,enumitem,titlesec,xcolor}
\\definecolor{accent}{HTML}{${accent}}
\\hypersetup{colorlinks=true,urlcolor=accent,linkcolor=accent}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{4pt}
\\pagestyle{empty}
\\titleformat{\\section}{\\large\\bfseries\\color{accent}}{}{0pt}{}[\\color{accent}\\titlerule]
\\titlespacing*{\\section}{0pt}{1.1em}{0.55em}
\\newcommand{\\cventry}[4]{\\begin{tabularx}{\\textwidth}{@{}p{0.19\\textwidth}X@{}}\\small #1 & \\textbf{#2} \\\\ & \\textit{#3} \\\\ & #4\\end{tabularx}\\vspace{0.55em}}
`;

  return `${preamble}\\begin{document}
${europass ? "{\\color{accent}\\Large\\bfseries EUROPASS}\\hfill Curriculum Vitae\\par\\vspace{1.2em}" : ""}
{\\Huge\\bfseries ${tex(content.personal.fullName || "Your Name")}}\\par
{\\large\\color{accent}${tex(content.personal.headline)}}\\par
\\small ${contact}${secondaryPersonal.length ? `\\par ${tex(secondaryPersonal.join(" · "))}` : ""}
\\normalsize
${section(europass ? "About me" : "Profile", tex(content.summary))}
${section(europass ? "Work experience" : "Professional experience", experience)}
${section("Education and training", education)}
${section("Research interests", tex(content.researchInterests.join(" · ")))}
${section("Publications", publications)}
${section("Projects", projects)}
${section("Teaching experience", teaching)}
${section("Technical and digital skills", [tex(content.skills.join(" · ")), groupedSkills].filter(Boolean).join("\\par\n"))}
${section("Language skills", languages)}
${section("Certifications and professional development", certifications)}
${section("Honours and awards", awards)}
${section("Volunteering", volunteering)}
${section("Networks and memberships", memberships)}
${section("Interests", tex(content.interests.join(" · ")))}
${section("References", references)}
${custom}
\\end{document}
`;
}
