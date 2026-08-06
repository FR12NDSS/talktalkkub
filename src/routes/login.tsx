import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { mockSignIn, DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/mock-db";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ — Pulse" },
      { name: "description", content: "เข้าสู่ระบบ Pulse เพื่อดูฟีดและพูดคุยกับผู้คนที่คุณติดตาม" },
      { property: "og:title", content: "เข้าสู่ระบบ — Pulse" },
      { property: "og:description", content: "เข้าสู่ระบบ Pulse เพื่อดูฟีดของคุณ" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <AuthShell
      title="เข้าสู่ระบบ"
      subtitle="ยินดีต้อนรับกลับมา ดูสิ่งที่เกิดขึ้นตอนนี้"
      footer={
        <span>
          ยังไม่มีบัญชี?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            สมัครสมาชิก
          </Link>
        </span>
      }
    >
      <div className="mb-5 rounded-xl border border-border bg-secondary/40 p-4 text-sm">
        <p className="font-semibold text-foreground">โหมดทดลอง (ข้อมูลจำลอง)</p>
        <p className="mt-1 text-muted-foreground">
          บัญชีเดโม่: {DEMO_EMAIL} / {DEMO_PASSWORD}
        </p>
        <button
          type="button"
          className="mt-2 font-medium text-primary hover:underline"
          onClick={() => {
            setIdentifier(DEMO_EMAIL);
            setPassword(DEMO_PASSWORD);
          }}
        >
          กรอกให้อัตโนมัติ
        </button>
      </div>

      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identifier.trim()) || password.length < 6) {
            toast.error("กรอกอีเมลให้ถูกต้อง และรหัสผ่านอย่างน้อย 6 ตัวอักษร");
            return;
          }
          setBusy(true);
          const { error } = await mockSignIn(identifier.trim(), password);
          setBusy(false);
          if (error) {
            toast.error(error);
            return;
          }
          toast.success("เข้าสู่ระบบสำเร็จ");
          navigate({ to: "/feed" });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="identifier">อีเมล</Label>
          <Input
            id="identifier"
            value={identifier}
            maxLength={255}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com"
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">รหัสผ่าน</Label>
          <Input
            id="password"
            type="password"
            value={password}
            maxLength={72}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 rounded-xl"
          />
        </div>
        <Button
          type="submit"
          disabled={busy}
          className="h-12 w-full rounded-full text-base font-semibold"
        >
          {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>
        <button
          type="button"
          onClick={() => {
            if (!identifier.trim()) {
              toast.error("กรอกอีเมลของคุณก่อน");
              return;
            }
            toast("โหมดทดลอง: ยังไม่รองรับการรีเซ็ตรหัสผ่านจริง");
          }}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          ลืมรหัสผ่าน?
        </button>
      </form>
    </AuthShell>
  );
}