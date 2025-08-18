import { LLMProvider } from '../types';
import { callOpenAI, callAnthropic, callPerplexity, callDeepSeek } from './llmProviders';
import { executeFourPhaseProtocol } from './fourPhaseProtocol';

interface IntelligentRewriteRequest {
  text: string;
  customInstructions?: string;
  provider: LLMProvider;
}

interface IntelligentRewriteResult {
  originalText: string;
  rewrittenText: string;
  originalScore: number;
  rewrittenScore: number;
  provider: string;
  instructions: string;
  rewriteReport: string;
}

export async function performIntelligentRewrite(request: IntelligentRewriteRequest): Promise<IntelligentRewriteResult> {
  const { text, customInstructions, provider } = request;
  
  console.log(`Starting intelligent rewrite with ${provider}`);
  
  // Step 1: Get baseline score using 4-phase protocol
  console.log('Step 1: Evaluating original text...');
  const originalEvaluation = await executeFourPhaseProtocol(text, provider);
  const originalScore = originalEvaluation.finalScore;
  
  console.log(`Original score: ${originalScore}/100`);
  
  // Step 2: Create rewrite instructions
  const defaultInstructions = `Rewrite the following text to score significantly higher on a 4-phase intelligence evaluation while preserving existing content as much as possible.

OPTIMIZATION CRITERIA:
- Enhance logical scaffolding and hierarchical organization
- Make implicit reasoning chains explicit  
- Improve semantic compression and inferential clarity
- Strengthen conceptual precision without unnecessary jargon
- Ensure organic development of ideas
- Preserve semantic density - never add words without adding value
- Maintain or enhance recursive logical structures (A→B→C→A*)
- Sharpen operational definitions
- Reveal underlying inferential frameworks

STRICT REQUIREMENTS:
- Preserve all core content, arguments, and conclusions
- Maintain the author's voice and style
- Keep similar length (no bloating with filler words)
- Focus on structural and logical improvements, not stylistic flourishes`;

  const finalInstructions = customInstructions 
    ? `${defaultInstructions}\n\nADDITIONAL CUSTOM INSTRUCTIONS:\n${customInstructions}\n\nNote: Balance custom instructions with the intelligence optimization criteria above.`
    : defaultInstructions;

  // Step 3: Perform the rewrite
  console.log('Step 2: Performing intelligent rewrite...');
  const rewritePrompt = `${finalInstructions}

ORIGINAL TEXT:
${text}

REWRITTEN TEXT:`;

  let rewrittenText: string;
  try {
    switch (provider) {
      case 'openai':
        rewrittenText = await callOpenAI(rewritePrompt);
        break;
      case 'anthropic':
        rewrittenText = await callAnthropic(rewritePrompt);
        break;
      case 'perplexity':
        rewrittenText = await callPerplexity(rewritePrompt);
        break;
      case 'deepseek':
        rewrittenText = await callDeepSeek(rewritePrompt);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error during rewrite with ${provider}:`, error);
    throw new Error(`Rewrite failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Step 4: Evaluate the rewritten text
  console.log('Step 3: Evaluating rewritten text...');
  const rewrittenEvaluation = await executeFourPhaseProtocol(rewrittenText, provider);
  const rewrittenScore = rewrittenEvaluation.finalScore;
  
  console.log(`Rewritten score: ${rewrittenScore}/100`);
  console.log(`Score improvement: ${rewrittenScore - originalScore} points`);
  
  // Step 5: Generate rewrite report
  const improvementType = rewrittenScore > originalScore ? 'improvement' : 
                         rewrittenScore < originalScore ? 'regression' : 'no change';
  
  const rewriteReport = `Intelligent Rewrite Analysis:

Original Score: ${originalScore}/100
Rewritten Score: ${rewrittenScore}/100
Change: ${rewrittenScore > originalScore ? '+' : ''}${rewrittenScore - originalScore} points (${improvementType})

Provider: ${provider}
Instructions: ${customInstructions || 'Default intelligence optimization'}

The rewrite ${improvementType === 'improvement' ? 'successfully enhanced' : 
             improvementType === 'regression' ? 'unfortunately decreased' : 'maintained'} 
the text's intelligence evaluation score through ${improvementType === 'improvement' ? 'strategic structural and logical improvements' : 
                                                  improvementType === 'regression' ? 'changes that may have disrupted the original logical flow' :
                                                  'modifications that preserved the original intellectual level'}.`;

  return {
    originalText: text,
    rewrittenText,
    originalScore,
    rewrittenScore,
    provider,
    instructions: customInstructions || 'Default intelligence optimization',
    rewriteReport
  };
}