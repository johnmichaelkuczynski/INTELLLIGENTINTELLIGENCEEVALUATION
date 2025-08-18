import { executeFourPhaseProtocol } from './fourPhaseProtocol';

export interface IntelligentRewriteOptions {
  customInstructions?: string;
  provider?: 'openai' | 'anthropic' | 'perplexity' | 'deepseek';
}

export interface IntelligentRewriteResult {
  originalText: string;
  rewrittenText: string;
  originalScore: number;
  rewrittenScore: number;
  provider: string;
  instructions: string;
  rewriteReport: string;
}

// Default rewrite instruction based on your protocol
const DEFAULT_REWRITE_INSTRUCTION = `REWRITE IN SUCH A WAY THAT (A) THE REWRITE SCORES SIGNIFICANTLY HIGHER RELATIVE TO THE OPERATIVE INTELLIGENCE EVALUATION PROTOCOL WHILE (B) PRESERVING EXISTING CONTENT AS MUCH AS CONDITION (A) ALLOWS.

CONDITION (A) MEANS: RIGHTSIZE THE PASSAGE WITH RESPECT TO THE OPERATIVE EVALUATION LOGIC.
CONDITION (B) MEANS: IF YOU CAN RIGHTSIZE THE PASSAGE WITHOUT CHANGING THE CONTENT, THEN DO THAT; AND IF YOU HAVE TO CHANGE OR SUPPLEMENT THE PASSAGE TO GET THE REWRITE TO BE ON THE RIGHT SIDE OF THE EVALUATION LOGIC, THEN MAKE THOSE CHANGES--AS LONG AS THEY DO NOT TOTALLY ALTER THE MEANING OF THE PASSAGE.

Focus on:
- Making implicit reasoning chains explicit
- Enhancing logical scaffolding and hierarchical organization
- Sharpening conceptual precision without adding jargon
- Revealing the epistemic structure of arguments
- Maintaining semantic compression while improving inferential clarity
- Ensuring points develop organically rather than artificially
- Strengthening system-level control over ideas

The goal is to optimize for the 4-phase intelligence evaluation protocol while preserving the core meaning and insights of the original text.`;

// Generic LLM caller for rewrite
async function callLLMForRewrite(
  provider: 'openai' | 'anthropic' | 'perplexity' | 'deepseek',
  prompt: string
): Promise<string> {
  try {
    if (provider === 'openai') {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      });
      
      return completion.choices[0]?.message?.content || '';
    } else if (provider === 'anthropic') {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      
      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      });
      
      return completion.content[0]?.type === 'text' ? completion.content[0].text : '';
    } else if (provider === 'perplexity') {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1
        })
      });
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } else if (provider === 'deepseek') {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1
        })
      });
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    }
    
    throw new Error(`Unsupported provider: ${provider}`);
  } catch (error) {
    console.error(`Error calling ${provider}:`, error);
    throw new Error(`Failed to call ${provider} API`);
  }
}

// Main intelligent rewrite function
export async function executeIntelligentRewrite(
  originalText: string,
  options: IntelligentRewriteOptions = {}
): Promise<IntelligentRewriteResult> {
  const provider = options.provider || 'deepseek';
  const customInstructions = options.customInstructions?.trim();
  
  console.log(`EXECUTING INTELLIGENT REWRITE WITH ${provider.toUpperCase()}`);
  
  // Step 1: Evaluate original text using 4-phase protocol
  console.log("STEP 1: Evaluating original text");
  const originalEvaluation = await executeFourPhaseProtocol(originalText, provider);
  const originalScore = originalEvaluation.overallScore;
  
  // Step 2: Create rewrite prompt
  let rewriteInstructions = DEFAULT_REWRITE_INSTRUCTION;
  
  if (customInstructions) {
    rewriteInstructions = `${DEFAULT_REWRITE_INSTRUCTION}

ADDITIONAL CUSTOM INSTRUCTIONS:
${customInstructions}

NOTE: Follow the custom instructions while ensuring conditions (A) and (B) above are fulfilled. If there's conflict between custom instructions and conditions (A) and (B), weight the custom instructions more heavily but try to strike a balance.`;
  }
  
  const rewritePrompt = `${rewriteInstructions}

ORIGINAL TEXT TO REWRITE:
${originalText}

Provide only the rewritten text without any commentary or explanation.`;
  
  // Step 3: Execute rewrite
  console.log("STEP 2: Executing intelligent rewrite");
  const rewrittenText = await callLLMForRewrite(provider, rewritePrompt);
  
  // Step 4: Evaluate rewritten text using 4-phase protocol
  console.log("STEP 3: Evaluating rewritten text");
  const rewrittenEvaluation = await executeFourPhaseProtocol(rewrittenText, provider);
  const rewrittenScore = rewrittenEvaluation.overallScore;
  
  // Step 5: Generate rewrite report
  const rewriteReport = `INTELLIGENT REWRITE ANALYSIS REPORT

Original Score: ${originalScore}/100
Rewritten Score: ${rewrittenScore}/100
Score Improvement: ${rewrittenScore - originalScore} points

Provider: ${provider}
Instructions Used: ${customInstructions ? 'Custom + Default' : 'Default Only'}

ORIGINAL EVALUATION:
${originalEvaluation.formattedReport}

REWRITTEN EVALUATION:
${rewrittenEvaluation.formattedReport}`;
  
  console.log(`REWRITE COMPLETED: ${originalScore}/100 → ${rewrittenScore}/100 (${rewrittenScore - originalScore > 0 ? '+' : ''}${rewrittenScore - originalScore})`);
  
  return {
    originalText,
    rewrittenText,
    originalScore,
    rewrittenScore,
    provider,
    instructions: customInstructions || 'Default intelligence optimization',
    rewriteReport
  };
}

// Individual provider functions
export async function intelligentRewriteOpenAI(text: string, options: Omit<IntelligentRewriteOptions, 'provider'> = {}): Promise<IntelligentRewriteResult> {
  return await executeIntelligentRewrite(text, { ...options, provider: 'openai' });
}

export async function intelligentRewriteAnthropic(text: string, options: Omit<IntelligentRewriteOptions, 'provider'> = {}): Promise<IntelligentRewriteResult> {
  return await executeIntelligentRewrite(text, { ...options, provider: 'anthropic' });
}

export async function intelligentRewritePerplexity(text: string, options: Omit<IntelligentRewriteOptions, 'provider'> = {}): Promise<IntelligentRewriteResult> {
  return await executeIntelligentRewrite(text, { ...options, provider: 'perplexity' });
}

export async function intelligentRewriteDeepSeek(text: string, options: Omit<IntelligentRewriteOptions, 'provider'> = {}): Promise<IntelligentRewriteResult> {
  return await executeIntelligentRewrite(text, { ...options, provider: 'deepseek' });
}