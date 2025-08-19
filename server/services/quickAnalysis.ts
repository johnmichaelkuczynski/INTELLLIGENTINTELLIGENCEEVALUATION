import { executePhase1Protocol } from './fourPhaseProtocol';

export async function performQuickAnalysis(text: string, provider: string = 'deepseek') {
  console.log(`QUICK INTELLIGENCE ANALYSIS WITH ${provider.toUpperCase()} - PHASE 1 ONLY`);
  
  try {
    // Use only Phase 1 of the exact 4-phase protocol
    const phase1Result = await executePhase1Protocol(text, provider);
    
    console.log(`Quick analysis complete - Score: ${phase1Result.intelligence_score}/100`);
    
    return {
      analysis: phase1Result.analysis,
      intelligence_score: phase1Result.intelligence_score,
      provider: provider,
      key_insights: phase1Result.key_insights || "Phase 1 assessment completed",
      cognitive_profile: phase1Result.cognitive_profile || "Initial cognitive evaluation",
    };
    
  } catch (error) {
    console.error(`Quick analysis error with ${provider}:`, error);
    throw new Error(`Quick analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function performQuickComparison(documentA: string, documentB: string, provider: string = 'deepseek') {
  console.log(`QUICK COMPARISON WITH ${provider.toUpperCase()} - PHASE 1 ONLY FOR BOTH DOCUMENTS`);
  
  try {
    // For comparison, analyze both documents using Phase 1 only
    const [phase1A, phase1B] = await Promise.all([
      executePhase1Protocol(documentA, provider),
      executePhase1Protocol(documentB, provider)
    ]);
    
    // Create comparison structure matching the expected format
    const analysisA = {
      id: Date.now(),
      formattedReport: phase1A.analysis,
      overallScore: phase1A.intelligence_score,
      provider: provider,
      summary: phase1A.key_insights,
      analysis: phase1A.cognitive_profile
    };
    
    const analysisB = {
      id: Date.now() + 1,
      formattedReport: phase1B.analysis,
      overallScore: phase1B.intelligence_score,
      provider: provider,
      summary: phase1B.key_insights,
      analysis: phase1B.cognitive_profile
    };
    
    const comparison = {
      documentA: {
        score: phase1A.intelligence_score || 0,
        strengths: [],
        style: []
      },
      documentB: {
        score: phase1B.intelligence_score || 0,
        strengths: [],
        style: []
      },
      comparisonTable: [],
      finalJudgment: `Quick Analysis Results - Document A: ${phase1A.intelligence_score}/100, Document B: ${phase1B.intelligence_score}/100`
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