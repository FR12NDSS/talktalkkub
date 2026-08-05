import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  Bookmark,
  Heart,
  Home,
  Image as ImageIcon,
  Mail,
  MessageCircle,
  Repeat2,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { BrandMark } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ฟีด — Pulse โซเชียลสั้น กระชับ ทันเหตุการณ์" },
      {
        name: "description",
        content: "ดูโพสต์ล่าสุดจากคนที่คุณติดตามบน Pulse ฟีดเรียลไทม์ เทรนด์ และบทสนทนา",
      },
      { property: "og:title", content: "ฟีด — Pulse" },
      { property: "og:description", content: "ฟีดเรียลไทม์ เทรนด์ และบทสนทนาบน Pulse" },
    ],
  }),
  component: FeedPage,
});

type Post = {
  id: number;
  name: string;
  handle: string;
  time: string;
  body: string;
  replies: number;
  reposts: number;
  likes: number;
};

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    name: "ณิชา ว.",
    handle: "nicha_codes",
    time: "12น.",
    body: "เพิ่งย้ายโปรเจกต์มาใช้ TanStack Start ครบสัปดาห์ ความเร็วตอน build ต่างกันจนต้องกลับไปเช็กสองรอบ 😅",
    replies: 24,
    reposts: 58,
    likes: 412,
  },
  {
    id: 2,
    name: "กิตติ ธนโชติ",
    handle: "kitti",
    time: "1ชม.",
    body: "เคล็ดลับเล็ก ๆ: ก่อนออกแบบหน้า onboarding ให้เขียนคำถามที่จำเป็นจริง ๆ ลงกระดาษก่อน ส่วนใหญ่จะเหลือไม่เกิน 6 ข้อ",
    replies: 8,
    reposts: 31,
    likes: 187,
  },
  {
    id: 3,
    name: "Pulse Design",
    handle: "pulsedesign",
    time: "3ชม.",
    body: "ธีมมืดใหม่มาแล้ว คอนทราสต์อ่านง่ายขึ้น 20% และปุ่มทุกตัวมีสถานะโฟกัสชัดเจน",
    replies: 45,
    reposts: 120,
    likes: 903,
  },
  {
    id: 4,
    name: "มินท์",
    handle: "mint.dev",
    time: "5ชม.",
    body: "ใครกำลังหาไอเดียโปรเจกต์สุดสัปดาห์ ลองทำ feed reader ของตัวเองดู ได้ฝึกทั้ง data loading และ UI state",
    replies: 13,
    reposts: 22,
    likes: 264,
  },
];

const TRENDS = [
  { topic: "เทคโนโลยี", tag: "#TanStack", count: "12.4K โพสต์" },
  { topic: "ดีไซน์", tag: "#DarkMode", count: "8,902 โพสต์" },
  { topic: "ประเทศไทย", tag: "#กรุงเทพ", count: "45.1K โพสต์" },
  { topic: "เกม", tag: "#IndieGame", count: "3,417 โพสต์" },
];

const NAV = [
  { label: "หน้าแรก", icon: Home, active: true },
  { label: "สำรวจ", icon: Search },
  { label: "แจ้งเตือน", icon: Bell },
  { label: "ข้อความ", icon: Mail },
  { label: "บุ๊กมาร์ก", icon: Bookmark },
  { label: "โปรไฟล์", icon: User },
  { label: "ตั้งค่า", icon: Settings },
];

function Avatar({ seed }: { seed: string }) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-primary-foreground"
      style={{ background: "var(--gradient-brand)" }}
    >
      {seed.slice(0, 1).toUpperCase()}
    </div>
  );
}

function FeedPage() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [liked, setLiked] = useState<number[]>([]);
  const [draft, setDraft] = useState("");

  const publish = () => {
    const text = draft.trim();
    if (!text) return;
    setPosts((p) => [
      {
        id: Date.now(),
        name: "คุณ",
        handle: "you",
        time: "ตอนนี้",
        body: text.slice(0, 280),
        replies: 0,
        reposts: 0,
        likes: 0,
      },
      ...p,
    ]);
    setDraft("");
    toast.success("โพสต์แล้ว");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl gap-6 px-4">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col py-4 md:flex">
        <div className="px-3 py-2 text-foreground">
          <BrandMark />
        </div>
        <nav className="mt-4 space-y-1">
          {NAV.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              className={`flex w-full items-center gap-4 rounded-full px-4 py-3 text-lg transition-colors hover:bg-surface-hover ${
                active ? "font-bold text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-6 w-6" />
              {label}
            </button>
          ))}
        </nav>
        <Button className="mt-6 h-12 rounded-full text-base font-semibold" onClick={publish}>
          โพสต์
        </Button>
      </aside>

      <main className="min-w-0 flex-1 border-x border-border">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <h1 className="text-xl font-bold text-foreground">หน้าแรก</h1>
          <div className="flex items-center gap-2 text-sm">
            <Link to="/login" className="rounded-full px-4 py-2 text-muted-foreground hover:bg-surface-hover">
              เข้าสู่ระบบ
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </header>

        <section className="flex gap-3 border-b border-border p-4">
          <Avatar seed="Y" />
          <div className="flex-1">
            <textarea
              value={draft}
              maxLength={280}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder="มีอะไรเกิดขึ้นบ้าง?"
              className="w-full resize-none bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-2 flex items-center justify-between">
              <ImageIcon className="h-5 w-5 text-primary" />
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{draft.length}/280</span>
                <Button
                  onClick={publish}
                  disabled={!draft.trim()}
                  className="h-9 rounded-full px-5 font-semibold"
                >
                  โพสต์
                </Button>
              </div>
            </div>
          </div>
        </section>

        <ul>
          {posts.map((post) => {
            const isLiked = liked.includes(post.id);
            return (
              <li
                key={post.id}
                className="flex gap-3 border-b border-border p-4 transition-colors hover:bg-surface-hover"
              >
                <Avatar seed={post.name} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1 text-sm">
                    <span className="font-bold text-foreground">{post.name}</span>
                    <span className="text-muted-foreground">@{post.handle} · {post.time}</span>
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                    {post.body}
                  </p>
                  <div className="mt-3 flex max-w-sm items-center justify-between text-muted-foreground">
                    <button type="button" className="flex items-center gap-2 text-sm hover:text-primary">
                      <MessageCircle className="h-4 w-4" />
                      {post.replies}
                    </button>
                    <button type="button" className="flex items-center gap-2 text-sm hover:text-success">
                      <Repeat2 className="h-4 w-4" />
                      {post.reposts}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setLiked((l) =>
                          l.includes(post.id) ? l.filter((x) => x !== post.id) : [...l, post.id],
                        )
                      }
                      className={`flex items-center gap-2 text-sm hover:text-destructive ${
                        isLiked ? "text-destructive" : ""
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                      {post.likes + (isLiked ? 1 : 0)}
                    </button>
                    <button type="button" className="hover:text-primary">
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </main>

      <aside className="sticky top-0 hidden h-screen w-80 shrink-0 py-4 lg:block">
        <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-3 text-muted-foreground">
          <Search className="h-4 w-4" />
          <input
            placeholder="ค้นหาบน Pulse"
            maxLength={100}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> กำลังมาแรง
          </h2>
          <ul className="mt-3 space-y-3">
            {TRENDS.map((t) => (
              <li key={t.tag}>
                <p className="text-xs text-muted-foreground">{t.topic} · กำลังมาแรง</p>
                <p className="font-semibold text-foreground">{t.tag}</p>
                <p className="text-xs text-muted-foreground">{t.count}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-bold text-foreground">ยังไม่มีบัญชี?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            สมัครใน 6 ขั้นตอนสั้น ๆ แล้วเริ่มติดตามคนที่คุณสนใจ
          </p>
          <Button asChild className="mt-4 h-11 w-full rounded-full font-semibold">
            <Link to="/signup">สมัครสมาชิก</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
