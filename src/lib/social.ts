import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
};

export type RawPost = {
  id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  repost_of: string | null;
  created_at: string;
};

export type SocialData = {
  posts: RawPost[];
  profiles: Profile[];
  likes: { post_id: string; user_id: string }[];
  follows: { follower_id: string; following_id: string }[];
};

export async function fetchSocial(): Promise<SocialData> {
  const [posts, profiles, likes, follows] = await Promise.all([
    supabase
      .from("posts")
      .select("id,author_id,content,parent_id,repost_of,created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("profiles").select("id,username,display_name,bio,avatar_url,created_at"),
    supabase.from("likes").select("post_id,user_id"),
    supabase.from("follows").select("follower_id,following_id"),
  ]);

  const error = posts.error || profiles.error || likes.error || follows.error;
  if (error) throw new Error(error.message);

  return {
    posts: posts.data ?? [],
    profiles: profiles.data ?? [],
    likes: likes.data ?? [],
    follows: follows.data ?? [],
  };
}

export const socialQuery = () =>
  queryOptions({ queryKey: ["social"], queryFn: fetchSocial, staleTime: 5_000 });

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
  const { error } = await supabase.from("posts").insert({
    author_id: input.authorId,
    content: input.content.slice(0, 280),
    parent_id: input.parentId ?? null,
    repost_of: input.repostOf ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function toggleLike(postId: string, userId: string, liked: boolean) {
  const { error } = liked
    ? await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId)
    : await supabase.from("likes").insert({ post_id: postId, user_id: userId });
  if (error) throw new Error(error.message);
}

export async function toggleFollow(targetId: string, userId: string, following: boolean) {
  const { error } = following
    ? await supabase
        .from("follows")
        .delete()
        .eq("follower_id", userId)
        .eq("following_id", targetId)
    : await supabase.from("follows").insert({ follower_id: userId, following_id: targetId });
  if (error) throw new Error(error.message);
}