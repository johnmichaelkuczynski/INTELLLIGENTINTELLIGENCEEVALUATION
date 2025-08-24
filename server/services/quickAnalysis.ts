import { executeNormalProtocol } from './fourPhaseProtocol';

export async function performQuickAnalysis(
  text: string, 
  provider: string = 'deepseek',
  evaluationType: 'intelligence' | 'originality' | 'cogency' | 'overall_quality' = 'intelligence'
) {
  console.log(`QUICK ${evaluationType.toUpperCase()} ANALYSIS WITH ${provider.toUpperCase()} - PHASE 1 ONLY`);
  
  try {
    // Use only Phase 1 of the exact 4-phase protocol
    const phase1Result = await executeNormalProtocol(
      text, 
      provider as 'openai' | 'anthropic' | 'perplexity' | 'deepseek'
    );
    
    console.log(`Quick ${evaluationType} analysis complete - Score: ${phase1Result.overallScore}/100`);
    
    return {
      analysis: phase1Result.analysis,
      intelligence_score: phase1Result.overallScore,
      provider: provider,
      evaluation_type: evaluationType,
      key_insights: phase1Result.analysis || `Phase 1 ${evaluationType} assessment completed`,
      cognitive_profile: phase1Result.analysis || `Initial ${evaluationType} evaluation`,
    };
    
  } catch (error) {
    console.error(`Quick ${evaluationType} analysis error with ${provider}:`, error);
    throw new Error(`Quick ${evaluationType} analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function performQuickComparison(
  documentA: string, 
  documentB: string, 
  provider: string = 'deepseek',
  evaluationType: 'intelligence' | 'originality' | 'cogency' | 'overall_quality' = 'intelligence'
) {
  console.log(`QUICK ${evaluationType.toUpperCase()} COMPARISON WITH ${provider.toUpperCase()} - PHASE 1 ONLY FOR BOTH DOCUMENTS`);
  
  try {
    // For comparison, analyze both documents using Phase 1 only
    const [phase1A, phase1B] = await Promise.all([
      executeNormalProtocol(documentA, provider as 'openai' | 'anthropic' | 'perplexity' | 'deepseek'),
      executeNormalProtocol(documentB, provider as 'openai' | 'anthropic' | 'perplexity' | 'deepseek')
    ]);
    
    // Create comparison structure matching the expected format
    // Both analyses need the same complete structure for proper modal display
    const analysisA = {
      id: Date.now(),
      formattedReport: phase1A.analysis,
      overallScore: phase1A.overallScore,
      provider: provider,
      summary: phase1A.analysis,
      analysis: phase1A.analysis // Use the full analysis content for display
    };
    
    const analysisB = {
      id: Date.now() + 1,
      formattedReport: phase1B.analysis,
      overallScore: phase1B.overallScore,
      provider: provider,
      summary: phase1B.analysis,
      analysis: phase1B.analysis // Use the full analysis content for display
    };
    
    const comparison = {
      documentA: {
        score: phase1A.overallScore || 0,
        strengths: [],
        style: []
      },
      documentB: {
        score: phase1B.overallScore || 0,
        strengths: [],
        style: []
      },
      comparisonTable: [],
      finalJudgment: `Quick Analysis Results - Document A: ${phase1A.overallScore}/100, Document B: ${phase1B.overallScore}/100`
    };
    
    return {
      analysisA,
      analysisB,
      comparison
    };
    
  } catch (error) {
    console.error(`Quick comparison error with ${provider}:`, error);
    throw new Error(`Quick comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}