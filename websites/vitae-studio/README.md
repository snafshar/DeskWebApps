# Vitae Studio

I built Vitae Studio as a full-stack platform for creating clear professional, academic, and Europass-style CVs without the visual clutter of many online builders. The product combines an extensive writing workspace with a live A4 preview, editable LaTeX source, secure user accounts, durable cloud storage, and a browser PDF flow.

**Live application:** [vitae-studio.afsharsn.chatgpt.site](https://vitae-studio.afsharsn.chatgpt.site)

## What I implemented

- A polished responsive landing page with four distinct CV formats
- Sign in and sign out through the hosting platform's identity flow
- A protected, user-specific dashboard and CV library
- Creation and deletion of multiple CV versions
- A structured editor for personal details and a user-chosen number of professional links
- Inclusive sections for work, teaching, volunteering, education, publications with DOI links, research interests, projects, credentials, skills, detailed CEFR languages, awards, memberships, references, interests, and custom content
- Immediate A4 preview while editing
- Three reusable standard templates: Classic, Modern, and Executive
- A dedicated Europass workspace and Europass-compatible A4 document renderer
- Debounced automatic saving plus an explicit save action
- Server-side ownership checks on every read, write, and delete operation
- A complete, compilable `.tex` generator with download and copy actions
- A print stylesheet that produces an A4 PDF through the browser's native save-to-PDF flow
- Responsive editor controls for desktop, tablet, and mobile

## Product flow

1. A visitor reviews the product and signs in.
2. The dashboard shows only CVs owned by that signed-in account.
3. The user selects a template and creates a named CV version.
4. Europass documents open in a dedicated editor; other formats use the standard editor.
5. Changes update the live document and LaTeX source and are saved automatically.
6. The finished document can be downloaded as `.tex`, copied to a LaTeX editor, or saved as PDF from the print dialog.

## Architecture

| Layer | Implementation |
|---|---|
| Interface | React 19, TypeScript, Vinext, Tailwind CSS, Shadcn primitives |
| Rendering | Server-rendered landing/protected routes plus client-side editing surfaces |
| Authentication | Dispatch-owned sign-in with identity resolved on the server |
| Persistence | Cloudflare D1 with Drizzle schema and generated migrations |
| API | Authenticated route handlers with record-level ownership checks |
| Deployment | Cloudflare Worker-compatible server output |

The central record is a `resume`. Each record stores its owner, document title, selected template, structured JSON content, and creation/update timestamps. I keep identity and authorization checks in server code so the client interface is never treated as a security boundary.

## Repository structure

```text
app/
  api/resumes/          Authenticated CRUD endpoints
  builder/[id]/         Protected CV editor
  europass/[id]/        Dedicated Europass editor
  dashboard/            Protected control panel
  page.tsx              Public product page
components/
  resume-preview.tsx    A4 document renderer
db/
  schema.ts             D1/Drizzle data model
drizzle/                Generated database migration
lib/
  resume-types.ts       Shared types, normalization, and completion logic
  latex.ts              Compilable LaTeX document generator
tests/                  Render and UI component checks
```

## Run locally

Prerequisites: Node.js 22.13 or newer and a Linux environment with GNU `timeout`.

```bash
npm ci
npm run dev
```

The production checks are:

```bash
npm run lint
npm test
```

Local identity headers and the D1 binding are supplied by the hosting runtime in production. The application deliberately does not store passwords or implement a second authentication system.

## Engineering decisions

- I used one extensible structured CV model so both editor experiences and every output render the same authoritative data.
- I chose D1 rather than browser storage because CVs are account data that should survive devices and sessions.
- I added a normalization boundary before stored JSON reaches the interface, which keeps older or incomplete records safe to render.
- Autosave is debounced to avoid writing on every keystroke; a visible status tells the user whether changes are saved.
- LaTeX is the primary editable source output. PDF output uses the browser print engine, preserving selectable text and avoiding a heavy client-side PDF dependency.
- Empty guidance is visible while editing but hidden from the printed document.

## Current scope and next iterations

This version covers the complete core workflow. The Europass renderer follows the familiar Europass information architecture and visual language, but Vitae Studio is an independent project and is not affiliated with or certified by the European Union. The next useful increments would be drag-and-drop section ordering, direct image uploads, shareable read-only CV links, document duplication, and server-side LaTeX compilation.
