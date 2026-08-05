import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { AppLayout, Avatar } from "@/components/social/AppLayout";
import { Composer } from "@/components/social/Composer";
import { PostCard } from "@/components/social/PostCard";
import { Button } from "@/components/ui/button";
import { socialQuery, toggleFollow } from "@/lib/social";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({
    meta: [
      { title: "ฟีด — Pulse" },
      { name: "description", content: "ดูโพสต์ล่าสุดจากคนที่คุณติดตามบน Pulse" },
      { property: "og:title", content: "ฟีด — Pulse" },
      { property: "og:description", content: "ฟีดเรียลไทม์และบทสนทนาบน Pulse" },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(socialQuery());

  if (isLoading || !data || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        กำลังโหลดฟีด...
      </div>
    );
  }

  const me = data.profiles.find((p) => p.id === user.id);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["social"] });
  const timeline = data.posts.filter((p) => !p.parent_id);
  const suggestions = data.profiles
    .filter(
      (p) =>
        p.id !== user.id &&
        !data.follows.some((f) => f.follower_id === user.id && f.following_id === p.id),
    )
    .slice(0, 4);

  const follow = async (targetId: string) => {
    try {
      await toggleFollow(targetId, user.id, false);
      toast.success("ติดตามแล้ว");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ติดตามไม่สำเร็จ");
    }
  };

  const aside = (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Sparkles className="h-4 w-4 text-primary" /> น่าติดตาม
      </h2>
      <ul className="mt-3 space-y-3">
        {suggestions.length === 0 ? (
          <li className="text-sm text-muted-foreground">ยังไม่มีคนแนะนำตอนนี้</li>
        ) : (
          suggestions.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              <Avatar seed={p.display_name || p.username} size="h-9 w-9" />
              <div className="min-w-0 flex-1">
                <Link
                  to="/u/$username"
                  params={{ username: p.username }}
                  className="block truncate text-sm font-semibold text-foreground hover:underline"
                >
                  {p.display_name || p.username}
                </Link>
                <p className="truncate text-xs text-muted-foreground">@{p.username}</p>
              </div>
              <Button size="sm" className="rounded-full" onClick={() => follow(p.id)}>
                ติดตาม
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );

  return (
    <AppLayout title="หน้าแรก" username={me?.username} aside={aside}>
      <Composer
        currentUserId={user.id}
        seed={me?.display_name ?? me?.username ?? "?"}
        onPosted={refresh}
      />
      {timeline.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">
          ยังไม่มีโพสต์ ลองเขียนโพสต์แรกของคุณดูสิ
        </p>
      ) : (
        timeline.map((post) => (
          <PostCard
            key={post.id}
            postId={post.id}
            data={data}
            currentUserId={user.id}
            onChanged={refresh}
          />
        ))
      )}

    </AppLayout>
  );
}