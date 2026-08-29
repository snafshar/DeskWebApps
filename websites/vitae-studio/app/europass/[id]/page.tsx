import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { ResumeBuilder } from "@/app/builder/[id]/resume-builder";

export const dynamic = "force-dynamic";

type EuropassPageProps = { params: Promise<{ id: string }> };

export default async function EuropassPage({ params }: EuropassPageProps) {
  const { id } = await params;
  const user = await requireChatGPTUser(`/europass/${id}`);
  return <ResumeBuilder resumeId={id} user={{ displayName: user.displayName, email: user.email }} signOutHref={chatGPTSignOutPath("/")} europassMode />;
}
