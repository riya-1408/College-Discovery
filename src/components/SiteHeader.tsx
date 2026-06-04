import { Link } from "@tanstack/react-router";
import { useAuthUser } from "@/lib/auth-store";
import { useCompare } from "@/lib/compare-store";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, Scale, Bookmark, LogOut } from "lucide-react";

export function SiteHeader() {
  const { user } = useAuthUser();
  const { ids } = useCompare();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-accent" />
          <span className="font-display text-2xl leading-none">Collegio</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/" className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>
            Discover
          </Link>
          <Link to="/compare" className="relative rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            <span className="inline-flex items-center gap-1.5"><Scale className="h-4 w-4" /> Compare</span>
            {ids.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-medium text-accent-foreground">{ids.length}</span>
            )}
          </Link>
          {user && (
            <Link to="/saved" className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              <span className="inline-flex items-center gap-1.5"><Bookmark className="h-4 w-4" /> Saved</span>
            </Link>
          )}
          <div className="mx-2 h-6 w-px bg-border" />
          {user ? (
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut className="mr-1.5 h-4 w-4" /> Sign out
            </Button>
          ) : (
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
