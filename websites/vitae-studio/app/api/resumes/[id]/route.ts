import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { resumes } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  normalizeResumeContent,
  type ResumeTemplate,
} from "@/lib/resume-types";

type RouteContext = { params: Promise<{ id: string }> };
const templates: ResumeTemplate[] = ["classic", "modern", "executive", "europass"];

function parseContent(value: string) {
  try {
    return normalizeResumeContent(JSON.parse(value));
  } catch {
    return normalizeResumeContent(null);
  }
}

async function getIdentityAndId(context: RouteContext) {
  const [user, params] = await Promise.all([getChatGPTUser(), context.params]);
  return { user, id: params.id };
}

export async function GET(_request: Request, context: RouteContext) {
  const { user, id } = await getIdentityAndId(context);
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const [resume] = await getDb()
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.ownerEmail, user.email)))
    .limit(1);

  if (!resume) return Response.json({ error: "CV not found" }, { status: 404 });
  return Response.json({ resume: { ...resume, content: parseContent(resume.content) } });
}

export async function PUT(request: Request, context: RouteContext) {
  const { user, id } = await getIdentityAndId(context);
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  let payload: { title?: string; template?: ResumeTemplate; content?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const title = payload.title?.trim().slice(0, 80);
  const template = payload.template && templates.includes(payload.template)
    ? payload.template
    : undefined;
  const content = payload.content ? normalizeResumeContent(payload.content) : undefined;
  const serialized = content ? JSON.stringify(content) : undefined;
  if (serialized && serialized.length > 300_000) {
    return Response.json({ error: "CV content is too large" }, { status: 413 });
  }

  const [resume] = await getDb()
    .update(resumes)
    .set({
      ...(title ? { title } : {}),
      ...(template ? { template } : {}),
      ...(serialized ? { content: serialized } : {}),
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(and(eq(resumes.id, id), eq(resumes.ownerEmail, user.email)))
    .returning();

  if (!resume) return Response.json({ error: "CV not found" }, { status: 404 });
  return Response.json({ resume: { ...resume, content: parseContent(resume.content) } });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { user, id } = await getIdentityAndId(context);
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const [deleted] = await getDb()
    .delete(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.ownerEmail, user.email)))
    .returning({ id: resumes.id });

  if (!deleted) return Response.json({ error: "CV not found" }, { status: 404 });
  return Response.json({ deleted: true });
}
