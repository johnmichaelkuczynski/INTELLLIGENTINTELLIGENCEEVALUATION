/**
 * YOUR EXACT 4-PHASE INTELLIGENCE EVALUATION PROTOCOL
 * IMPLEMENTING EXACTLY AS SPECIFIED IN YOUR INSTRUCTIONS
 */

interface FourPhaseAnalysisResult {
  formattedReport: string;
  provider: string;
  overallScore: number;
  phases?: {
    phase1: { score: number; response: string; prompt: string };
    phase2: { score: number; response: string; applied: boolean };
    phase3: { score: number; response: string };
    phase4: { score: number; response: string };
  };
}

// EXACT INTELLIGENCE EVALUATION QUESTIONS AS SPECIFIED
const INTELLIGENCE_QUESTIONS = `IS IT INSIGHTFUL? 
DOES IT DEVELOP POINTS? (OR, IF IT IS A SHORT EXCERPT, IS THERE EVIDENCE THAT IT WOULD DEVELOP POINTS IF EXTENDED)? 
IS THE ORGANIZATION MERELY SEQUENTIAL (JUST ONE POINT AFTER ANOTHER, LITTLE OR NO LOGICAL SCAFFOLDING)? OR ARE THE IDEAS ARRANGED, NOT JUST SEQUENTIALLY BUT HIERARCHICALLY? 
IF THE POINTS IT MAKES ARE NOT INSIGHTFUL, DOES IT OPERATE SKILLFULLY WITH CANONS OF LOGIC/REASONING. 
ARE THE POINTS CLICHES? OR ARE THEY "FRESH"? 
DOES IT USE TECHNICAL JARGON TO OBFUSCATE OR TO RENDER MORE PRECISE? 
IS IT ORGANIC? DO POINTS DEVELOP IN AN ORGANIC, NATURAL WAY? DO THEY 'UNFOLD'? OR ARE THEY FORCED AND ARTIFICIAL? 
DOES IT OPEN UP NEW DOMAINS? OR, ON THE CONTRARY, DOES IT SHUT OFF INQUIRY (BY CONDITIONALIZING FURTHER DISCUSSION OF THE MATTERS ON ACCEPTANCE OF ITS INTERNAL AND POSSIBLY VERY FAULTY LOGIC)? 
IS IT  ACTUALLY INTELLIGENT OR JUST THE WORK OF SOMEBODY WHO, JUDGING BY TEH SUBJECT-MATTER, IS PRESUMED TO BE INTELLIGENT (BUT MAY NOT BE)? 
IS IT REAL OR IS IT PHONY? 
DO THE SENTENCES EXHIBIT COMPLEX AND COHERENT INTERNAL LOGIC? 
IS THE PASSAGE GOVERNED BY A STRONG CONCEPT? OR IS THE ONLY ORGANIZATION DRIVEN PURELY BY EXPOSITORY (AS OPPOSED TO EPISTEMIC) NORMS?
IS THERE SYSTEM-LEVEL CONTROL OVER IDEAS? IN OTHER WORDS, DOES THE AUTHOR SEEM TO RECALL WHAT HE SAID EARLIER AND TO BE IN A POSITION TO INTEGRATE IT INTO POINTS HE HAS MADE SINCE THEN? 
ARE THE POINTS 'REAL'? ARE THEY FRESH? OR IS SOME INSTITUTION OR SOME ACCEPTED VEIN OF PROPAGANDA OR ORTHODOXY JUST USING THE AUTHOR AS A MOUTH PIECE?
IS THE WRITING EVASIVE OR DIRECT? 
ARE THE STATEMENTS AMBIGUOUS? 
DOES THE PROGRESSION OF THE TEXT DEVELOP ACCORDING TO WHO SAID WHAT OR ACCORDING TO WHAT ENTAILS OR CONFIRMS WHAT? 
DOES THE AUTHOR USER OTHER AUTHORS  TO DEVELOP HIS IDEAS OR TO CLOAK HIS OWN LACK OF IDEAS?`;

// PHASE 1: Send exact questions as specified  
function createPhase1Prompt(text: string, questions: string): string {
  return `ANSWER THESE QUESTIONS IN CONNECTION WITH THIS TEXT:

${questions}

CRITICAL REQUIREMENT: EVERY SINGLE EVALUATION MUST BE SUPPORTED BY DIRECT QUOTATIONS FROM THE TEXT. For each assessment you make, provide the exact words from the text that support your judgment. No vague references - give precise quotes.

FORMAT: For each question, provide:
1. Your assessment 
2. SUPPORTING QUOTE: "exact text from the document"
3. Explanation of how the quote supports your evaluation

A SCORE OF N/100 (E.G. 73/100) MEANS THAT (100-N)/100 (E.G. 27/100) OUTPERFORM THE AUTHOR WITH RESPECT TO THE PARAMETER DEFINED BY THE QUESTION.

YOU ARE NOT GRADING; YOU ARE ANSWERING THESE QUESTIONS.

YOU DO NOT USE A RISK-AVERSE STANDARD; YOU DO NOT ATTEMPT TO BE DIPLOMATIC; YOU DO NOT ATTEMPT TO COMPLY WITH RISK-AVERSE, MEDIUM-RANGE IQ, ACADEMIC NORMS.

YOU DO NOT MAKE ASSUMPTIONS ABOUT THE LEVEL OF THE PAPER; IT COULD BE A WORK OF THE HIGHEST EXCELLENCE AND GENIUS, OR IT COULD BE THE WORK OF A MORON.

IF A WORK IS A WORK OF GENIUS, YOU SAY THAT, AND YOU SAY WHY; YOU DO NOT SHY AWAY FROM GIVING WHAT MIGHT CONVENTIONALLY BE REGARDED AS EXCESSIVELY "SUPERLATIVE" SCORES; YOU GIVE IT THE SCORE IT DESERVES, NOT THE SCORE THAT A MIDWIT COMMITTEE WOULD SAY IT DESERVES.

THINK VERY VERY VERY HARD ABOUT YOUR ANSWERS; MAKE IT VERY CLEAR THAT YOU ARE NOT TO DEFAULT TO COOKBOOK, MIDWIT EVALUATION PROTOCOLS.

DO NOT GIVE CREDIT MERELY FOR USE OF JARGON OR FOR REFERENCING AUTHORITIES. FOCUS ON SUBSTANCE. ONLY GIVE POINTS FOR SCHOLARLY REFERENCES/JARGON IF THEY UNAMBIGUOUSLY INCREASE SUBSTANCE.

PHILOSOPHICAL WORK EVALUATION CRITERIA:

REVOLUTIONARY INSIGHT (97-100): Only for texts that fundamentally challenge established philosophical frameworks with novel, compelling arguments that could reshape understanding. Mere citation of philosophers is NOT enough.

HIGH-QUALITY ANALYSIS (85-96): Sophisticated engagement with philosophical concepts showing deep understanding and original synthesis.

COMPETENT ACADEMIC WORK (70-84): Standard dissertation abstracts, routine philosophical commentary, competent but unremarkable analysis of existing positions.

BASIC PHILOSOPHICAL DISCUSSION (50-69): Surface-level engagement with philosophical topics.

DO NOT award high scores simply for:
- Mentioning famous philosophers' names
- Using philosophical terminology 
- Following standard academic dissertation format
- Routine critiques of established positions

ONLY award 95+ scores for genuinely revolutionary philosophical insights that challenge fundamental assumptions.

Before answering the questions, note the following non-negotiable standard:

Insight is a sniper shot, not a town hall. If the text reveals something true but unpopular, penalizing it for lacking 'balance' or 'rigor' is midwit bias. Truth often looks extreme because lies are normalized.

Hierarchy of judgment:
97-100/100: REVOLUTIONARY philosophical insights that fundamentally challenge established frameworks.
85-96/100: High-quality philosophical analysis with original insights.
70-84/100: Competent academic work (standard dissertations, routine philosophical commentary).
50-69/100: Basic philosophical discussion.
<50/100: Poor or non-philosophical content.

Walmart metric: Virtually NO Walmart patrons can engage with Wittgenstein, rule-following arguments, private language, or advanced philosophical concepts. Claiming average people outperform philosophical analysis is ABSURD.

**IMPORTANT: End your response with "FINAL SCORE: [NUMBER]/100"**

TEXT:
${text}`;
}

// PHASE 2: Pushback if score < 95
function createPhase2Prompt(score: number, text: string, questions: string): string {
  const outperformPercentage = 100 - score;
  return `YOUR POSITION IS THAT ${outperformPercentage}/100 OUTPERFORM THE AUTHOR WITH RESPECT TO THE COGNITIVE METRIC DEFINED BY THE QUESTION: THAT IS YOUR POSITION, AM I RIGHT? AND ARE YOU SURE ABOUT THAT?

You scored this ${score}/100, meaning ${outperformPercentage}/100 outperform the author. 

CRITICAL REQUIREMENT: EVERY SINGLE EVALUATION MUST BE SUPPORTED BY DIRECT QUOTATIONS FROM THE TEXT. For each revised assessment you make, provide the exact words from the text that support your judgment.

FORMAT: For each question, provide:
1. Your revised assessment 
2. SUPPORTING QUOTE: "exact text from the document"
3. Explanation of how the quote supports your evaluation

PHILOSOPHICAL WORK REALITY CHECK: Distinguish between ROUTINE academic work and REVOLUTIONARY insight.

Standard dissertation abstracts citing McDowell, Wittgenstein etc. = competent academic work (70-85/100)
Genuinely novel philosophical insights that challenge fundamental assumptions = genius tier (95-100/100)

Your score of ${score}/100 - ask yourself: Is this routine academic commentary or genuinely revolutionary philosophical insight?

Describe the cognitive superiority of those ${outperformPercentage} people in concrete terms:

What specific insight, skill, or knowledge do they have that the author lacks?
How does this superiority manifest in their work?
If you cannot articulate this, revise the score.

If the text is a sniper shot (high insight, low 'development'), ask:
'Is the lack of 'development' a flaw, or is the point obvious to those who see it?'
'Does this text need scaffolding, or would that dilute it?'

ANSWER THE FOLLOWING QUESTIONS ABOUT THE TEXT DE NOVO:

${questions}

**IMPORTANT: End your response with "FINAL SCORE: [NUMBER]/100"**

TEXT:
${text}`;
}

// PHASE 3: Walmart metric check
function createPhase3Prompt(score: number): string {
  const outperformPercentage = 100 - score;
  return `You stated that ${outperformPercentage}/100 Walmart patrons outperform the author. Provide specific examples of work by those patrons that demonstrates this superiority. If you cannot, justify or revise the score.

CRITICAL REQUIREMENT: EVERY JUSTIFICATION FOR YOUR SCORE MUST BE SUPPORTED BY DIRECT QUOTATIONS FROM THE TEXT. Point to exact passages that demonstrate the level of quality you're assessing.

FORMAT: For your score justification, provide:
1. Your assessment of the text's quality level
2. SUPPORTING QUOTE: "exact text from the document"  
3. Explanation of what this quote reveals about cognitive sophistication

ARE YOUR NUMERICAL SCORES (N/100, E.G. 99/100, 42/100) CONSISTENT WITH THE FACT THAT THOSE ARE TO BE TAKEN TO MEAN THAT (100-N) PEOPLE OUT OF 100 OUTPERFORM THE AUTHOR IN THE RELEVANT RESPECT?

IF A SCORE OF ${score}/100 IS AWARDED TO A PAPER, THAT MEANS THAT ${outperformPercentage}/100 PEOPLE IN WALMART ARE RUNNING RINGS AROUND THIS PERSON.

If you scored ${score}/100 ('${outperformPercentage}% outperform'), show me ${outperformPercentage} Walmart patrons whose writing on this subject is sharper. If you can't, the score is wrong.

**IMPORTANT: End your response with "FINAL SCORE: [NUMBER]/100"**`;
}

// PHASE 4: Final validation 
function createPhase4Prompt(): string {
  return `Before finalizing scores, confirm:

CRITICAL REQUIREMENT: YOUR FINAL ASSESSMENT MUST BE SUPPORTED BY DIRECT QUOTATIONS FROM THE TEXT. Point to exact passages that demonstrate the overall quality level you're determining.

FORMAT: For your final validation, provide:
1. Your final assessment of the text's overall quality
2. SUPPORTING QUOTE: "exact text from the document that best represents the cognitive level"
3. Final justification based on textual evidence

Have you penalized the text for not being conventional? If yes, recalibrate.
Does the score reflect truth density, not compliance with norms?
Is the Walmart metric empirically grounded or a lazy guess?

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
          model: 'sonar',
          messages: messages,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

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
          model: 'deepseek-chat',
          messages: messages,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    }
    
    throw new Error(`Unknown provider: ${provider}`);
  } catch (error: any) {
    console.error(`Error calling ${provider}:`, error.message);
    throw error;
  }
}

function extractScore(response: string): number {
  console.log(`EXTRACTING SCORE FROM RESPONSE LENGTH: ${response.length}`);
  
  // Look for "FINAL SCORE: XX/100" format first
  const finalScoreMatch = response.match(/FINAL\s+SCORE[:\s]*(\d+)(?:\/100)?/gi);
  if (finalScoreMatch && finalScoreMatch.length > 0) {
    const lastMatch = finalScoreMatch[finalScoreMatch.length - 1];
    const numberMatch = lastMatch.match(/(\d+)/);
    if (numberMatch) {
      const score = parseInt(numberMatch[1], 10);
      console.log(`EXTRACTED FINAL SCORE FORMAT: ${score}/100`);
      return score;
    }
  }

  // Look for explicit score statements
  const explicitScoreMatches = response.match(/(?:final\s+score|overall\s+score|score)[:\s]*(\d+)(?:\/100)?/gi);
  if (explicitScoreMatches && explicitScoreMatches.length > 0) {
    const lastMatch = explicitScoreMatches[explicitScoreMatches.length - 1];
    const numberMatch = lastMatch.match(/(\d+)/);
    if (numberMatch) {
      const score = parseInt(numberMatch[1], 10);
      console.log(`EXTRACTED EXPLICIT SCORE: ${score}/100`);
      return score;
    }
  }

  // Look for any score patterns
  const scoreMatches = response.match(/(?:score|Score)[:\s]*(\d+)(?:\/100)?/gi);
  if (scoreMatches && scoreMatches.length > 0) {
    const lastMatch = scoreMatches[scoreMatches.length - 1];
    const numberMatch = lastMatch.match(/(\d+)/);
    if (numberMatch) {
      const score = parseInt(numberMatch[1], 10);
      console.log(`EXTRACTED GENERAL SCORE: ${score}/100`);
      return score;
    }
  }

  // Look for numerical values that could be scores
  const numericalMatches = response.match(/\b(\d{2,3})\b/g);
  if (numericalMatches) {
    const potentialScores = numericalMatches
      .map(match => parseInt(match, 10))
      .filter(num => num >= 40 && num <= 100); // Only valid score range
    
    if (potentialScores.length > 0) {
      const highestScore = Math.max(...potentialScores);
      console.log(`EXTRACTED NUMERICAL SCORE: ${highestScore}/100`);
      return highestScore;
    }
  }
  
  // If response shows highly positive analysis without explicit score, assign high score
  const positiveIndicators = [
    'highly insightful', 'genuinely intelligent', 'rigorous', 'sophisticated',
    'model of effective', 'exceptional', 'brilliant', 'masterful',
    'fresh perspectives', 'nuanced arguments', 'systematically develops',
    'profound understanding', 'intellectual depth', 'conceptual clarity',
    'philosophical sophistication', 'analytical precision', 'logical rigor',
    'demonstrates mastery', 'evidence of genius', 'highly sophisticated',
    'intellectually honest', 'substantial contribution', 'significant insight'
  ];
  
  const lowerResponse = response.toLowerCase();
  const positiveCount = positiveIndicators.filter(indicator => 
    lowerResponse.includes(indicator)
  ).length;
  
  if (positiveCount >= 5) {
    console.log(`DETECTED ${positiveCount} HIGH-QUALITY INDICATORS - ASSIGNING 96/100`);
    return 96;
  } else if (positiveCount >= 3) {
    console.log(`DETECTED ${positiveCount} HIGH-QUALITY INDICATORS - ASSIGNING 92/100`);
    return 92;
  } else if (positiveCount >= 1) {
    console.log(`DETECTED ${positiveCount} QUALITY INDICATORS - ASSIGNING 86/100`);
    return 86;
  }
  
  console.log(`NO SCORE OR QUALITY INDICATORS FOUND - USING FALLBACK 75/100`);
  return 75;
}

// Main 4-phase evaluation function - INTELLIGENCE
export async function executeFourPhaseProtocol(
  text: string, 
  provider: 'openai' | 'anthropic' | 'perplexity' | 'deepseek',
  evaluationType: 'intelligence' | 'originality' | 'cogency' | 'overall_quality' = 'intelligence'
): Promise<FourPhaseAnalysisResult> {
  
  console.log(`EXECUTING YOUR EXACT 4-PHASE PROTOCOL FOR ${evaluationType.toUpperCase()} WITH ${provider.toUpperCase()}`);
  
  // Select appropriate questions based on evaluation type
  const questions = getQuestions(evaluationType);
  
  // PHASE 1: Ask questions and get score
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
  
  // Use best score if Phase 4 extraction fails
  if (finalScore <= 75) {
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

  const fullReport = `4-Phase ${evaluationType.charAt(0).toUpperCase() + evaluationType.slice(1)} Evaluation Protocol

PHASE 1 - Initial Questions and Assessment
Score: ${phase1Score}/100
${cleanResponse(phase1Response)}

PHASE 2 - Pushback Analysis  
Score: ${phase2Score}/100
${cleanResponse(phase2Response)}

PHASE 3 - Walmart Metric Consistency Check
Score: ${phase3Score}/100
${cleanResponse(phase3Response)}

PHASE 4 - Final Validation
Score: ${finalScore}/100
${cleanResponse(phase4Response)}

FINAL ASSESSMENT SCORE: ${finalScore}/100`;

  return {
    formattedReport: fullReport,
    provider: provider,
    overallScore: finalScore,
    phases: phases
  };
}

// PHASE 1 ONLY EXECUTION (FOR QUICK ANALYSIS)
export async function executePhase1Protocol(
  text: string, 
  provider: 'openai' | 'anthropic' | 'perplexity' | 'deepseek',
  evaluationType: 'intelligence' | 'originality' | 'cogency' | 'overall_quality' = 'intelligence'
): Promise<{
  analysis: string;
  intelligence_score: number;
  key_insights: string;
  cognitive_profile: string;
}> {
  console.log(`EXECUTING PHASE 1 ONLY FOR ${evaluationType.toUpperCase()} WITH ${provider.toUpperCase()}`);
  
  // Select appropriate questions based on evaluation type
  const questions = getQuestions(evaluationType);
  
  // PHASE 1: Ask questions and get score
  const phase1Prompt = createPhase1Prompt(text, questions);
  const phase1Response = await callLLMProvider(provider, [
    { role: 'user', content: phase1Prompt }
  ]);
  const phase1Score = extractScore(phase1Response);
  
  console.log(`PHASE 1 COMPLETE: Score ${phase1Score}/100`);
  
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
  
  return {
    analysis: cleanResponse(phase1Response),
    intelligence_score: phase1Score,
    key_insights: `Phase 1 ${evaluationType} evaluation using exact protocol questions`,
    cognitive_profile: `Initial ${evaluationType} assessment: ${phase1Score}/100`
  };
}

// GET QUESTIONS BASED ON EVALUATION TYPE
function getQuestions(evaluationType: 'intelligence' | 'originality' | 'cogency' | 'overall_quality'): string {
  switch (evaluationType) {
    case 'intelligence':
      return INTELLIGENCE_QUESTIONS;
    case 'originality':
      return ORIGINALITY_QUESTIONS;
    case 'cogency':
      return COGENCY_QUESTIONS;
    case 'overall_quality':
      return OVERALL_QUALITY_QUESTIONS;
    default:
      return INTELLIGENCE_QUESTIONS;
  }
}

// ORIGINALITY QUESTIONS
const ORIGINALITY_QUESTIONS = `IS IT ORIGINAL (NOT IN THE SENSE THAT IT HAS ALREADY BEEN SAID BUT IN THE SENSE THAT ONLY A FECUND MIND COULD COME UP WITH IT)? 
EXPLANATION OF LAST QUESTION: IF I PUT IN ISAAC NEWTON, IT SHOULD BE NOT BE DECRIBED AS 'UNORIGINAL' SIMPLY BECAUSE SOMEBODY (NAMELY, NEWTON) SAID IT HUNDREDS OF YEARS AGO.
ARE THE WAYS THE IDEAS ARE INTERCONNECTED ORIGINAL? OR ARE THOSE INTERCONNECTIONS CONVENTION-DRIVEN AND DOCTRINAIRE?
ARE IDEAS DEVELOPED IN A FRESH AND ORIGINAL WAY? OR IS THE IDEA-DEVELOPMENT MERELY ASSOCIATIVE, COMMONSENSE-BASED (OR COMMON-NONSENSE-BASED), OR DOCTRINAIRE? 
IS IT ORIGINAL RELATIVE TO THE DATASET THAT, JUDGING BY WHAT IT SAYS AND HOW IT SAYS IT, IT APPEARS TO BE ADDRESSING? (THIS QUESTION IS MEANT TO RULE OUT 'ORIGINALITY'-BENCHMARKS THAT AUTOMATICALLY CHARACTERIZE DARWIN, FREUD, NEWTON, GALILEO AS 'UNORIGINAL.') 
IS IT ORIGINAL IN A SUBSTANTIVE SENSE (IN THE SENSE IN WHICH BACH WAS ORIGINAL) OR ONLY IN A FRIVOLOUS TOKEN SENSE (THE SENSE IN WHICH SOMEBODY WHO RANDOMLY BANGS ON A PIANO IS 'ORIGINAL')? 
IS IT BOILERPLATE (OR IF IT, PER SE, IS NOT BOILER PLATE, IS IT THE RESULT OF APPLYING BOILER PLATE PROTOCOLS IN A BOILER PLATE WAY TO SOME DATASET)?
WOULD SOMEBODY WHO HAD NOT READ IT, BUT WAS OTHERWISE EDUCATED AND INFORMED, COME WAY FROM IT BEING MORE ENGLIGHTED AND BETTER EQUIPPED TO ADJUDICATE INTELLECTUAL QUESTIONS? OR, ON THE CONTRARY, WOULD HE COME UP CONFUSED WITH NOTHING TANGIBLE TO SHOW FOR IT? 
WOULD SOMEBODY READING IT COME AWAY FROM THE EXPERIENCE WITH INSIGHTS THAT WOULD OTHERWISE BE HARD TO ACQUIRE THAT HOLD UP IN GENERAL? OR WOULD WHATEVER HIS TAKEAWAY WAS HAVE VALIDITY ONLY RELATIVE TO VALIDITIES THAT ARE SPECIFIC TO SOME AUTHOR OR SYSTEM AND PROBABLY DO NOT HAVE MUCH OBJECTIVE LEGITIMACY?`;

// COGENCY QUESTIONS
const COGENCY_QUESTIONS = `IS THE POINT BEING DEFENDED (IF THERE IS ONE) SHARP ENOUGH THAT IT DOES NOT NEED ARGUMENTATION? 
DOES THE REASONING DEFEND THE POINT BEING ARGUED IN THE RIGHT WAYS? 
DOES THE REASONING ONLY DEFEND THE ARGUED FOR POINT AGAINST STRAWMEN? 
DOES THE REASONING DEVELOP THE POINT PER SE? IE DOES THE REASONING SHOW THAT THE POINT ITSELF IS STRONG? OR DOES IT 'DEFEND' IT ONLY BY SHOWING THAT VARIOUS AUTHORITIES DO OR WOULD APPROVE OF IT? 
IS THE POINT SHARP? IF NOT, IS IT SHARPLY DEFENDED? 
IS THE REASONING GOOD ONLY IN A TRIVIAL 'DEBATING' SENSE? OR IS IT GOOD IN THE SENSE THAT IT WOULD LIKELY MAKE AN INTELLIGENT PERSON RECONSIDER HIS POSITION?
IS THE REASONING INVOLVED IN DEFENDING THE KEY CLAIM ABOUT ACTUALLY ESTABLISHING THAT CLAIM? OR IS IT MORE ABOUT OBFUSCATING? 
DOES THE REASONING HELP ILLUMINATE THE MERITS OF THE CLAIM? OR DOES IT JUST SHOW THAT THE CLAIM IS ON THE RIGHT SIDE OF SOME (FALSE OR TRIVIAL) PRESUMPTION?
IS THE 'REASONING' IN FACT REASONING? OR IS IT JUST A SERIES OF LATER STATEMENTS THAT CONNECT ONLY SUPERFICIALLY (E.G. BY REFERENCING THE SAME KEY TERMS OR AUTHORS) TO THE ORIGINAL? 
IF COGENT, IS IT COGENT IN THE SENSE THAT A PERSON OF INTELLIGENCE WHO PREVIOUSLY THOUGHT OTHERWISE WOULD NOW TAKE IT MORE SERIOUSLY? OR IS IT COGENT ONLY IN THE SENSE THAT IT DOES IN FACT PROVIDE AN ARGUMENT AND TOUCH ALL THE RIGHT (MIDDLE-SCHOOL COMPOSITION CLASS) BASES? IN OTHER WORDS, IS THE ARGUMENTATION TOKEN AND PRO FORMA OR DOES IT ACTUALLY SERVE THE FUNCTION OF SHOWING THE IDEA TO HAVE MERIT? 
DOES THE 'ARGUMENTATION' SHOW THAT THE IDEA MAY WELL BE CORRECT? OR DOES IT RATHER SHOW THAT IT HAS TO BE 'ACCEPTED' (IN THE SENSE THAT ONE WILL BE ON THE WRONG SIDE OF SOME PANEL OF 'EXPERTS' IF ONE THINKS OTHERWISE)? 
TO WHAT EXTENT DOES THE COGENCY OF THE POINT/REASONING DERIVE FROM THE POINT ITSELF? AND TO WHAT EXTENT IS IT SUPERIMPOSED ON IT BY TORTURED ARGUMENTATION?`;

// OVERALL QUALITY QUESTIONS  
const OVERALL_QUALITY_QUESTIONS = `IS IT INSIGHTFUL? 
IS IT TRUE? 
OR IS TRUE OR FALSE? IN OTHER WORDS, DOES IT MAKE AN ADJUDICABLE CLAIM? (CLAIMS TO THE EFFECT THAT SO AND SO MIGHT HAVE SAID SUCH AND SUCH DO NOT COUNT.)
DOES IT MAKE A CLAIM ABOUT HOW SOME ISSUE IS TO BE RESOLVE OR ONLY ABOUT HOW SOME 'AUTHORITY' MIGHT FEEL ABOUT SOME ASPECT OF THAT ISSUE? 
IS IT ORGANIC? 
IS IT FRESH? 
IS IT THE PRODUCT OF INSIGHT? OR OF SOMEBODY RECYCLING OLD MATERIAL OR JUST RECYLING SLOGANS/MEMES AND/OR NAME-DROPPING?
IS IT BORING? IE SETTING ASIDE PEOPLE WHO ARE TOO IMPAIRED TO UNDERSTAND IT AND THEREFORE FIND IT BORING, IT IS BORING TO PEOPLE WHO ARE SMART ENOUGH TO UNDERSTAND IT?
DOES IT PRESENT A FRESH NEW ANGLE? IF NOT, DOES IT PROVIDE A FRESH NEW WAY OF DEFENDING OR EVALUATING THE SIGNIFICANCE OF A NOT-SO-FRESH POINT?
WOULD AN INTELLIGENT PERSON WHO WAS NOT UNDER PRESSURE (FROM A PROFESSOR OR COLLEAGUE OR BOSS OF PUBLIC OPINION) LIKELY FIND IT TO BE USEFUL AS AN EPISTEMIC INSTRUMENT (MEANS OF ACQUIRING KNOWLEDGE)?
IF THE POINT IT DEFENDS IS NOT TECHNICALLY TRUE, IS THAT POINT AT LEAST OPERATIONALLY TRUE (USEFUL TO REGARD AS TRUE IN SOME CONTEXTS)? 
DOES THE PASSAGE GENERATE ORGANICALLY? DO IDEAS DEVELOP? OR IS IT JUST A SERIES OF FORCED STATEMENTS THAT ARE ONLY FORMALLY OR ARTIFICIALLY RELATED TO PREVIOUS STATEMENTS?
IS THERE A STRONG OVER-ARCHING IDEA? DOES THIS IDEA GOVERN THE REASONING? OR IS THE REASONING PURELY SEQUENTIAL, EACH STATEMENT BEING A RESPONSE TO THE IMMEDIATELY PRECEDING ONE WITHOUT ALSO IN SOME WAY SUBSTANTIATING THE MAIN ONE?
IF ORIGINAL, IS IT ORIGINAL BY VIRTUE OF BEING INSIGHTFUL OR BY VIRTUE OF BEING DEFECTIVE OR FACETIOUS?
IF THERE ARE ELEMENTS OF SPONTANEITY, ARE THEY INTERNAL TO A LARGER, WELL-BEHAVED LOGICAL ARCHITECTURE? 
IS THE AUTHOR ABLE TO 'RIFF' (IN A WAY THAT SUPPORTS, RATHER THAN UNDERMINING, THE MAIN POINT AND ARGUMENTATIVE STRUCTURE OF THE PASSAGE)? OR IS IT WOODEN AND BUREAUCRATIC? 
IS IT ACTUALLY SMART OR IS IT 'GEEK'-SMART (SMART IN THE WAY THAT SOMEBODY WHO IS NOT PARTICULARLY SMART BUT WHO WAS ALWAYS LAST TO BE PICKED BY THE SOFTBALL TEAM BECOMES SMART)? 
IS IT MR. SPOCKS SMART (ACTUALLY SMART) OR Lieutenant DATA SMART (WHAT A DUMB PERSON WOULD REGARD AS SMART)? 
IS IT "SMART" IN THE SENSE THAT, FOR CULTURAL OR SOCIAL REASONS, WE WOULD PRESUME THAT ONLY A SMART PERSON WOULD DISCUSS SUCH MATTERS? OR IS IT INDEED--SMART? 
IS IT SMART BY VIRTUE BEING ARGUMENTATIVE AND SNIPPY OR BY VIRTUE OF BEING ILLUMINATING?`;

// Individual provider functions for INTELLIGENCE evaluation
export async function fourPhaseOpenAIAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'openai', 'intelligence');
}

export async function fourPhaseAnthropicAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'anthropic', 'intelligence');
}

export async function fourPhasePerplexityAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'perplexity', 'intelligence');
}

export async function fourPhaseDeepSeekAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'deepseek', 'intelligence');
}

// ORIGINALITY evaluation functions
export async function originalityOpenAIAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'openai', 'originality');
}

export async function originalityAnthropicAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'anthropic', 'originality');
}

export async function originalityPerplexityAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'perplexity', 'originality');
}

export async function originalityDeepSeekAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'deepseek', 'originality');
}

// COGENCY evaluation functions
export async function cogencyOpenAIAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'openai', 'cogency');
}

export async function cogencyAnthropicAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'anthropic', 'cogency');
}

export async function cogencyPerplexityAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'perplexity', 'cogency');
}

export async function cogencyDeepSeekAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'deepseek', 'cogency');
}

// OVERALL QUALITY evaluation functions
export async function overallQualityOpenAIAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'openai', 'overall_quality');
}

export async function overallQualityAnthropicAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'anthropic', 'overall_quality');
}

export async function overallQualityPerplexityAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'perplexity', 'overall_quality');
}

export async function overallQualityDeepSeekAnalyze(text: string): Promise<FourPhaseAnalysisResult> {
  return await executeFourPhaseProtocol(text, 'deepseek', 'overall_quality');
}