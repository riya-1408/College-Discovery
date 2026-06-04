import { Link } from "@tanstack/react-router";
import { MapPin, Star, IndianRupee, TrendingUp, Scale } from "lucide-react";
import { type College, formatINR } from "@/lib/colleges";
import { useCompare } from "@/lib/compare-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CollegeCard({ college }: { college: College }) {
  const { ids, toggle, max } = useCompare();
  const inCompare = ids.includes(college.id);
  const disabled = !inCompare && ids.length >= max;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-accent/40 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <span>{college.type}</span>
            {college.established && <><span>•</span><span>Est. {college.established}</span></>}
          </div>
          <Link to="/colleges/$slug" params={{ slug: college.slug }} className="block">
            <h3 className="font-display text-2xl leading-tight transition-colors group-hover:text-accent">
              {college.name}
            </h3>
          </Link>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {college.city}, {college.state}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-md bg-secondary px-2.5 py-1.5">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="text-sm font-semibold">{Number(college.rating).toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({college.reviews_count})</span>
        </div>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-px border-t border-border bg-border">
        <div className="bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            <IndianRupee className="h-3 w-3" /> Tuition / year
          </div>
          <div className="mt-1 font-medium">{formatINR(college.fees_per_year)}</div>
        </div>
        <div className="bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3 w-3" /> Avg package
          </div>
          <div className="mt-1 font-medium">
            {college.avg_package_lpa ? `${college.avg_package_lpa} LPA` : "—"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-border bg-surface p-4">
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link to="/colleges/$slug" params={{ slug: college.slug }}>View details</Link>
        </Button>
        <Button
          size="sm"
          variant={inCompare ? "default" : "outline"}
          disabled={disabled}
          onClick={() => toggle(college.id)}
          className={cn(inCompare && "bg-accent text-accent-foreground hover:bg-accent/90")}
          title={disabled ? "Compare list is full (3 max)" : ""}
        >
          <Scale className="mr-1.5 h-4 w-4" />
          {inCompare ? "Added" : "Compare"}
        </Button>
      </div>
    </article>
  );
}
