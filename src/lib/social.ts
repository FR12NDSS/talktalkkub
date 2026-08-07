import { queryOptions } from "@tanstack/react-query";
import {
  getDb,
  update,
  uid,
  delay,
  DEFAULT_SETTINGS,
  type MockProfile,
  type MockPost,
  type MockMessage,
  type MockNotification,
  type MockSettings,
} from "@/lib/mock-db";

export type Profile = MockProfile;
export type RawPost = MockPost;
export type Message = MockMessage;
export type Notification = MockNotification;
export type Settings = MockSettings;

export type SocialData = {
  posts: RawPost[];
  profiles: Profile[];
  likes: { post_id: string; user_id: string }[];
  follows: { follower_id: string; following_id: string }[];
  messages: Message[];
  notifications: Notification[];
  settings: Settings;
};

export async function fetchSocial(): Promise<SocialData> {
  const db = getDb();
  return {
    posts: [...db.posts].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    profiles: db.profiles,
    likes: db.likes,
    follows: db.follows,
    messages: [...db.messages].sort((a, b) => a.created_at.localeCompare(b.created_at)),
    notifications: [...db.notifications].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    settings: { ...DEFAULT_SETTINGS, ...db.settings },
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
    const target = input.parentId ?? input.repostOf ?? null;
    if (target) {
      const owner = db.posts.find((p) => p.id === target)?.author_id;
      if (owner && owner !== input.authorId) {
        db.notifications.push({
          id: uid("n"),
          user_id: owner,
          actor_id: input.authorId,
          type: input.parentId ? "reply" : "repost",
          post_id: target,
          created_at: new Date().toISOString(),
          read: false,
        });
      }
    }
  });
}

export async function toggleLike(postId: string, userId: string, liked: boolean) {
  update((db) => {
    db.likes = liked
      ? db.likes.filter((l) => !(l.post_id === postId && l.user_id === userId))
      : [...db.likes, { post_id: postId, user_id: userId }];
    const owner = db.posts.find((p) => p.id === postId)?.author_id;
    if (!liked && owner && owner !== userId) {
      db.notifications.push({
        id: uid("n"),
        user_id: owner,
        actor_id: userId,
        type: "like",
        post_id: postId,
        created_at: new Date().toISOString(),
        read: false,
      });
    }
  });
}

export async function toggleFollow(targetId: string, userId: string, following: boolean) {
  update((db) => {
    db.follows = following
      ? db.follows.filter((f) => !(f.follower_id === userId && f.following_id === targetId))
      : [...db.follows, { follower_id: userId, following_id: targetId }];
    if (!following && targetId !== userId) {
      db.notifications.push({
        id: uid("n"),
        user_id: targetId,
        actor_id: userId,
        type: "follow",
        post_id: null,
        created_at: new Date().toISOString(),
        read: false,
      });
    }
  });
}

/* ---------- แชท ---------- */

export async function sendMessage(fromId: string, toId: string, text: string) {
  const body = text.trim().slice(0, 500);
  if (!body) return;
  update((db) => {
    db.messages.push({
      id: uid("m"),
      from_id: fromId,
      to_id: toId,
      text: body,
      created_at: new Date().toISOString(),
      read: false,
    });
  });
}

export function markConversationRead(userId: string, otherId: string) {
  update((db) => {
    db.messages.forEach((m) => {
      if (m.to_id === userId && m.from_id === otherId) m.read = true;
    });
  });
}

export function conversationsOf(data: SocialData, userId: string) {
  const map = new Map<string, { otherId: string; last: Message; unread: number }>();
  for (const m of data.messages) {
    if (m.from_id !== userId && m.to_id !== userId) continue;
    const otherId = m.from_id === userId ? m.to_id : m.from_id;
    const entry = map.get(otherId);
    const unread = (entry?.unread ?? 0) + (m.to_id === userId && !m.read ? 1 : 0);
    map.set(otherId, { otherId, last: m, unread });
  }
  return [...map.values()].sort((a, b) => b.last.created_at.localeCompare(a.last.created_at));
}

export const unreadMessageCount = (data: SocialData, userId: string) =>
  data.messages.filter((m) => m.to_id === userId && !m.read).length;

/* ---------- การแจ้งเตือน ---------- */

export const unreadNotificationCount = (data: SocialData, userId: string) =>
  data.notifications.filter((n) => n.user_id === userId && !n.read).length;

export function markNotificationsRead(userId: string) {
  update((db) => {
    db.notifications.forEach((n) => {
      if (n.user_id === userId) n.read = true;
    });
  });
}

export function clearNotifications(userId: string) {
  update((db) => {
    db.notifications = db.notifications.filter((n) => n.user_id !== userId);
  });
}

/* ---------- โปรไฟล์ & การตั้งค่า ---------- */

export async function updateProfile(
  userId: string,
  patch: { display_name?: string; bio?: string; username?: string },
) {
  await delay(150);
  const db = getDb();
  if (patch.username) {
    const taken = db.profiles.some(
      (p) => p.id !== userId && p.username.toLowerCase() === patch.username!.trim().toLowerCase(),
    );
    if (taken) throw new Error("ชื่อผู้ใช้นี้ถูกใช้แล้ว");
  }
  update((d) => {
    const profile = d.profiles.find((p) => p.id === userId);
    if (!profile) return;
    if (patch.display_name !== undefined) profile.display_name = patch.display_name.trim();
    if (patch.bio !== undefined) profile.bio = patch.bio;
    if (patch.username) profile.username = patch.username.trim();
  });
}

export function updateSettings(patch: Partial<Settings>) {
  update((db) => {
    db.settings = { ...DEFAULT_SETTINGS, ...db.settings, ...patch };
  });
}

export function searchAll(data: SocialData, term: string) {
  const q = term.trim().toLowerCase();
  if (!q) return { people: [] as Profile[], posts: [] as RawPost[] };
  return {
    people: data.profiles.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        p.display_name.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q),
    ),
    posts: data.posts.filter((p) => p.content.toLowerCase().includes(q) && !p.repost_of),
  };
}
