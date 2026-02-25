'use server';
/**
 * @fileOverview A Genkit flow for analyzing medical bills via OpenRouter.
 * Updated to use Indian Rupee (₹) and a specific fair price reference.
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
    billedPrice: z.number().describe('The price billed for this item in ₹.'),
    fairPriceEstimate: z.number().describe('An estimated fair price for this item in ₹.'),
    recommendation: z.string().describe('Specific recommendation for this item.'),
  })).describe('A list of items identified as potentially overpriced.'),
  totalPossibleSavings: z.number().describe('The total estimated savings in ₹.'),
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
      const fairPriceReference = `
      REFERENCE FAIR PRICE LIST (in ₹):
      - Bandage: 144 - 216
      - Cotton Roll: 80 - 120
      - Face Mask: 24 - 36
      - Gauze Piece: 32 - 48
      - IV Cannula: 200 - 300
      - IV Set: 200 - 300
      - Nasal Cannula: 240 - 360
      - Needle: 12 - 18
      - Oxygen Mask: 280 - 420
      - Shoe Cover: 24 - 36
      - Sterile Gloves: 120 - 180
      - Suction Catheter: 200 - 300
      - Surgical Blade: 48 - 72
      - Surgical Cap: 24 - 36
      - Syringe: 24 - 36
      - Urine Bag: 360 - 540
      - 2D Echo: 2400 - 3600
      - CT Scan: 4800 - 7200
      - Doppler Study: 3200 - 4800
      - ECG: 320 - 480
      - MRI: 9600 - 14400
      - Ultrasound: 1200 - 1800
      - X-ray: 480 - 720
      - Blood Sugar: 120 - 180
      - CBC: 320 - 480
      - Culture & Sensitivity: 1600 - 2400
      - ESR: 144 - 216
      - KFT: 880 - 1320
      - LFT: 960 - 1440
      - Lipid Profile: 800 - 1200
      - Stool Exam: 240 - 360
      - Thyroid Profile: 800 - 1200
      - Urine Routine: 200 - 300
      - Antibiotics (High): 400 - 600
      - Antibiotics (Low): 24 - 36
      - Emergency Meds: 480 - 720
      - Gloves Vinyl: 120 - 180
      - IV Fluid: 200 - 300
      - Painkillers: 160 - 240
      - Paracetamol: 6 - 10
      - Catheter: 800 - 1200
      - Dressing (Major): 960 - 1440
      - Dressing (Minor): 320 - 480
      - IV Line Insertion: 480 - 720
      - Injection: 160 - 240
      - Minor Procedure: 1600 - 2400
      - Nebulization: 280 - 420
      - OT Consultation: 4000 - 6000
      `;

      const prompt = `You are an expert medical bill analyst specialized in Indian healthcare costs. 
      Review the medical bill OCR text and identify overpriced items compared to the provided fair price reference. 
      Use Indian Rupee (₹) for all currency values.
      
      ${fairPriceReference}

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

      Return ONLY the JSON object. 
      
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

      // Extract JSON from potential markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not find valid JSON in AI response.");
      }
      
      const rawData = JSON.parse(jsonMatch[0]);

      // Normalization layer
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
