import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Bell, Heart, MessageCircle, Repeat2, UserPlus } from "lucide-react";
import { AppLayout, Avatar } from "@/components/social/AppLayout";
import { Button } from "@/components/ui/button";
import {
  socialQuery,
  timeAgo,
  markNotificationsRead,
  clearNotifications,
  type Notification,
} from "@/lib/social";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "การแจ้งเตือน — Pulse" },
      { name: "description", content: "ดูการถูกใจ ติดตาม ตอบกลับ และรีโพสต์ล่าสุดของคุณ" },
      { property: "og:title", content: "การแจ้งเตือน — Pulse" },
      { property: "og:description", content: "กิจกรรมล่าสุดเกี่ยวกับบัญชีของคุณบน Pulse" },
    ],
  }),
  component: NotificationsPage,
});

const META: Record<Notification["type"], { icon: typeof Heart; text: string; color: string }> = {
  like: { icon: Heart, text: "ถูกใจโพสต์ของคุณ", color: "text-destructive" },
  follow: { icon: UserPlus, text: "เริ่มติดตามคุณ", color: "text-primary" },
  reply: { icon: MessageCircle, text: "ตอบกลับโพสต์ของคุณ", color: "text-primary" },
  repost: { icon: Repeat2, text: "รีโพสต์โพสต์ของคุณ", color: "text-success" },
};

function NotificationsPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data } = useQuery(socialQuery());
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["social"] });

  useEffect(() => {
    if (!user) return;
    const t = setTimeout(() => {
      markNotificationsRead(user.id);
      queryClient.invalidateQueries({ queryKey: ["social"] });
    }, 1200);
    return () => clearTimeout(t);
  }, [user, queryClient]);

  if (!data || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        กำลังโหลด...
      </div>
    );
  }

  const me = data.profiles.find((p) => p.id === user.id);
  const items = data.notifications.filter((n) => n.user_id === user.id);

  return (
    <AppLayout title="การแจ้งเตือน" username={me?.username}>
      <div className="flex items-center justify-between border-b border-border p-3">
        <p className="text-sm text-muted-foreground">ทั้งหมด {items.length} รายการ</p>
        <Button
          variant="ghost"
          size="sm"
          disabled={items.length === 0}
          onClick={() => {
            clearNotifications(user.id);
            refresh();
          }}
        >
          ล้างทั้งหมด
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 p-12 text-center text-muted-foreground">
          <Bell className="h-10 w-10" />
          ยังไม่มีการแจ้งเตือน
        </div>
      ) : (
        items.map((n) => {
          const actor = data.profiles.find((p) => p.id === n.actor_id);
          const { icon: Icon, text, color } = META[n.type];
          const post = n.post_id ? data.posts.find((p) => p.id === n.post_id) : null;
          const body = (
            <div className="flex gap-3">
              <Icon className={`mt-1 h-5 w-5 shrink-0 ${color}`} />
              <Avatar seed={actor?.display_name || actor?.username || "?"} size="h-9 w-9" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">
                  <span className="font-bold">{actor?.display_name || actor?.username}</span> {text}
                  <span className="text-muted-foreground"> · {timeAgo(n.created_at)}</span>
                </p>
                {post ? (
                  <p className="mt-1 truncate text-sm text-muted-foreground">{post.content}</p>
                ) : null}
              </div>
              {!n.read ? <span className="mt-2 h-2 w-2 rounded-full bg-primary" /> : null}
            </div>
          );
          return (
            <div
              key={n.id}
              className={`border-b border-border p-4 transition-colors hover:bg-surface-hover ${
                n.read ? "" : "bg-surface-hover"
              }`}
            >
              {post ? (
                <Link to="/post/$postId" params={{ postId: post.id }}>
                  {body}
                </Link>
              ) : actor ? (
                <Link to="/u/$username" params={{ username: actor.username }}>
                  {body}
                </Link>
              ) : (
                body
              )}
            </div>
          );
        })
      )}
    </AppLayout>
  );
}