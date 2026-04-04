import { CampaignReport, LLMSummary } from '../domain/types';

export async function generateCampaignSummary(reports: CampaignReport[]): Promise<LLMSummary> {
    const systemPrompt = `
Eres un analista de marketing experto. Tu tarea es evaluar el rendimiento de campañas.
Reglas de salida:
1. Identifica y menciona las campañas en estado 'critical'.
2. Resume el estado de las campañas 'warning'.
3. Sugiere al menos una acción concreta.
4. DEBES responder ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "summary": "Tu resumen ejecutivo en texto aquí...",
  "criticalCampaignIds": ["id1", "id2"],
  "suggestedActions": [{ "campaignId": "id1", "actionToTake": "Pausar inmediatamente" }]
}
`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                max_tokens: 1000,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: JSON.stringify(reports) }
                ]
            })
        });

        const data = await response.json();
        if (!data.choices || data.choices.length === 0) {
            console.error("OpenRouter devolvió un error en vez de una respuesta:", JSON.stringify(data, null, 2));
            throw new Error("Estructura de respuesta inválida desde OpenRouter. Revisa tu API Key o saldo.");
        }
        let rawContent = data.choices[0].message.content;
        rawContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();

        const llmOutput = JSON.parse(rawContent);

        return {
            generatedAt: new Date(),
            model: "openrouter",
            summary: llmOutput.summary,
            criticalCampaignIds: llmOutput.criticalCampaignIds,
            suggestedActions: llmOutput.suggestedActions
        };
    } catch (error) {
        console.error("Error conectando con el LLM:", error);
        throw error;
    }
}