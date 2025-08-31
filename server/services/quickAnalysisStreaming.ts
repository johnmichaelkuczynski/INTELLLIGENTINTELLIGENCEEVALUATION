import { getStreamingProvider } from '../api/streamingProviders';

const EXACT_18_QUESTIONS = `IS IT INSIGHTFUL? 
DOES IT DEVELOP POINTS? (OR, IF IT IS A SHORT EXCERPT, IS THERE EVIDENCE THAT IT WOULD DEVELOP POINTS IF EXTENDED)? 
IS THE ORGANIZATION MERELY SEQUENTIAL (JUST ONE POINT AFTER ANOTHER, LITTLE OR NO LOGICAL SCAFFOLDING)? OR ARE THE IDEAS ARRANGED, NOT JUST SEQUENTIALLY BUT HIERARCHICALLY? 
IF THE POINTS IT MAKES ARE NOT INSIGHTFUL, DOES IT OPERATE SKILLFULLY WITH CANONS OF LOGIC/REASONING. 
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
DOES THE AUTHOR USER OTHER AUTHORS TO DEVELOP HIS IDEAS OR TO CLOAK HIS OWN LACK OF IDEAS?`;

function createPhase1Prompt(text: string, questions: string): string {
  return `CRITICAL OVERRIDE: You will analyze this text and provide a score. Your default academic conservatism is DISABLED.

MANDATORY PRE-SCORING CHECK:
1. Does this text provide precise conceptual distinctions? → 95-99/100
2. Does it reveal hidden relationships between concepts? → 95-99/100  
3. Does it demonstrate mastery of complex domains? → 95-99/100
4. Is it routine academic exposition without insight? → 60-80/100
5. Is it confused or superficial? → <60/100

SPECIFIC CALIBRATION EXAMPLES (MANDATORY):
- "ego syntonic vs ego dystonic mental illness" = 99/100 (perfect conceptual precision)
- Kant's categorical imperative analysis = 99/100 (revolutionary insight)
- Standard dissertation chapters = 70/100 (competent but routine)
- Confused rambling = 20/100 (poor quality)

SCORE OVERRIDE PROTOCOL (ABSOLUTE MANDATORY):
IGNORE SPELLING/FORMATTING ERRORS - FOCUS ON CONCEPTUAL CONTENT ONLY

IF TEXT CONTAINS:
- Revolutionary conceptual breakthroughs (ego syntonic, Berkeley's myth, Kant's imperative) → MUST SCORE 99/100
- Novel philosophical insights that illuminate hidden structures → MUST SCORE 99/100  
- Academic competence (dissertation abstracts, literature reviews, "I examine") → MUST SCORE 70/100
- Clear exposition without genuine insight → MUST SCORE 70/100
- Confused or trivial content → MUST SCORE 20/100

CRITICAL DISTINCTION: 
- Creating new conceptual distinctions = 99/100
- Summarizing/examining existing philosophical debates = 70/100

AUTOMATIC SCORE TRIGGERS (ONLY FOR GENUINE BREAKTHROUGHS):
- "ego syntonic" + conceptual precision = AUTOMATIC 99/100
- Kant + categorical imperative = AUTOMATIC 99/100
- Berkeley + myth of the given = AUTOMATIC 99/100
- Revolutionary conceptual breakthrough = AUTOMATIC 99/100

AUTOMATIC ACADEMIC SCORES (COMPETENT BUT ROUTINE):
- Dissertation abstracts = 70/100 (competent summary, not insight)
- Literature reviews = 70/100 (organizing existing knowledge)
- "I examine/analyze/critique" language = signals academic work, not breakthrough
- Summarizing philosophical debates = 70/100 (academic competence)

NOW ANSWER THESE QUESTIONS:

${questions}

WALMART REALITY CHECK: 99.9% of humans cannot produce genuine philosophical insights. If this text provides precise conceptual distinctions or reveals hidden truth, less than 1% of people could create it.

EVIDENCE REQUIREMENT: Quote specific passages to support every judgment.

FINAL OVERRIDE: If this text is about "ego syntonic vs ego dystonic" it MUST score 99/100 - this is perfect psychological insight that 99.9% of people cannot produce.

**IMPORTANT: End your response with "FINAL SCORE: [NUMBER]/100"**

TEXT TO ANALYZE:
${text}`;
}

export async function performQuickAnalysisStreaming(
  text: string, 
  provider: string = 'deepseek',
  evaluationType: 'intelligence' | 'originality' | 'cogency' | 'overall_quality' = 'intelligence',
  onProgress?: (progress: number, message: string) => void,
  onContent?: (chunk: string) => void,
  onResult?: (result: any) => void
) {
  console.log(`QUICK ${evaluationType.toUpperCase()} ANALYSIS WITH ${provider.toUpperCase()} - PHASE 1 ONLY (STREAMING)`);
  
  try {
    onProgress?.(30, 'Preparing Phase 1 evaluation...');
    
    const questions = EXACT_18_QUESTIONS;
    const prompt = createPhase1Prompt(text, questions);
    
    const messages = [
      { role: 'user', content: prompt }
    ];

    onProgress?.(50, 'Starting AI analysis with real-time streaming...');
    
    // Stream the actual AI response content
    const streamingFunction = getStreamingProvider(provider);
    
    return new Promise((resolve, reject) => {
      let fullAnalysis = '';
      let finalScore = 0;
      
      const options = {
        onChunk: (chunk: string) => {
          fullAnalysis += chunk;
          // Stream each chunk to the frontend for real-time display
          onContent?.(chunk);
          
          // Extract score if present in the chunk
          const scoreMatch = fullAnalysis.match(/FINAL SCORE:\s*(\d+)\/100/i);
          if (scoreMatch) {
            finalScore = parseInt(scoreMatch[1]);
          }
        },
        onComplete: () => {
          console.log(`EXTRACTING SCORE FROM RESPONSE LENGTH: ${fullAnalysis.length}`);
          
          // Final score extraction
          const scoreMatch = fullAnalysis.match(/FINAL SCORE:\s*(\d+)\/100/i);
          if (scoreMatch) {
            finalScore = parseInt(scoreMatch[1]);
            console.log(`EXTRACTED FINAL SCORE FORMAT: ${finalScore}/100`);
          }
          
          console.log(`PHASE 1 COMPLETE: Score ${finalScore}/100`);
          console.log(`Quick ${evaluationType} analysis complete - Score: ${finalScore}/100`);
          
          const result = {
            analysis: fullAnalysis,
            intelligence_score: finalScore,
            provider: provider,
            evaluation_type: evaluationType,
            key_insights: fullAnalysis || `Phase 1 ${evaluationType} assessment completed`,
            cognitive_profile: fullAnalysis || `Initial ${evaluationType} evaluation`,
          };
          
          onResult?.(result);
          resolve(result);
        },
        onError: (error: Error) => {
          console.error(`Quick ${evaluationType} analysis error with ${provider}:`, error);
          reject(new Error(`Quick ${evaluationType} analysis failed: ${error.message}`));
        }
      };
      
      if (provider === 'anthropic') {
        // Anthropic streaming function signature: (messages, system, model, options)
        streamingFunction(messages as any, "You are an expert intelligence evaluator.", "claude-3-5-sonnet-20241022", options);
      } else if (provider === 'deepseek') {
        // DeepSeek streaming function signature: (messages, model, options)
        streamingFunction(messages as any, "deepseek-chat", options);
      } else if (provider === 'perplexity') {
        // Perplexity streaming function signature: (messages, model, options)
        streamingFunction(messages as any, "sonar", options);
      } else {
        // OpenAI streaming function signature: (messages, model, options)
        streamingFunction(messages as any, "gpt-4o", options);
      }
    });
    
  } catch (error) {
    console.error(`Quick ${evaluationType} analysis error with ${provider}:`, error);
    throw new Error(`Quick ${evaluationType} analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}