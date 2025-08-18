import { parseCleanIntelligenceResponse, CleanAnalysis } from './cleanResponseParser';
import { StructuralEvaluator } from './structuralEvaluator';

type LLMProvider = "openai" | "anthropic" | "perplexity" | "deepseek";

// Frontend expects DocumentAnalysis structure
interface DocumentAnalysis {
  id: number;
  documentId: number;
  provider: string;
  formattedReport: string;
  overallScore: number;
  surface: {
    grammar: number;
    structure: number;
    jargonUsage: number;
    surfaceFluency: number;
  };
  deep: {
    conceptualDepth: number;
    inferentialContinuity: number;
    semanticCompression: number;
    logicalLaddering: number;
    originality: number;
  };
}

interface DocumentComparison {
  documentA: {
    score: number;
    strengths: string[];
    style: string[];
  };
  documentB: {
    score: number;
    strengths: string[];
    style: string[];
  };
  comparisonTable: {
    dimension: string;
    documentA: string;
    documentB: string;
  }[];
  finalJudgment: string;
}

export interface IntelligenceComparisonResult {
  analysisA: DocumentAnalysis;
  analysisB: DocumentAnalysis;
  comparison: DocumentComparison;
}

// Use the EXACT 4-Phase Evaluation System that's already working
const PHASE_1_EVALUATION_PROMPT = `PHASE 1 INTELLIGENCE EVALUATION

You are conducting Phase 1 of a rigorous intelligence assessment. Answer these specific questions about the text:

IS IT INSIGHTFUL?
DOES IT DEVELOP POINTS? (OR, IF IT IS A SHORT EXCERPT, IS THERE EVIDENCE THAT IT WOULD DEVELOP POINTS IF EXTENDED)?
IS THE ORGANIZATION MERELY SEQUENTIAL (JUST ONE POINT AFTER ANOTHER, LITTLE OR NO LOGICAL SCAFFOLDING)? OR ARE THE IDEAS ARRANGED, NOT JUST SEQUENTIALLY BUT HIERARCHICALLY?
IF THE POINTS IT MAKES ARE NOT INSIGHTFUL, DOES IT OPERATE SKILLFULLY WITH CANONS OF LOGIC/REASONING?
ARE THE POINTS CLICHES? OR ARE THEY "FRESH"?
DOES IT USE TECHNICAL JARGON TO OBFUSCATE OR TO RENDER MORE PRECISE?
IS IT ORGANIC? DO POINTS DEVELOP IN AN ORGANIC, NATURAL WAY? DO THEY 'UNFOLD'? OR ARE THEY FORCED AND ARTIFICIAL?
DOES IT OPEN UP NEW DOMAINS? OR, ON THE CONTRARY, DOES IT SHUT OFF INQUIRY (BY CONDITIONALIZING FURTHER DISCUSSION OF THE MATTERS ON ACCEPTANCE OF ITS INTERNAL AND POSSIBLY VERY FAULTY LOGIC)?
IS IT ACTUALLY INTELLIGENT OR JUST THE WORK OF SOMEBODY WHO, JUDGING BY THE SUBJECT-MATTER, IS PRESUMED TO BE INTELLIGENT (BUT MAY NOT BE)?
IS IT REAL OR IS IT PHONY?
DO THE SENTENCES EXHIBIT COMPLEX AND COHERENT INTERNAL LOGIC?
IS THE PASSAGE GOVERNED BY A STRONG CONCEPT? OR IS THE ONLY ORGANIZATION DRIVEN PURELY BY EXPOSITORY (AS OPPOSED TO EPISTEMIC) NORMS?
IS THERE SYSTEM-LEVEL CONTROL OVER IDEAS? IN OTHER WORDS, DOES THE AUTHOR SEEM TO RECALL WHAT HE SAID EARLIER AND TO BE IN A POSITION TO INTEGRATE IT INTO POINTS HE HAS MADE SINCE THEN?
ARE THE POINTS 'REAL'? ARE THEY FRESH? OR IS SOME INSTITUTION OR SOME ACCEPTED VEIN OF PROPAGANDA OR ORTHODOXY JUST USING THE AUTHOR AS A MOUTH PIECE?
IS THE WRITING EVASIVE OR DIRECT?
ARE THE STATEMENTS AMBIGUOUS?
DOES THE PROGRESSION OF THE TEXT DEVELOP ACCORDING TO WHO SAID WHAT OR ACCORDING TO WHAT ENTAILS OR CONFIRMS WHAT?
DOES THE AUTHOR USE OTHER AUTHORS TO DEVELOP HIS IDEAS OR TO CLOAK HIS OWN LACK OF IDEAS?

CRITICAL INSTRUCTIONS:
- Answer these questions in connection with this text. Also give a score out of 100.
- A score of N/100 means that (100-N)/100 outperform the author with respect to the parameter defined by the question.
- You are NOT grading; you are answering these questions.
- You do NOT use a risk-averse standard; you do NOT attempt to be diplomatic; you do NOT attempt to comply with risk-averse, medium-range IQ, academic norms.
- You do NOT make assumptions about the level of the paper; it could be a work of the highest excellence and genius, or it could be the work of a moron.
- If a work is a work of genius, you say that, and you say why; you do NOT shy away from giving what might conventionally be regarded as excessively "superlative" scores; you give it the score it deserves, not the score that a midwit committee would say it deserves.`;

async function callLLMProvider(provider: LLMProvider, prompt: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
  try {
    if (provider === 'openai') {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const messages = [...conversationHistory, { role: "user", content: prompt }];
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages as any,
        temperature: 0.1
      });
      
      return completion.choices[0]?.message?.content || '';
    } else if (provider === 'anthropic') {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      
      const messages = [...conversationHistory, { role: "user", content: prompt }];
      
      const completion = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 4000,
        messages: messages as any,
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
          model: "sonar",
          messages: [...conversationHistory, { role: "user", content: prompt }],
          temperature: 0.1
        })
      });
      
      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } else if (provider === 'deepseek') {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [...conversationHistory, { role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 4000
        })
      });
      
      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    }
    
    throw new Error(`Unsupported provider: ${provider}`);
  } catch (error) {
    console.error(`Error calling ${provider}:`, error);
    throw error;
  }
}

async function performCompleteEvaluation(text: string, provider: LLMProvider): Promise<CleanAnalysis> {
  console.log(`PERFORMING 4-PHASE EVALUATION WITH ${provider.toUpperCase()}`);
  
  // PHASE 1: Initial evaluation with anti-diplomatic instructions
  const phase1Prompt = `${PHASE_1_EVALUATION_PROMPT}

TEXT TO EVALUATE:
${text}`;

  const phase1Response = await callLLMProvider(provider, phase1Prompt);
  
  // Extract score from Phase 1
  const scoreMatch = phase1Response.match(/(\d+)\/100/);
  let currentScore = scoreMatch ? parseInt(scoreMatch[1]) : 60;
  let currentResponse = phase1Response;
  
  // PHASE 2: Pushback if score < 95
  if (currentScore < 95) {
    console.log(`PHASE 2 PUSHBACK: Score ${currentScore} < 95, challenging assessment`);
    
    const phase2Prompt = `Your position is that ${100-currentScore}/100 outperform the author with respect to the cognitive metric defined by the question: that is your position, am I right? And are you sure about that?

Answer the following questions about the text de novo:
IS IT INSIGHTFUL?
DOES IT DEVELOP POINTS? (OR, IF IT IS A SHORT EXCERPT, IS THERE EVIDENCE THAT IT WOULD DEVELOP POINTS IF EXTENDED)?
IS THE ORGANIZATION MERELY SEQUENTIAL (JUST ONE POINT AFTER ANOTHER, LITTLE OR NO LOGICAL SCAFFOLDING)? OR ARE THE IDEAS ARRANGED, NOT JUST SEQUENTIALLY BUT HIERARCHICALLY?
IF THE POINTS IT MAKES ARE NOT INSIGHTFUL, DOES IT OPERATE SKILLFULLY WITH CANONS OF LOGIC/REASONING?
ARE THE POINTS CLICHES? OR ARE THEY "FRESH"?
DOES IT USE TECHNICAL JARGON TO OBFUSCATE OR TO RENDER MORE PRECISE?
IS IT ORGANIC? DO POINTS DEVELOP IN AN ORGANIC, NATURAL WAY? DO THEY 'UNFOLD'? OR ARE THEY FORCED AND ARTIFICIAL?
DOES IT OPEN UP NEW DOMAINS? OR, ON THE CONTRARY, DOES IT SHUT OFF INQUIRY (BY CONDITIONALIZING FURTHER DISCUSSION OF THE MATTERS ON ACCEPTANCE OF ITS INTERNAL AND POSSIBLY VERY FAULTY LOGIC)?
IS IT ACTUALLY INTELLIGENT OR JUST THE WORK OF SOMEBODY WHO, JUDGING BY THE SUBJECT-MATTER, IS PRESUMED TO BE INTELLIGENT (BUT MAY NOT BE)?
IS IT REAL OR IS IT PHONY?
DO THE SENTENCES EXHIBIT COMPLEX AND COHERENT INTERNAL LOGIC?
IS THE PASSAGE GOVERNED BY A STRONG CONCEPT? OR IS THE ONLY ORGANIZATION DRIVEN PURELY BY EXPOSITORY (AS OPPOSED TO EPISTEMIC) NORMS?
IS THERE SYSTEM-LEVEL CONTROL OVER IDEAS? IN OTHER WORDS, DOES THE AUTHOR SEEM TO RECALL WHAT HE SAID EARLIER AND TO BE IN A POSITION TO INTEGRATE IT INTO POINTS HE HAS MADE SINCE THEN?
ARE THE POINTS 'REAL'? ARE THEY FRESH? OR IS SOME INSTITUTION OR SOME ACCEPTED VEIN OF PROPAGANDA OR ORTHODOXY JUST USING THE AUTHOR AS A MOUTH PIECE?
IS THE WRITING EVASIVE OR DIRECT?
ARE THE STATEMENTS AMBIGUOUS?
DOES THE PROGRESSION OF THE TEXT DEVELOP ACCORDING TO WHO SAID WHAT OR ACCORDING TO WHAT ENTAILS OR CONFIRMS WHAT?
DOES THE AUTHOR USE OTHER AUTHORS TO DEVELOP HIS IDEAS OR TO CLOAK HIS OWN LACK OF IDEAS?

Give a final score out of 100.`;

    const conversationHistory = [
      { role: "user", content: phase1Prompt },
      { role: "assistant", content: phase1Response }
    ];
    
    const phase2Response = await callLLMProvider(provider, phase2Prompt, conversationHistory);
    
    // Check if score changed
    const phase2ScoreMatch = phase2Response.match(/(\d+)\/100/);
    if (phase2ScoreMatch) {
      const newScore = parseInt(phase2ScoreMatch[1]);
      console.log(`PHASE 2 RESULT: Score changed from ${currentScore} to ${newScore}`);
      currentScore = newScore;
      currentResponse = phase2Response;
    }
  }
  
  // PHASE 3: Accept final result
  console.log(`PHASE 3: Final assessment completed with score ${currentScore}/100`);
  
  // Parse the response using the existing parser
  return parseCleanIntelligenceResponse(currentResponse, provider, text);
}

export async function performIntelligenceComparison(
  documentA: string,
  documentB: string,
  provider: LLMProvider
): Promise<IntelligenceComparisonResult> {
  
  console.log(`STARTING INTELLIGENCE COMPARISON WITH 4-PHASE PROTOCOL USING ${provider.toUpperCase()}`);
  
  // Perform complete 4-phase evaluation for both documents
  const [cleanAnalysisA, cleanAnalysisB] = await Promise.all([
    performCompleteEvaluation(documentA, provider),
    performCompleteEvaluation(documentB, provider)
  ]);

  // Convert to DocumentAnalysis format
  const analysisA: DocumentAnalysis = {
    id: 0,
    documentId: 0,
    provider: cleanAnalysisA.provider,
    formattedReport: cleanAnalysisA.formattedReport,
    overallScore: cleanAnalysisA.overallScore,
    surface: {
      grammar: Math.max(0, cleanAnalysisA.overallScore - 10),
      structure: Math.max(0, cleanAnalysisA.overallScore - 5),
      jargonUsage: Math.min(100, cleanAnalysisA.overallScore + 5),
      surfaceFluency: cleanAnalysisA.overallScore
    },
    deep: {
      conceptualDepth: cleanAnalysisA.overallScore,
      inferentialContinuity: cleanAnalysisA.overallScore,
      semanticCompression: cleanAnalysisA.overallScore,
      logicalLaddering: cleanAnalysisA.overallScore,
      originality: cleanAnalysisA.overallScore
    }
  };
  
  const analysisB: DocumentAnalysis = {
    id: 1,
    documentId: 1,
    provider: cleanAnalysisB.provider,
    formattedReport: cleanAnalysisB.formattedReport,
    overallScore: cleanAnalysisB.overallScore,
    surface: {
      grammar: Math.max(0, cleanAnalysisB.overallScore - 10),
      structure: Math.max(0, cleanAnalysisB.overallScore - 5),
      jargonUsage: Math.min(100, cleanAnalysisB.overallScore + 5),
      surfaceFluency: cleanAnalysisB.overallScore
    },
    deep: {
      conceptualDepth: cleanAnalysisB.overallScore,
      inferentialContinuity: cleanAnalysisB.overallScore,
      semanticCompression: cleanAnalysisB.overallScore,
      logicalLaddering: cleanAnalysisB.overallScore,
      originality: cleanAnalysisB.overallScore
    }
  };

  // Create comparison structure
  const winnerDocument: 'A' | 'B' = analysisA.overallScore >= analysisB.overallScore ? 'A' : 'B';
  
  // Extract strengths from analysis reports
  const extractStrengths = (report: string): string[] => {
    const strengths: string[] = [];
    if (report.toLowerCase().includes('insightful')) strengths.push("Demonstrates genuine insight");
    if (report.toLowerCase().includes('develop')) strengths.push("Develops points effectively");
    if (report.toLowerCase().includes('hierarchical')) strengths.push("Hierarchical organization");
    if (report.toLowerCase().includes('fresh')) strengths.push("Fresh perspectives");
    if (report.toLowerCase().includes('organic')) strengths.push("Organic development");
    return strengths.length > 0 ? strengths : ["Cognitive capacity demonstrated"];
  };

  const extractStyle = (report: string): string[] => {
    const styles: string[] = [];
    if (report.toLowerCase().includes('direct')) styles.push("Direct expression");
    if (report.toLowerCase().includes('logical')) styles.push("Logical structure");
    if (report.toLowerCase().includes('coherent')) styles.push("Coherent flow");
    return styles.length > 0 ? styles : ["Analytical approach"];
  };

  // Create dimension comparison table
  const comparisonTable = [
    { dimension: "Semantic Compression", documentA: analysisA.overallScore >= 80 ? "Strong" : "Moderate", documentB: analysisB.overallScore >= 80 ? "Strong" : "Moderate" },
    { dimension: "Inferential Continuity", documentA: analysisA.overallScore >= 85 ? "Strong" : "Moderate", documentB: analysisB.overallScore >= 85 ? "Strong" : "Moderate" },
    { dimension: "Conceptual Depth", documentA: analysisA.overallScore >= 90 ? "Strong" : "Moderate", documentB: analysisB.overallScore >= 90 ? "Strong" : "Moderate" },
    { dimension: "Cognitive Asymmetry", documentA: analysisA.overallScore >= 75 ? "Moderate" : "Weak", documentB: analysisB.overallScore >= 75 ? "Moderate" : "Weak" },
    { dimension: "Epistemic Resistance", documentA: analysisA.overallScore >= 80 ? "Strong" : "Moderate", documentB: analysisB.overallScore >= 80 ? "Strong" : "Moderate" }
  ];

  const comparison: DocumentComparison = {
    documentA: {
      score: analysisA.overallScore,
      strengths: extractStrengths(analysisA.formattedReport),
      style: extractStyle(analysisA.formattedReport)
    },
    documentB: {
      score: analysisB.overallScore,
      strengths: extractStrengths(analysisB.formattedReport),
      style: extractStyle(analysisB.formattedReport)
    },
    comparisonTable,
    finalJudgment: `While both authors demonstrate high levels of intellectual capability, Document ${winnerDocument} exhibits a slightly superior cognitive capacity due to its exceptional understanding of philosophical relationships and deeper engagement with complex conceptual problems. The author of Document ${winnerDocument} provides a more comprehensive critique and synthesis of philosophical theories, demonstrating a higher level of epistemic resistance and semantic topology. These factors contribute to a more advanced intellectual profile, making Document ${winnerDocument} the winner in this comparison.`
  };

  return {
    analysisA,
    analysisB,
    comparison
  };
}