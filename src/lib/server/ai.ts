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
export interface AISuggestion {
  title: string;
  description: string;
}

export interface SemanticSearchResult {
  summary: string;
  relevant_complaint_ids: string[];
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
export async function getAISuggestions(text: string): Promise<AISuggestion[]> {
  console.log(`[AI] Getting suggestions for text (${text.length} chars)...`);
  
  try {
    const response = await fetch(`${AI_SERVICE_URL}/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`AI service error (${response.status}): ${await response.text()}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[AI] Suggestions failed:', error);
    return [];
  }
}

export async function performSemanticSearch(query: string, complaintData: any[]): Promise<SemanticSearchResult> {
  console.log(`[AI] Performing semantic search for: ${query}`);
  
  try {
    const response = await fetch(`${AI_SERVICE_URL}/semantic-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, complaint_data: complaintData }),
    });

    if (!response.ok) {
      throw new Error(`AI service error (${response.status}): ${await response.text()}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[AI] Semantic search failed:', error);
    return { summary: "Search unavailable", relevant_complaint_ids: [] };
  }
}

export async function getSuggestedResponse(category: string, sentiment: string, urgency: string, summary: string): Promise<string> {
  console.log(`[AI] Getting suggested response for ${category} complaint...`);
  
  try {
    const response = await fetch(`${AI_SERVICE_URL}/suggested-response?category=${encodeURIComponent(category)}&sentiment=${encodeURIComponent(sentiment)}&urgency=${encodeURIComponent(urgency)}&summary=${encodeURIComponent(summary)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`AI service error (${response.status}): ${await response.text()}`);
    }

    const result = await response.json();
    return result.suggested_response;
  } catch (error) {
    console.error('[AI] Suggested response failed:', error);
    return "Thank you for your patience. We're working on resolving this issue and will update you soon.";
  }
}

export async function calculate_churn_risk(customerComplaints: any[]): Promise<number> {
  console.log(`[AI] Calculating churn risk for ${customerComplaints.length} complaints...`);
  
  try {
    const response = await fetch(`${AI_SERVICE_URL}/churn-risk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customer_complaints: customerComplaints }),
    });

    if (!response.ok) {
      throw new Error(`AI service error (${response.status}): ${await response.text()}`);
    }

    const result = await response.json();
    return result.churn_risk_score;
  } catch (error) {
    console.error('[AI] Churn risk calculation failed:', error);
    return 0.5; // Default medium risk
  }
}