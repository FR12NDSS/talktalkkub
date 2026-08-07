import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { AppLayout, Avatar } from "@/components/social/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { socialQuery, updateProfile, updateSettings, type Settings } from "@/lib/social";
import { mockSignOut } from "@/lib/mock-db";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "ตั้งค่า — Pulse" },
      { name: "description", content: "แก้ไขโปรไฟล์ ธีม ความเป็นส่วนตัว และการแจ้งเตือนของคุณ" },
      { property: "og:title", content: "ตั้งค่า — Pulse" },
      { property: "og:description", content: "จัดการบัญชีและการแจ้งเตือนบน Pulse" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery(socialQuery());
  const me = data?.profiles.find((p) => p.id === user?.id);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (me) {
      setDisplayName(me.display_name);
      setUsername(me.username);
      setBio(me.bio);
    }
  }, [me?.id]);

  useEffect(() => {
    if (!data) return;
    document.documentElement.classList.toggle("light", data.settings.theme === "light");
  }, [data?.settings.theme]);

  if (!data || !user || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        กำลังโหลด...
      </div>
    );
  }

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["social"] });
  const setSetting = (patch: Partial<Settings>) => {
    updateSettings(patch);
    refresh();
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile(user.id, { display_name: displayName, bio, username });
      toast.success("บันทึกโปรไฟล์แล้ว");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const toggles: { key: keyof Settings; label: string; desc: string }[] = [
    { key: "privateAccount", label: "บัญชีส่วนตัว", desc: "เฉพาะผู้ติดตามเท่านั้นที่เห็นโพสต์" },
    { key: "notifyLikes", label: "แจ้งเตือนการถูกใจ", desc: "เมื่อมีคนถูกใจโพสต์ของคุณ" },
    { key: "notifyFollows", label: "แจ้งเตือนผู้ติดตามใหม่", desc: "เมื่อมีคนเริ่มติดตามคุณ" },
    { key: "notifyReplies", label: "แจ้งเตือนการตอบกลับ", desc: "เมื่อมีคนตอบกลับโพสต์ของคุณ" },
    { key: "notifyMessages", label: "แจ้งเตือนข้อความ", desc: "เมื่อมีข้อความใหม่เข้ามา" },
  ];

  return (
    <AppLayout title="ตั้งค่า" username={me.username}>
      <section className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar seed={displayName || username} size="h-14 w-14" />
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground">{displayName || username}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">ชื่อที่แสดง</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">ชื่อผู้ใช้</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">แนะนำตัว</Label>
            <textarea
              id="bio"
              value={bio}
              rows={3}
              maxLength={160}
              onChange={(e) => setBio(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-foreground outline-none"
            />
            <p className="text-right text-xs text-muted-foreground">{bio.length}/160</p>
          </div>
          <Button onClick={save} disabled={saving || !username.trim()} className="rounded-full px-6 font-semibold">
            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </div>
      </section>

      <section className="border-b border-border p-4">
        <h2 className="font-bold text-foreground">การแสดงผล</h2>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.settings.theme === "light" ? (
              <Sun className="h-5 w-5 text-primary" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
            <div>
              <p className="text-foreground">โหมดสว่าง</p>
              <p className="text-sm text-muted-foreground">สลับระหว่างธีมสว่างและมืด</p>
            </div>
          </div>
          <Switch
            checked={data.settings.theme === "light"}
            onCheckedChange={(v) => setSetting({ theme: v ? "light" : "dark" })}
          />
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground">ภาษา</p>
            <p className="text-sm text-muted-foreground">ภาษาที่ใช้แสดงผลในแอป</p>
          </div>
          <select
            value={data.settings.language}
            onChange={(e) => setSetting({ language: e.target.value as "th" | "en" })}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground"
          >
            <option value="th">ไทย</option>
            <option value="en">English</option>
          </select>
        </div>
      </section>

      <section className="border-b border-border p-4">
        <h2 className="font-bold text-foreground">ความเป็นส่วนตัวและการแจ้งเตือน</h2>
        <ul className="mt-3 space-y-4">
          {toggles.map((t) => (
            <li key={t.key} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-foreground">{t.label}</p>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
              <Switch
                checked={Boolean(data.settings[t.key])}
                onCheckedChange={(v) => setSetting({ [t.key]: v } as Partial<Settings>)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="p-4">
        <Button
          variant="destructive"
          className="rounded-full px-6 font-semibold"
          onClick={async () => {
            await queryClient.cancelQueries();
            queryClient.clear();
            await mockSignOut();
            navigate({ to: "/", replace: true });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> ออกจากระบบ
        </Button>
      </section>
    </AppLayout>
  );
}