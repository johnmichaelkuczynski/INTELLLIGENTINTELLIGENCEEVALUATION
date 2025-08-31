import { LLMProvider } from '../lib/types';

interface StreamingRewriteRequest {
  text: string;
  customInstructions?: string;
  provider: LLMProvider;
  onChunk: (chunk: string, type: 'originalScore' | 'rewriteChunk' | 'finalScore' | 'complete') => void;
}

export async function performStreamingIntelligentRewrite(request: StreamingRewriteRequest): Promise<void> {
  const { text, customInstructions, provider, onChunk } = request;
  
  console.log(`EXECUTING INTELLIGENT REWRITE WITH ${provider.toUpperCase()}`);
  
  const rewritePrompt = `Rewrite the following text to be more intelligent, sophisticated, and well-reasoned. Make it sound like it was written by someone with deep expertise and brilliant analytical thinking.

${customInstructions ? `Additional instructions: ${customInstructions}\n\n` : ''}

Text to rewrite:
${text}

Rewritten version:`;

  try {
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: rewritePrompt }],
          stream: true,
          temperature: 0.1,
          max_tokens: 4000
        }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                onChunk(content, 'rewriteChunk');
              }
            } catch (e) {}
          }
        }
      }
    } else if (provider === 'anthropic') {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      
      const stream = await anthropic.messages.stream({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [{ role: "user", content: rewritePrompt }],
        temperature: 0.1
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const content = chunk.delta.text;
          if (content) {
            onChunk(content, 'rewriteChunk');
          }
        }
      }
    } else {
      throw new Error(`Provider ${provider} not supported`);
    }

    onChunk('complete', 'complete');

  } catch (error) {
    console.error(`Error during rewrite with ${provider}:`, error);
    onChunk(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'complete');
  }
}