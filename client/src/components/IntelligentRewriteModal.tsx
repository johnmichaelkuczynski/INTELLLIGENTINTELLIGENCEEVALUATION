import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Brain, Copy, FileText, ArrowRight } from "lucide-react";

interface RewriteResult {
  originalText: string;
  rewrittenText: string;
  originalScore: number;
  rewrittenScore: number;
  provider: string;
  instructions: string;
  rewriteReport: string;
}

interface IntelligentRewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
}

export function IntelligentRewriteModal({ isOpen, onClose, originalText }: IntelligentRewriteModalProps) {
  const [customInstructions, setCustomInstructions] = useState("");
  const [provider, setProvider] = useState("zhi2");
  const [isRewriting, setIsRewriting] = useState(false);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const { toast } = useToast();

  const handleRewrite = async () => {
    if (!originalText.trim()) {
      toast({
        title: "Error",
        description: "Please provide text to rewrite",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRewriting(true);
      setResult(null);
      
      console.log(`Starting rewrite with ${provider}`);
      
      // Call simple rewrite endpoint
      const response = await fetch('/api/intelligent-rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: originalText,
          customInstructions,
          provider
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.message || 'Rewrite failed');
      }

      toast({
        title: "Rewrite completed",
        description: `Text has been rewritten`,
      });
      
      setResult(result);
      
    } catch (error) {
      console.error('Error during rewrite:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rewrite text",
        variant: "destructive",
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setResult(null);
    setCustomInstructions("");
    setProvider("zhi2");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Intelligent Rewrite
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isRewriting && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
                <div className="text-sm text-blue-800">Processing rewrite...</div>
              </div>
            </div>
          )}

          {/* Instructions Section */}
          {!result && !isRewriting && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">AI Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zhi1">Zhi 1</SelectItem>
                    <SelectItem value="zhi2">Zhi 2</SelectItem>
                    <SelectItem value="zhi3">Zhi 3</SelectItem>
                    <SelectItem value="zhi4">Zhi 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Custom Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Add any specific instructions for how you want the text rewritten..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleRewrite}
                className="w-full"
                disabled={isRewriting}
              >
                {isRewriting ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Start Intelligent Rewrite
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-green-900 flex items-center gap-1.5 mb-3">
                  <FileText className="h-4 w-4" />
                  Rewrite Complete
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Text */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-700">Original Text</h5>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(result.originalText)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="bg-white border rounded p-3 max-h-48 overflow-y-auto">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{result.originalText}</p>
                    </div>
                  </div>

                  {/* Rewritten Text */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-gray-700">Rewritten Text</h5>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(result.rewrittenText)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="bg-white border rounded p-3 max-h-48 overflow-y-auto">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{result.rewrittenText}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-green-200">
                  <div className="text-xs text-green-700">
                    <strong>Provider:</strong> {result.provider} | 
                    <strong> Instructions:</strong> {result.instructions}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setResult(null)}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Try Another Rewrite
                </Button>
                <Button 
                  onClick={handleClose}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}