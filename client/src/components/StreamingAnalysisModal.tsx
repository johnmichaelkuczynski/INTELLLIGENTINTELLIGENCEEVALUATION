import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Brain, Play, Square, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StreamingAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  provider: 'openai' | 'anthropic' | 'perplexity' | 'deepseek';
  mode: 'normal' | 'comprehensive';
}

type StreamingState = 'idle' | 'connecting' | 'streaming' | 'completed' | 'error';

const getProviderDisplayName = (provider: string): string => {
  const providerMap: { [key: string]: string } = {
    'deepseek': 'Zhi 3',
    'openai': 'Zhi 2', 
    'anthropic': 'Zhi 1',
    'perplexity': 'Zhi 4'
  };
  return providerMap[provider.toLowerCase()] || provider;
};

const extractScore = (text: string): number | null => {
  const patterns = [
    /\[COMPLETED\]\s*Final Score:\s*(\d+)\/100/i,
    /SCORE:\s*(\d+)\/100/i,
    /Final Score:\s*(\d+)\/100/i,
    /(\d+)\/100/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const score = parseInt(match[1], 10);
      if (score >= 0 && score <= 100) {
        return score;
      }
    }
  }
  return null;
};

export function StreamingAnalysisModal({ 
  isOpen, 
  onClose, 
  text, 
  provider, 
  mode 
}: StreamingAnalysisModalProps) {
  const [streamingState, setStreamingState] = useState<StreamingState>('idle');
  const [streamedContent, setStreamedContent] = useState('');
  const [currentPhase, setCurrentPhase] = useState(1);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [streamedContent]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStreamingState('idle');
      setStreamedContent('');
      setCurrentPhase(1);
      setFinalScore(null);
      setAbortController(null);
    }
  }, [isOpen]);

  const startStreaming = async () => {
    if (streamingState === 'streaming') return;

    const controller = new AbortController();
    setAbortController(controller);
    setStreamingState('connecting');
    setStreamedContent('');
    setCurrentPhase(1);
    setFinalScore(null);

    try {
      const endpoint = mode === 'normal' ? '/api/stream-normal-analysis' : '/api/stream-comprehensive-analysis';
      
      console.log(`Starting ${mode} streaming analysis with ${provider}...`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, provider }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      setStreamingState('streaming');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Extract complete content from buffer
        setStreamedContent(prev => prev + decoder.decode(value, { stream: true }));
        
        // Check for phase markers in comprehensive mode
        if (mode === 'comprehensive') {
          if (buffer.includes('--- PHASE 2:')) setCurrentPhase(2);
          else if (buffer.includes('--- PHASE 3:')) setCurrentPhase(3);
          else if (buffer.includes('--- PHASE 4:')) setCurrentPhase(4);
        }
        
        // Check for completion
        if (buffer.includes('[COMPLETED]')) {
          const score = extractScore(buffer);
          if (score !== null) {
            setFinalScore(score);
          }
          setStreamingState('completed');
          break;
        }
      }

      // Final score extraction if not already found
      if (finalScore === null) {
        const score = extractScore(buffer);
        if (score !== null) {
          setFinalScore(score);
        }
      }

      if (streamingState !== 'completed') {
        setStreamingState('completed');
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Streaming aborted');
        setStreamingState('idle');
      } else {
        console.error('Streaming error:', error);
        setStreamingState('error');
        setStreamedContent(prev => prev + `\n\nERROR: ${error.message}`);
        toast({
          title: "Analysis Error",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const stopStreaming = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setStreamingState('idle');
  };

  const getScoreColor = (score: number): string => {
    if (score >= 95) return 'text-purple-600 bg-purple-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 65) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreInterpretation = (score: number): string => {
    if (score >= 99) return 'Revolutionary insight - top 1%';
    if (score >= 95) return 'Unignorable insight - top 5%';
    if (score >= 80) return 'Strong with minor friction';
    if (score >= 65) return 'Above average intelligence';
    if (score >= 50) return 'Average cognitive ability';
    return 'Below average performance';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            Real-Time Intelligence Analysis
            <Badge variant="outline" className="ml-2">
              {getProviderDisplayName(provider)}
            </Badge>
            <Badge variant="secondary">
              {mode === 'normal' ? 'Normal (Phase 1)' : 'Comprehensive (4-Phase)'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-0 space-y-4">
          {/* Control buttons */}
          <div className="flex items-center gap-3">
            {streamingState === 'idle' && (
              <Button onClick={startStreaming} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Start Analysis
              </Button>
            )}
            
            {streamingState === 'streaming' && (
              <Button onClick={stopStreaming} variant="destructive" className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                Stop Analysis
              </Button>
            )}

            {streamingState === 'connecting' && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </div>
            )}

            {streamingState === 'completed' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Analysis Complete
              </div>
            )}

            {streamingState === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                Error Occurred
              </div>
            )}

            {mode === 'comprehensive' && streamingState === 'streaming' && (
              <Badge variant="outline" className="ml-auto">
                Phase {currentPhase}/4
              </Badge>
            )}
          </div>

          {/* Score display */}
          {finalScore !== null && (
            <Card className="border-2 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`text-lg px-4 py-2 ${getScoreColor(finalScore)}`}>
                      {finalScore}/100
                    </Badge>
                    <div>
                      <div className="font-semibold">Final Intelligence Score</div>
                      <div className="text-sm text-muted-foreground">
                        {getScoreInterpretation(finalScore)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {100 - finalScore}% of population would outperform this author
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Streaming content */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Live Analysis Stream</h3>
                {streamingState === 'streaming' && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    Streaming...
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea ref={scrollAreaRef} className="h-[400px] p-4">
                {streamedContent ? (
                  <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {streamedContent}
                    {streamingState === 'streaming' && (
                      <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1">|</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Click "Start Analysis" to begin real-time intelligence evaluation</p>
                      <p className="text-sm mt-2">
                        You'll see each word as it's generated by the AI
                      </p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Protocol info */}
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <strong>Protocol:</strong> {mode === 'normal' ? 
              'Phase 1 only - Core intelligence questions with anti-diplomatic evaluation' :
              '4-Phase comprehensive - Initial evaluation → Pushback if <95 → Walmart metric check → Final acceptance'
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}