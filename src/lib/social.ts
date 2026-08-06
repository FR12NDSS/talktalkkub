import { queryOptions } from "@tanstack/react-query";
import { getDb, update, uid, delay, type MockProfile, type MockPost } from "@/lib/mock-db";

export type Profile = MockProfile;
export type RawPost = MockPost;

export type SocialData = {
  posts: RawPost[];
  profiles: Profile[];
  likes: { post_id: string; user_id: string }[];
  follows: { follower_id: string; following_id: string }[];
};

export async function fetchSocial(): Promise<SocialData> {
  const db = getDb();
  return {
    posts: [...db.posts].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    profiles: db.profiles,
    likes: db.likes,
    follows: db.follows,
  };
}

export const socialQuery = () =>
  queryOptions({ queryKey: ["social"], queryFn: fetchSocial, staleTime: 0 });

export function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "ตอนนี้";
  if (diff < 3600) return `${Math.floor(diff / 60)}น.`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}ชม.`;
  return `${Math.floor(diff / 86400)}ว.`;
}

export async function createPost(input: {
  authorId: string;
  content: string;
  parentId?: string | null;
  repostOf?: string | null;
}) {
  await delay(150);
  update((db) => {
    db.posts.push({
      id: uid("p"),
      author_id: input.authorId,
      content: input.content.slice(0, 280),
      parent_id: input.parentId ?? null,
      repost_of: input.repostOf ?? null,
      created_at: new Date().toISOString(),
    });
  });
}

export async function toggleLike(postId: string, userId: string, liked: boolean) {
  update((db) => {
    db.likes = liked
      ? db.likes.filter((l) => !(l.post_id === postId && l.user_id === userId))
      : [...db.likes, { post_id: postId, user_id: userId }];
  });
}

export async function toggleFollow(targetId: string, userId: string, following: boolean) {
  update((db) => {
    db.follows = following
      ? db.follows.filter((f) => !(f.follower_id === userId && f.following_id === targetId))
      : [...db.follows, { follower_id: userId, following_id: targetId }];
  });
}
