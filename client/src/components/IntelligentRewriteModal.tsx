import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, TrendingUp, FileText, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

interface IntelligentRewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
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

const IntelligentRewriteModal: React.FC<IntelligentRewriteModalProps> = ({
  isOpen,
  onClose,
  originalText
}) => {
  const [customInstructions, setCustomInstructions] = useState('');
  const [provider, setProvider] = useState('zhi2');
  const [isRewriting, setIsRewriting] = useState(false);
  const [result, setResult] = useState<IntelligentRewriteResult | null>(null);
  const { toast } = useToast();

  const [streamingText, setStreamingText] = useState('');
  const [originalScore, setOriginalScore] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const handleRewrite = async () => {
    if (!originalText.trim()) {
      toast({
        title: "Missing text",
        description: "Original text is required for rewriting.",
        variant: "destructive"
      });
      return;
    }

    setIsRewriting(true);
    setResult(null);
    setStreamingText('');
    setOriginalScore(null);
    setFinalScore(null);

    try {
      console.log(`Starting REAL-TIME streaming rewrite with ${provider}`);
      
      const response = await fetch('/api/intelligent-rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: originalText,
          customInstructions: customInstructions.trim() || undefined,
          provider
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'originalScore') {
                // No score tracking - just status updates
              } else if (parsed.type === 'rewriteChunk') {
                setStreamingText(prev => prev + parsed.chunk);
              } else if (parsed.type === 'finalScore') {
                // Rewrite completed
              } else if (parsed.type === 'complete') {
                // Rewrite complete
                toast({
                  title: "LIVE STREAMING REWRITE COMPLETED!",
                  description: `Rewritten text is ready`,
                });
                
                // Set final result
                setResult({
                  originalText,
                  rewrittenText: streamingText,
                  originalScore: 0,
                  rewrittenScore: 0,
                  provider,
                  instructions: customInstructions || 'Default intelligence optimization',
                  rewriteReport: 'Real-time streaming rewrite completed'
                });
                break;
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }

    } catch (error: any) {
      console.error('Error during streaming rewrite:', error);
      toast({
        title: "Streaming rewrite failed",
        description: error.message || "Failed to stream rewrite. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setCustomInstructions('');
    onClose();
  };

  const scoreImprovement = result ? result.rewrittenScore - result.originalScore : 0;
  const improvementColor = scoreImprovement > 0 ? 'text-green-600' : scoreImprovement < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="rewrite-modal-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Intelligent Rewrite with 4-Phase Protocol
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* REAL-TIME STREAMING DISPLAY */}
          {isRewriting && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-green-900 flex items-center gap-1.5 mb-2">
                  <Brain className="h-4 w-4 animate-pulse" />
                  LIVE STREAMING REWRITE - REAL TIME
                </h4>
                <div className="space-y-3">
                  {streamingText && (
                    <div className="bg-white border rounded p-3 max-h-80 overflow-y-auto">
                      <div className="text-sm font-medium text-gray-700 mb-2">LIVE STREAMING REWRITTEN TEXT:</div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">
                        {streamingText}
                        <span className="animate-pulse text-blue-500">|</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions Section */}
          {!result && !isRewriting && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-4 w-4" />
                  Intelligent Rewrite Protocol
                </h4>
                <div className="text-xs text-blue-800 space-y-2">
                  <p><strong>Default Optimization:</strong> Rewrite to score significantly higher on the 4-phase intelligence evaluation while preserving existing content as much as possible.</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Enhance logical scaffolding and hierarchical organization</li>
                    <li>Make implicit reasoning chains explicit</li>
                    <li>Improve semantic compression and inferential clarity</li>
                    <li>Strengthen conceptual precision without jargon</li>
                    <li>Ensure organic development of ideas</li>
                  </ul>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="provider" className="mb-2 block">
                    AI Provider
                  </Label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zhi1">Zhi 1</SelectItem>
                      <SelectItem value="zhi2">Zhi 2</SelectItem>
                      <SelectItem value="zhi3">Zhi 3</SelectItem>
                      <SelectItem value="zhi4">Zhi 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="instructions" className="mb-2 block">
                    Custom Instructions (Optional)
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="Add specific instructions for the rewrite (e.g., 'Focus on strengthening the causal arguments' or 'Enhance the philosophical rigor'). Leave blank to use default intelligence optimization."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Custom instructions will be balanced with the default intelligence optimization criteria.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleRewrite}
                  disabled={isRewriting || !originalText.trim()}
                  className="flex-1"
                >
                  {isRewriting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing 4-Phase Rewrite...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Execute Intelligent Rewrite
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              {/* Score Comparison */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Intelligence Score Improvement</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{result.originalScore}/100</div>
                        <div className="text-xs text-gray-500">Original</div>
                      </div>
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{result.rewrittenScore}/100</div>
                        <div className="text-xs text-gray-500">Rewritten</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xl font-bold ${improvementColor}`}>
                          {scoreImprovement > 0 ? '+' : ''}{scoreImprovement}
                        </div>
                        <div className="text-xs text-gray-500">Change</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700">
                    <strong>Provider:</strong> {result.provider} | <strong>Instructions:</strong> {result.instructions}
                  </div>
                </CardContent>
              </Card>

              {/* Text Comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Original Text ({result.originalScore}/100)
                    </h4>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-3 rounded text-sm max-h-60 overflow-y-auto">
                      {result.originalText}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Rewritten Text ({result.rewrittenScore}/100)
                    </h4>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-3 rounded text-sm max-h-60 overflow-y-auto">
                      {result.rewrittenText}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => navigator.clipboard.writeText(result.rewrittenText)}
                  variant="outline"
                  className="flex-1"
                >
                  Copy Rewritten Text
                </Button>
                <Button
                  onClick={() => {
                    setResult(null);
                    setCustomInstructions('');
                  }}
                  variant="outline"
                >
                  Rewrite Again
                </Button>
                <Button onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntelligentRewriteModal;