
'use server';
/**
 * @fileOverview A Genkit flow for analyzing medical bills.
 *
 * - analyzeMedicalBill - A function that handles the medical bill analysis process.
 * - AnalyzeMedicalBillInput - The input type for the analyzeMedicalBill function.
 * - AnalyzeMedicalBillOutput - The return type for the analyzeMedicalBill function.
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
    recommendation: z.string().describe('Specific recommendation for this item, e.g., "Negotiate for lower price based on fair estimate."'),
  })).describe('A list of items identified as potentially overpriced.'),
  totalPossibleSavings: z.number().describe('The total estimated savings if all overpriced items are negotiated to their fair price estimates.'),
  generalRecommendations: z.array(z.string()).describe('General recommendations for the user regarding their medical bill.'),
});
export type AnalyzeMedicalBillOutput = z.infer<typeof AnalyzeMedicalBillOutputSchema>;

export async function analyzeMedicalBill(input: AnalyzeMedicalBillInput): Promise<AnalyzeMedicalBillOutput> {
  return analyzeMedicalBillFlow(input);
}

const analyzeMedicalBillPrompt = ai.definePrompt({
  name: 'analyzeMedicalBillPrompt',
  input: { schema: AnalyzeMedicalBillInputSchema },
  output: { schema: AnalyzeMedicalBillOutputSchema },
  prompt: `You are an expert medical bill analyst. Your task is to carefully review the provided OCR text from a medical bill.
Identify all medical services and items, their billed prices, and determine if any are potentially overpriced based on common market rates and typical charges.
For any item you identify as potentially overpriced, provide a realistic fair price estimate.
Calculate the total possible savings if all identified overpriced items were adjusted to their fair price estimates.
Finally, provide general recommendations to the user about managing and disputing medical bills.

Be precise with monetary values and ensure they are numbers. If a price is not clearly visible or estimable, use 0. Focus on accuracy and actionable advice.

Medical Bill OCR Text:
{{{ocrText}}}`,
});

const analyzeMedicalBillFlow = ai.defineFlow(
  {
    name: 'analyzeMedicalBillFlow',
    inputSchema: AnalyzeMedicalBillInputSchema,
    outputSchema: AnalyzeMedicalBillOutputSchema,
  },
  async (input) => {
    // Using OpenRouter via the openai plugin
    const { output } = await analyzeMedicalBillPrompt(input, {
      model: 'openai/google/gemini-2.0-flash-001',
    });
    return output!;
  }
);
