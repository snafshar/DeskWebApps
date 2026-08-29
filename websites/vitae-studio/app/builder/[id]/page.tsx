import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { ResumeBuilder } from "./resume-builder";

export const dynamic = "force-dynamic";

type BuilderPageProps = { params: Promise<{ id: string }> };

export default async function BuilderPage({ params }: BuilderPageProps) {
  const { id } = await params;
  const user = await requireChatGPTUser(`/builder/${id}`);
  return (
    <ResumeBuilder
      resumeId={id}
      user={{ displayName: user.displayName, email: user.email }}
      signOutHref={chatGPTSignOutPath("/")}
    />
  );
}
