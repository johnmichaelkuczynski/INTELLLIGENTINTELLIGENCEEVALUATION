// Import the LLM calling function directly 
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface QuickAnalysisResult {
  intelligence_score: number;
  key_insights: string;
  cognitive_profile: string;
  analysis: string;
  provider: string;
}

export async function performQuickAnalysis(
  text: string,
  provider: string
): Promise<QuickAnalysisResult> {
  console.log(`QUICK INTELLIGENCE ANALYSIS WITH ${provider.toUpperCase()}`);
  
  // Single streamlined prompt that captures core intelligence assessment
  const quickPrompt = `You are evaluating the intelligence of an author based on their writing. Provide a focused assessment in exactly this format:

INTELLIGENCE SCORE: [0-100]/100

KEY INSIGHTS: [2-3 sentences describing the most important cognitive strengths or weaknesses]

COGNITIVE PROFILE: [Brief assessment of thinking style - analytical, creative, systematic, etc.]

ANALYSIS: [Concise 3-4 sentence evaluation focusing on: conceptual depth, logical reasoning, originality of thought, and clarity of expression]

TEXT TO ANALYZE:
${text}

Focus on genuine intellectual capacity, not academic credentials or verbose language. Look for evidence of:
- Original thinking and novel insights
- Logical reasoning and argument structure  
- Conceptual sophistication
- Authentic vs. superficial analysis

Provide honest, direct assessment without diplomatic hedging.`;

  try {
    let response: string;
    
    // Call the appropriate LLM provider
    if (provider === 'openai') {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: quickPrompt }],
        temperature: 0.1,
      });
      response = completion.choices[0]?.message?.content || '';
    } else if (provider === 'anthropic') {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [{ role: "user", content: quickPrompt }],
        temperature: 0.1,
      });
      response = completion.content[0]?.type === 'text' ? completion.content[0].text : '';
    } else {
      throw new Error(`Quick analysis not supported for ${provider} yet`);
    }
    
    // Extract components from response
    const scoreMatch = response.match(/INTELLIGENCE SCORE:\s*(\d+)\/100/gi);
    const insightsMatch = response.match(/KEY INSIGHTS:\s*(.*?)(?=COGNITIVE PROFILE:|$)/gm);
    const profileMatch = response.match(/COGNITIVE PROFILE:\s*(.*?)(?=ANALYSIS:|$)/gm);
    const analysisMatch = response.match(/ANALYSIS:\s*(.*?)$/gm);
    
    const intelligence_score = scoreMatch ? parseInt(scoreMatch[0].split(':')[1].split('/')[0].trim()) : 75;
    const key_insights = insightsMatch ? insightsMatch[0].split(':')[1].trim() : "Standard analytical capability observed.";
    const cognitive_profile = profileMatch ? profileMatch[0].split(':')[1].trim() : "Conventional academic approach.";
    const analysis = analysisMatch ? analysisMatch[0].split(':')[1].trim() : response.slice(0, 500);

    console.log(`Quick analysis complete - Score: ${intelligence_score}/100`);
    
    return {
      intelligence_score,
      key_insights,
      cognitive_profile,
      analysis,
      provider
    };
    
  } catch (error) {
    console.error(`Quick analysis failed with ${provider}:`, error);
    throw new Error(`Quick analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function performQuickComparison(
  textA: string,
  textB: string,
  provider: string
): Promise<{ analysisA: QuickAnalysisResult; analysisB: QuickAnalysisResult; comparison: string }> {
  console.log(`QUICK INTELLIGENCE COMPARISON WITH ${provider.toUpperCase()}`);
  
  // Perform quick analysis on both texts simultaneously
  const [analysisA, analysisB] = await Promise.all([
    performQuickAnalysis(textA, provider),
    performQuickAnalysis(textB, provider)
  ]);
  
  // Generate brief comparison
  const comparisonPrompt = `Compare these two intelligence assessments briefly:

DOCUMENT A: Score ${analysisA.intelligence_score}/100 - ${analysisA.key_insights}

DOCUMENT B: Score ${analysisB.intelligence_score}/100 - ${analysisB.key_insights}

Provide a 2-3 sentence comparison highlighting the key cognitive differences and which author demonstrates superior intellectual capacity.`;

  let comparison: string;
  
  // Call the appropriate LLM provider for comparison
  if (provider === 'openai') {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: comparisonPrompt }],
      temperature: 0.1,
    });
    comparison = completion.choices[0]?.message?.content || '';
  } else if (provider === 'anthropic') {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [{ role: "user", content: comparisonPrompt }],
      temperature: 0.1,
    });
    comparison = completion.content[0]?.type === 'text' ? completion.content[0].text : '';
  } else {
    comparison = `Comparison completed using ${provider}`;
  }
  
  return { analysisA, analysisB, comparison };
}