'use server';
/**
 * @fileOverview A Genkit flow for analyzing prescriptions via OpenRouter.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzePrescriptionInputSchema = z.object({
  prescriptionText: z.string().describe('The extracted text from a prescription via OCR.'),
});
export type AnalyzePrescriptionInput = z.infer<typeof AnalyzePrescriptionInputSchema>;

const AnalyzePrescriptionOutputSchema = z.object({
  medicines: z.array(
    z.object({
      name: z.string().describe('The name of the medicine.'),
      treats: z.string().describe('What the medicine treats.'),
      sideEffects: z.array(z.string()).describe('List of common side effects.'),
      drugInteractions: z.array(z.string()).describe('Significant drug interactions.'),
      cautions: z.array(z.string()).describe('Important cautions or warnings.'),
    })
  ).describe('An array of identified medicines.'),
});
export type AnalyzePrescriptionOutput = z.infer<typeof AnalyzePrescriptionOutputSchema>;

export async function analyzePrescription(input: AnalyzePrescriptionInput): Promise<AnalyzePrescriptionOutput> {
  return analyzePrescriptionFlow(input);
}

const analyzePrescriptionFlow = ai.defineFlow(
  {
    name: 'analyzePrescriptionFlow',
    inputSchema: AnalyzePrescriptionInputSchema,
    outputSchema: AnalyzePrescriptionOutputSchema,
  },
  async (input) => {
    const prompt = `You are a medical assistant analyzing prescription text. Extract medicine details and return a JSON array of objects strictly matching the schema.

Prescription Text:
${input.prescriptionText}`;

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
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter Error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content) as AnalyzePrescriptionOutput;
  }
);
