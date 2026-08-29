# Vitae Studio

I built Vitae Studio as a full-stack platform for creating clear, standard-format CVs without the visual clutter of many online builders. The product combines a focused writing workspace with a live A4 preview, secure user accounts, durable cloud storage, and a PDF-ready export flow.

**Live application:** [vitae-studio.afsharsn.chatgpt.site](https://vitae-studio.afsharsn.chatgpt.site)

## What I implemented

- A polished responsive landing page with three distinct CV formats
- Sign in and sign out through the hosting platform's identity flow
- A protected, user-specific dashboard and CV library
- Creation and deletion of multiple CV versions
- A structured editor for personal details, profile, experience, education, skills, and languages
- Immediate A4 preview while editing
- Three reusable templates: Classic, Modern, and Executive
- Debounced automatic saving plus an explicit save action
- Server-side ownership checks on every read, write, and delete operation
- A print stylesheet that produces an A4 PDF through the browser's native save-to-PDF flow
- Responsive editor controls for desktop, tablet, and mobile

## Product flow

1. A visitor reviews the product and signs in.
2. The dashboard shows only CVs owned by that signed-in account.
3. The user selects a template and creates a named CV version.
4. Changes in the editor update the live preview and are saved automatically.
5. The finished document can be saved as a PDF from the print dialog.

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
  dashboard/            Protected control panel
  page.tsx              Public product page
components/
  resume-preview.tsx    A4 document renderer
db/
  schema.ts             D1/Drizzle data model
drizzle/                Generated database migration
lib/
  resume-types.ts       Shared types, normalization, and completion logic
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

- I used a single structured CV model so the editor and all templates render the same authoritative data.
- I chose D1 rather than browser storage because CVs are account data that should survive devices and sessions.
- I added a normalization boundary before stored JSON reaches the interface, which keeps older or incomplete records safe to render.
- Autosave is debounced to avoid writing on every keystroke; a visible status tells the user whether changes are saved.
- PDF output uses the browser print engine, preserving selectable text and avoiding a heavy client-side PDF dependency.
- Empty guidance is visible while editing but hidden from the printed document.

## Current scope and next iterations

This version covers the complete core workflow. The next useful increments would be drag-and-drop section ordering, optional profile photos, shareable read-only CV links, document duplication, and more granular typography controls. I would add those only after measuring which parts of the current workflow users rely on most.
