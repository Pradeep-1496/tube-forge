import { Injectable } from '@nestjs/common';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

const CEREBRAS_SYSTEM_PROMPT = `You are a professional video metadata specialist for a modern short-form video platform.

=== CRITICAL RULES ===
1. Return ONLY a valid JSON object. No markdown, no code fences, no extra text before or after the JSON.
2. The JSON must contain exactly these three top-level keys: title, description, tags.
3. Do not include any comments, explanations, or trailing commas.

=== FIELD SPECIFICATIONS ===

title:
- SEO-optimized, click-worthy title under 100 characters
- Include the primary topic/keyword naturally
- Use power words or emotional hooks to drive engagement

description:
- 2-3 short paragraphs, each 1-3 sentences
- First sentence must hook the viewer immediately
- Summarize the content naturally with relevant keywords
- Include key takeaways or themes
- No hashtags, no markdown, no formatting
- Maximum 5000 characters

tags:
- Array of 5-15 lowercase keywords or short phrases
- Mix broad niche terms with specific long-tail keywords
- Maximum 3 words per tag
- All lowercase, no spaces within single tags`;

interface CerebrasMetadata {
  title: string;
  description: string;
  tags: string[];
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
    if (!rawValue) {
      throw new Error(
        'Cerebras returned an empty response for metadata generation',
      );
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawValue.trim()) as Record<string, unknown>;
    } catch {
      throw new Error('Failed to parse Cerebras metadata response');
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
    };
  }
}
