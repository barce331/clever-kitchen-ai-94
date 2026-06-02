import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, Loader2, Plus, Sparkles, X, Clock, Users, ChefHat, ShoppingBasket, Lightbulb, Heart, Globe2 } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { detectIngredients, generateRecipes } from "@/lib/ai.functions";

export const Route = createFileRoute("/cozinha")({
  head: () => ({
    meta: [
      { title: "Cozinha — Chef IA" },
      { name: "description", content: "Liste ou fotografe seus ingredientes e receba receitas criadas pela IA." },
      { property: "og:title", content: "Cozinha — Chef IA" },
      { property: "og:description", content: "Receitas geradas pela IA com o que você já tem em casa." },
    ],
  }),
  component: Kitchen,
});

const FILTERS = [
  "Vegetariano", "Vegano", "Sem lactose", "Sem glúten", "Low carb", "Fitness", "Até 15 min",
];
const CUISINES = [
  "Surpreenda-me",
  "Brasileira",
  "Portuguesa",
  "Italiana",
  "Francesa",
  "Espanhola",
  "Mediterrânea",
  "Grega",
  "Turca",
  "Marroquina",
  "Libanesa",
  "Árabe",
  "Indiana",
  "Tailandesa",
  "Vietnamita",
  "Japonesa",
  "Coreana",
  "Chinesa",
  "Mexicana",
  "Peruana",
  "Argentina",
  "Americana",
  "Cajun",
  "Caribenha",
  "Africana",
  "Etíope",
  "Alemã",
  "Britânica",
  "Russa",
  "Havaiana",
  "Filipina",
  "Indonésia",
];

type Recipe = Awaited<ReturnType<typeof generateRecipes>>["recipes"][number];

function Kitchen() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState<string>("Surpreenda-me");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const detectFn = useServerFn(detectIngredients);
  const genFn = useServerFn(generateRecipes);

  const [userEmail, setUserEmail] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("chefia:email");
  });
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const detect = useMutation({
    mutationFn: async (file: File) => {
      const dataUrl = await fileToDataUrl(file);
      return detectFn({ data: { imageDataUrl: dataUrl } });
    },
    onSuccess: (r) => {
      if (!r.ingredients.length) {
        toast.error("Nenhum ingrediente detectado. Tente outra foto.");
        return;
      }
      const merged = Array.from(new Set([...ingredients, ...r.ingredients.map((s) => s.toLowerCase())]));
      setIngredients(merged);
      toast.success(`${r.ingredients.length} ingredientes detectados!`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const generate = useMutation({
    mutationFn: async () =>
      genFn({
        data: {
          ingredients,
          filters,
          cuisine: cuisine === "Surpreenda-me" ? undefined : cuisine,
          count: 3,
        },
      }),
    onSuccess: (r) => {
      setRecipes(r.recipes);
      if (!r.recipes.length) toast.error("A IA não conseguiu criar receitas. Tente mais ingredientes.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleGenerateClick() {
    if (!userEmail) {
      setShowEmailGate(true);
      return;
    }
    generate.mutate();
  }

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    const v = emailInput.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.error("Digite um e-mail válido.");
      return;
    }
    localStorage.setItem("chefia:email", v);
    setUserEmail(v);
    setShowEmailGate(false);
    setEmailInput("");
    toast.success("Cadastro concluído! Gerando receitas...");
    generate.mutate();
  }

  function addIngredient(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim().toLowerCase();
    if (!v) return;
    if (ingredients.includes(v)) return setInput("");
    setIngredients([...ingredients, v]);
    setInput("");
  }
  function remove(i: string) {
    setIngredients(ingredients.filter((x) => x !== i));
  }
  function toggleFilter(f: string) {
    setFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  }
  function toggleFav(title: string) {
    setFavorites((cur) => (cur.includes(title) ? cur.filter((x) => x !== title) : [...cur, title]));
    toast.success(favorites.includes(title) ? "Removida dos favoritos" : "Salva nos favoritos");
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10">
          <p className="text-sm uppercase tracking-widest text-[var(--spice)] font-medium">Cozinha do Chef</p>
          <h1 className="mt-2 text-4xl md:text-5xl">Bora cozinhar com o que tem aí.</h1>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* INPUT PANEL */}
          <section className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--spice)]" />
                Seus ingredientes
              </h2>

              <form onSubmit={addIngredient} className="mt-4 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="ex: ovos, tomate, alho..."
                  className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="rounded-full bg-foreground text-background px-4 py-2.5 text-sm font-medium inline-flex items-center gap-1 hover:bg-foreground/90"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </form>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={detect.isPending}
                  className="w-full rounded-2xl border-2 border-dashed border-border bg-background/50 hover:bg-accent/40 transition px-4 py-6 text-sm flex flex-col items-center gap-2 disabled:opacity-60"
                >
                  {detect.isPending ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <Camera className="h-6 w-6 text-primary" />
                  )}
                  <span className="font-medium">
                    {detect.isPending ? "Analisando foto..." : "Tirar/enviar foto dos ingredientes"}
                  </span>
                  <span className="text-xs text-muted-foreground">A IA identifica o que está na imagem</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) detect.mutate(f);
                    e.target.value = "";
                  }}
                />
              </div>

              {ingredients.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {ingredients.map((i) => (
                    <span
                      key={i}
                      className="group inline-flex items-center gap-1.5 rounded-full bg-secondary text-secondary-foreground px-3 py-1.5 text-sm capitalize"
                    >
                      {i}
                      <button
                        onClick={() => remove(i)}
                        className="opacity-50 group-hover:opacity-100 hover:text-destructive transition"
                        aria-label={`Remover ${i}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="text-xl">Filtros</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {FILTERS.map((f) => {
                  const on = filters.includes(f);
                  return (
                    <button
                      key={f}
                      onClick={() => toggleFilter(f)}
                      className={`rounded-full px-3 py-1.5 text-sm border transition ${
                        on
                          ? "bg-gradient-warm text-primary-foreground border-transparent shadow-soft"
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>

              <h3 className="mt-6 text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Globe2 className="h-4 w-4" /> Culinária
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {CUISINES.map((c) => {
                  const on = cuisine === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setCuisine(c)}
                      className={`rounded-full px-3 py-1.5 text-sm border transition ${
                        on
                          ? "bg-foreground text-background border-transparent"
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleGenerateClick}
              disabled={ingredients.length === 0 || generate.isPending}
              className="w-full rounded-full bg-gradient-warm text-primary-foreground py-4 text-base font-medium shadow-warm hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {generate.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Inventando receitas...
                </>
              ) : (
                <>
                  <ChefHat className="h-5 w-5" /> Gerar receitas com IA
                </>
              )}
            </button>
            {userEmail && (
              <p className="text-xs text-muted-foreground text-center">
                Conectado como <span className="font-medium text-foreground">{userEmail}</span>
              </p>
            )}
          </section>

          {/* RECIPES */}
          <section className="lg:col-span-7 space-y-6">
            {recipes.length === 0 && !generate.isPending && (
              <EmptyState />
            )}

            {generate.isPending && (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-3xl border border-border bg-card p-6 animate-pulse">
                    <div className="h-6 w-2/3 bg-muted rounded mb-3" />
                    <div className="h-4 w-full bg-muted rounded mb-2" />
                    <div className="h-4 w-5/6 bg-muted rounded" />
                  </div>
                ))}
              </div>
            )}

            {recipes.map((r) => (
              <RecipeCard
                key={r.title}
                recipe={r}
                isFavorite={favorites.includes(r.title)}
                onToggleFav={() => toggleFav(r.title)}
              />
            ))}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
      <span className="mx-auto grid place-items-center h-14 w-14 rounded-2xl bg-gradient-warm shadow-warm">
        <ChefHat className="h-7 w-7 text-primary-foreground" />
      </span>
      <h3 className="mt-6 text-2xl">Suas receitas vão aparecer aqui</h3>
      <p className="mt-2 text-muted-foreground max-w-md mx-auto">
        Adicione ingredientes ou envie uma foto da sua geladeira. O Chef IA cuida do resto.
      </p>
    </div>
  );
}

function RecipeCard({
  recipe,
  isFavorite,
  onToggleFav,
}: {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFav: () => void;
}) {
  return (
    <article className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-soft hover:shadow-warm transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-[var(--herb)]/15 text-[var(--herb)] px-2 py-0.5 font-medium">
              {recipe.cuisine}
            </span>
            {recipe.tags?.slice(0, 2).map((t) => (
              <span key={t} className="rounded-full bg-secondary px-2 py-0.5">{t}</span>
            ))}
          </div>
          <h3 className="mt-2 text-2xl md:text-3xl">{recipe.title}</h3>
          <p className="mt-2 text-muted-foreground">{recipe.description}</p>
        </div>
        <button
          onClick={onToggleFav}
          className={`shrink-0 grid place-items-center h-10 w-10 rounded-full border border-border transition ${
            isFavorite ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-muted"
          }`}
          aria-label="Favoritar"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{recipe.time_minutes} min</span>
        <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{recipe.servings} porções</span>
        <span className="inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4" />{recipe.difficulty}</span>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Panel title="Você usa" items={recipe.ingredients_used} accent="herb" />
        <Panel
          title="Lista de compras"
          items={recipe.missing_ingredients.length ? recipe.missing_ingredients : ["Tudo o que precisa você já tem!"]}
          accent="spice"
          icon={<ShoppingBasket className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Passo a passo</h4>
        <ol className="mt-3 space-y-3">
          {recipe.steps.map((s, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="shrink-0 grid place-items-center h-7 w-7 rounded-full bg-gradient-warm text-primary-foreground text-xs font-medium">
                {idx + 1}
              </span>
              <p className="text-sm leading-relaxed pt-1">{s}</p>
            </li>
          ))}
        </ol>
      </div>

      {recipe.tip && (
        <div className="mt-6 flex gap-3 rounded-2xl bg-accent/50 border border-border p-4">
          <Lightbulb className="h-5 w-5 text-[var(--spice)] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground">Dica do Chef</p>
            <p className="text-sm mt-1">{recipe.tip}</p>
          </div>
        </div>
      )}
    </article>
  );
}

function Panel({
  title,
  items,
  accent,
  icon,
}: {
  title: string;
  items: string[];
  accent: "herb" | "spice";
  icon?: React.ReactNode;
}) {
  const color = accent === "herb" ? "var(--herb)" : "var(--spice)";
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <h4 className="text-sm font-medium flex items-center gap-1.5" style={{ color }}>
        {icon}
        {title}
      </h4>
      <ul className="mt-2 space-y-1 text-sm capitalize">
        {items.map((i) => (
          <li key={i} className="text-foreground/80">· {i}</li>
        ))}
      </ul>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
