
import { AIProvider } from './ai-provider';
import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { DeepSeekProvider } from './deepseek-provider';
import { env } from '../../shared/config/env';

export function createAIProvider(): AIProvider {
  switch (env.AI_PROVIDER) {
    case 'openai':
      return new OpenAIProvider();
    case 'anthropic':
      return new AnthropicProvider();
    case 'deepseek':
      return new DeepSeekProvider();
    default:
      throw new Error('AI_CONFIG_ERROR');
  }
}

export type { AIProvider, AIMessage, AITool, AIToolCall, AIOptions, AIResponse } from './ai-provider';
