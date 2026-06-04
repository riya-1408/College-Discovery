import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Course = { name: string; duration: string; fees: number };
export type Review = { author: string; rating: number; text: string };

export type College = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  established: number | null;
  fees_per_year: number;
  rating: number;
  reviews_count: number;
  avg_package_lpa: number | null;
  highest_package_lpa: number | null;
  placement_rate: number | null;
  overview: string | null;
  courses: Course[];
  reviews: Review[];
  image_url: string | null;
};

export type CollegeFilters = {
  q?: string;
  type?: string;
  maxFees?: number;
  minRating?: number;
  sort?: "rating" | "fees_asc" | "fees_desc" | "name";
};

export async function fetchColleges(filters: CollegeFilters = {}): Promise<College[]> {
  let q = supabase.from("colleges").select("*");
  if (filters.q) q = q.ilike("name", `%${filters.q}%`);
  if (filters.type && filters.type !== "all") q = q.eq("type", filters.type);
  if (filters.maxFees) q = q.lte("fees_per_year", filters.maxFees);
  if (filters.minRating) q = q.gte("rating", filters.minRating);

  switch (filters.sort) {
    case "fees_asc": q = q.order("fees_per_year", { ascending: true }); break;
    case "fees_desc": q = q.order("fees_per_year", { ascending: false }); break;
    case "name": q = q.order("name", { ascending: true }); break;
    default: q = q.order("rating", { ascending: false });
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as College[];
}

export async function fetchCollegeBySlug(slug: string): Promise<College | null> {
  const { data, error } = await supabase.from("colleges").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as unknown as College | null) ?? null;
}

export async function fetchCollegesByIds(ids: string[]): Promise<College[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase.from("colleges").select("*").in("id", ids);
  if (error) throw error;
  return (data ?? []) as unknown as College[];
}

export const collegesQuery = (filters: CollegeFilters) =>
  queryOptions({
    queryKey: ["colleges", filters],
    queryFn: () => fetchColleges(filters),
  });

export const collegeBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["college", slug],
    queryFn: () => fetchCollegeBySlug(slug),
  });

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
