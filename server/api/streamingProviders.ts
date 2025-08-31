import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface StreamingOptions {
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export async function streamingOpenAIRequest(
  messages: any[],
  model: string = "gpt-4o",
  options: StreamingOptions
) {
  try {
    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.1,
      max_tokens: 4000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        options.onChunk(content);
      }
    }
    
    options.onComplete();
  } catch (error) {
    options.onError(error as Error);
  }
}

export async function streamingAnthropicRequest(
  messages: any[],
  system: string = "You are an expert intelligence evaluator.",
  model: string = "claude-3-5-sonnet-20241022",
  options: StreamingOptions
) {
  try {
    const stream = await anthropic.messages.create({
      model,
      max_tokens: 4000,
      temperature: 0.1,
      system,
      messages,
      stream: true,
    });

    let buffer = '';
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const content = chunk.delta.text;
        buffer += content;
        options.onChunk(content);
      }
    }
    
    options.onComplete();
  } catch (error) {
    options.onError(error as Error);
  }
}

export async function streamingDeepSeekRequest(
  messages: any[],
  model: string = "deepseek-chat",
  options: StreamingOptions
) {
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 4000,
        stream: true,
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              options.onChunk(content);
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
      
      buffer = lines[lines.length - 1];
    }
    
    options.onComplete();
  } catch (error) {
    options.onError(error as Error);
  }
}

export async function streamingPerplexityRequest(
  messages: any[],
  model: string = "sonar",
  options: StreamingOptions
) {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 4000,
        stream: true,
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              options.onChunk(content);
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
      
      buffer = lines[lines.length - 1];
    }
    
    options.onComplete();
  } catch (error) {
    options.onError(error as Error);
  }
}

export function getStreamingProvider(provider: string): any {
  switch (provider.toLowerCase()) {
    case 'openai':
      return streamingOpenAIRequest;
    case 'anthropic':
      return streamingAnthropicRequest;
    case 'deepseek':
      return streamingDeepSeekRequest;
    case 'perplexity':
      return streamingPerplexityRequest;
    default:
      return streamingDeepSeekRequest; // Default fallback
  }
}