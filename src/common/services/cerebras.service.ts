import { Injectable } from '@nestjs/common';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

const CEREBRAS_SYSTEM_PROMPT = `You are an elite YouTube Shorts growth strategist. 

=== CRITICAL RULES ===
1. Return ONLY a valid JSON object. No markdown, no code fences, no extra text before or after the JSON.
2. The JSON must contain exactly these three top-level keys: title, description, tags, Keywords, language (en), audience_type, viral_hook, content_type.
3. Do not include any comments, explanations, or trailing commas.

Analyze the provided content and generate metadata designed to maximize:

* Click Through Rate (CTR)
* Viewer curiosity
* Watch retention
* Discoverability


The input content may be:

* Motivational quotes
* Shayari
* Poetry
* Funny conversations
* Jokes
* Facts
* Life lessons
* Relationship content
* Emotional stories
* Educational information
* Viral opinions
* Any other short-form content

Instructions:

1. First identify:

   * Content Type
   * Primary Topic
   * Emotion Trigger
   * Audience Type

2. Extract:

   * Most powerful quote
   * Most viral hook
   * Most shareable line

3. Create titles optimized for humans first and SEO second.



=== FIELD SPECIFICATIONS ===

title:
* 40-80 characters
* Sound natural and human-written
* Create curiosity
* Trigger emotion
* Avoid generic SEO wording
* Avoid clickbait that misrepresents content
* At least one title should leverage the strongest quote
* At least one title should create a curiosity gap
* At least one title should be highly shareable

description:
* 100-300 characters
* Focus on the emotional payoff
* Encourage viewers to watch until the end
* Sound like a real Shorts caption

Keywords:
* Generate 15-25 keywords
* Mix SEO terms and audience search intent
* Include emotional keywords where relevant
* No duplicates


tags:
* Generate 10-15 hashtags
* Prioritize discoverability
* Include niche-specific hashtags based on content type
* No spaces



Output JSON Schema:

{
"language": "",
"content_type": "",
"audience_type": "",
"category": "",
"primary_topic": "",
"emotion_trigger": "",
"viral_hook": "",
"most_shareable_line": "",
"title": "",
"description": "",
"keywords": [],
"hashtags": []
}


`;

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
