import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { collegesQuery, type CollegeFilters } from "@/lib/colleges";
import { CollegeCard } from "@/components/CollegeCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Discover colleges — Collegio" },
      { name: "description", content: "Search and filter top engineering, management and research colleges across India." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(collegesQuery({})),
  component: DiscoverPage,
  errorComponent: ({ error }) => <div className="p-12 text-center text-sm text-muted-foreground">Couldn't load colleges: {error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found.</div>,
});

const PAGE_SIZE = 9;

function DiscoverPage() {
  const [filters, setFilters] = useState<CollegeFilters>({ sort: "rating" });
  const [page, setPage] = useState(1);
  const { data } = useSuspenseQuery(collegesQuery(filters));

  const paged = useMemo(() => data.slice(0, page * PAGE_SIZE), [data, page]);
  const hasMore = paged.length < data.length;

  const update = <K extends keyof CollegeFilters>(k: K, v: CollegeFilters[K]) => {
    setPage(1);
    setFilters((f) => ({ ...f, [k]: v }));
  };

  return (
    <div>
      <section className="border-b border-border bg-gradient-to-b from-surface to-background">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-accent">India · 2026 admissions</p>
          <h1 className="max-w-3xl font-display text-5xl leading-[1.05] md:text-6xl">
            Find the college that <em className="italic text-accent">actually</em> fits you.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Browse fees, placements, courses and real student reviews. Compare side-by-side and save your shortlist.
          </p>
          <div className="mt-8 flex max-w-2xl items-center gap-2 rounded-full border border-border bg-card px-4 shadow-sm focus-within:border-accent">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by college name…"
              value={filters.q ?? ""}
              onChange={(e) => update("q", e.target.value)}
              className="h-14 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 grid grid-cols-1 gap-6 rounded-xl border border-border bg-card p-6 md:grid-cols-4">
          <div className="flex items-center gap-2 text-sm font-medium md:col-span-4">
            <SlidersHorizontal className="h-4 w-4 text-accent" /> Refine results
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Type</label>
            <Select value={filters.type ?? "all"} onValueChange={(v) => update("type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Sort by</label>
            <Select value={filters.sort ?? "rating"} onValueChange={(v) => update("sort", v as CollegeFilters["sort"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest rated</SelectItem>
                <SelectItem value="fees_asc">Fees: low to high</SelectItem>
                <SelectItem value="fees_desc">Fees: high to low</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
              Min rating: {filters.minRating ?? 0}
            </label>
            <Slider min={0} max={5} step={0.5} value={[filters.minRating ?? 0]} onValueChange={([v]) => update("minRating", v)} className="mt-3" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
              Max fees: ₹{((filters.maxFees ?? 1500000) / 100000).toFixed(1)}L
            </label>
            <Slider min={25000} max={1500000} step={25000} value={[filters.maxFees ?? 1500000]} onValueChange={([v]) => update("maxFees", v)} className="mt-3" />
          </div>
        </div>

        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-3xl">{data.length} colleges</h2>
          <p className="text-sm text-muted-foreground">Showing {paged.length} of {data.length}</p>
        </div>

        {data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center text-muted-foreground">
            No colleges match your filters. Try loosening them.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {paged.map((c) => <CollegeCard key={c.id} college={c} />)}
          </div>
        )}

        {hasMore && (
          <div className="mt-10 flex justify-center">
            <Button variant="outline" size="lg" onClick={() => setPage((p) => p + 1)}>Load more</Button>
          </div>
        )}
      </section>
    </div>
  );
}
