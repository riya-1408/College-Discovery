import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { X, Scale } from "lucide-react";

import { fetchCollegesByIds, formatINR } from "@/lib/colleges";
import { useCompare } from "@/lib/compare-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare colleges — Collegio" },
      { name: "description", content: "Compare up to 3 colleges side-by-side on fees, placements, ratings and location." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const { data: colleges = [], isLoading } = useQuery({
    queryKey: ["compare", ids],
    queryFn: () => fetchCollegesByIds(ids),
    enabled: ids.length > 0,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">Side by side</p>
          <h1 className="font-display text-5xl">Compare colleges</h1>
          <p className="mt-2 text-muted-foreground">Up to 3 colleges, head to head. Add candidates from the discover page.</p>
        </div>
        {ids.length > 0 && (
          <Button variant="outline" onClick={clear}>Clear all</Button>
        )}
      </div>

      {ids.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <Scale className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="font-display text-2xl">Nothing to compare yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add colleges from the discover page using the "Compare" button.</p>
          <Button asChild className="mt-6"><Link to="/">Browse colleges</Link></Button>
        </div>
      ) : isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="w-40 px-4 py-3 text-left text-xs uppercase tracking-wider text-muted-foreground">Attribute</th>
                {colleges.map((c) => (
                  <th key={c.id} className="px-4 py-3 text-left align-top">
                    <div className="flex items-start justify-between gap-2">
                      <Link to="/colleges/$slug" params={{ slug: c.slug }} className="font-display text-xl leading-tight hover:text-accent">
                        {c.name}
                      </Link>
                      <button onClick={() => remove(c.id)} className="rounded-full p-1 text-muted-foreground hover:bg-background hover:text-foreground" aria-label="Remove">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_td]:border-t [&_td]:border-border [&_td]:px-4 [&_td]:py-4 [&_th]:border-t [&_th]:border-border [&_th]:px-4 [&_th]:py-4 [&_th]:text-left [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground">
              <Row label="Location" cells={colleges.map((c) => `${c.city}, ${c.state}`)} />
              <Row label="Type" cells={colleges.map((c) => c.type)} />
              <Row label="Established" cells={colleges.map((c) => String(c.established ?? "—"))} />
              <Row label="Rating" cells={colleges.map((c) => `★ ${Number(c.rating).toFixed(1)} (${c.reviews_count})`)} />
              <Row label="Tuition / yr" cells={colleges.map((c) => formatINR(c.fees_per_year))} highlight />
              <Row label="Avg package" cells={colleges.map((c) => c.avg_package_lpa ? `${c.avg_package_lpa} LPA` : "—")} />
              <Row label="Highest package" cells={colleges.map((c) => c.highest_package_lpa ? `${c.highest_package_lpa} LPA` : "—")} />
              <Row label="Placement rate" cells={colleges.map((c) => c.placement_rate ? `${c.placement_rate}%` : "—")} />
              <Row label="Top course" cells={colleges.map((c) => c.courses[0]?.name ?? "—")} />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, cells, highlight }: { label: string; cells: string[]; highlight?: boolean }) {
  return (
    <tr className={highlight ? "bg-surface" : ""}>
      <th>{label}</th>
      {cells.map((c, i) => <td key={i} className="font-medium">{c}</td>)}
    </tr>
  );
}
