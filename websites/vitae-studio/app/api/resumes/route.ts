import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { resumes } from "@/db/schema";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  createEmptyResumeContent,
  normalizeResumeContent,
  type ResumeTemplate,
} from "@/lib/resume-types";

const templates: ResumeTemplate[] = ["classic", "modern", "executive"];

function parseContent(value: string) {
  try {
    return normalizeResumeContent(JSON.parse(value));
  } catch {
    return normalizeResumeContent(null);
  }
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const rows = await getDb()
    .select()
    .from(resumes)
    .where(eq(resumes.ownerEmail, user.email))
    .orderBy(desc(resumes.updatedAt));

  return Response.json({
    resumes: rows.map((row) => ({ ...row, content: parseContent(row.content) })),
  });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  let payload: { title?: string; template?: ResumeTemplate };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const title = payload.title?.trim().slice(0, 80) || "My CV";
  const template = templates.includes(payload.template ?? "classic")
    ? payload.template ?? "classic"
    : "classic";
  const id = crypto.randomUUID();
  const content = createEmptyResumeContent(user.fullName ?? "", user.email);
  const [resume] = await getDb()
    .insert(resumes)
    .values({ id, ownerEmail: user.email, title, template, content: JSON.stringify(content) })
    .returning();

  return Response.json(
    { resume: { ...resume, content: parseContent(resume.content) } },
    { status: 201 },
  );
}
