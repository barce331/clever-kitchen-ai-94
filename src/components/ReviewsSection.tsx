import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
};

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d} dia${d > 1 ? "s" : ""}`;
  const w = Math.floor(d / 7);
  if (w < 5) return `há ${w} semana${w > 1 ? "s" : ""}`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchReviews() {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("id, name, comment, rating, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      console.error("Erro ao buscar avaliações:", error);
      toast.error("Não foi possível carregar as avaliações.");
    } else {
      setReviews(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast.error("Preencha seu nome e a avaliação.");
      return;
    }
    if (rating < 1) {
      toast.error("Escolha de 1 a 5 estrelas.");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        name: name.trim().slice(0, 60),
        comment: comment.trim().slice(0, 500),
        rating,
      })
      .select("id, name, comment, rating, created_at")
      .single();
    setSubmitting(false);

    if (error) {
      console.error("Erro ao salvar avaliação:", error);
      toast.error("Não foi possível enviar sua avaliação. Tente novamente.");
      return;
    }

    if (data) setReviews((r) => [data, ...r]);
    setName("");
    setComment("");
    setRating(0);
    toast.success("Obrigado pela sua avaliação!");
  }

  const avg =
    reviews.reduce((s, r) => s + r.rating, 0) / Math.max(reviews.length, 1);

  return (
    <section id="avaliacoes" className="mx-auto max-w-7xl px-6 py-20">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-widest text-[var(--spice)] font-medium">
          Avaliações
        </p>
        <h2 className="mt-3 text-4xl md:text-5xl">O que dizem por aí.</h2>
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-5 w-5 ${
                  n <= Math.round(avg)
                    ? "fill-[var(--spice)] text-[var(--spice)]"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <span>
            <span className="font-display text-foreground text-lg">
              {avg.toFixed(1)}
            </span>{" "}
            · {reviews.length} avaliações
          </span>
        </div>
      </div>

      <div className="mt-12 grid lg:grid-cols-12 gap-8">
        {/* FORM */}
        <form
          onSubmit={submit}
          className="lg:col-span-5 rounded-3xl border border-border bg-card p-8 shadow-soft h-fit"
        >
          <h3 className="text-2xl">Deixe sua avaliação</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Sua opinião ajuda outros cozinheiros a descobrir o Chef IA.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
                Sua nota
              </label>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className="p-1"
                    aria-label={`${n} estrelas`}
                  >
                    <Star
                      className={`h-7 w-7 transition ${
                        n <= (hover || rating)
                          ? "fill-[var(--spice)] text-[var(--spice)]"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
                Seu nome
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como podemos te chamar?"
                maxLength={60}
                className="mt-2 w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
                Comentário
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte como o Chef IA te ajudou na cozinha..."
                rows={4}
                maxLength={500}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-warm text-primary-foreground py-3 text-sm font-medium shadow-warm hover:opacity-95 disabled:opacity-60"
            >
              {submitting ? "Enviando..." : "Enviar avaliação"}
            </button>
          </div>
        </form>

        {/* LIST */}
        <div className="lg:col-span-7 space-y-4">
          {loading && (
            <p className="text-sm text-muted-foreground">Carregando avaliações...</p>
          )}
          {!loading && reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Seja o primeiro a avaliar o Chef IA!
            </p>
          )}
          {reviews.map((r) => (
            <article
              key={r.id}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center h-11 w-11 rounded-full bg-gradient-warm text-primary-foreground font-display text-lg">
                    {r.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(r.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${
                        n <= r.rating
                          ? "fill-[var(--spice)] text-[var(--spice)]"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Quote className="h-5 w-5 text-[var(--herb)] shrink-0" />
                <p className="text-sm leading-relaxed text-foreground/85">
                  {r.comment}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
