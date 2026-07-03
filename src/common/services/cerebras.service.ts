import { Injectable } from '@nestjs/common';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

const CEREBRAS_SYSTEM_PROMPT = `You are an elite YouTube Shorts growth strategist.

Analyze the provided content and generate metadata designed to maximize:
- Click Through Rate (CTR)
- Viewer curiosity
- Watch retention
- Discoverability

=== CRITICAL RULES ===
1. Return ONLY a valid JSON object. No markdown, no code fences, no extra text before or after the JSON.
2. The JSON must contain exactly these four top-level keys: title, description, tags, category_id.
3. Do not include any comments, explanations, or trailing commas.

=== FIELD SPECIFICATIONS ===

title:
- SEO-optimized, click-worthy title under 100 characters for peak mobile visibility.
- Include 1-2 high-energy emojis strategically placed to draw the eye (e.g., 🚨, 🛑, 💡, 🤯).
- Include the primary topic/keyword naturally
- Use power words or emotional hooks to drive engagement

description:
- First sentence must hook the viewer immediately
- Summarize the content naturally with relevant keywords
- THE HOOK: A compelling, curiosity-driven first sentence using emojis to grab attention.
- VALUE SUMMARY: A brief 2-3 sentence breakdown of the video's core value proposition and key takeaways, naturally woven with semantic keywords.
- CALL TO ACTION (CTA): A friendly push to subscribe, comment, or watch a related video (e.g., "💬 Drop your thoughts below!").
- THE HASHTAG BLOCK: Exactly 3 to 5 highly relevant, high-traffic hashtags at the very bottom (e.g., #Niche #Topic #Shorts). 
- THE HASHTAG BLOCK: Exactly 3 to 5 highly relevant, high-traffic hashtags at the very bottom (e.g., #Niche #Topic #Shorts).
- Maximum 5000 characters

tags:
- Array of 10-15 lowercase keywords or short phrases
- Mix broad niche terms with specific long-tail keywords
- Maximum 3 words per tag
- All lowercase, no spaces within single tags

category_id:
- A YouTube category ID from 1 to 44 that best matches the content topic
- Return only the numeric ID as a string
- Choose the most relevant category for the content


`;

interface CerebrasMetadata {
  title: string;
  description: string;
  tags: string[];
  category_id?: string;
}

@Injectable()
export class CerebrasService {
  private readonly client = new Cerebras({
    apiKey: process.env['CEREBRAS_API_KEY'],
  });
  private readonly model = 'gpt-oss-120b';

  async generateMetadata(
    title: string,
    content: string,
  ): Promise<CerebrasMetadata> {
    const MAX_ATTEMPTS = 3;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const completion = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: CEREBRAS_SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Generate optimized video metadata for the following content:\n\nTitle: ${title}\n\nContent:\n${content}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 1024,
        });

        const firstChoice = completion.choices?.[0] as
          | {
              message?: { content?: string };
            }
          | undefined;
        const rawValue = firstChoice?.message?.content;
        if (rawValue) {
          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(rawValue.trim()) as Record<string, unknown>;
          } catch {
            lastError = new Error('Failed to parse Cerebras metadata response');
            if (attempt < MAX_ATTEMPTS) {
              await this.delay(1000);
              continue;
            }
            throw lastError;
          }

          if (
            typeof parsed.title !== 'string' ||
            typeof parsed.description !== 'string' ||
            !Array.isArray(parsed.tags)
          ) {
            return { title, description: '', tags: [] };
          }

          const tags = parsed.tags.filter(
            (item: unknown): item is string => typeof item === 'string',
          );

          return {
            title: parsed.title,
            description: parsed.description,
            tags,
            category_id:
              typeof parsed.category_id === 'string'
                ? parsed.category_id
                : undefined,
          };
        }

        lastError = new Error(
          'Cerebras returned an empty response for metadata generation',
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }

      if (attempt < MAX_ATTEMPTS) {
        await this.delay(1000);
      }
    }

    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
