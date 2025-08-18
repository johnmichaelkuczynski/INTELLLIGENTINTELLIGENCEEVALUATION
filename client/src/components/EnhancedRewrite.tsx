import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RewriteOptions, EnhancementSuggestion, GoogleSearchResult, EnhancedRewriteOptions } from '@/lib/types';
import { getEnhancementSuggestions, searchGoogle, fetchUrlContent } from '@/lib/enhancementServices';
import { Search, Globe, Sparkles, RotateCw, FileEdit, Info, Check, X } from 'lucide-react';

interface EnhancedRewriteProps {
  originalText: string;
  provider: string;
  onRewrite: (options: EnhancedRewriteOptions) => Promise<void>;
  isRewriting: boolean;
}

const EnhancedRewrite: React.FC<EnhancedRewriteProps> = ({
  originalText,
  provider,
  onRewrite,
  isRewriting
}) => {
  const { toast } = useToast();

  // Tabs state
  const [activeTab, setActiveTab] = useState<string>('instructions');
  
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

  // Rewrite options
  const [instruction, setInstruction] = useState<string>('');
  const [customInstruction, setCustomInstruction] = useState<string>(DEFAULT_REWRITE_INSTRUCTIONS);
  
  // Suggestions and search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GoogleSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<EnhancementSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<EnhancementSuggestion[]>([]);
  const [selectedSearchResults, setSelectedSearchResults] = useState<GoogleSearchResult[]>([]);
  const [urlContent, setUrlContent] = useState<{[key: string]: string}>({});
  
  // Toggle inclusion in final rewrite
  const [includeSuggestions, setIncludeSuggestions] = useState<boolean>(true);
  const [includeSearchResults, setIncludeSearchResults] = useState<boolean>(true);

  // Common rewrite instructions
  const REWRITE_PRESETS = [
    {
      label: "Enhance semantic density",
      value: "semantic_density"
    },
    {
      label: "Improve recursive reasoning",
      value: "recursive_reasoning"
    },
    {
      label: "Add conceptual precision",
      value: "conceptual_precision"
    },
    {
      label: "Strengthen logical coherence",
      value: "logical_coherence"
    },
    {
      label: "Improve inferential connections",
      value: "inferential_connections"
    },
    {
      label: "Add meta-structural elements",
      value: "meta_structural"
    }
  ];

  // Map preset values to actual instructions
  const INSTRUCTION_MAP: Record<string, string> = {
    "semantic_density": "Increase semantic density by replacing general terms with precise ones. Maintain exact structure and sentence count. Add empirical references where it improves informational content. Ensure all definitional relationships are operationally clear. NEVER add academic fluff phrases.",
    
    "recursive_reasoning": "Enhance recursive reasoning by nesting arguments where logically appropriate. Introduce self-reference only where it genuinely clarifies. Emphasize logical continuity between sequential ideas. Use definitional recursion (where concept A depends on B which clarifies A). NEVER add length.",
    
    "conceptual_precision": "Sharpen all conceptual distinctions without adding jargon. Replace ambiguous terms with precise ones. Clearly differentiate between related concepts. Use operational definitions that explain how concepts work, not just what they are. AVOID unnecessary abstraction.",
    
    "logical_coherence": "Strengthen logical coherence by making implicit reasoning chains explicit. Ensure each claim follows necessarily from previous ones. Preserve compact sentences while improving inferential clarity. NEVER add transitional fluff phrases.",
    
    "inferential_connections": "Enhance inferential connections by revealing the steps between linked ideas. Show how premises lead to conclusions. Transform A→C reasoning into A→B→C without adding words. Preserve semantic compression throughout.",
    
    "meta_structural": "Clarify the logical architecture without meta-commentary. Strengthen the core argument skeleton. Reveal rather than describe the logical progression. NEVER add phrases like 'it should be noted that' or other academic filler."
  };

  // Handle loading AI suggestions
  const loadAISuggestions = async () => {
    if (!originalText) return;
    
    setIsLoadingSuggestions(true);
    setSuggestions([]);
    
    try {
      const result = await getEnhancementSuggestions(originalText, provider);
      setSuggestions(result);
      
      // Auto-select high relevance suggestions
      const highRelevance = result.filter(s => s.relevanceScore >= 8);
      setSelectedSuggestions(highRelevance);
      
      toast({
        title: "AI suggestions loaded",
        description: `Received ${result.length} suggestions from ${provider}`,
      });
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
      toast({
        title: "Failed to load suggestions",
        description: "Could not retrieve AI suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle Google search
  const handleSearch = async () => {
    if (!searchQuery) {
      toast({
        title: "Search query required",
        description: "Please enter a search term",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const results = await searchGoogle(searchQuery);
      setSearchResults(results);
      toast({
        title: "Search completed",
        description: `Found ${results.length} results`,
      });
    } catch (error) {
      console.error('Error searching Google:', error);
      toast({
        title: "Search failed",
        description: "Could not complete the search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle selection of a suggestion
  const toggleSuggestion = (suggestion: EnhancementSuggestion) => {
    if (selectedSuggestions.some(s => s.title === suggestion.title)) {
      setSelectedSuggestions(selectedSuggestions.filter(s => s.title !== suggestion.title));
    } else {
      setSelectedSuggestions([...selectedSuggestions, suggestion]);
    }
  };

  // Toggle selection of a search result
  const toggleSearchResult = (result: GoogleSearchResult) => {
    if (selectedSearchResults.some(r => r.link === result.link)) {
      setSelectedSearchResults(selectedSearchResults.filter(r => r.link !== result.link));
    } else {
      setSelectedSearchResults([...selectedSearchResults, result]);
      
      // Fetch the content of the URL if not already fetched
      if (!urlContent[result.link]) {
        fetchUrlContent(result.link)
          .then(content => {
            if (content) {
              setUrlContent({
                ...urlContent,
                [result.link]: content
              });
            }
          })
          .catch(err => console.error('Error fetching URL content:', err));
      }
    }
  };

  // Handle the rewrite
  const handleRewrite = async () => {
    // Get the final instruction
    let finalInstruction = instruction === "custom" 
      ? customInstruction
      : INSTRUCTION_MAP[instruction] || "";
      
    if (!finalInstruction) {
      toast({
        title: "Missing instruction",
        description: "Please select or enter a rewrite instruction.",
        variant: "destructive"
      });
      return;
    }
    
    // Enhance the instruction with selected information
    const enhancedOptions: EnhancedRewriteOptions = {
      instruction: finalInstruction,
      preserveLength: true,
      preserveDepth: true,
      selectedSuggestions: includeSuggestions ? selectedSuggestions : [],
      selectedSearchResults: includeSearchResults ? selectedSearchResults : [],
      includeSuggestions,
      includeSearchResults
    };
    
    // Call the parent component's rewrite function
    await onRewrite(enhancedOptions);
  };

  // Extract topics for search suggestions
  useEffect(() => {
    if (originalText && !searchQuery) {
      // Extract potential search topics from the text
      const extractWords = (text: string): string[] => {
        const commonWords = new Set(['the', 'and', 'is', 'of', 'to', 'a', 'in', 'that', 'it', 'with']);
        return text
          .split(/\s+/)
          .filter(word => word.length > 4 && !commonWords.has(word.toLowerCase()))
          .filter(word => /^[A-Z]/.test(word)) // Capitalize words often indicate topics
          .map(word => word.replace(/[.,;?!()]/g, ''))
          .filter(Boolean);
      };
      
      const words = extractWords(originalText.slice(0, 2000));
      const uniqueWords = Array.from(new Set(words));
      const potentialTopics = uniqueWords.slice(0, 3).join(' ');
      
      if (potentialTopics) {
        setSearchQuery(potentialTopics);
      }
    }
  }, [originalText]);

  return (
    <div className="enhanced-rewrite space-y-4">
      <Tabs defaultValue="instructions" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="instructions">
            <FileEdit className="h-4 w-4 mr-2" />
            Rewrite Instructions
          </TabsTrigger>
          <TabsTrigger value="aiSuggestions">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Suggestions {selectedSuggestions.length > 0 && `(${selectedSuggestions.length})`}
          </TabsTrigger>
          <TabsTrigger value="webSearch">
            <Globe className="h-4 w-4 mr-2" />
            Web Search {selectedSearchResults.length > 0 && `(${selectedSearchResults.length})`}
          </TabsTrigger>
        </TabsList>
        
        {/* Instructions Tab */}
        <TabsContent value="instructions" className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <h4 className="text-sm font-medium text-blue-900 flex items-center gap-1.5 mb-2">
              <Sparkles className="h-4 w-4" />
              Enhanced Rewrite Process
            </h4>
            <div className="text-xs text-blue-800 mb-2">
              <strong>1. Choose rewrite instruction</strong> to enhance the intelligence of your text
            </div>
            <div className="text-xs text-blue-800 mb-2">
              <strong>2. Get AI suggestions</strong> from {provider} to incorporate relevant information
            </div>
            <div className="text-xs text-blue-800 mb-2">
              <strong>3. Find web resources</strong> that can enhance your text with factual content
            </div>
            <div className="text-xs text-blue-800">
              <strong>4. Customize and rewrite</strong> by selecting which information to include
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="rewrite-instruction" className="mb-1">
              Rewrite Instructions
            </Label>
            <Select 
              onValueChange={(value) => setInstruction(value)}
              value={instruction}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select intelligence-enhancing approach" />
              </SelectTrigger>
              <SelectContent>
                {REWRITE_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom instruction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {instruction === "custom" && (
            <div className="grid gap-2">
              <Label htmlFor="custom-instruction">Custom Rewrite Instruction</Label>
              <Textarea
                id="custom-instruction"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="DO: 'Replace vague terms with precise ones'; 'Make reasoning chains explicit'; 'Add empirical grounding to claims' | DON'T: 'Make it sound more academic'; 'Use bigger words'; 'Add stylistic flair'"
                className="min-h-[80px]"
              />
            </div>
          )}
        </TabsContent>
        
        {/* AI Suggestions Tab */}
        <TabsContent value="aiSuggestions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">AI Enhancement Suggestions</h3>
            <Button
              onClick={loadAISuggestions}
              disabled={isLoadingSuggestions || !originalText}
              className="flex items-center gap-2"
            >
              {isLoadingSuggestions ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Get Suggestions
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox 
              id="includeSuggestions" 
              checked={includeSuggestions}
              onCheckedChange={(checked) => setIncludeSuggestions(!!checked)}
            />
            <Label htmlFor="includeSuggestions" className="text-sm text-gray-700">
              Include selected suggestions in rewrite
            </Label>
          </div>
          
          {suggestions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-100">
              <Sparkles className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">
                {isLoadingSuggestions ? 'Getting enhancement suggestions...' : 'Click "Get Suggestions" to receive AI enhancement ideas'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, idx) => (
                <Card key={idx} className={`${selectedSuggestions.some(s => s.title === suggestion.title) ? 'border-blue-400 bg-blue-50' : ''}`}>
                  <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {suggestion.title}
                        <Badge variant="outline" className="ml-2 text-xs font-normal">
                          Relevance: {suggestion.relevanceScore}/10
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Source: {suggestion.source}
                      </CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      variant={selectedSuggestions.some(s => s.title === suggestion.title) ? "default" : "outline"}
                      className="h-8 gap-1"
                      onClick={() => toggleSuggestion(suggestion)}
                    >
                      {selectedSuggestions.some(s => s.title === suggestion.title) ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Selected
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          Select
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <p className="text-sm text-gray-700">{suggestion.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Web Search Tab */}
        <TabsContent value="webSearch" className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="search-query" className="mb-1.5 block">Search Query</Label>
                <Input
                  id="search-query"
                  placeholder="Enter search terms"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery}
                className="mb-0.5"
              >
                {isSearching ? (
                  <>
                    <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeSearchResults" 
                checked={includeSearchResults}
                onCheckedChange={(checked) => setIncludeSearchResults(!!checked)}
              />
              <Label htmlFor="includeSearchResults" className="text-sm text-gray-700">
                Include selected search results in rewrite
              </Label>
            </div>
          </div>
          
          {searchResults.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-100">
              <Globe className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">
                {isSearching ? 'Searching...' : 'Enter a search query and click "Search" to find relevant information'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((result, idx) => (
                <Card key={idx} className={`${selectedSearchResults.some(r => r.link === result.link) ? 'border-green-400 bg-green-50' : ''}`}>
                  <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base">
                        <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                          {result.title}
                          <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                        </a>
                      </CardTitle>
                      <CardDescription className="text-xs truncate max-w-md">
                        {result.link}
                      </CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      variant={selectedSearchResults.some(r => r.link === result.link) ? "default" : "outline"}
                      className="h-8 gap-1"
                      onClick={() => toggleSearchResult(result)}
                    >
                      {selectedSearchResults.some(r => r.link === result.link) ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Selected
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          Select
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <p className="text-sm text-gray-700">{result.snippet}</p>
                    
                    {selectedSearchResults.some(r => r.link === result.link) && urlContent[result.link] && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-600 mb-1">Extracted Content:</p>
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-sm max-h-32 overflow-y-auto">
                          {urlContent[result.link].slice(0, 500)}...
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Rewrite Button Section */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="flex items-center">
            <Info className="h-4 w-4 mr-1.5 text-blue-500" />
            <span>
              {selectedSuggestions.length > 0 && `${selectedSuggestions.length} suggestions selected. `}
              {selectedSearchResults.length > 0 && `${selectedSearchResults.length} search results selected.`}
              {selectedSuggestions.length === 0 && selectedSearchResults.length === 0 && 
                'Enhanced rewrite works best with AI suggestions and web references.'}
            </span>
          </div>
        </div>
        
        <Button
          onClick={handleRewrite}
          disabled={isRewriting || !instruction}
          className={`${isRewriting ? "animate-pulse" : ""}`}
        >
          {isRewriting ? (
            <>
              <RotateCw className="h-4 w-4 mr-2 animate-spin" />
              Rewriting...
            </>
          ) : (
            <>
              <FileEdit className="h-4 w-4 mr-2" />
              Rewrite Document
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Import needs to be at component level to avoid circular dependencies
import { Badge } from '@/components/ui/badge';
import { Plus, ExternalLink } from 'lucide-react';

export default EnhancedRewrite;