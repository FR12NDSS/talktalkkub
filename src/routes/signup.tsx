import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { checkAvailability } from "@/lib/auth.functions";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "สมัครสมาชิก 6 ขั้นตอน — Pulse" },
      {
        name: "description",
        content: "สร้างบัญชี Pulse ง่าย ๆ ใน 6 ขั้นตอน ตั้งแต่ข้อมูลพื้นฐานจนถึงยืนยันตัวตน",
      },
      { property: "og:title", content: "สมัครสมาชิก 6 ขั้นตอน — Pulse" },
      { property: "og:description", content: "สร้างบัญชี Pulse ใน 6 ขั้นตอน" },
    ],
  }),
  component: SignupPage,
});

const STEPS = [
  { title: "ข้อมูลพื้นฐาน", hint: "บอกเราหน่อยว่าคุณคือใคร" },
  { title: "บัญชีเข้าใช้งาน", hint: "อีเมลและรหัสผ่านของคุณ" },
  { title: "ตั้งชื่อผู้ใช้", hint: "เลือก @username ที่คนอื่นจะเห็น" },
  { title: "ความสนใจ", hint: "เลือกอย่างน้อย 3 หัวข้อเพื่อจัดฟีดให้คุณ" },
  { title: "โปรไฟล์", hint: "เพิ่มคำแนะนำตัวสั้น ๆ" },
  { title: "ยืนยันตัวตน", hint: "กรอกรหัส 6 หลักที่ส่งไปทางอีเมล" },
];

const TOPICS = [
  "เทคโนโลยี",
  "ข่าว",
  "กีฬา",
  "ดนตรี",
  "ภาพยนตร์",
  "เกม",
  "อาหาร",
  "ท่องเที่ยว",
  "ธุรกิจ",
  "ศิลปะ",
];

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [code, setCode] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  const passwordRules = [
    { label: "อย่างน้อย 8 ตัวอักษร", ok: password.length >= 8 },
    { label: "มีตัวเลขอย่างน้อย 4 หลัก", ok: (password.match(/\d/g) ?? []).length >= 4 },
    { label: "มีอักษรตัวใหญ่อย่างน้อย 1 ตัว", ok: /[A-Z]/.test(password) },
    { label: "มีสัญลักษณ์พิเศษอย่างน้อย 1 ตัว", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const passedRules = passwordRules.filter((r) => r.ok).length;
  const passwordStrong = passedRules === passwordRules.length;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const validate = () => {
    switch (step) {
      case 0:
        if (name.trim().length < 2) return "กรอกชื่อของคุณอย่างน้อย 2 ตัวอักษร";
        if (!birthday) return "เลือกวันเกิดของคุณ";
        return null;
      case 1:
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return "อีเมลไม่ถูกต้อง";
        if (!passwordStrong) return "รหัสผ่านยังไม่ผ่านเงื่อนไขความปลอดภัย";
        if (!passwordsMatch) return "รหัสผ่านทั้งสองช่องไม่ตรงกัน";
        return null;
      case 2:
        if (!/^[a-zA-Z0-9_]{3,15}$/.test(username)) return "ชื่อผู้ใช้ 3–15 ตัว (a-z, 0-9, _)";
        return null;
      case 3:
        if (topics.length < 3) return "เลือกความสนใจอย่างน้อย 3 หัวข้อ";
        return null;
      case 4:
        if (bio.length > 160) return "คำแนะนำตัวยาวเกิน 160 ตัวอักษร";
        return null;
      case 5:
        if (!/^\d{6}$/.test(code)) return "กรอกรหัสยืนยัน 6 หลัก";
        if (!agree) return "กรุณายอมรับเงื่อนไขการใช้งาน";
        return null;
      default:
        return null;
    }
  };

  const next = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setBusy(true);
    try {
      if (step === 1) {
        const res = await checkAvailability({ data: { email: email.trim() } });
        if (res.emailAvailable === false) {
          toast.error("อีเมลนี้ถูกใช้งานแล้ว");
          return;
        }
      }
      if (step === 2) {
        const res = await checkAvailability({ data: { username } });
        if (res.usernameAvailable === false) {
          toast.error("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว");
          return;
        }
      }
      if (step === 4) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/feed`,
            data: { username, display_name: name.trim(), bio, birthday, topics },
          },
        });
        if (signUpError) {
          toast.error(signUpError.message);
          return;
        }
        toast.success(`ส่งรหัสยืนยัน 6 หลักไปที่ ${email.trim()} แล้ว`);
      }
      if (step === STEPS.length - 1) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          email: email.trim(),
          token: code,
          type: "signup",
        });
        if (otpError) {
          toast.error("รหัสยืนยันไม่ถูกต้องหรือหมดอายุ");
          return;
        }
        toast.success("สร้างบัญชีสำเร็จ ยินดีต้อนรับสู่ Pulse!");
        navigate({ to: "/feed" });
        return;
      }
      setStep((s) => s + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  };

  const current = STEPS[step] ?? STEPS[0]!;

  return (
    <AuthShell
      title={current.title}
      subtitle={current.hint}
      footer={
        <span>
          มีบัญชีอยู่แล้ว?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            เข้าสู่ระบบ
          </Link>
        </span>
      }
    >
      <div className="mb-8">
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-xs font-medium tracking-wide text-muted-foreground">
          ขั้นตอนที่ {step + 1} จาก {STEPS.length}
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        {step === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อที่แสดง</Label>
              <Input
                id="name"
                value={name}
                maxLength={50}
                onChange={(e) => setName(e.target.value)}
                placeholder="สมชาย ใจดี"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthday">วันเกิด</Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={email}
                maxLength={255}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="อย่างน้อย 8 ตัวอักษร"
                className="h-12 rounded-xl"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <Label htmlFor="username">ชื่อผู้ใช้</Label>
            <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3">
              <span className="text-muted-foreground">@</span>
              <Input
                id="username"
                value={username}
                maxLength={15}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                placeholder="pulse_user"
                className="h-12 border-0 bg-transparent px-0 focus-visible:ring-0"
              />
            </div>
            <p className="text-xs text-muted-foreground">เปลี่ยนภายหลังได้ในหน้าตั้งค่า</p>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => {
              const active = topics.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() =>
                    setTopics((t) =>
                      t.includes(topic) ? t.filter((x) => x !== topic) : [...t, topic],
                    )
                  }
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-surface-hover"
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2">
            <Label htmlFor="bio">แนะนำตัว</Label>
            <Textarea
              id="bio"
              value={bio}
              maxLength={160}
              rows={4}
              onChange={(e) => setBio(e.target.value)}
              placeholder="เล่าเกี่ยวกับตัวคุณสั้น ๆ"
              className="rounded-xl"
            />
            <p className="text-right text-xs text-muted-foreground">{bio.length}/160</p>
          </div>
        )}

        {step === 5 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="code">รหัสยืนยัน</Label>
              <Input
                id="code"
                inputMode="numeric"
                value={code}
                maxLength={6}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="h-14 rounded-xl text-center text-2xl tracking-[0.5em]"
              />
              <p className="text-xs text-muted-foreground">
                ส่งรหัสไปที่ {email || "อีเมลของคุณ"} แล้ว
              </p>
            </div>
            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <Checkbox
                checked={agree}
                onCheckedChange={(v) => setAgree(v === true)}
                className="mt-0.5"
              />
              <span>ฉันยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว</span>
            </label>
          </>
        )}

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <Button
              type="button"
              variant="secondary"
              className="h-12 flex-1 rounded-full"
              onClick={() => setStep((s) => s - 1)}
            >
              ย้อนกลับ
            </Button>
          )}
          <Button
            type="submit"
            disabled={busy}
            className="h-12 flex-1 rounded-full text-base font-semibold"
          >
            {busy ? "กำลังดำเนินการ..." : step === STEPS.length - 1 ? "สร้างบัญชี" : "ถัดไป"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}