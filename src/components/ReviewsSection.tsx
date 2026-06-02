import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { toast } from "sonner";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
};

const SEED: Review[] = [
  {
    id: "seed-1",
    name: "Mariana S.",
    rating: 5,
    comment:
      "Tirei foto da geladeira meio vazia e o Chef IA me salvou no jantar de quarta. Receita incrível com 4 ingredientes!",
    date: "há 2 dias",
  },
  {
    id: "seed-2",
    name: "Rafael C.",
    rating: 5,
    comment:
      "Economizo no mercado e como melhor. Os filtros de culinária mediterrânea e japonesa são meus favoritos.",
    date: "há 1 semana",
  },
  {
    id: "seed-3",
    name: "Júlia P.",
    rating: 4,
    comment:
      "Diminuiu muito o desperdício aqui em casa. Adoro a dica do chef no final de cada receita.",
    date: "há 2 semanas",
  },
];

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>(SEED);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("chefia:reviews");
      if (stored) {
        const parsed: Review[] = JSON.parse(stored);
        setReviews([...parsed, ...SEED]);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast.error("Preencha seu nome e a avaliação.");
      return;
    }
    if (rating < 1) {
      toast.error("Escolha de 1 a 5 estrelas.");
      return;
    }
    const newReview: Review = {
      id: crypto.randomUUID(),
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: "agora",
    };
    try {
      const stored = localStorage.getItem("chefia:reviews");
      const parsed: Review[] = stored ? JSON.parse(stored) : [];
      const next = [newReview, ...parsed].slice(0, 50);
      localStorage.setItem("chefia:reviews", JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setReviews((r) => [newReview, ...r]);
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
              className="w-full rounded-full bg-gradient-warm text-primary-foreground py-3 text-sm font-medium shadow-warm hover:opacity-95"
            >
              Enviar avaliação
            </button>
          </div>
        </form>

        {/* LIST */}
        <div className="lg:col-span-7 space-y-4">
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
                    <p className="text-xs text-muted-foreground">{r.date}</p>
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
