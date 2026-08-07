// ชั้นข้อมูลจำลอง (mock) สำหรับทดลองใช้งานสมัครสมาชิก/เข้าสู่ระบบ/ฟีด
// เก็บข้อมูลไว้ใน localStorage ของเบราว์เซอร์ ไม่แตะฐานข้อมูลจริง
export type MockProfile = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
};

export type MockPost = {
  id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  repost_of: string | null;
  created_at: string;
};

export type MockAccount = { id: string; email: string; password: string; verified: boolean };

export type MockMessage = {
  id: string;
  from_id: string;
  to_id: string;
  text: string;
  created_at: string;
  read: boolean;
};

export type MockNotification = {
  id: string;
  user_id: string;
  actor_id: string;
  type: "like" | "follow" | "reply" | "repost";
  post_id: string | null;
  created_at: string;
  read: boolean;
};

export type MockSettings = {
  theme: "dark" | "light";
  language: "th" | "en";
  privateAccount: boolean;
  notifyLikes: boolean;
  notifyFollows: boolean;
  notifyReplies: boolean;
  notifyMessages: boolean;
};

export const DEFAULT_SETTINGS: MockSettings = {
  theme: "dark",
  language: "th",
  privateAccount: false,
  notifyLikes: true,
  notifyFollows: true,
  notifyReplies: true,
  notifyMessages: true,
};

export type MockDb = {
  accounts: MockAccount[];
  profiles: MockProfile[];
  posts: MockPost[];
  likes: { post_id: string; user_id: string }[];
  follows: { follower_id: string; following_id: string }[];
  messages: MockMessage[];
  notifications: MockNotification[];
  settings: MockSettings;
  sessionUserId: string | null;
};

const KEY = "pulse-mock-db-v2";
export const DEMO_EMAIL = "demo@pulse.app";
export const DEMO_PASSWORD = "Demo@1234";
export const DEMO_OTP = "123456";

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

function seed(): MockDb {
  const profiles: MockProfile[] = [
    {
      id: "u-demo",
      username: "demo",
      display_name: "คุณเดโม่",
      bio: "บัญชีทดลองใช้งาน Pulse",
      avatar_url: null,
      created_at: ago(60 * 24 * 30),
    },
    {
      id: "u-nara",
      username: "nara_dev",
      display_name: "นารา",
      bio: "นักพัฒนาเว็บ ชอบ TypeScript",
      avatar_url: null,
      created_at: ago(60 * 24 * 90),
    },
    {
      id: "u-ploy",
      username: "ployjung",
      display_name: "พลอย",
      bio: "คนรักกาแฟและการเดินทาง",
      avatar_url: null,
      created_at: ago(60 * 24 * 120),
    },
    {
      id: "u-thana",
      username: "thana_x",
      display_name: "ธนา",
      bio: "ข่าวเทคโนโลยีรายวัน",
      avatar_url: null,
      created_at: ago(60 * 24 * 200),
    },
  ];

  const posts: MockPost[] = [
    {
      id: "p1",
      author_id: "u-nara",
      content: "เพิ่งย้ายโปรเจกต์มาใช้ TanStack Start เร็วขึ้นเยอะมาก 🚀",
      parent_id: null,
      repost_of: null,
      created_at: ago(12),
    },
    {
      id: "p2",
      author_id: "u-ploy",
      content: "เช้านี้กาแฟดริปหอมมาก ใครแนะนำเมล็ดดี ๆ บ้าง ☕️",
      parent_id: null,
      repost_of: null,
      created_at: ago(48),
    },
    {
      id: "p3",
      author_id: "u-thana",
      content: "สรุปข่าวเทค: AI ผู้ช่วยเขียนโค้ดกำลังเปลี่ยนวิธีทำงานของทีมเล็ก ๆ",
      parent_id: null,
      repost_of: null,
      created_at: ago(150),
    },
    {
      id: "p4",
      author_id: "u-demo",
      content: "สวัสดีทุกคน นี่คือโพสต์แรกของฉันบน Pulse 👋",
      parent_id: null,
      repost_of: null,
      created_at: ago(320),
    },
    {
      id: "p5",
      author_id: "u-ploy",
      content: "เห็นด้วยเลย ตอนนี้ทำงานไวขึ้นมาก",
      parent_id: "p3",
      repost_of: null,
      created_at: ago(100),
    },
  ];

  return {
    accounts: [{ id: "u-demo", email: DEMO_EMAIL, password: DEMO_PASSWORD, verified: true }],
    profiles,
    posts,
    likes: [
      { post_id: "p1", user_id: "u-ploy" },
      { post_id: "p1", user_id: "u-thana" },
      { post_id: "p3", user_id: "u-demo" },
    ],
    follows: [
      { follower_id: "u-demo", following_id: "u-nara" },
      { follower_id: "u-ploy", following_id: "u-nara" },
    ],
    messages: [
      { id: "m1", from_id: "u-nara", to_id: "u-demo", text: "สวัสดีครับ ยินดีที่ได้รู้จัก!", created_at: ago(180), read: false },
      { id: "m2", from_id: "u-demo", to_id: "u-nara", text: "สวัสดีครับ ผมเพิ่งสมัครเลย", created_at: ago(170), read: true },
      { id: "m3", from_id: "u-nara", to_id: "u-demo", text: "ลองโพสต์แรกดูสิ สนุกมาก", created_at: ago(30), read: false },
      { id: "m4", from_id: "u-ploy", to_id: "u-demo", text: "แนะนำร้านกาแฟแถวนี้หน่อยได้ไหม ☕️", created_at: ago(90), read: false },
    ],
    notifications: [
      { id: "n1", user_id: "u-demo", actor_id: "u-ploy", type: "like", post_id: "p4", created_at: ago(20), read: false },
      { id: "n2", user_id: "u-demo", actor_id: "u-nara", type: "follow", post_id: null, created_at: ago(120), read: false },
      { id: "n3", user_id: "u-demo", actor_id: "u-thana", type: "reply", post_id: "p4", created_at: ago(240), read: true },
    ],
    settings: { ...DEFAULT_SETTINGS },
    sessionUserId: null,
  };
}

let memory: MockDb | null = null;

export function getDb(): MockDb {
  if (typeof window === "undefined") return memory ?? (memory = seed());
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MockDb;
      parsed.messages ??= [];
      parsed.notifications ??= [];
      parsed.settings = { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) };
      return parsed;
    }
  } catch {
    /* ignore */
  }
  const fresh = seed();
  saveDb(fresh);
  return fresh;
}

export function saveDb(db: MockDb) {
  memory = db;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(db));
    window.dispatchEvent(new Event("mock-db-change"));
  }
}

export function update(fn: (db: MockDb) => void) {
  const db = getDb();
  fn(db);
  saveDb(db);
  return db;
}

export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/* ---------- Auth จำลอง ---------- */

export function currentUserId() {
  return getDb().sessionUserId;
}

export async function mockSignIn(email: string, password: string) {
  await delay();
  const db = getDb();
  const account = db.accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!account || account.password !== password) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  db.sessionUserId = account.id;
  saveDb(db);
  return { error: null };
}

export async function mockSignOut() {
  update((db) => {
    db.sessionUserId = null;
  });
}

export async function mockEmailAvailable(email: string) {
  await delay(200);
  return !getDb().accounts.some((a) => a.email.toLowerCase() === email.trim().toLowerCase());
}

export async function mockUsernameAvailable(username: string) {
  await delay(200);
  return !getDb().profiles.some((p) => p.username.toLowerCase() === username.trim().toLowerCase());
}

export async function mockSignUp(input: {
  email: string;
  password: string;
  username: string;
  displayName: string;
  bio: string;
}) {
  await delay();
  const id = uid("u");
  update((db) => {
    db.accounts.push({ id, email: input.email.trim(), password: input.password, verified: false });
    db.profiles.push({
      id,
      username: input.username.trim(),
      display_name: input.displayName.trim() || input.username.trim(),
      bio: input.bio,
      avatar_url: null,
      created_at: new Date().toISOString(),
    });
  });
  return { userId: id, code: DEMO_OTP };
}

export async function mockVerifyOtp(email: string, code: string) {
  await delay();
  if (code !== DEMO_OTP) return { error: "รหัสยืนยันไม่ถูกต้อง" };
  const db = getDb();
  const account = db.accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!account) return { error: "ไม่พบบัญชีนี้" };
  account.verified = true;
  db.sessionUserId = account.id;
  saveDb(db);
  return { error: null };
}
