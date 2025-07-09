'use server';
/**
 * @fileOverview An AI flow to add Markdown formatting to a text.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatMarkdownInputSchema = z.object({
  body: z.string().describe('The plain text body to be formatted.'),
});
export type FormatMarkdownInput = z.infer<typeof FormatMarkdownInputSchema>;

const FormatMarkdownOutputSchema = z.object({
  formattedBody: z.string().describe('The text with added Markdown formatting.'),
});
export type FormatMarkdownOutput = z.infer<typeof FormatMarkdownOutputSchema>;

export async function formatMarkdown(input: FormatMarkdownInput): Promise<FormatMarkdownOutput> {
  return formatMarkdownFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formatMarkdownPrompt',
  input: {schema: FormatMarkdownInputSchema},
  output: {schema: FormatMarkdownOutputSchema},
  prompt: `You are a text formatting expert. Your task is to take a piece of text and add appropriate Markdown formatting to improve its readability and structure.

- Add headings (#, ##) for different sections.
- Use bold (**) for important terms.
- Use italics (*) for emphasis.
- Create bulleted lists (-) for items.
- Use blockquotes (>) for citations or highlighted text.

Do NOT change the original wording, content, or language. Simply apply Markdown formatting to the existing text.

Original Text:
---
{{{body}}}
---
`,
});

const formatMarkdownFlow = ai.defineFlow(
  {
    name: 'formatMarkdownFlow',
    inputSchema: FormatMarkdownInputSchema,
    outputSchema: FormatMarkdownOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to format text from the AI.');
    }
    return output;
  }
);
