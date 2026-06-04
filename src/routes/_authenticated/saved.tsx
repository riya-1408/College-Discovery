import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { type College, formatINR } from "@/lib/colleges";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved colleges — Collegio" }] }),
  component: SavedPage,
});

function SavedPage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["saved-list", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_colleges")
        .select("id, college:colleges(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as { id: string; college: College }[];
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_colleges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-list"] });
      qc.invalidateQueries({ queryKey: ["saved"] });
      toast.success("Removed");
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">Your shortlist</p>
      <h1 className="font-display text-5xl">Saved colleges</h1>

      <div className="mt-10">
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
            <Bookmark className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h2 className="font-display text-2xl">No saved colleges yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tap the Save button on any college to build your shortlist.</p>
            <Button asChild className="mt-6"><Link to="/">Browse colleges</Link></Button>
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {data.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <Link to="/colleges/$slug" params={{ slug: row.college.slug }} className="font-display text-2xl leading-tight hover:text-accent">
                    {row.college.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.college.city}, {row.college.state} · {formatINR(row.college.fees_per_year)} / yr · ★ {Number(row.college.rating).toFixed(1)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeMutation.mutate(row.id)}>
                  <Trash2 className="mr-1.5 h-4 w-4" /> Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
