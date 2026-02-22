export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AITool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AIToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  tools?: AITool[];
}

export interface AIResponse {
  content: string;
  toolCalls?: AIToolCall[];
}

export interface AIProvider {
  chat(
    systemPrompt: string,
    messages: AIMessage[],
    options?: AIOptions,
  ): Promise<AIResponse>;
}
