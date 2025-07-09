'use server';
/**
 * @fileOverview An AI flow to improve an existing article body.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveBodyInputSchema = z.object({
  body: z.string().describe('The original article body written by the user.'),
  userContext: z.string().optional().describe('Optional, user-provided keywords for additional context. Up to 5 words.'),
});
export type ImproveBodyInput = z.infer<typeof ImproveBodyInputSchema>;

const ImproveBodyOutputSchema = z.object({
  improvedBody: z.string().describe('The improved article body, with better engagement and structure.'),
});
export type ImproveBodyOutput = z.infer<typeof ImproveBodyOutputSchema>;

export async function improveBody(input: ImproveBodyInput): Promise<ImproveBodyOutput> {
  return improveBodyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveBodyPrompt',
  input: {schema: ImproveBodyInputSchema},
  output: {schema: ImproveBodyOutputSchema},
  prompt: `You are an expert copy editor. Your task is to take an existing article body and improve it. Make it more engaging, clear, and well-structured. Correct any grammatical errors or awkward phrasing, but preserve the original intent, information, and Markdown formatting.

First, detect the language of the original text. Your improved version MUST be in the same language.

{{#if userContext}}
Consider these keywords provided by the user for additional context: "{{{userContext}}}"
{{/if}}

Original Text:
---
{{{body}}}
---
`,
});

const improveBodyFlow = ai.defineFlow(
  {
    name: 'improveBodyFlow',
    inputSchema: ImproveBodyInputSchema,
    outputSchema: ImproveBodyOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to get an improvement from the AI.');
    }
    return output;
  }
);
