import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { AppLayout, Avatar } from "@/components/social/AppLayout";
import { Button } from "@/components/ui/button";
import { socialQuery, sendMessage, markConversationRead, timeAgo } from "@/lib/social";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/messages/$username")({
  head: () => ({
    meta: [
      { title: "แชท — Pulse" },
      { name: "description", content: "ส่งข้อความส่วนตัวแบบเรียลไทม์บน Pulse" },
      { property: "og:title", content: "แชท — Pulse" },
      { property: "og:description", content: "บทสนทนาส่วนตัวบน Pulse" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { username } = Route.useParams();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data } = useQuery(socialQuery());
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const other = data?.profiles.find((p) => p.username === username);

  useEffect(() => {
    if (user && other) {
      markConversationRead(user.id, other.id);
      queryClient.invalidateQueries({ queryKey: ["social"] });
    }
  }, [user?.id, other?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

  if (!data || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        กำลังโหลด...
      </div>
    );
  }

  const me = data.profiles.find((p) => p.id === user.id);

  if (!other) {
    return (
      <AppLayout title="แชท" username={me?.username}>
        <p className="p-8 text-center text-muted-foreground">ไม่พบผู้ใช้ @{username}</p>
      </AppLayout>
    );
  }

  const thread = data.messages.filter(
    (m) =>
      (m.from_id === user.id && m.to_id === other.id) ||
      (m.from_id === other.id && m.to_id === user.id),
  );

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await sendMessage(user.id, other.id, text);
    queryClient.invalidateQueries({ queryKey: ["social"] });
  };

  return (
    <AppLayout title={other.display_name || other.username} username={me?.username}>
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Link to="/messages" aria-label="กลับไปกล่องข้อความ" className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Link
          to="/u/$username"
          params={{ username: other.username }}
          className="flex min-w-0 items-center gap-3"
        >
          <Avatar seed={other.display_name || other.username} size="h-10 w-10" />
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground">
              {other.display_name || other.username}
            </p>
            <p className="truncate text-sm text-muted-foreground">@{other.username}</p>
          </div>
        </Link>
      </div>

      <div className="flex flex-col gap-2 p-4">
        {thread.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">
            ยังไม่มีข้อความ ทักทายกันก่อนเลย 👋
          </p>
        ) : (
          thread.map((m) => {
            const mine = m.from_id === user.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-[15px] ${
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className="mt-1 text-right text-[11px] opacity-70">{timeAgo(m.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-16 flex items-end gap-2 border-t border-border bg-background/95 p-3 backdrop-blur md:bottom-0">
        <textarea
          value={draft}
          rows={1}
          maxLength={500}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="พิมพ์ข้อความ..."
          className="max-h-32 flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-2.5 text-foreground outline-none placeholder:text-muted-foreground"
        />
        <Button
          onClick={send}
          disabled={!draft.trim()}
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          aria-label="ส่งข้อความ"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </AppLayout>
  );
}