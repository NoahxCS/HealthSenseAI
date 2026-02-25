'use server';
/**
 * @fileOverview A Genkit flow for analyzing medical bills via OpenRouter.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeMedicalBillInputSchema = z.object({
  ocrText: z.string().describe('The extracted text from the medical bill via OCR.'),
});
export type AnalyzeMedicalBillInput = z.infer<typeof AnalyzeMedicalBillInputSchema>;

const AnalyzeMedicalBillOutputSchema = z.object({
  overpricedItems: z.array(z.object({
    item: z.string().describe('Name of the medical service or item.'),
    billedPrice: z.number().describe('The price billed for this item.'),
    fairPriceEstimate: z.number().describe('An estimated fair price for this item.'),
    recommendation: z.string().describe('Specific recommendation for this item.'),
  })).describe('A list of items identified as potentially overpriced.'),
  totalPossibleSavings: z.number().describe('The total estimated savings.'),
  generalRecommendations: z.array(z.string()).describe('General recommendations.'),
});
export type AnalyzeMedicalBillOutput = z.infer<typeof AnalyzeMedicalBillOutputSchema>;

export async function analyzeMedicalBill(input: AnalyzeMedicalBillInput): Promise<AnalyzeMedicalBillOutput> {
  return analyzeMedicalBillFlow(input);
}

const analyzeMedicalBillFlow = ai.defineFlow(
  {
    name: 'analyzeMedicalBillFlow',
    inputSchema: AnalyzeMedicalBillInputSchema,
    outputSchema: AnalyzeMedicalBillOutputSchema,
  },
  async (input) => {
    try {
      const prompt = `You are an expert medical bill analyst. Review the following OCR text and identify overpriced items compared to market rates. 
      
      CRITICAL: You MUST return a JSON object that strictly follows this schema:
      {
        "overpricedItems": [
          {
            "item": "string",
            "billedPrice": number,
            "fairPriceEstimate": number,
            "recommendation": "string"
          }
        ],
        "totalPossibleSavings": number,
        "generalRecommendations": ["string"]
      }

      Return ONLY the JSON object. Do not include any conversational text or markdown formatting except for code blocks if necessary.
      
      Medical Bill OCR Text:
      ${input.ocrText}`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://genkit.dev",
          "X-Title": "HealthSense AI"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: prompt }],
          // REMOVED response_format: { type: "json_object" } because some free models don't support it
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("Empty response received from AI model.");
      }

      // Robust JSON extraction: look for the first '{' and the last '}'
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not find valid JSON in AI response.");
      }
      
      const rawData = JSON.parse(jsonMatch[0]);

      // NORMALIZATION LAYER: Map common AI hallucinations to the expected schema
      const overpricedItems = (rawData.overpricedItems || rawData.overpriced_items || []).map((item: any) => ({
        item: item.item || item.Item || item.name || "Unknown Item",
        billedPrice: Number(item.billedPrice || item.billed_price || item.Rate || item.price || 0),
        fairPriceEstimate: Number(item.fairPriceEstimate || item.fair_price_estimate || item.fair_price || 0),
        recommendation: item.recommendation || item.Recommendation || "Compare with local market rates.",
      }));

      const normalizedData: AnalyzeMedicalBillOutput = {
        overpricedItems,
        totalPossibleSavings: Number(rawData.totalPossibleSavings || rawData.total_possible_savings || 0),
        generalRecommendations: rawData.generalRecommendations || rawData.general_recommendations || ["Review your bill for duplicate charges."],
      };

      return normalizedData;
    } catch (error: any) {
      console.error("Medical Bill Analysis Flow Error:", error);
      throw new Error(`Failed to analyze medical bill: ${error.message}`);
    }
  }
);