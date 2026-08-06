import { useEffect, useState } from "react";
import { getDb } from "@/lib/mock-db";

export type MockUser = { id: string; email: string };

export function useSession() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const read = () => {
      const db = getDb();
      const account = db.accounts.find((a) => a.id === db.sessionUserId);
      setUser(account ? { id: account.id, email: account.email } : null);
      setLoading(false);
    };
    read();
    window.addEventListener("mock-db-change", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("mock-db-change", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  return { user, session: user ? { user } : null, loading };
}
