import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Home, LogOut, User } from "lucide-react";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { mockSignOut } from "@/lib/mock-db";

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
        <nav className="mt-4 space-y-1">
          <Link
            to="/feed"
            activeProps={{ className: "font-bold text-foreground" }}
            inactiveProps={{ className: "text-muted-foreground" }}
            className="flex w-full items-center gap-4 rounded-full px-4 py-3 text-lg transition-colors hover:bg-surface-hover"
          >
            <Home className="h-6 w-6" /> หน้าแรก
          </Link>
          {username ? (
            <Link
              to="/u/$username"
              params={{ username }}
              activeProps={{ className: "font-bold text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex w-full items-center gap-4 rounded-full px-4 py-3 text-lg transition-colors hover:bg-surface-hover"
            >
              <User className="h-6 w-6" /> โปรไฟล์
            </Link>
          ) : null}
        </nav>
        <Button
          variant="ghost"
          onClick={signOut}
          className="mt-6 h-12 justify-start gap-4 rounded-full px-4 text-base text-muted-foreground"
        >
          <LogOut className="h-5 w-5" /> ออกจากระบบ
        </Button>
      </aside>

      <main className="min-w-0 flex-1 border-x border-border">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <Button variant="ghost" size="sm" className="md:hidden" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        {children}
      </main>

      <aside className="sticky top-0 hidden h-screen w-80 shrink-0 py-4 lg:block">{aside}</aside>
    </div>
  );
}