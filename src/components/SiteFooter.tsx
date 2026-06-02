export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Chef IA — Menos desperdício, mais sabor.</p>
        <p className="font-display italic">"O melhor tempero é o que você já tem em casa."</p>
      </div>
    </footer>
  );
}
