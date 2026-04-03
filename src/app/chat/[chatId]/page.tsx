import { ChatShell } from "@/components/chat/ChatShell";

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  return <ChatShell chatId={chatId} />;
}

