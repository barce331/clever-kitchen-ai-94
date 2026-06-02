import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callGateway(body: unknown) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY ausente");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    if (res.status === 429) throw new Error("Muitas requisições. Tente novamente em instantes.");
    if (res.status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos no workspace.");
    throw new Error(`Gateway IA: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

/** Detectar ingredientes de uma imagem (data URL base64) */
export const detectIngredients = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      imageDataUrl: z.string().min(20).max(8_000_000),
    }).parse,
  )
  .handler(async ({ data }) => {
    const json = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente culinário. Identifique apenas ingredientes alimentícios visíveis na imagem (em português). Não invente. Seja específico (ex: 'tomate cereja' em vez de 'fruta').",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Liste os ingredientes que você vê nesta foto." },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "report_ingredients",
            description: "Reporta a lista de ingredientes detectados",
            parameters: {
              type: "object",
              properties: {
                ingredients: {
                  type: "array",
                  items: { type: "string" },
                  description: "Nomes simples dos ingredientes em português",
                },
              },
              required: ["ingredients"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "report_ingredients" } },
    });
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    const args = call ? JSON.parse(call.function.arguments) : { ingredients: [] };
    const ingredients: string[] = (args.ingredients || []).map((s: string) => s.trim()).filter(Boolean);
    return { ingredients };
  });

/** Gerar receitas a partir de ingredientes + filtros */
export const generateRecipes = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      ingredients: z.array(z.string().min(1).max(60)).min(1).max(40),
      filters: z.array(z.string().max(40)).max(10).default([]),
      cuisine: z.string().max(40).optional(),
      count: z.number().int().min(1).max(4).default(3),
    }).parse,
  )
  .handler(async ({ data }) => {
    const filtersText = data.filters.length ? `Restrições: ${data.filters.join(", ")}.` : "";
    const cuisineText = data.cuisine ? `Estilo culinário: ${data.cuisine}.` : "";
    const json = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "Você é o Chef IA, um chef criativo que cria receitas práticas usando o que o usuário tem em casa. Priorize aproveitar ao máximo os ingredientes listados. Pode assumir temperos básicos (sal, pimenta, óleo, água). Liste ingredientes faltantes separadamente. Responda em português brasileiro.",
        },
        {
          role: "user",
          content: `Ingredientes que tenho: ${data.ingredients.join(", ")}. ${filtersText} ${cuisineText} Gere ${data.count} receitas criativas e viáveis.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_recipes",
            description: "Retorna receitas estruturadas",
            parameters: {
              type: "object",
              properties: {
                recipes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string", description: "1-2 frases apetitosas" },
                      cuisine: { type: "string" },
                      time_minutes: { type: "number" },
                      difficulty: { type: "string", enum: ["Fácil", "Médio", "Difícil"] },
                      servings: { type: "number" },
                      tags: { type: "array", items: { type: "string" } },
                      ingredients_used: { type: "array", items: { type: "string" } },
                      missing_ingredients: { type: "array", items: { type: "string" } },
                      steps: { type: "array", items: { type: "string" }, description: "Passo a passo claro" },
                      tip: { type: "string", description: "Dica do chef" },
                    },
                    required: [
                      "title",
                      "description",
                      "cuisine",
                      "time_minutes",
                      "difficulty",
                      "servings",
                      "ingredients_used",
                      "missing_ingredients",
                      "steps",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["recipes"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "return_recipes" } },
    });
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    const args = call ? JSON.parse(call.function.arguments) : { recipes: [] };
    return args as {
      recipes: Array<{
        title: string;
        description: string;
        cuisine: string;
        time_minutes: number;
        difficulty: string;
        servings: number;
        tags?: string[];
        ingredients_used: string[];
        missing_ingredients: string[];
        steps: string[];
        tip?: string;
      }>;
    };
  });
