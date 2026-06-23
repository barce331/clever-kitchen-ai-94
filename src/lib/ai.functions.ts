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
            "Você é o Chef IA, um chef profissional brasileiro. Crie receitas COMPLETAS e DETALHADAS, no padrão de grandes sites de culinária (Panelinha, Tudogostoso, NYT Cooking). Regras obrigatórias:\n" +
            "1) TODOS os ingredientes DEVEM ter QUANTIDADE e UNIDADE em medidas usadas no Brasil (g, kg, ml, L, xícara (chá), colher (sopa), colher (chá), unidade, dente, fatia, pitada, a gosto). Nunca cite um ingrediente sem quantidade.\n" +
            "2) O modo de preparo deve ter PASSOS LONGOS, ESPECÍFICOS e DIDÁTICOS — descreva temperatura (ex: fogo médio-alto), tempo de cada etapa, ponto visual (ex: 'até dourar nas bordas, ~4 min'), técnica e tamanhos de corte. Cada passo deve ter pelo menos 2 frases completas.\n" +
            "3) Calcule calorias aproximadas POR PORÇÃO de forma realista.\n" +
            "4) Forneça sugestões de substituição para os ingredientes principais (ex: 'creme de leite → iogurte natural integral').\n" +
            "5) Você pode assumir temperos básicos disponíveis (sal, pimenta-do-reino, óleo, água) e listá-los com quantidade. Marque como faltantes apenas o que o usuário realmente não tem.\n" +
            "6) Responda 100% em português brasileiro.",
        },
        {
          role: "user",
          content: `Ingredientes que tenho em casa: ${data.ingredients.join(", ")}. ${filtersText} ${cuisineText} Gere ${data.count} receitas criativas, viáveis e bem detalhadas seguindo TODAS as regras.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "return_recipes",
            description: "Retorna receitas profissionais estruturadas",
            parameters: {
              type: "object",
              properties: {
                recipes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string", description: "2-3 frases apetitosas" },
                      cuisine: { type: "string" },
                      time_minutes: { type: "number", description: "Tempo total em minutos" },
                      difficulty: { type: "string", enum: ["Fácil", "Médio", "Difícil"] },
                      servings: { type: "number" },
                      calories_per_serving: { type: "number", description: "Calorias aproximadas por porção (kcal)" },
                      tags: { type: "array", items: { type: "string" } },
                      ingredients_used: {
                        type: "array",
                        description: "Ingredientes COM quantidade e unidade",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            quantity: { type: "string", description: "Quantidade como string (ex: '200', '1/2', 'a gosto')" },
                            unit: { type: "string", description: "Unidade (g, ml, xícara (chá), colher (sopa), unidade, dente, pitada, a gosto)" },
                            notes: { type: "string", description: "Preparo prévio opcional (ex: 'picado', 'em cubos')" },
                          },
                          required: ["name", "quantity", "unit"],
                          additionalProperties: false,
                        },
                      },
                      missing_ingredients: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            quantity: { type: "string" },
                            unit: { type: "string" },
                            notes: { type: "string" },
                          },
                          required: ["name", "quantity", "unit"],
                          additionalProperties: false,
                        },
                      },
                      steps: {
                        type: "array",
                        description: "Passo a passo detalhado",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string", description: "Título curto da etapa" },
                            description: { type: "string", description: "Instrução completa, 2+ frases, com tempo, temperatura e ponto visual" },
                          },
                          required: ["title", "description"],
                          additionalProperties: false,
                        },
                      },
                      tip: { type: "string", description: "Dica do chef" },
                      substitutions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            ingredient: { type: "string" },
                            substitute: { type: "string" },
                          },
                          required: ["ingredient", "substitute"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: [
                      "title",
                      "description",
                      "cuisine",
                      "time_minutes",
                      "difficulty",
                      "servings",
                      "calories_per_serving",
                      "ingredients_used",
                      "missing_ingredients",
                      "steps",
                      "substitutions",
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
        calories_per_serving: number;
        tags?: string[];
        ingredients_used: Array<{ name: string; quantity: string; unit: string; notes?: string }>;
        missing_ingredients: Array<{ name: string; quantity: string; unit: string; notes?: string }>;
        steps: Array<{ title: string; description: string }>;
        tip?: string;
        substitutions: Array<{ ingredient: string; substitute: string }>;
      }>;
    };
  });
