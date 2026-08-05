import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { AppLayout, Avatar } from "@/components/social/AppLayout";
import { PostCard } from "@/components/social/PostCard";
import { Button } from "@/components/ui/button";
import { socialQuery, toggleFollow } from "@/lib/social";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/u/$username")({
  head: () => ({
    meta: [
      { title: "โปรไฟล์ — Pulse" },
      { name: "description", content: "ดูโปรไฟล์ โพสต์ และผู้ติดตามบน Pulse" },
      { property: "og:title", content: "โปรไฟล์ — Pulse" },
      { property: "og:description", content: "ดูโปรไฟล์และโพสต์ทั้งหมดบน Pulse" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { username } = Route.useParams();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(socialQuery());

  if (isLoading || !data || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        กำลังโหลดโปรไฟล์...
      </div>
    );
  }

  const me = data.profiles.find((p) => p.id === user.id);
  const profile = data.profiles.find((p) => p.username === username);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["social"] });

  if (!profile) {
    return (
      <AppLayout title="โปรไฟล์" username={me?.username}>
        <p className="p-8 text-center text-muted-foreground">ไม่พบผู้ใช้ @{username}</p>
      </AppLayout>
    );
  }

  const posts = data.posts.filter((p) => p.author_id === profile.id && !p.parent_id);
  const followers = data.follows.filter((f) => f.following_id === profile.id).length;
  const following = data.follows.filter((f) => f.follower_id === profile.id).length;
  const isFollowing = data.follows.some(
    (f) => f.follower_id === user.id && f.following_id === profile.id,
  );
  const isMe = profile.id === user.id;

  const handleFollow = async () => {
    try {
      await toggleFollow(profile.id, user.id, isFollowing);
      toast.success(isFollowing ? "เลิกติดตามแล้ว" : "ติดตามแล้ว");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ดำเนินการไม่สำเร็จ");
    }
  };

  return (
    <AppLayout title={profile.display_name || profile.username} username={me?.username}>
      <section className="border-b border-border p-4">
        <div className="flex items-start justify-between gap-4">
          <Avatar seed={profile.display_name || profile.username} size="h-20 w-20" />
          {!isMe && (
            <Button
              onClick={handleFollow}
              variant={isFollowing ? "secondary" : "default"}
              className="rounded-full px-6 font-semibold"
            >
              {isFollowing ? "กำลังติดตาม" : "ติดตาม"}
            </Button>
          )}
        </div>
        <h2 className="mt-4 text-2xl font-bold text-foreground">
          {profile.display_name || profile.username}
        </h2>
        <p className="text-muted-foreground">@{profile.username}</p>
        {profile.bio ? <p className="mt-3 text-foreground">{profile.bio}</p> : null}
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          เข้าร่วมเมื่อ {new Date(profile.created_at).toLocaleDateString("th-TH")}
        </p>
        <div className="mt-3 flex gap-5 text-sm">
          <span className="text-muted-foreground">
            <span className="font-bold text-foreground">{following}</span> กำลังติดตาม
          </span>
          <span className="text-muted-foreground">
            <span className="font-bold text-foreground">{followers}</span> ผู้ติดตาม
          </span>
        </div>
      </section>

      {posts.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">ยังไม่มีโพสต์</p>
      ) : (
        posts.map((p) => (
          <PostCard
            key={p.id}
            postId={p.id}
            data={data}
            currentUserId={user.id}
            onChanged={refresh}
          />
        ))
      )}
    </AppLayout>
  );
}