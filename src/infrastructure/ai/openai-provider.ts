import { AIProvider, AIMessage, AIOptions, AIResponse } from "./ai-provider";
import { env } from "../../shared/config/env";

interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface OpenAIChoice {
  message: {
    content: string | null;
    tool_calls?: { function: { name: string; arguments: string } }[];
  };
}

export class OpenAIProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.openai.com/v1/chat/completions";

  constructor() {
    if (!env.OPENAI_API_KEY) {
      throw new Error("AI_CONFIG_ERROR");
    }
    this.apiKey = env.OPENAI_API_KEY;
  }

  async chat(
    systemPrompt: string,
    messages: AIMessage[],
    options?: AIOptions,
  ): Promise<AIResponse> {
    const openaiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages,
    ];

    const body: Record<string, unknown> = {
      model: env.AI_MODEL || "gpt-4o-mini",
      messages: openaiMessages,
      temperature: options?.temperature ?? env.AI_TEMPERATURE,
      max_tokens: options?.maxTokens ?? env.AI_MAX_TOKENS,
    };

    if (options?.tools?.length) {
      body.tools = options.tools.map(
        (t): OpenAITool => ({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          },
        }),
      );
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("AI_PROVIDER_ERROR");
    }

    const data = (await response.json()) as { choices: OpenAIChoice[] };
    const choice = data.choices[0].message;

    return {
      content: choice.content ?? "",
      toolCalls: choice.tool_calls?.map((tc) => ({
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments),
      })),
    };
  }
}
