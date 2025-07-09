
'use server';
/**
 * @fileOverview An AI flow to suggest improved, SEO-friendly titles for articles.
 *
 * - suggestTitle - A function that takes a title and suggests a better one.
 * - TitleSuggestionInput - The input type for the title suggestion flow.
 * - TitleSuggestionOutput - The return type for the title suggestion flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema for the prompt
const TitleSuggestionInputSchema = z.object({
  title: z.string().describe('The original article title written by the user.'),
  userContext: z.string().optional().describe('Optional, user-provided keywords for additional context. Up to 5 words.'),
});
export type TitleSuggestionInput = z.infer<typeof TitleSuggestionInputSchema>;

// Output schema for the prompt
const TitleSuggestionOutputSchema = z.object({
  suggestedTitle: z.string().describe('The improved, SEO-friendly title. It should be catchy and relevant.'),
});
export type TitleSuggestionOutput = z.infer<typeof TitleSuggestionOutputSchema>;


// The exported function that the client will call.
export async function suggestTitle(title: string, userContext?: string): Promise<TitleSuggestionOutput> {
    const input: TitleSuggestionInput = {
        title,
        userContext,
    };
    return suggestTitleFlow(input);
}


const prompt = ai.definePrompt({
  name: 'titleSuggesterPrompt',
  input: {schema: TitleSuggestionInputSchema},
  output: {schema: TitleSuggestionOutputSchema},
  prompt: `You are an expert SEO copywriter. Your task is to take a draft title for an article and make it better. The improved title should be catchy, engaging, and optimized for search engines.

First, detect the language of the "Original Title". Your response in "suggestedTitle" MUST be in the same language.

{{#if userContext}}
Consider these keywords provided by the user for additional context: "{{{userContext}}}"
{{/if}}

Based on this, improve the following title. Return only the improved title in the specified JSON format. Do not add any extra commentary or explanation.

Original Title: "{{{title}}}"
`,
});

const suggestTitleFlow = ai.defineFlow(
  {
    name: 'suggestTitleFlow',
    inputSchema: TitleSuggestionInputSchema,
    outputSchema: TitleSuggestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to get a suggestion from the AI.');
    }
    return output;
  }
);
