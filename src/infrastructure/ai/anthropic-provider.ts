import { AIProvider, AIMessage, AIOptions, AIResponse } from './ai-provider';
import { env } from '../../shared/config/env';

interface AnthropicTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

interface AnthropicBlock {
  type: 'text' | 'tool_use';
  text?: string;
  name?: string;
  input?: Record<string, unknown>;
}

export class AnthropicProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error('AI_CONFIG_ERROR');
    }
    this.apiKey = env.ANTHROPIC_API_KEY;
  }

  async chat(systemPrompt: string, messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
    const body: Record<string, unknown> = {
      model: env.AI_MODEL || 'claude-sonnet-4-6',
      max_tokens: options?.maxTokens ?? env.AI_MAX_TOKENS,
      temperature: options?.temperature ?? env.AI_TEMPERATURE,
      system: systemPrompt,
      messages,
    };

    if (options?.tools?.length) {
      body.tools = options.tools.map((t): AnthropicTool => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      }));
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('AI_PROVIDER_ERROR');
    }

    const data = (await response.json()) as { content: AnthropicBlock[] };

    const textContent = data.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const toolCalls = data.content
      .filter((b) => b.type === 'tool_use')
      .map((b) => ({ name: b.name!, arguments: b.input! }));

    return {
      content: textContent,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }
}
