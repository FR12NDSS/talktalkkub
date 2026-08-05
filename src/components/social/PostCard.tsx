import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Repeat2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "./AppLayout";
import { timeAgo, toggleLike, createPost, type SocialData } from "@/lib/social";

export function PostCard({
  postId,
  data,
  currentUserId,
  onChanged,
  highlight = false,
}: {
  postId: string;
  data: SocialData;
  currentUserId: string;
  onChanged: () => void;
  highlight?: boolean;
}) {
  const post = data.posts.find((p) => p.id === postId);
  if (!post) return null;

  const author = data.profiles.find((p) => p.id === post.author_id);
  const original = post.repost_of ? data.posts.find((p) => p.id === post.repost_of) : null;
  const shown = original ?? post;
  const shownAuthor = data.profiles.find((p) => p.id === shown.author_id);

  const likes = data.likes.filter((l) => l.post_id === shown.id);
  const isLiked = likes.some((l) => l.user_id === currentUserId);
  const replies = data.posts.filter((p) => p.parent_id === shown.id).length;
  const reposts = data.posts.filter((p) => p.repost_of === shown.id);
  const isReposted = reposts.some((p) => p.author_id === currentUserId);

  const handleLike = async () => {
    try {
      await toggleLike(shown.id, currentUserId, isLiked);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ถูกใจไม่สำเร็จ");
    }
  };

  const handleRepost = async () => {
    if (isReposted) {
      toast("คุณรีโพสต์โพสต์นี้แล้ว");
      return;
    }
    try {
      await createPost({ authorId: currentUserId, content: "", repostOf: shown.id });
      toast.success("รีโพสต์แล้ว");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "รีโพสต์ไม่สำเร็จ");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${shown.id}`;
    try {
      if (navigator.share) await navigator.share({ url, title: "Pulse" });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("คัดลอกลิงก์แล้ว");
      }
    } catch {
      toast.error("แชร์ไม่สำเร็จ");
    }
  };

  return (
    <article
      className={`flex gap-3 border-b border-border p-4 transition-colors hover:bg-surface-hover ${
        highlight ? "bg-surface-hover" : ""
      }`}
    >
      <Avatar seed={shownAuthor?.display_name ?? shownAuthor?.username ?? "?"} />
      <div className="min-w-0 flex-1">
        {original ? (
          <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Repeat2 className="h-3 w-3" /> {author?.display_name ?? "ผู้ใช้"} รีโพสต์
          </p>
        ) : null}
        <p className="flex flex-wrap items-center gap-1 text-sm">
          <Link
            to="/u/$username"
            params={{ username: shownAuthor?.username ?? "" }}
            className="font-bold text-foreground hover:underline"
          >
            {shownAuthor?.display_name ?? "ผู้ใช้"}
          </Link>
          <span className="text-muted-foreground">
            @{shownAuthor?.username} · {timeAgo(shown.created_at)}
          </span>
        </p>
        <Link to="/post/$postId" params={{ postId: shown.id }} className="block">
          <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
            {shown.content}
          </p>
        </Link>
        <div className="mt-3 flex max-w-sm items-center justify-between text-muted-foreground">
          <Link
            to="/post/$postId"
            params={{ postId: shown.id }}
            className="flex items-center gap-2 text-sm hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" />
            {replies}
          </Link>
          <button
            type="button"
            onClick={handleRepost}
            className={`flex items-center gap-2 text-sm hover:text-success ${
              isReposted ? "text-success" : ""
            }`}
          >
            <Repeat2 className="h-4 w-4" />
            {reposts.length}
          </button>
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm hover:text-destructive ${
              isLiked ? "text-destructive" : ""
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            {likes.length}
          </button>
          <button type="button" onClick={handleShare} className="hover:text-primary">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}