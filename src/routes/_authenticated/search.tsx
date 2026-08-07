import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search as SearchIcon, X } from "lucide-react";
import { toast } from "sonner";
import { AppLayout, Avatar } from "@/components/social/AppLayout";
import { PostCard } from "@/components/social/PostCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { socialQuery, searchAll, toggleFollow } from "@/lib/social";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/search")({
  head: () => ({
    meta: [
      { title: "ค้นหา — Pulse" },
      { name: "description", content: "ค้นหาผู้คนและโพสต์บน Pulse ได้ทันที" },
      { property: "og:title", content: "ค้นหา — Pulse" },
      { property: "og:description", content: "ค้นหาผู้คนและโพสต์บน Pulse" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data } = useQuery(socialQuery());
  const [term, setTerm] = useState("");

  if (!data || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        กำลังโหลด...
      </div>
    );
  }

  const me = data.profiles.find((p) => p.id === user.id);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["social"] });
  const { people, posts } = searchAll(data, term);
  const trending = [...new Set(data.posts.flatMap((p) => p.content.match(/#[^\s#]+/g) ?? []))].slice(
    0,
    6,
  );

  const follow = async (targetId: string, isFollowing: boolean) => {
    await toggleFollow(targetId, user.id, isFollowing);
    toast.success(isFollowing ? "เลิกติดตามแล้ว" : "ติดตามแล้ว");
    refresh();
  };

  return (
    <AppLayout title="ค้นหา" username={me?.username}>
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="ค้นหาผู้คนหรือโพสต์"
            className="h-11 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
          {term ? (
            <button type="button" onClick={() => setTerm("")} aria-label="ล้างคำค้นหา">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : null}
        </div>
      </div>

      {!term.trim() ? (
        <div className="p-4">
          <h2 className="text-lg font-bold text-foreground">แนะนำสำหรับคุณ</h2>
          {trending.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {trending.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTerm(t)}
                  className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:bg-surface-hover"
                >
                  {t}
                </button>
              ))}
            </div>
          ) : null}
          <ul className="mt-5 space-y-3">
            {data.profiles
              .filter((p) => p.id !== user.id)
              .slice(0, 5)
              .map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <Avatar seed={p.display_name || p.username} size="h-10 w-10" />
                  <Link
                    to="/u/$username"
                    params={{ username: p.username }}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate font-semibold text-foreground">
                      {p.display_name || p.username}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">@{p.username}</p>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ) : (
        <Tabs defaultValue="people" className="w-full">
          <TabsList className="m-4">
            <TabsTrigger value="people">ผู้คน ({people.length})</TabsTrigger>
            <TabsTrigger value="posts">โพสต์ ({posts.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="people">
            {people.length === 0 ? (
              <p className="p-8 text-center text-muted-foreground">ไม่พบผู้ใช้ที่ตรงกับ “{term}”</p>
            ) : (
              people.map((p) => {
                const isFollowing = data.follows.some(
                  (f) => f.follower_id === user.id && f.following_id === p.id,
                );
                return (
                  <div key={p.id} className="flex items-center gap-3 border-b border-border p-4">
                    <Avatar seed={p.display_name || p.username} />
                    <Link
                      to="/u/$username"
                      params={{ username: p.username }}
                      className="min-w-0 flex-1"
                    >
                      <p className="truncate font-semibold text-foreground">
                        {p.display_name || p.username}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">@{p.username}</p>
                      {p.bio ? (
                        <p className="truncate text-sm text-muted-foreground">{p.bio}</p>
                      ) : null}
                    </Link>
                    {p.id !== user.id ? (
                      <Button
                        size="sm"
                        variant={isFollowing ? "secondary" : "default"}
                        className="rounded-full px-4 font-semibold"
                        onClick={() => follow(p.id, isFollowing)}
                      >
                        {isFollowing ? "กำลังติดตาม" : "ติดตาม"}
                      </Button>
                    ) : null}
                  </div>
                );
              })
            )}
          </TabsContent>
          <TabsContent value="posts">
            {posts.length === 0 ? (
              <p className="p-8 text-center text-muted-foreground">ไม่พบโพสต์ที่ตรงกับ “{term}”</p>
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
          </TabsContent>
        </Tabs>
      )}
    </AppLayout>
  );
}