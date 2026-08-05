import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!identifier.trim() || password.length < 6) {
            toast.error("กรอกอีเมล/ชื่อผู้ใช้ และรหัสผ่านอย่างน้อย 6 ตัวอักษร");
            return;
          }
          toast.success("เข้าสู่ระบบสำเร็จ");
          navigate({ to: "/" });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="identifier">อีเมลหรือชื่อผู้ใช้</Label>
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
        <Button type="submit" className="h-12 w-full rounded-full text-base font-semibold">
          เข้าสู่ระบบ
        </Button>
        <button
          type="button"
          onClick={() => toast("ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปที่อีเมลของคุณแล้ว")}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          ลืมรหัสผ่าน?
        </button>
      </form>
    </AuthShell>
  );
}