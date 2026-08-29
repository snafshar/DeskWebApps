import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireChatGPTUser("/dashboard");
  return (
    <DashboardClient
      user={{ displayName: user.displayName, email: user.email }}
      signOutHref={chatGPTSignOutPath("/")}
    />
  );
}
