/**
 * CCIS — AI Service Integration (Direct Groq Migration)
 * ============================================================
 * Migrated from Python FastAPI to direct Groq LLM calls for 
 * improved reliability and simpler architecture.
 */

import Groq from "groq-sdk";

let _groq: Groq | null = null;

function getGroqClient() {
  if (_groq) return _groq;
  
  const apiKey = process.env.GROQ_API_KEY || 
                 process.env.VITE_GROQ_API_KEY || 
                 (import.meta as any).env?.VITE_GROQ_API_KEY ||
                 (globalThis as any).process?.env?.VITE_GROQ_API_KEY;

  if (!apiKey) {
    console.error("[AI] GROQ_API_KEY is missing! Check your .env.local file.");
    throw new Error("GROQ_API_KEY is missing");
  }

  _groq = new Groq({ apiKey });
  return _groq;
}

const MODEL = "llama-3.1-8b-instant";

export interface AIAnalysisResult {
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  sentiment_score: number;
  summary: string;
  department: string;
  financial_loss_estimate: number | null;
  // New AI Signals
  blast_radius: string;
  trend_risk: string;
  business_impact_hint: string;
  similar_issue_cluster: string;
  novelty_score: string;
  failure_point_guess: string;
  dependency_risk: string;
  missing_info: string;
  next_best_action: string;
  auto_routing_hint: string;
  escalation_reason: string;
}

export interface SemanticSearchResult {
  summary: string;
  relevant_complaint_ids: string[];
}

/**
 * Analyzes a complaint using Groq LLM with high-value AI Signals.
 */
export async function analyzeComplaint(text: string, categoryHint?: string): Promise<AIAnalysisResult> {
  console.log(`[AI] Analyzing complaint text (length: ${text.length})...`);
  
  try {
    const prompt = `You are an AI system generating high-value "AI Signals" for internal teams from a customer complaint.
    Do NOT repeat obvious information. Provide only insights that help prioritize, debug, or take action faster.

    Return ONLY a valid JSON object with the following keys:
    - category: short classification
    - department: one of IT, Finance, Operations, Cards, Loans
    - urgency: one of Low, Medium, High, Critical
    - sentiment: one of Positive, Neutral, Negative
    - sentiment_score: number from -1 to 1
    - summary: 1-sentence summary
    - financial_loss_estimate: number or null
    - blast_radius: One user | Few users | Many users likely affected
    - trend_risk: Low | Medium | High (likelihood of more similar complaints soon)
    - business_impact_hint: short phrase (e.g., churn risk, trust risk, revenue blocker)
    - similar_issue_cluster: short description if this resembles a known pattern, else "Unknown"
    - novelty_score: New | Possibly Known | Known Issue
    - failure_point_guess: where the system is likely failing
    - dependency_risk: None | Backend API | Database | Third-party service | Unknown
    - missing_info: key info needed to debug faster
    - next_best_action: specific actionable step
    - auto_routing_hint: which team should handle this (e.g., Backend, Mobile, Payments)
    - escalation_reason: short reason if this needs escalation, else "None"

    Complaint: "${text}" ${categoryHint ? `(Category Hint: ${categoryHint})` : ""}`;

    const completion = await getGroqClient().chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No content returned from Groq");

    console.log(`[AI] Groq Response:`, content);
    const data = JSON.parse(content);
    
    return {
      category: data.category || "General",
      department: data.department || "Operations",
      urgency: data.urgency || "Medium",
      sentiment: data.sentiment || "Neutral",
      sentiment_score: parseFloat(data.sentiment_score || 0),
      summary: data.summary || "No summary available.",
      financial_loss_estimate: data.financial_loss_estimate || null,
      blast_radius: data.blast_radius || "Unknown",
      trend_risk: data.trend_risk || "Low",
      business_impact_hint: data.business_impact_hint || "None",
      similar_issue_cluster: data.similar_issue_cluster || "Unknown",
      novelty_score: data.novelty_score || "New",
      failure_point_guess: data.failure_point_guess || "Unknown",
      dependency_risk: data.dependency_risk || "None",
      missing_info: data.missing_info || "None",
      next_best_action: data.next_best_action || "Investigate",
      auto_routing_hint: data.auto_routing_hint || "Operations",
      escalation_reason: data.escalation_reason || "None",
    };
  } catch (error) {
    console.error('[AI] Analysis failed, using fallback:', error);
    return {
      category: categoryHint || 'Other',
      urgency: 'Medium',
      sentiment: 'Neutral',
      sentiment_score: 0.5,
      summary: text.slice(0, 100) + '...',
      department: 'Operations',
      financial_loss_estimate: null,
      blast_radius: "Unknown",
      trend_risk: "Low",
      business_impact_hint: "None",
      similar_issue_cluster: "Unknown",
      novelty_score: "New",
      failure_point_guess: "Unknown",
      dependency_risk: "None",
      missing_info: "None",
      next_best_action: "Investigate",
      auto_routing_hint: "Operations",
      escalation_reason: "None",
    };
  }
}

/**
 * Generates self-help suggestions for customers.
 */
export async function getAISuggestions(text: string): Promise<AISuggestion[]> {
  console.log(`[AI] Getting suggestions for text (${text.length} chars)...`);
  
  try {
    const prompt = `Based on this customer complaint, suggest 3 relevant self-help articles or FAQs that might resolve their issue. 
    Return ONLY a JSON object with a "suggestions" key containing an array of objects with "title" and "description".
    
    Complaint: ${text}`;

    const completion = await getGroqClient().chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return [];

    const data = JSON.parse(content);
    return data.suggestions || [];
  } catch (error) {
    console.error('[AI] Suggestions failed:', error);
    return [
      {
        title: "Check Account Status",
        description: "Verify your account status and recent transactions in the app."
      },
      {
        title: "Contact Support",
        description: "Reach out to our 24/7 customer support for immediate assistance."
      }
    ];
  }
}

/**
 * Performs semantic search over complaint data.
 */
export async function performSemanticSearch(query: string, complaintData: any[]): Promise<SemanticSearchResult> {
  console.log(`[AI] Performing semantic search for: ${query}`);
  
  try {
    const context = complaintData.slice(-30).map(c => 
      `ID ${c.id?.slice(0,8)}: ${c.description?.slice(0, 200)} (Category: ${c.category}, Sentiment: ${c.sentiment})`
    ).join("\n");

    const prompt = `Answer this query about customer complaints: ${query}
    
    Complaint data:
    ${context}
    
    Return ONLY a JSON object with keys: "summary" (concise answer) and "relevant_complaint_ids" (array of full IDs).`;

    const completion = await getGroqClient().chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No search results");

    const data = JSON.parse(content);
    return {
      summary: data.summary || "Unable to find specific answers.",
      relevant_complaint_ids: data.relevant_complaint_ids || [],
    };
  } catch (error) {
    console.error('[AI] Semantic search failed:', error);
    return { summary: "Search unavailable", relevant_complaint_ids: [] };
  }
}

/**
 * Generates a suggested response for employees.
 */
export async function getSuggestedResponse(category: string, sentiment: string, urgency: string, summary: string): Promise<string> {
  console.log(`[AI] Getting suggested response for ${category} complaint...`);
  
  try {
    const prompt = `Generate a professional, empathetic response template for a ${category} complaint with ${sentiment} sentiment and ${urgency} urgency. 
    Summary: ${summary}
    Keep it under 150 words, include next steps, and be customer-focused. 
    Return ONLY the response text.`;

    const completion = await getGroqClient().chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.5,
    });

    return completion.choices[0]?.message?.content?.trim() || "Thank you for your patience.";
  } catch (error) {
    console.error('[AI] Suggested response failed:', error);
    return "Thank you for your patience. We're working on resolving this issue and will update you soon.";
  }
}

/**
 * Calculates churn risk score for a customer.
 */
export async function calculate_churn_risk(customerComplaints: any[]): Promise<number> {
  console.log(`[AI] Calculating churn risk for ${customerComplaints.length} complaints...`);
  
  if (customerComplaints.length === 0) return 0;

  try {
    const context = customerComplaints.slice(-10).map((c, i) => 
      `C${i+1}: ${c.description?.slice(0, 100)} (Sentiment: ${c.ai_analyses?.[0]?.sentiment}, Status: ${c.status})`
    ).join("\n");

    const prompt = `Analyze this customer's complaint history and assign a churn risk score from 0-100.
    100 = highest risk, 0 = lowest risk.
    Complaints:
    ${context}
    
    Return ONLY a JSON object with key "churn_risk_score".`;

    const completion = await getGroqClient().chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return 50;

    const data = JSON.parse(content);
    return Math.min(100, Math.max(0, data.churn_risk_score || 50));
  } catch (error) {
    console.error('[AI] Churn risk calculation failed:', error);
    return 50;
  }
}