import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { AppLayout, Avatar } from "@/components/social/AppLayout";
import { socialQuery, conversationsOf, timeAgo } from "@/lib/social";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({
    meta: [
      { title: "ข้อความ — Pulse" },
      { name: "description", content: "แชทส่วนตัวกับเพื่อนและคนที่คุณติดตามบน Pulse" },
      { property: "og:title", content: "ข้อความ — Pulse" },
      { property: "og:description", content: "กล่องข้อความส่วนตัวบน Pulse" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user } = useSession();
  const { data } = useQuery(socialQuery());

  if (!data || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        กำลังโหลด...
      </div>
    );
  }

  const me = data.profiles.find((p) => p.id === user.id);
  const conversations = conversationsOf(data, user.id);
  const others = data.profiles.filter(
    (p) => p.id !== user.id && !conversations.some((c) => c.otherId === p.id),
  );

  return (
    <AppLayout title="ข้อความ" username={me?.username}>
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 p-12 text-center text-muted-foreground">
          <Mail className="h-10 w-10" />
          ยังไม่มีบทสนทนา เริ่มแชทกับใครสักคนด้านล่าง
        </div>
      ) : (
        conversations.map((c) => {
          const other = data.profiles.find((p) => p.id === c.otherId);
          if (!other) return null;
          return (
            <Link
              key={c.otherId}
              to="/messages/$username"
              params={{ username: other.username }}
              className="flex items-center gap-3 border-b border-border p-4 transition-colors hover:bg-surface-hover"
            >
              <Avatar seed={other.display_name || other.username} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm">
                  <span className="truncate font-bold text-foreground">
                    {other.display_name || other.username}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    @{other.username} · {timeAgo(c.last.created_at)}
                  </span>
                </p>
                <p
                  className={`truncate text-sm ${
                    c.unread ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {c.last.from_id === user.id ? "คุณ: " : ""}
                  {c.last.text}
                </p>
              </div>
              {c.unread ? (
                <span className="min-w-6 rounded-full bg-primary px-2 py-0.5 text-center text-xs font-bold text-primary-foreground">
                  {c.unread}
                </span>
              ) : null}
            </Link>
          );
        })
      )}

      {others.length ? (
        <section className="p-4">
          <h2 className="text-sm font-bold text-muted-foreground">เริ่มแชทใหม่</h2>
          <ul className="mt-3 space-y-3">
            {others.map((p) => (
              <li key={p.id}>
                <Link
                  to="/messages/$username"
                  params={{ username: p.username }}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-hover"
                >
                  <Avatar seed={p.display_name || p.username} size="h-9 w-9" />
                  <span className="truncate text-sm text-foreground">
                    {p.display_name || p.username}{" "}
                    <span className="text-muted-foreground">@{p.username}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AppLayout>
  );
}