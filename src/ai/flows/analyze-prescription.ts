
'use server';
/**
 * @fileOverview This file implements a Genkit flow for analyzing prescription text.
 *
 * - analyzePrescription - A function that handles the prescription analysis process.
 * - AnalyzePrescriptionInput - The input type for the analyze prescription function.
 * - AnalyzePrescriptionOutput - The return type for the analyze prescription function.
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
      treats: z.string().describe('What the medicine treats or its primary use.'),
      sideEffects: z.array(z.string()).describe('A list of common or important side effects.'),
      drugInteractions: z.array(z.string()).describe('A list of significant drug interactions.'),
      cautions: z.array(z.string()).describe('A list of important cautions or warnings for the medicine.'),
    })
  ).describe('An array of identified medicines with their detailed analysis.'),
});
export type AnalyzePrescriptionOutput = z.infer<typeof AnalyzePrescriptionOutputSchema>;

export async function analyzePrescription(input: AnalyzePrescriptionInput): Promise<AnalyzePrescriptionOutput> {
  return analyzePrescriptionFlow(input);
}

const analyzePrescriptionPrompt = ai.definePrompt({
  name: 'analyzePrescriptionPrompt',
  input: { schema: AnalyzePrescriptionInputSchema },
  output: { schema: AnalyzePrescriptionOutputSchema },
  prompt: `You are a helpful medical assistant specializing in analyzing prescription information.
Your task is to extract detailed information about each medicine mentioned in the provided text.
For each medicine, identify its name, what it treats, its potential side effects, any significant drug interactions, and important cautions or warnings.

Here is the prescription text:
---
{{{prescriptionText}}}
---

Extract the information and format it as a JSON array of medicine objects, strictly following the provided schema. If a piece of information is not present or cannot be determined, return an empty string or empty array for that field. Focus only on the medical information and do not include any conversational text or explanations outside the JSON.`,
});

const analyzePrescriptionFlow = ai.defineFlow(
  {
    name: 'analyzePrescriptionFlow',
    inputSchema: AnalyzePrescriptionInputSchema,
    outputSchema: AnalyzePrescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await analyzePrescriptionPrompt(input, {
      model: 'googleai/gemini-2.0-flash-001',
    });
    return output!;
  }
);
