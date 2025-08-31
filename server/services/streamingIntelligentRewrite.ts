import { executeFourPhaseProtocol } from './fourPhaseProtocol';

type LLMProvider = 'openai' | 'anthropic' | 'perplexity' | 'deepseek';

interface StreamingRewriteRequest {
  text: string;
  customInstructions?: string;
  provider: LLMProvider;
  onChunk: (chunk: string, type: 'originalScore' | 'rewriteChunk' | 'finalScore' | 'complete') => void;
}

export async function performStreamingIntelligentRewrite(request: StreamingRewriteRequest): Promise<void> {
  const { text, customInstructions, provider, onChunk } = request;
  
  console.log(`Starting REAL-TIME streaming rewrite with ${provider}`);
  
  onChunk('Starting rewrite...', 'originalScore');
  
  // Create rewrite instructions
  const defaultInstructions = `You are rewriting text to score 98-100/100 on a sophisticated 4-phase intelligence evaluation. This evaluation specifically looks for:

CRITICAL SUCCESS FACTORS (what scores 95-100):
1. NOVEL ABSTRACTION: Introduce genuinely new conceptual distinctions or frameworks that weren't obvious before
2. INFERENTIAL CONTROL: Make every logical step crystal clear with explicit reasoning chains 
3. SEMANTIC COMPRESSION: Pack maximum meaning into minimal words - every sentence must carry heavy conceptual load
4. RECURSIVE STRUCTURE: Create arguments that loop back and strengthen themselves (A supports B supports C supports A*)
5. OPERATIONAL PRECISION: Define terms with surgical precision - no vague concepts allowed
6. HIERARCHICAL ORGANIZATION: Clear logical progression from foundation to implications
7. COGNITIVE RISK: Make bold, non-obvious claims that require sophisticated reasoning to defend

SPECIFIC REWRITE TACTICS:
- Add explicit "because" and "therefore" chains showing logical connections
- Introduce precise technical distinctions (like "presentations vs representations")
- Create nested logical structures where each point builds on and reinforces others
- Use precise philosophical/technical language where it adds conceptual clarity
- Make implicit assumptions explicit and defend them
- Show how conclusions loop back to strengthen premises
- Add brief explanations of why obvious alternatives fail

PRESERVE: Core arguments, conclusions, overall thesis
ENHANCE: Logical rigor, conceptual precision, inferential transparency`;

  const finalInstructions = customInstructions 
    ? `${defaultInstructions}\n\nADDITIONAL CUSTOM INSTRUCTIONS:\n${customInstructions}\n\nNote: Balance custom instructions with the intelligence optimization criteria above.`
    : defaultInstructions;

  // Start streaming the rewrite IMMEDIATELY
  onChunk('', 'rewriteChunk');
  
  const rewritePrompt = `${finalInstructions}

ORIGINAL TEXT:
${text}

CRITICAL: Output ONLY the rewritten text. NO commentary, NO explanations, NO preamble like "Here's a rewrite..." Just the pure rewritten text starting immediately.

REWRITTEN TEXT:`;

  let fullRewrittenText = '';
  
  try {
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: rewritePrompt }],
          stream: true,
          max_tokens: 4000,
          temperature: 0.1,
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
                // Clean up any commentary that slips through
                const cleanContent = content
                  .replace(/^Here's.*?rewrite.*?:/i, '')
                  .replace(/^This.*?version.*?:/i, '')
                  .replace(/^The following.*?:/i, '')
                  .replace(/^Below.*?:/i, '');
                
                fullRewrittenText += cleanContent;
                onChunk(cleanContent, 'rewriteChunk');
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
            // Clean up any commentary that slips through
            const cleanContent = content
              .replace(/^Here's.*?rewrite.*?:/i, '')
              .replace(/^This.*?version.*?:/i, '')
              .replace(/^The following.*?:/i, '')
              .replace(/^Below.*?:/i, '');
            
            fullRewrittenText += cleanContent;
            onChunk(cleanContent, 'rewriteChunk');
          }
        }
      }
    } else {
      throw new Error(`Streaming not supported for provider: ${provider}`);
    }

    // Final cleanup of accumulated text
    fullRewrittenText = fullRewrittenText
      .replace(/^Here's.*?rewrite.*?:/i, '')
      .replace(/^This.*?version.*?:/i, '')
      .replace(/^The following.*?:/i, '')
      .replace(/^Below.*?:/i, '')
      .replace(/^\*\*.*?\*\*:?/gm, '')
      .replace(/^--+/gm, '')
      .trim();

    onChunk('Rewrite completed!', 'finalScore');
    onChunk('complete', 'complete');

  } catch (error) {
    console.error(`Error during streaming rewrite with ${provider}:`, error);
    onChunk(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'complete');
  }
}