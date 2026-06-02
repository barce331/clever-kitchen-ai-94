import { Link } from "@tanstack/react-router";
import { ChefHat } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-warm shadow-warm">
            <ChefHat className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="font-display text-xl tracking-tight">
            Chef <span className="text-gradient-warm font-semibold">IA</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/" hash="recursos" className="hover:text-foreground transition">Recursos</Link>
          <Link to="/" hash="como-funciona" className="hover:text-foreground transition">Como funciona</Link>
          <Link to="/cozinha" className="hover:text-foreground transition">Receitas do mundo</Link>
        </nav>
        <Link
          to="/cozinha"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 transition shadow-soft"
        >
          Abrir cozinha
        </Link>
      </div>
    </header>
  );
}
