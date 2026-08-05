import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "./AppLayout";
import { Button } from "@/components/ui/button";
import { createPost } from "@/lib/social";

export function Composer({
  currentUserId,
  seed,
  parentId = null,
  placeholder = "มีอะไรเกิดขึ้นบ้าง?",
  submitLabel = "โพสต์",
  onPosted,
}: {
  currentUserId: string;
  seed: string;
  parentId?: string | null;
  placeholder?: string;
  submitLabel?: string;
  onPosted: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const publish = async () => {
    const text = draft.trim();
    if (!text) return;
    setBusy(true);
    try {
      await createPost({ authorId: currentUserId, content: text, parentId });
      setDraft("");
      toast.success(parentId ? "ตอบกลับแล้ว" : "โพสต์แล้ว");
      onPosted();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "โพสต์ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex gap-3 border-b border-border p-4">
      <Avatar seed={seed} />
      <div className="flex-1">
        <textarea
          value={draft}
          maxLength={280}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-2 flex items-center justify-between">
          <ImageIcon className="h-5 w-5 text-primary" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{draft.length}/280</span>
            <Button
              onClick={publish}
              disabled={!draft.trim() || busy}
              className="h-9 rounded-full px-5 font-semibold"
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}