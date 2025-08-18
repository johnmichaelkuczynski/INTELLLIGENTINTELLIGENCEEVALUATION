import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Mail, CheckSquare, Square } from 'lucide-react';
import { MathRenderer } from './MathRenderer';

interface SelectiveChunkRewriterProps {
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

interface DocumentChunk {
  id: number;
  content: string;
  selected: boolean;
  rewritten?: string;
  isProcessing?: boolean;
}

const SelectiveChunkRewriter: React.FC<SelectiveChunkRewriterProps> = ({
  isOpen,
  onClose,
  originalText,
  onRewriteUpdate
}) => {
  const { toast } = useToast();
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [instructions, setInstructions] = useState<string>(DEFAULT_REWRITE_INSTRUCTIONS);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>("openai");
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Split text into chunks when modal opens
  useEffect(() => {
    if (isOpen && originalText) {
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

      const textChunks = splitIntoChunks(originalText);
      const documentChunks: DocumentChunk[] = textChunks.map((content, index) => ({
        id: index + 1,
        content,
        selected: false
      }));
      
      setChunks(documentChunks);
      setInstructions(DEFAULT_REWRITE_INSTRUCTIONS);
      setProgress(0);
    }
  }, [isOpen, originalText]);

  const toggleChunkSelection = (chunkId: number) => {
    setChunks(prev => prev.map(chunk => 
      chunk.id === chunkId 
        ? { ...chunk, selected: !chunk.selected }
        : chunk
    ));
  };

  const selectAllChunks = () => {
    setChunks(prev => prev.map(chunk => ({ ...chunk, selected: true })));
  };

  const deselectAllChunks = () => {
    setChunks(prev => prev.map(chunk => ({ ...chunk, selected: false })));
  };

  const rewriteSelectedChunks = async () => {
    const selectedChunks = chunks.filter(chunk => chunk.selected);
    
    if (selectedChunks.length === 0) {
      toast({
        title: "No chunks selected",
        description: "Please select at least one chunk to rewrite",
        variant: "destructive"
      });
      return;
    }

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

    console.log(`🎯 Rewriting ${selectedChunks.length} selected chunks`);

    try {
      for (let i = 0; i < selectedChunks.length; i++) {
        const chunk = selectedChunks[i];
        
        // Mark chunk as processing
        setChunks(prev => prev.map(c => 
          c.id === chunk.id 
            ? { ...c, isProcessing: true }
            : c
        ));

        console.log(`📝 Processing selected chunk ${chunk.id} (${i + 1}/${selectedChunks.length})`);

        const response = await fetch('/api/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalText: chunk.content,
            instructions: instructions,
            provider: selectedProvider
          })
        });

        if (!response.ok) {
          throw new Error(`Chunk ${chunk.id} failed: ${response.status}`);
        }

        const data = await response.json();
        let rewrittenContent = data.content || data.rewrittenText || chunk.content;
        
        // Clean markup formatting
        rewrittenContent = rewrittenContent
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/^#+\s*/gm, '')
          .trim();

        // Update chunk with rewritten content
        setChunks(prev => prev.map(c => 
          c.id === chunk.id 
            ? { ...c, rewritten: rewrittenContent, isProcessing: false }
            : c
        ));

        // Add to chat dialog
        if ((window as any).addChatChunk) {
          (window as any).addChatChunk(`Chunk ${chunk.id}:\n\n${rewrittenContent}`, i + 1, selectedChunks.length);
        }

        // Update progress
        const progressPercent = ((i + 1) / selectedChunks.length) * 100;
        setProgress(progressPercent);

        // Small delay to prevent rate limiting
        if (i < selectedChunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Combine all chunks (using rewritten versions where available)
      const finalResult = chunks.map(chunk => chunk.rewritten || chunk.content).join('\n\n');
      onRewriteUpdate(finalResult);

      toast({
        title: "🎉 Selected chunks rewritten!",
        description: `Successfully rewrote ${selectedChunks.length} chunks. Check chat below for results.`
      });

      // DON'T close modal - let user see results and manually close

    } catch (error) {
      console.error("Selective rewrite error:", error);
      toast({
        title: "Rewrite failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsRewriting(false);
      // Modal stays open so user can see results
    }
  };

  const downloadResults = () => {
    const finalResult = chunks.map(chunk => chunk.rewritten || chunk.content).join('\n\n');
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Selective Rewrite Results</title>
          <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
          <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
          <style>
            body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 1in; }
            .rewritten { background-color: #f0f8ff; padding: 10px; margin: 10px 0; border-left: 4px solid #0066cc; }
            @media print { body { margin: 0.5in; } }
          </style>
        </head>
        <body>
          <h1>Selective Rewrite Results</h1>
          ${chunks.map(chunk => `
            <div class="${chunk.rewritten ? 'rewritten' : ''}">
              <h3>Chunk ${chunk.id} ${chunk.rewritten ? '(Rewritten)' : '(Original)'}</h3>
              <p>${(chunk.rewritten || chunk.content).split('\n').map(line => `${line}<br>`).join('')}</p>
            </div>
          `).join('')}
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

  const selectedCount = chunks.filter(chunk => chunk.selected).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Selective Chunk Rewriter</span>
            </div>
            <div className="text-sm text-gray-600">
              {selectedCount} of {chunks.length} chunks selected
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
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
                placeholder="Instructions for selected chunks..."
                className="min-h-24"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={selectAllChunks} variant="outline" size="sm" className="flex-1">
                Select All
              </Button>
              <Button onClick={deselectAllChunks} variant="outline" size="sm" className="flex-1">
                Clear All
              </Button>
            </div>

            <Button 
              onClick={rewriteSelectedChunks} 
              disabled={isRewriting || selectedCount === 0 || !instructions.trim()}
              className="w-full"
            >
              {isRewriting ? "Rewriting..." : `Rewrite ${selectedCount} Selected`}
            </Button>

            {isRewriting && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600 text-center">
                  {Math.round(progress)}% Complete
                </p>
              </div>
            )}

            <Button onClick={downloadResults} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-1" />
              Download Results
            </Button>
          </div>

          {/* Middle Panel - Chunk Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-medium">Select Chunks to Rewrite</label>
            <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-gray-50 space-y-3">
              {chunks.map((chunk) => (
                <div 
                  key={chunk.id} 
                  className={`p-3 border rounded cursor-pointer transition-all ${
                    chunk.selected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  } ${chunk.isProcessing ? 'opacity-50' : ''}`}
                  onClick={() => toggleChunkSelection(chunk.id)}
                >
                  <div className="flex items-start space-x-2">
                    {chunk.selected ? 
                      <CheckSquare className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" /> : 
                      <Square className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    }
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        Chunk {chunk.id} {chunk.isProcessing && "(Processing...)"}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 line-clamp-3">
                        {chunk.content.substring(0, 150)}...
                      </div>
                      {chunk.rewritten && (
                        <div className="text-xs text-green-600 mt-1 font-medium">
                          ✓ Rewritten
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Results Preview */}
          <div className="space-y-4">
            <label className="block text-sm font-medium">Rewrite Results</label>
            <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
              {chunks.some(chunk => chunk.rewritten) ? (
                <div className="space-y-4">
                  {chunks.filter(chunk => chunk.rewritten).map((chunk) => (
                    <div key={chunk.id} className="border-b pb-2">
                      <div className="text-xs text-gray-500 mb-1">Chunk {chunk.id} (Rewritten):</div>
                      <div className="text-sm">
                        <MathRenderer content={chunk.rewritten!} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center mt-8">
                  Rewritten chunks will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectiveChunkRewriter;