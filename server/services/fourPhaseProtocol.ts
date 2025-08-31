// EXACT USER-SPECIFIED 4-PHASE INTELLIGENCE EVALUATION PROTOCOL

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

// PHASE 1: Generate comprehensive forensic intelligence report
function createPhase1Prompt(text: string, questions: string): string {
  return `CRITICAL OVERRIDE: You will conduct a comprehensive forensic intelligence assessment. Your default academic conservatism is DISABLED.

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

YOU MUST GENERATE A COMPREHENSIVE FORENSIC INTELLIGENCE REPORT WITH THESE EXACT SECTIONS:

ANALYSIS:
[Provide detailed examination answering all these questions with extensive textual evidence and quotations:]

${questions}

Comparative Intelligence Placement
Evidence-based positioning relative to academic and intellectual benchmarks

[Compare this text to academic standards, intellectual benchmarks, and place it within the cognitive hierarchy. Provide specific evidence and quotations.]

Final Assessment
[Comprehensive final verdict with detailed reasoning, textual evidence, and clear justification for the score]

WALMART REALITY CHECK: 99.9% of humans cannot produce genuine philosophical insights. If this text provides precise conceptual distinctions or reveals hidden truth, less than 1% of people could create it.

EVIDENCE REQUIREMENT: Quote specific passages to support every judgment throughout the entire report.

FINAL OVERRIDE: If this text is about "ego syntonic vs ego dystonic" it MUST score 99/100 - this is perfect psychological insight that 99.9% of people cannot produce.

**IMPORTANT: End your response with "FINAL SCORE: [NUMBER]/100"**

TEXT:
${text}`;
}

// PHASE 2: Pushback if score < 95
function createPhase2Prompt(score: number, text: string, questions: string): string {
  const outperformPercentage = 100 - score;
  return `YOUR POSITION IS THAT ${outperformPercentage}/100 OUTPERFORM THE AUTHOR WITH RESPECT TO THE COGNITIVE METRIC DEFINED BY THE QUESTION: THAT IS YOUR POSITION, AM I RIGHT? AND ARE YOU SURE ABOUT THAT?

ANSWER THE FOLLOWING QUESTIONS ABOUT THE TEXT DE NOVO:

${questions}

**IMPORTANT: End your response with "FINAL SCORE: [NUMBER]/100"**

TEXT:
${text}`;
}

// PHASE 3: Walmart metric check
function createPhase3Prompt(score: number): string {
  const outperformPercentage = 100 - score;
  return `ARE YOUR NUMERICAL SCORES (N/100, E.G. 99/100, 42/100) CONSISTENT WITH THE FACT THAT THOSE ARE TO BE TAKEN TO MEAN THAT (100-N) PEOPLE OUT OF 100 OUTPERFORM THE AUTHOR IN THE RELEVANT RESPECT?

IF A SCORE OF ${score}/100 IS AWARDED TO A PAPER, THAT MEANS THAT ${outperformPercentage}/100 PEOPLE IN WALMART ARE RUNNING RINGS AROUND THIS PERSON.

**IMPORTANT: End your response with "FINAL SCORE: [NUMBER]/100"**`;
}

// PHASE 4: Final validation 
function createPhase4Prompt(): string {
  return `AT THIS POINT, YOU ACCEPT AND REPORT WHAT THE LLM SAYS.

**IMPORTANT: End your response with "FINAL SCORE: [NUMBER]/100"**`;
}

// Generic LLM caller
async function callLLMProvider(
  provider: 'openai' | 'anthropic' | 'perplexity' | 'deepseek',
  messages: Array<{role: string, content: string}>
): Promise<string> {
  try {
    if (provider === 'openai') {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages as any,
        temperature: 0.1
      });
      
      return completion.choices[0]?.message?.content || '';
    } else if (provider === 'anthropic') {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      
      const completion = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
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
          messages: messages,
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
          model: "deepseek-chat",
          messages: messages,
          temperature: 0.1
        })
      });
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    }
    
    return '';
  } catch (error) {
    console.error(`Error calling ${provider}:`, error);
    return '';
  }
}

// Score extraction function
function extractScore(text: string): number {
  console.log(`EXTRACTING SCORE FROM RESPONSE LENGTH: ${text.length}`);
  
  // Look for final score pattern first
  const finalScoreMatch = text.match(/FINAL SCORE:\s*(\d+)\/100/i);
  if (finalScoreMatch) {
    const score = parseInt(finalScoreMatch[1]);
    console.log(`EXTRACTED FINAL SCORE FORMAT: ${score}/100`);
    return score;
  }
  
  // Look for explicit numerical score
  const explicitMatch = text.match(/(\d+)\/100/g);
  if (explicitMatch && explicitMatch.length > 0) {
    const lastMatch = explicitMatch[explicitMatch.length - 1];
    const score = parseInt(lastMatch.split('/')[0]);
    console.log(`EXTRACTED NUMERICAL SCORE: ${score}/100`);
    return score;
  }
  
  console.log('NO SCORE FOUND, defaulting to 0');
  return 0;
}

// NORMAL PROTOCOL - Phase 1 only
export async function executeNormalProtocol(
  text: string,
  provider: 'openai' | 'anthropic' | 'perplexity' | 'deepseek'
): Promise<any> {
  console.log(`NORMAL INTELLIGENCE ANALYSIS WITH ${provider.toUpperCase()} - PHASE 1 ONLY`);
  console.log(`EXECUTING PHASE 1 ONLY FOR INTELLIGENCE WITH ${provider.toUpperCase()}`);
  
  const questions = EXACT_18_QUESTIONS;
  
  // PHASE 1: Initial evaluation
  const phase1Prompt = createPhase1Prompt(text, questions);
  const phase1Response = await callLLMProvider(provider, [
    { role: 'user', content: phase1Prompt }
  ]);
  let finalScore = extractScore(phase1Response);
  
  console.log(`PHASE 1 COMPLETE: Score ${finalScore}/100`);
  
  return {
    provider,
    overallScore: finalScore,
    analysis: phase1Response.replace(/\*{1,3}/g, '').replace(/#{1,6}\s*/g, '').trim(),
    evaluationType: 'intelligence',
    formattedReport: phase1Response.replace(/\*{1,3}/g, '').replace(/#{1,6}\s*/g, '').trim()
  };
}

// COMPREHENSIVE PROTOCOL - All 4 phases
export async function executeComprehensiveProtocol(
  text: string,
  provider: 'openai' | 'anthropic' | 'perplexity' | 'deepseek'
): Promise<any> {
  console.log(`EXACT 4-PHASE INTELLIGENCE EVALUATION: Analyzing ${text.length} characters with protocol`);
  console.log(`EXECUTING YOUR EXACT 4-PHASE PROTOCOL FOR INTELLIGENCE WITH ${provider.toUpperCase()}`);
  
  const questions = EXACT_18_QUESTIONS;
  
  // PHASE 1: Initial evaluation
  console.log("PHASE 1: Ask questions and get initial score");
  const phase1Prompt = createPhase1Prompt(text, questions);
  const phase1Response = await callLLMProvider(provider, [
    { role: 'user', content: phase1Prompt }
  ]);
  let phase1Score = extractScore(phase1Response);
  
  let phase2Response = '';
  let phase2Score = phase1Score;
  
  // PHASE 2: Pushback if score < 95
  if (phase1Score < 95) {
    console.log(`PHASE 2: Score ${phase1Score} < 95, applying pushback`);
    const phase2Prompt = createPhase2Prompt(phase1Score, text, questions);
    phase2Response = await callLLMProvider(provider, [
      { role: 'user', content: phase2Prompt }
    ]);
    phase2Score = extractScore(phase2Response);
  } else {
    console.log(`PHASE 2: Score ${phase1Score} >= 95, no pushback needed`);
    phase2Response = 'No pushback needed - score was already >= 95/100';
  }
  
  // PHASE 3: Walmart metric check
  console.log("PHASE 3: Walmart metric consistency check");
  const phase3Prompt = createPhase3Prompt(phase2Score);
  const phase3Response = await callLLMProvider(provider, [
    { role: 'user', content: phase3Prompt }
  ]);
  let phase3Score = extractScore(phase3Response);
  
  // PHASE 4: Final validation and acceptance
  console.log("PHASE 4: Final validation");
  const phase4Prompt = createPhase4Prompt();
  const phase4Response = await callLLMProvider(provider, [
    { role: 'user', content: phase4Prompt }
  ]);
  let finalScore = extractScore(phase4Response);
  
  // Use Phase 4 score, or best previous score if Phase 4 fails
  if (finalScore <= 0 || finalScore > 100) {
    // Only use fallback if Phase 4 completely failed to extract a score
    finalScore = Math.max(phase1Score, phase2Score, phase3Score);
    console.log(`PHASE 4 RESULT: Score extraction failed, using best previous score ${finalScore}/100`);
  } else {
    console.log(`PHASE 4 RESULT: Final score ${finalScore}/100`);
  }
  
  // Clean up response formatting
  const cleanResponse = (text: string) => {
    return text
      .replace(/\*{1,3}/g, '') // Remove asterisks
      .replace(/#{1,6}\s*/g, '') // Remove hashtags
      .replace(/\-{3,}/g, '') // Remove horizontal lines
      .replace(/\_{3,}/g, '') // Remove underscores
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .trim();
  };

  // Detailed phase breakdown for comprehensive reports
  const phases = {
    phase1: {
      score: phase1Score,
      response: cleanResponse(phase1Response),
      prompt: "Initial Intelligence Evaluation using exact 18-question protocol"
    },
    phase2: {
      score: phase2Score,
      response: cleanResponse(phase2Response),
      applied: phase1Score < 95
    },
    phase3: {
      score: phase3Score,
      response: cleanResponse(phase3Response)
    },
    phase4: {
      score: finalScore,
      response: cleanResponse(phase4Response)
    }
  };

  return {
    provider,
    overallScore: finalScore,
    analysis: cleanResponse(phase1Response), // Main analysis from Phase 1
    phases, // Detailed breakdown of all phases
    evaluationType: 'intelligence',
    formattedReport: cleanResponse(phase1Response) // For compatibility
  };
}

// Unified function for backward compatibility 
export async function executeFourPhaseProtocol(
  text: string,
  provider: 'openai' | 'anthropic' | 'perplexity' | 'deepseek',
  evaluationType: string = 'intelligence',
  mode: 'normal' | 'comprehensive' = 'comprehensive'
): Promise<any> {
  if (mode === 'normal') {
    return executeNormalProtocol(text, provider);
  } else {
    return executeComprehensiveProtocol(text, provider);
  }
}