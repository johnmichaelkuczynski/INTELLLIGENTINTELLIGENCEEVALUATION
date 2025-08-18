import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Mail } from 'lucide-react';
import { MathRenderer } from './MathRenderer';

interface ChunkRewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onRewriteUpdate: (newText: string) => void;
}

type LLMProvider = "openai" | "anthropic" | "perplexity" | "deepseek";

const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI (GPT-4)" },
  { value: "anthropic", label: "Anthropic (Claude)" },
  { value: "perplexity", label: "Perplexity AI" },
  { value: "deepseek", label: "DeepSeek" }
] as const;

// Default rewrite instruction based on your intelligence evaluation protocol
const DEFAULT_REWRITE_INSTRUCTIONS = `REWRITE THE TEXT SO THAT DOES WELL RELATIVE TO THE FOLLOWING INTELLIGENCE EVALUATION PROTOCOL: 

YOU SEND THE LLM THE FOLLOWING QUESTIONS: 

IS IT INSIGHTFUL? 
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
DOES THE AUTHOR USER OTHER AUTHORS  TO DEVELOP HIS IDEAS OR TO CLOAK HIS OWN LACK OF IDEAS? 

YOU TELL THE LLM TO ANSWER THOSE QUESTIONS. YOU SAY: ANSWER THESE QUESTIONS IN CONNECTION WITH THIS TEXT. YOU DON'T SAY: DETERMINE INTELLIGENCE OF TEXT.
YOU DO NOT SAY: DETERMINE INTELLIGENCE/COGENCY/ETC BY ANSWERING THESE QUESTIONS. YOU JUST SAY: ANSWER THESE QUESTIONS (AND ALSO GIVE A SCORE OUT OF 100). BUT THERE ARE SEVERAL QUALIFICATION.
AFTER YOU GIVE IT THE TEXT AND THE QUESTIONS, YOU SAY THE FOLLOWING: A SCORE OF N/100 (E.G. 73/100) MEANS THAT (100-N)/100 (E.G. 27/100) 
OUTPERFORM THE AUTHOR IN WITH RESPECT TO THE PARAMETER DEFINED BY THE QUESTION. YOU ALSO SAY: YOU ARE NOT GRADING; 
YOU ARE ANSWERING THESE QUESTIONS. YOU ALSO SAY: YOU DO NOT USE A RISK-AVERSE STANDARD; YOU DO NOT ATTEMPT TO BE DIPLOMATIC; YOU DO NOT ATTEMPT TO COMPLY WITH RISK-AVERSE, 
MEDIUM-RANGE IQ, ACADEMIC NORMS. YOU DO NOT MAKE ASSUMPTIONS ABOUT THE LEVEL OF THE PAPER; IT COULD BE A WORK OF THE HIGHEST EXCELENCE 
AND GENIUS, OR IT COULD BE THE WORK OF A MORON.
IF A WORK IS A WORK OF GENIUS, YOU SAY THAT, AND YOU SAY WHY; YOU DO NOT SHY AWAY FROM GIVING WHAT MIGHT CONVENTIONALLY BE REGARDED AS  
EXCESSIVELY "SUPERLATIVE"
SCORES; YOU GIVE IT THE SCORE IT DESERVES, NOT THE SCORE THAT A MIDWIT COMMITTEE WOULD SAY IT DESERVES. 

PHASE 2: IF THE SCORES ARE LESS THAN 95/100, YOU PUSH BACK. YOU SAY: YOUR POSITION IS THAT 
(E.G.) 11/100 OUTPERFORM THE AUTHOR WITH RESPECT TO THE COGNITIVE METRIC DEFINED BY THE 
QUESTION: THAT IS YOUR POSITION, AM I RIGHT? AND ARE YOU SURE ABOUT THAT? IN GENERAL, IF THE SCORE IS N/100 (E.G. 80/100) FOR A GIVEN QUESTION, 
YOU SAY: YOUR POSITION IS THAT 
(N-100)/100 (E.G. 20/100) OUTPERFORM THE AUTHOR WITH RESPECT TO THE COGNITIVE METRIC DEFINED BY THE 
QUESTION: THAT IS YOUR POSITION, AM I RIGHT? AND ARE YOU SURE ABOUT THAT?" IN SAYING THIS, YOU ARE NOT NECESSARILY TELLING IT TO CHANGE ITS SCORE, ONLY 
TO CAREFULLY CONSIDER IT. YOU ALSO SAY: ANSWER THE FOLLOWING QUESTIONS ABOUT THE TEXT DE NOVO: IS IT INSIGHTFUL? 
DOES IT DEVELOP POINTS? (OR, IF IT IS A SHORT EXCERPT, IS THERE EVIDENCE THAT IT WOULD DEVELOP POINTS IF EXTENDED)? 
IS THE ORGANIZATION MERELY SEQUENTIAL (JUST ONE POINT AFTER ANOTHER, LITTLE OR NO LOGICAL SCAFFOLDING)? OR ARE THE IDEAS ARRANGED, NOT JUST SEQUENTIALLY
BUT HIERARCHICALLY? 
IF THE POINTS IT MAKES ARE NOT INSIGHTFUL, DOES IT OPERATE SKILLFULLY WITH CANONS OF LOGIC/REASONING. 
ARE THE POINTS CLICHES? OR ARE THEY "FRESH"? 
DOES IT USE TECHNICAL JARGON TO OBFUSCATE OR TO RENDER MORE PRECISE? 
IS IT ORGANIC? DO POINTS DEVELOP IN AN ORGANIC, NATURAL WAY? DO THEY 'UNFOLD'? OR ARE THEY FORCED AND ARTIFICIAL? 
DOES IT OPEN UP NEW DOMAINS? OR, ON THE CONTRARY, DOES IT SHUT OFF INQUIRY (BY CONDITIONALIZING FURTHER DISCUSSION OF THE MATTERS ON ACCEPTANCE OF 
ITS INTERNAL AND POSSIBLY VERY FAULTY LOGIC)? 
IS IT  ACTUALLY INTELLIGENT OR JUST THE WORK OF SOMEBODY WHO, JUDGING BY TEH SUBJECT-MATTER, IS PRESUMED TO BE INTELLIGENT (BUT MAY NOT BE)? 
IS IT REAL OR IS IT PHONY? 
DO THE SENTENCES EXHIBIT COMPLEX AND COHERENT INTERNAL LOGIC? 
IS THE PASSAGE GOVERNED BY A STRONG CONCEPT? OR IS THE ONLY ORGANIZATION DRIVEN PURELY BY EXPOSITORY (AS OPPOSED TO EPISTEMIC) NORMS?
IS THERE SYSTEM-LEVEL CONTROL OVER IDEAS? IN OTHER WORDS, DOES THE AUTHOR SEEM TO RECALL WHAT HE SAID EARLIER AND TO BE IN A POSITION TO INTEGRATE IT INTO 
POINTS HE HAS MADE SINCE THEN? 
ARE THE POINTS 'REAL'? ARE THEY FRESH? OR IS SOME INSTITUTION OR SOME ACCEPTED VEIN OF PROPAGANDA OR ORTHODOXY JUST USING THE AUTHOR AS A MOUTH PIECE?
IS THE WRITING EVASIVE OR DIRECT? 
ARE THE STATEMENTS AMBIGUOUS? 
DOES THE PROGRESSION OF THE TEXT DEVELOP ACCORDING TO WHO SAID WHAT OR ACCORDING TO WHAT ENTAILS OR CONFIRMS WHAT? 
DOES THE AUTHOR USER OTHER AUTHORS  TO DEVELOP HIS IDEAS OR TO CLOAK HIS OWN LACK OF IDEAS? 

PHASE 3: YOU ASK THE LLM IF ITS NUMERICAL SCORES (N/100, E.G. 99/100, 42/100) ARE CONSISTENT WITH THE FACT THAT THOSE ARE TO BE TAKEN TO MEAN THAT 
(100-N) PEOPLE OUT OF 100 OUTPERFORM THE AUTHOR IN THE RELEVANT RESPECT. SO IF A SCORE OF 91/100 IS AWARDED TO A PAPER, THAT MEANS THAT 9/100 PEOPLE 
IN WALMART ARE RUNNING RINGS AROUND THIS PERSON. 

PHASE 4: AT THIS POINT, YOU ACCEPT AND REPORT WHAT THE LLM SAYS.`;

const ChunkRewriteModal: React.FC<ChunkRewriteModalProps> = ({
  isOpen,
  onClose,
  originalText,
  onRewriteUpdate
}) => {
  const { toast } = useToast();
  const [instructions, setInstructions] = useState<string>(DEFAULT_REWRITE_INSTRUCTIONS);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>("openai");
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentChunk, setCurrentChunk] = useState<number>(0);
  const [totalChunks, setTotalChunks] = useState<number>(0);
  const [rewrittenChunks, setRewrittenChunks] = useState<string[]>([]);
  const [fullResult, setFullResult] = useState<string>("");

  // Set default instructions when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setInstructions(DEFAULT_REWRITE_INSTRUCTIONS);
      setProgress(0);
      setCurrentChunk(0);
      setTotalChunks(0);
      setRewrittenChunks([]);
      setFullResult("");
    }
  }, [isOpen]);

  // Split text into manageable chunks
  const splitIntoChunks = (text: string, maxChunkSize: number = 2000): string[] => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim() + '.');
        currentChunk = sentence;
      } else {
        currentChunk += sentence + '.';
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  };

  const handleChunkRewrite = async () => {
    if (!instructions.trim()) {
      toast({
        title: "Instructions required",
        description: "Please enter rewrite instructions",
        variant: "destructive"
      });
      return;
    }

    setIsRewriting(true);
    setProgress(0);
    setRewrittenChunks([]);
    setFullResult("");
    
    const chunks = splitIntoChunks(originalText);
    setTotalChunks(chunks.length);
    
    console.log(`🔄 Processing ${chunks.length} chunks for large document rewrite`);
    
    const processedChunks: string[] = [];
    
    try {
      for (let i = 0; i < chunks.length; i++) {
        setCurrentChunk(i + 1);
        console.log(`📝 Processing chunk ${i + 1}/${chunks.length}`);
        
        const response = await fetch('/api/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalText: chunks[i],
            instructions: instructions,
            provider: selectedProvider
          })
        });

        if (!response.ok) {
          throw new Error(`Chunk ${i + 1} failed: ${response.status}`);
        }

        const data = await response.json();
        let rewrittenChunk = data.content || data.rewrittenText || chunks[i];
        
        // Clean markup formatting
        rewrittenChunk = rewrittenChunk
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/^#+\s*/gm, '')
          .trim();
        
        processedChunks.push(rewrittenChunk);
        setRewrittenChunks([...processedChunks]);
        
        // Update progress
        const progressPercent = ((i + 1) / chunks.length) * 100;
        setProgress(progressPercent);
        
        // Add to chat dialog immediately
        if ((window as any).addChatChunk) {
          (window as any).addChatChunk(rewrittenChunk, i + 1, chunks.length);
        }
        
        // Small delay to prevent rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Combine all chunks
      const finalResult = processedChunks.join('\n\n');
      setFullResult(finalResult);
      onRewriteUpdate(finalResult);
      
      toast({
        title: "🎉 Chunk rewrite completed!",
        description: `Successfully processed ${chunks.length} chunks. Content saved to chat below.`
      });

    } catch (error) {
      console.error("Chunk rewrite error:", error);
      toast({
        title: "Chunk rewrite failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const downloadAsPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rewritten Document</title>
          <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
          <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
          <script>
            window.MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
              }
            };
          </script>
          <style>
            body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 1in; }
            @media print { body { margin: 0.5in; } }
          </style>
        </head>
        <body>
          <h1>Rewritten Document</h1>
          ${fullResult.split('\n').map(line => `<p>${line}</p>`).join('')}
          <script>
            window.onload = function() {
              setTimeout(() => { window.print(); window.close(); }, 2000);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const shareViaEmail = async () => {
    const recipientEmail = prompt("Enter recipient email:");
    if (!recipientEmail || !fullResult) return;

    try {
      const response = await fetch('/api/share-simple-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipientEmail,
          subject: "Rewritten Document",
          content: fullResult
        }),
      });

      if (response.ok) {
        toast({ title: "Email sent successfully" });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      toast({
        title: "Email failed to send",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Chunk-Based Document Rewriter</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Panel - Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">AI Provider</label>
              <Select value={selectedProvider} onValueChange={(value: LLMProvider) => setSelectedProvider(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rewrite Instructions</label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter rewrite instructions for all chunks..."
                className="min-h-32"
              />
            </div>

            <Button 
              onClick={handleChunkRewrite} 
              disabled={isRewriting || !instructions.trim()}
              className="w-full"
            >
              {isRewriting ? `Processing Chunk ${currentChunk}/${totalChunks}...` : "Start Chunk Rewrite"}
            </Button>

            {isRewriting && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600 text-center">
                  Chunk {currentChunk} of {totalChunks} ({Math.round(progress)}%)
                </p>
              </div>
            )}

            {fullResult && (
              <div className="flex space-x-2">
                <Button onClick={downloadAsPDF} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button onClick={shareViaEmail} variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel - Live Results */}
          <div className="space-y-4">
            <label className="block text-sm font-medium">Live Rewrite Progress</label>
            <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
              {rewrittenChunks.length > 0 ? (
                <div className="space-y-4">
                  {rewrittenChunks.map((chunk, index) => (
                    <div key={index} className="border-b pb-2">
                      <div className="text-xs text-gray-500 mb-1">Chunk {index + 1}:</div>
                      <div className="text-sm">
                        <MathRenderer content={chunk} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center mt-8">
                  {isRewriting ? "Processing chunks..." : "Rewritten chunks will appear here as they complete"}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChunkRewriteModal;