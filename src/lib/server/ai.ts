/**
 * CCIS — AI Service Integration
 * ============================================================
 * Handles communication with the FastAPI microservice.
 */

const AI_SERVICE_URL = process.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

export interface AIAnalysisResult {
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentiment_score: number;
  summary: string;
  department: string;
  financial_loss_estimate: number | null;
}

export async function analyzeComplaint(text: string, category?: string): Promise<AIAnalysisResult> {
  console.log(`[AI] Analyzing complaint text (length: ${text.length})...`);
  
  try {
    const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        category,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI service error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    return result as AIAnalysisResult;
  } catch (error) {
    console.error('[AI] Pipeline failed, using fallback:', error);
    
    // Fallback logic if AI service is down
    return {
      category: category || 'Other',
      urgency: 'Medium',
      sentiment: 'Neutral',
      sentiment_score: 0.5,
      summary: text.slice(0, 100) + '...',
      department: 'Operations',
      financial_loss_estimate: null,
    };
  }
}
