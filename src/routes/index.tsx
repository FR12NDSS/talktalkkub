import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Repeat2, Sparkles, Users } from "lucide-react";
import { BrandMark } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse — โซเชียลสั้น กระชับ ทันเหตุการณ์" },
      {
        name: "description",
        content: "สมัครสมาชิก Pulse ใน 6 ขั้นตอน แล้วเริ่มโพสต์ รีโพสต์ คอมเมนต์ และติดตามคนที่คุณสนใจ",
      },
      { property: "og:title", content: "Pulse — โซเชียลสั้น กระชับ ทันเหตุการณ์" },
      { property: "og:description", content: "สมัครสมาชิกใน 6 ขั้นตอน แล้วเริ่มพูดคุยบน Pulse" },
    ],
  }),
  component: LandingPage,
});

const FEATURES = [
  { icon: MessageCircle, title: "คอมเมนต์", desc: "ตอบกลับทุกบทสนทนาแบบเธรด" },
  { icon: Repeat2, title: "รีโพสต์", desc: "ส่งต่อโพสต์ที่ชอบให้ผู้ติดตามของคุณ" },
  { icon: Users, title: "ติดตาม", desc: "สร้างฟีดของคุณเองจากคนที่คุณสนใจ" },
];

function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-52 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16">
        <span className="text-foreground">
          <BrandMark className="h-12 w-12" />
        </span>
        <h1 className="mt-8 max-w-2xl text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl">
          เกิดอะไรขึ้นบ้างตอนนี้
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Pulse คือโซเชียลสั้น กระชับ ทันเหตุการณ์ สมัครใน 6 ขั้นตอน แล้วเริ่มโพสต์ รีโพสต์
          คอมเมนต์ และติดตามคนที่คุณสนใจ
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:max-w-xs">
          <Button asChild className="h-12 rounded-full text-base font-semibold">
            <Link to="/signup">สมัครสมาชิก</Link>
          </Button>
          <Button asChild variant="secondary" className="h-12 rounded-full text-base font-semibold">
            <Link to="/login">เข้าสู่ระบบ</Link>
          </Button>
        </div>

        <ul className="mt-16 grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="rounded-2xl border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-primary" />
              <h2 className="mt-3 font-bold text-foreground">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </li>
          ))}
        </ul>

        <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> ฟีดของคุณพร้อมทันทีหลังยืนยันอีเมล
        </p>
      </div>
    </main>
  );
}
