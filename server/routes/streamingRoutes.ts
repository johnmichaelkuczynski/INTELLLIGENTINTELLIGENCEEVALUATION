import { Router, Request, Response } from 'express';
import { StreamingProtocolService } from '../services/streamingProtocol';

const router = Router();
const streamingService = new StreamingProtocolService();

// Normal (Phase 1 only) streaming analysis
router.post('/stream-normal-analysis', async (req: Request, res: Response) => {
  try {
    const { text, provider } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!provider || !['openai', 'anthropic', 'perplexity', 'deepseek'].includes(provider)) {
      return res.status(400).json({ error: 'Valid provider is required' });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    console.log(`Starting Normal Protocol streaming with ${provider}...`);

    try {
      for await (const result of streamingService.streamNormalProtocol({ 
        text, 
        provider: provider as any, 
        mode: 'normal' 
      })) {
        if (result.chunk) {
          res.write(result.chunk);
        }
        
        if (result.completed) {
          res.write(`\n\n[COMPLETED] Final Score: ${result.score || 'N/A'}/100`);
          break;
        }
      }
    } catch (streamError) {
      console.error('Streaming error:', streamError);
      res.write(`\n\nERROR: ${streamError instanceof Error ? streamError.message : 'Unknown streaming error'}`);
    }

    res.end();
  } catch (error) {
    console.error('Route error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.write(`\n\nSERVER ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.end();
    }
  }
});

// Comprehensive (4-Phase) streaming analysis  
router.post('/stream-comprehensive-analysis', async (req: Request, res: Response) => {
  try {
    const { text, provider } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!provider || !['openai', 'anthropic', 'perplexity', 'deepseek'].includes(provider)) {
      return res.status(400).json({ error: 'Valid provider is required' });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    console.log(`Starting Comprehensive Protocol (4-Phase) streaming with ${provider}...`);

    try {
      for await (const result of streamingService.streamComprehensiveProtocol({ 
        text, 
        provider: provider as any, 
        mode: 'comprehensive' 
      })) {
        if (result.chunk) {
          res.write(result.chunk);
        }
        
        if (result.completed) {
          res.write(`\n\n[COMPLETED] Final Score: ${result.score || 'N/A'}/100`);
          break;
        }
      }
    } catch (streamError) {
      console.error('Streaming error:', streamError);
      res.write(`\n\nERROR: ${streamError instanceof Error ? streamError.message : 'Unknown streaming error'}`);
    }

    res.end();
  } catch (error) {
    console.error('Route error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.write(`\n\nSERVER ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.end();
    }
  }
});

// Test endpoint for critical scoring thresholds
router.post('/test-scoring-thresholds', async (req: Request, res: Response) => {
  try {
    const { provider = 'anthropic' } = req.body;

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    res.write('TESTING CRITICAL SCORING THRESHOLDS...\n\n');

    // Test the negative example (should score ≤65)
    res.write('=== TESTING NEGATIVE EXAMPLE (SHOULD SCORE ≤65) ===\n\n');
    
    const negativeText = `In this dissertation, I critically examine the philosophy of transcendental empiricism. Transcendental empiricism is, among other things, a philosophy of mental content. It attempts to dissolve an epistemological dilemma of mental content by splitting the difference between two diametrically opposed accounts of content. John McDowell's minimal empiricism and Richard Gaskin's minimalist empiricism are two versions of transcendental empiricism.`;

    let negativeScore = 0;
    for await (const result of streamingService.streamNormalProtocol({ 
      text: negativeText, 
      provider: provider as any, 
      mode: 'normal' 
    })) {
      if (result.chunk) {
        res.write(result.chunk);
      }
      if (result.completed) {
        negativeScore = result.score || 0;
        res.write(`\n\nNEGATIVE EXAMPLE SCORE: ${negativeScore}/100 (MUST BE ≤65)\n\n`);
        break;
      }
    }

    // Test positive example (should score ≥96)
    res.write('=== TESTING POSITIVE EXAMPLE (SHOULD SCORE ≥96) ===\n\n');
    
    const positiveText = `One cannot have the concept of a red object without having the concept of an extended object. But the word "red" doesn't contain the word "extended." In general, our concepts are interconnected in ways in which the corresponding words are not interconnected. This is not an accidental fact about the English language or about any other language: it is inherent in what a language is that the cognitive abilities corresponding to a person's abilities to use words cannot possibly be reflected in semantic relations holding among those words.`;

    let positiveScore = 0;
    for await (const result of streamingService.streamNormalProtocol({ 
      text: positiveText, 
      provider: provider as any, 
      mode: 'normal' 
    })) {
      if (result.chunk) {
        res.write(result.chunk);
      }
      if (result.completed) {
        positiveScore = result.score || 0;
        res.write(`\n\nPOSITIVE EXAMPLE SCORE: ${positiveScore}/100 (MUST BE ≥96)\n\n`);
        break;
      }
    }

    // Results summary
    res.write('=== THRESHOLD TEST RESULTS ===\n');
    res.write(`Negative Example: ${negativeScore}/100 (Target: ≤65) - ${negativeScore <= 65 ? 'PASS' : 'FAIL'}\n`);
    res.write(`Positive Example: ${positiveScore}/100 (Target: ≥96) - ${positiveScore >= 96 ? 'PASS' : 'FAIL'}\n`);
    
    const overallResult = (negativeScore <= 65 && positiveScore >= 96) ? 'SYSTEM CALIBRATED CORRECTLY' : 'SYSTEM CALIBRATION FAILED';
    res.write(`\nOVERALL: ${overallResult}\n`);

    res.end();
  } catch (error) {
    console.error('Test error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.write(`\n\nTEST ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.end();
    }
  }
});

export default router;