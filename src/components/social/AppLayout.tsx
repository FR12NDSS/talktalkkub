import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Home, LogOut, Mail, Menu, Search, Settings, User } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { mockSignOut } from "@/lib/mock-db";
import { socialQuery, unreadMessageCount, unreadNotificationCount } from "@/lib/social";
import { useSession } from "@/hooks/use-session";

export function Avatar({ seed, size = "h-11 w-11" }: { seed: string; size?: string }) {
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full text-sm font-bold text-primary-foreground`}
      style={{ background: "var(--gradient-brand)" }}
    >
      {(seed || "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ml-auto min-w-6 rounded-full bg-primary px-2 py-0.5 text-center text-xs font-bold text-primary-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NavLinks({
  username,
  unreadMsg,
  unreadNotif,
  onNavigate,
}: {
  username?: string | undefined;
  unreadMsg: number;
  unreadNotif: number;
  onNavigate?: (() => void) | undefined;
}) {
  const cls =
    "flex w-full items-center gap-4 rounded-full px-4 py-3 text-lg transition-colors hover:bg-surface-hover";
  const active = { className: "font-bold text-foreground" };
  const inactive = { className: "text-muted-foreground" };
  return (
    <nav className="space-y-1">
      <Link to="/feed" onClick={onNavigate} activeProps={active} inactiveProps={inactive} className={cls}>
        <Home className="h-6 w-6" /> หน้าแรก
      </Link>
      <Link to="/search" onClick={onNavigate} activeProps={active} inactiveProps={inactive} className={cls}>
        <Search className="h-6 w-6" /> ค้นหา
      </Link>
      <Link
        to="/notifications"
        onClick={onNavigate}
        activeProps={active}
        inactiveProps={inactive}
        className={cls}
      >
        <Bell className="h-6 w-6" /> การแจ้งเตือน
        <Badge count={unreadNotif} />
      </Link>
      <Link to="/messages" onClick={onNavigate} activeProps={active} inactiveProps={inactive} className={cls}>
        <Mail className="h-6 w-6" /> ข้อความ
        <Badge count={unreadMsg} />
      </Link>
      {username ? (
        <Link
          to="/u/$username"
          params={{ username }}
          onClick={onNavigate}
          activeProps={active}
          inactiveProps={inactive}
          className={cls}
        >
          <User className="h-6 w-6" /> โปรไฟล์
        </Link>
      ) : null}
      <Link to="/settings" onClick={onNavigate} activeProps={active} inactiveProps={inactive} className={cls}>
        <Settings className="h-6 w-6" /> ตั้งค่า
      </Link>
    </nav>
  );
}

export function AppLayout({
  title,
  username,
  children,
  aside,
}: {
  title: string;
  username?: string | undefined;
  children: ReactNode;
  aside?: ReactNode | undefined;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { data } = useQuery(socialQuery());
  const [menuOpen, setMenuOpen] = useState(false);

  const unreadMsg = data && user ? unreadMessageCount(data, user.id) : 0;
  const unreadNotif = data && user ? unreadNotificationCount(data, user.id) : 0;
  const theme = data?.settings.theme;

  useEffect(() => {
    if (theme) document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await mockSignOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl gap-6 px-4">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col py-4 md:flex">
        <Link to="/feed" className="px-3 py-2 text-foreground">
          <BrandMark />
        </Link>
        <div className="mt-4">
          <NavLinks username={username} unreadMsg={unreadMsg} unreadNotif={unreadNotif} />
        </div>
        <Button
          variant="ghost"
          onClick={signOut}
          className="mt-6 h-12 justify-start gap-4 rounded-full px-4 text-base text-muted-foreground"
        >
          <LogOut className="h-5 w-5" /> ออกจากระบบ
        </Button>
      </aside>

      <main className="min-w-0 flex-1 border-x border-border pb-16 md:pb-0">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="เปิดเมนู">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-background p-4">
                <Link to="/feed" onClick={() => setMenuOpen(false)} className="inline-flex px-3 py-2 text-foreground">
                  <BrandMark />
                </Link>
                {username ? (
                  <div className="mt-4 flex items-center gap-3 px-3">
                    <Avatar seed={username} size="h-10 w-10" />
                    <p className="truncate text-sm font-semibold text-foreground">@{username}</p>
                  </div>
                ) : null}
                <div className="mt-4">
                  <NavLinks
                    username={username}
                    unreadMsg={unreadMsg}
                    unreadNotif={unreadNotif}
                    onNavigate={() => setMenuOpen(false)}
                  />
                </div>
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="mt-4 h-12 w-full justify-start gap-4 rounded-full px-4 text-base text-muted-foreground"
                >
                  <LogOut className="h-5 w-5" /> ออกจากระบบ
                </Button>
              </SheetContent>
            </Sheet>
            <h1 className="truncate text-xl font-bold text-foreground">{title}</h1>
          </div>
        </header>
        {children}
      </main>

      <aside className="sticky top-0 hidden h-screen w-80 shrink-0 py-4 lg:block">{aside}</aside>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-background/95 py-2 backdrop-blur md:hidden">
        {[
          { to: "/feed" as const, icon: Home, label: "หน้าแรก" },
          { to: "/search" as const, icon: Search, label: "ค้นหา" },
          { to: "/notifications" as const, icon: Bell, label: "แจ้งเตือน", badge: unreadNotif },
          { to: "/messages" as const, icon: Mail, label: "ข้อความ", badge: unreadMsg },
        ].map(({ to, icon: Icon, label, badge }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            activeProps={{ className: "text-primary" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className="relative flex flex-col items-center gap-1 px-4 py-1 text-xs"
          >
            <Icon className="h-5 w-5" />
            {badge ? (
              <span className="absolute right-2 top-0 h-2 w-2 rounded-full bg-primary" />
            ) : null}
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}