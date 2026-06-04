import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Star, IndianRupee, TrendingUp, Award, Calendar, Bookmark, Scale } from "lucide-react";
import { toast } from "sonner";

import { collegeBySlugQuery, formatINR } from "@/lib/colleges";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth-store";
import { useCompare } from "@/lib/compare-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/colleges/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(collegeBySlugQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Fees, Placements & Reviews | Collegio` },
          { name: "description", content: (loaderData.overview ?? "").slice(0, 155) },
          { property: "og:title", content: loaderData.name },
          { property: "og:description", content: (loaderData.overview ?? "").slice(0, 155) },
        ]
      : [{ title: "College — Collegio" }],
  }),
  component: CollegeDetailPage,
  errorComponent: ({ error }) => <div className="p-12 text-center text-sm text-muted-foreground">Error: {error.message}</div>,
  notFoundComponent: () => (
    <div className="p-16 text-center">
      <h1 className="font-display text-4xl">College not found</h1>
      <Link to="/" className="mt-4 inline-block text-accent hover:underline">Browse all colleges</Link>
    </div>
  ),
});

function CollegeDetailPage() {
  const { slug } = Route.useParams();
  const { data: college } = useSuspenseQuery(collegeBySlugQuery(slug));
  const { user } = useAuthUser();
  const { ids, toggle, max } = useCompare();
  const qc = useQueryClient();

  if (!college) return null;
  const inCompare = ids.includes(college.id);

  const { data: savedRow } = useQuery({
    queryKey: ["saved", user?.id, college.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("saved_colleges").select("id").eq("user_id", user!.id).eq("college_id", college.id).maybeSingle();
      return data;
    },
  });
  const isSaved = !!savedRow;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to save colleges");
      if (isSaved) {
        await supabase.from("saved_colleges").delete().eq("user_id", user.id).eq("college_id", college.id);
      } else {
        await supabase.from("saved_colleges").insert({ user_id: user.id, college_id: college.id });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved"] });
      toast.success(isSaved ? "Removed from saved" : "Saved to your shortlist");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <article>
      <header className="border-b border-border bg-gradient-to-b from-surface to-background">
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to discover</Link>
          <div className="mt-6 flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">{college.type} · Est. {college.established ?? "—"}</p>
              <h1 className="font-display text-4xl leading-tight md:text-6xl max-w-3xl">{college.name}</h1>
              <div className="mt-3 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {college.city}, {college.state}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant={isSaved ? "default" : "outline"} onClick={() => user ? saveMutation.mutate() : toast.error("Sign in to save", { action: { label: "Sign in", onClick: () => (window.location.href = "/auth") } })}>
                <Bookmark className={`mr-1.5 h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button variant={inCompare ? "default" : "outline"} disabled={!inCompare && ids.length >= max} onClick={() => toggle(college.id)} className={inCompare ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}>
                <Scale className="mr-1.5 h-4 w-4" /> {inCompare ? "Added to compare" : "Compare"}
              </Button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
            <Stat icon={<Star className="h-4 w-4 fill-gold text-gold" />} label="Rating" value={`${Number(college.rating).toFixed(1)} / 5`} sub={`${college.reviews_count} reviews`} />
            <Stat icon={<IndianRupee className="h-4 w-4" />} label="Tuition / year" value={formatINR(college.fees_per_year)} />
            <Stat icon={<TrendingUp className="h-4 w-4" />} label="Avg package" value={college.avg_package_lpa ? `${college.avg_package_lpa} LPA` : "—"} sub={college.highest_package_lpa ? `Highest ${college.highest_package_lpa} LPA` : ""} />
            <Stat icon={<Award className="h-4 w-4" />} label="Placement rate" value={college.placement_rate ? `${college.placement_rate}%` : "—"} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="placements">Placements</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="prose max-w-3xl">
              <p className="text-lg leading-relaxed text-foreground/80">{college.overview}</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 max-w-3xl">
              <InfoRow icon={<Calendar className="h-4 w-4" />} label="Established" value={String(college.established ?? "—")} />
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Location" value={`${college.city}, ${college.state}`} />
              <InfoRow icon={<Award className="h-4 w-4" />} label="Type" value={college.type} />
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3 text-right">Fees / year</th>
                  </tr>
                </thead>
                <tbody>
                  {college.courses.map((c, i) => (
                    <tr key={i} className="border-t border-border bg-card">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.duration}</td>
                      <td className="px-4 py-3 text-right">{formatINR(c.fees)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="placements">
            <div className="grid gap-4 md:grid-cols-3 max-w-3xl">
              <Stat icon={<TrendingUp className="h-4 w-4" />} label="Average package" value={college.avg_package_lpa ? `${college.avg_package_lpa} LPA` : "—"} />
              <Stat icon={<Award className="h-4 w-4" />} label="Highest package" value={college.highest_package_lpa ? `${college.highest_package_lpa} LPA` : "—"} />
              <Stat icon={<Star className="h-4 w-4" />} label="Placement rate" value={college.placement_rate ? `${college.placement_rate}%` : "—"} />
            </div>
            <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
              Placement figures are based on the last reported campus drive. Actual outcomes depend on branch, CGPA and student preparation.
            </p>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="grid gap-4 md:grid-cols-2">
              {college.reviews.map((r, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium">{r.author}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`h-3.5 w-3.5 ${idx < r.rating ? "fill-gold text-gold" : "text-muted"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80">"{r.text}"</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </article>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card p-5">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">{icon} {label}</div>
      <div className="mt-1.5 font-display text-2xl">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">{icon} {label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
