"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Link = { id: string; url: string; title: string | null };

export function Board({
  tripId,
  initialNotes,
  initialLinks,
}: {
  tripId: string;
  initialNotes: string;
  initialLinks: Link[];
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (notes === initialNotes) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      const supabase = createClient();
      await supabase.from("trip_boards").upsert({ trip_id: tripId, notes, updated_at: new Date().toISOString() });
      setSaving(false);
    }, 700);
    return () => clearTimeout(timer.current);
  }, [notes, tripId, initialNotes]);

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setAdding(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    let url = newUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    const { data, error } = await supabase
      .from("trip_links")
      .insert({ trip_id: tripId, url, title: newTitle.trim() || null, created_by: user.id })
      .select()
      .single();
    setAdding(false);
    if (error || !data) { alert(error?.message ?? "Feil"); return; }
    setLinks((l) => [data as Link, ...l]);
    setNewUrl("");
    setNewTitle("");
  }

  async function deleteLink(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("trip_links").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    setLinks((l) => l.filter((x) => x.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-chunk bg-card p-5 shadow-soft">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">Notater</p>
          <p className="text-[10px] text-muted">{saving ? "Lagrer…" : "Alle kan skrive ✿"}</p>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Skriv noe her — planer, minner, tanker…"
          rows={5}
          className="w-full resize-none bg-transparent text-base leading-relaxed outline-none placeholder:text-muted/60"
        />
      </div>

      <div className="rounded-chunk bg-card p-5 shadow-soft">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Lenker</p>
        <div className="flex flex-col gap-2">
          {links.map((l) => (
            <div key={l.id} className="flex items-center gap-2 rounded-2xl border border-border bg-bg px-3 py-2">
              <a href={l.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-sm font-semibold underline-offset-2 hover:underline">
                {l.title || l.url.replace(/^https?:\/\//, "")}
              </a>
              <button onClick={() => deleteLink(l.id)} className="text-xs text-muted">✕</button>
            </div>
          ))}
          {links.length === 0 && <p className="text-xs text-muted">Ingen lenker enda</p>}
        </div>
        <form onSubmit={addLink} className="mt-3 flex flex-col gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Tittel (valgfri)"
            className="rounded-2xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <div className="flex gap-2">
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://open.spotify.com/…"
              className="flex-1 rounded-2xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button disabled={adding} className="rounded-2xl bg-fg px-4 text-sm font-bold text-bg disabled:opacity-50">
              +
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
