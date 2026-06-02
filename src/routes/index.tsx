import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-ingredients.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ReviewsSection } from "@/components/ReviewsSection";
import { Camera, Sparkles, Leaf, Clock, ShoppingBasket, Heart, CalendarDays, Globe2, BarChart3, ChefHat } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chef IA — Receitas com o que você tem em casa" },
      { name: "description", content: "Tire uma foto dos ingredientes e a IA cria receitas personalizadas. Menos desperdício, mais sabor." },
      { property: "og:title", content: "Chef IA — Receitas com o que você tem em casa" },
      { property: "og:description", content: "Transforme ingredientes esquecidos em refeições incríveis com inteligência artificial." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Camera, title: "Foto vira receita", desc: "Aponte a câmera pra geladeira. A IA identifica os ingredientes." },
  { icon: Sparkles, title: "Receitas sob medida", desc: "Geradas a partir do que você tem agora — não do que falta." },
  { icon: Leaf, title: "Filtros inteligentes", desc: "Vegano, sem glúten, low carb, fitness, em até 15 minutos." },
  { icon: ShoppingBasket, title: "Lista de compras", desc: "Só o que falta, organizado por categoria automaticamente." },
  { icon: Heart, title: "Favoritos", desc: "Salve receitas e crie coleções suas." },
  { icon: CalendarDays, title: "Planejador semanal", desc: "Monte o cardápio da semana em segundos." },
  { icon: Globe2, title: "Receitas do mundo", desc: "Brasileira, italiana, japonesa, mexicana e muito mais." },
  { icon: BarChart3, title: "Dashboard", desc: "Acompanhe economia, desperdício evitado e estatísticas." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-20 md:pt-20 md:pb-32 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-[var(--spice)]" />
              Powered by IA culinária
            </span>
            <h1 className="mt-6 text-5xl md:text-7xl leading-[0.95]">
              O que tem na sua{" "}
              <span className="text-gradient-warm italic">geladeira</span>{" "}
              vira jantar.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Chef IA transforma ingredientes esquecidos em receitas criativas.
              Tire uma foto, escreva o que tem — receba um cardápio em segundos.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/cozinha"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-warm px-6 py-3 text-base font-medium text-primary-foreground shadow-warm hover:opacity-95 transition"
              >
                <ChefHat className="h-5 w-5" /> Começar a cozinhar
              </Link>
              <Link
                to="/"
                hash="como-funciona"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-base font-medium hover:bg-muted transition"
              >
                Como funciona
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <Stat n="2.3M" label="refeições criadas" />
              <Stat n="68%" label="menos desperdício" />
              <Stat n="R$ 340" label="economia/mês*" />
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-8 bg-gradient-warm opacity-20 blur-3xl rounded-full" />
            <div className="relative rounded-3xl overflow-hidden shadow-warm border border-border/60 rotate-1 hover:rotate-0 transition-transform duration-700">
              <img
                src={heroImg}
                alt="Ingredientes frescos sobre superfície de terracota: tomate, manjericão, alho, ovos, pimentões, limão e massa fresca"
                width={1536}
                height={1280}
                className="w-full h-auto block"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl px-4 py-3 shadow-soft flex items-center gap-3 max-w-xs">
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-[var(--herb)]/15">
                <Leaf className="h-5 w-5 text-[var(--herb)]" />
              </span>
              <div>
                <p className="text-sm font-medium">Tagliatelle ao pesto</p>
                <p className="text-xs text-muted-foreground">15 min · usa 6 ingredientes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-widest text-[var(--spice)] font-medium">Como funciona</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Três passos. Zero desperdício.</h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { n: "01", t: "Mostre o que tem", d: "Tire uma foto da geladeira ou liste ingredientes manualmente." },
            { n: "02", t: "Escolha o estilo", d: "Vegano, rápido, italiano, fitness — combine filtros como quiser." },
            { n: "03", t: "Cozinhe e salve", d: "Passo a passo claro, lista do que falta e favoritos." },
          ].map((s) => (
            <div key={s.n} className="rounded-3xl border border-border bg-card p-8 shadow-soft hover:shadow-warm transition">
              <span className="font-display text-5xl text-gradient-warm">{s.n}</span>
              <h3 className="mt-4 text-2xl">{s.t}</h3>
              <p className="mt-2 text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-[var(--spice)] font-medium">Recursos</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Tudo na sua bancada.</h2>
          </div>
          <p className="text-muted-foreground max-w-md">
            Um assistente culinário completo — da câmera ao prato, do cardápio à lista de compras.
          </p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 hover:bg-accent/40 transition">
              <span className="grid place-items-center h-11 w-11 rounded-xl bg-primary/10 text-primary group-hover:bg-gradient-warm group-hover:text-primary-foreground transition">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-medium">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-warm p-10 md:p-16 text-primary-foreground shadow-warm">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="text-4xl md:text-5xl">Pronto pra inventar o jantar?</h2>
            <p className="mt-4 text-primary-foreground/90 text-lg">
              Abra a cozinha do Chef IA, jogue seus ingredientes e veja a mágica acontecer.
            </p>
            <Link
              to="/cozinha"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-base font-medium text-background hover:bg-foreground/90 transition"
            >
              <ChefHat className="h-5 w-5" /> Abrir cozinha do Chef IA
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl text-foreground">{n}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}
