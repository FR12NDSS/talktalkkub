import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/social/AppLayout";
import { Composer } from "@/components/social/Composer";
import { PostCard } from "@/components/social/PostCard";
import { socialQuery } from "@/lib/social";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/post/$postId")({
  head: () => ({
    meta: [
      { title: "โพสต์ — Pulse" },
      { name: "description", content: "อ่านโพสต์และความคิดเห็นทั้งหมดบน Pulse" },
      { property: "og:title", content: "โพสต์ — Pulse" },
      { property: "og:description", content: "อ่านโพสต์และความคิดเห็นบน Pulse" },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { postId } = Route.useParams();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(socialQuery());

  if (isLoading || !data || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        กำลังโหลด...
      </div>
    );
  }

  const me = data.profiles.find((p) => p.id === user.id);
  const post = data.posts.find((p) => p.id === postId);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["social"] });
  const replies = data.posts.filter((p) => p.parent_id === postId);

  return (
    <AppLayout title="โพสต์" username={me?.username}>
      <div className="border-b border-border px-4 py-3">
        <Link to="/feed" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> กลับไปที่ฟีด
        </Link>
      </div>
      {!post ? (
        <p className="p-8 text-center text-muted-foreground">ไม่พบโพสต์นี้</p>
      ) : (
        <>
          <PostCard
            postId={post.id}
            data={data}
            currentUserId={user.id}
            onChanged={refresh}
            highlight
          />
          <Composer
            currentUserId={user.id}
            seed={me?.display_name ?? me?.username ?? "?"}
            parentId={post.id}
            placeholder="เขียนความคิดเห็นของคุณ"
            submitLabel="ตอบกลับ"
            onPosted={refresh}
          />
          {replies.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">ยังไม่มีความคิดเห็น</p>
          ) : (
            replies.map((r) => (
              <PostCard
                key={r.id}
                postId={r.id}
                data={data}
                currentUserId={user.id}
                onChanged={refresh}
              />
            ))
          )}
        </>
      )}
    </AppLayout>
  );
}