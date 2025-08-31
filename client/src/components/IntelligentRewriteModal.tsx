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
  const [provider, setProvider] = useState('openai');
  const [isRewriting, setIsRewriting] = useState(false);
  const [result, setResult] = useState<IntelligentRewriteResult | null>(null);
  const { toast } = useToast();

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

    try {
      console.log(`Starting intelligent rewrite with ${provider}`);
      
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

      const rewriteResult = await response.json() as IntelligentRewriteResult;
      console.log('Intelligent rewrite completed:', rewriteResult);
      setResult(rewriteResult);

      toast({
        title: "Rewrite completed!",
        description: `Score improved from ${rewriteResult.originalScore}/100 to ${rewriteResult.rewrittenScore}/100 (${rewriteResult.rewrittenScore > rewriteResult.originalScore ? '+' : ''}${rewriteResult.rewrittenScore - rewriteResult.originalScore} points)`,
      });

    } catch (error: any) {
      console.error('Error during intelligent rewrite:', error);
      toast({
        title: "Rewrite failed",
        description: error.message || "Failed to rewrite text. Please try again.",
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Intelligent Rewrite with 4-Phase Protocol
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions Section */}
          {!result && (
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
                      <SelectItem value="deepseek">DeepSeek (Recommended)</SelectItem>
                      <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                      <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                      <SelectItem value="perplexity">Perplexity AI</SelectItem>
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