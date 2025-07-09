'use server';
/**
 * @fileOverview An AI flow to generate an article body from a title.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBodyInputSchema = z.object({
  title: z.string().describe('The article title to generate content from.'),
  userContext: z.string().optional().describe('Optional, user-provided keywords for additional context. Up to 5 words.'),
});
export type GenerateBodyInput = z.infer<typeof GenerateBodyInputSchema>;

const GenerateBodyOutputSchema = z.object({
  body: z.string().describe('The generated article body in Markdown format.'),
});
export type GenerateBodyOutput = z.infer<typeof GenerateBodyOutputSchema>;

export async function generateBody(input: GenerateBodyInput): Promise<GenerateBodyOutput> {
  return generateBodyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBodyPrompt',
  input: {schema: GenerateBodyInputSchema},
  output: {schema: GenerateBodyOutputSchema},
  prompt: `You are an expert content writer and SEO specialist. Your task is to write a compelling, well-structured, and engaging article body based on the provided title.

First, detect the language of the "Title". Your response in "body" MUST be in the same language.
The article should be formatted using Markdown for readability (headings, lists, bold text, etc.).

{{#if userContext}}
Consider these keywords provided by the user for additional context: "{{{userContext}}}"
{{/if}}

Title: "{{{title}}}"
`,
});

const generateBodyFlow = ai.defineFlow(
  {
    name: 'generateBodyFlow',
    inputSchema: GenerateBodyInputSchema,
    outputSchema: GenerateBodyOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate body from the AI.');
    }
    return output;
  }
);
