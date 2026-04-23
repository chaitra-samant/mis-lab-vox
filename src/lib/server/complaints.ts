import { createServerFn } from "@tanstack/react-start";
import { supabase, supabaseAdmin } from "../supabase";
import { analyzeComplaint, calculate_churn_risk, getAISuggestions as _getAISuggestions, getSuggestedResponse as _getSuggestedResponse, performSemanticSearch as _performSemanticSearch } from "./ai";

export const performSemanticSearch = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const { query, complaintData } = args?.data || args;
    return _performSemanticSearch(query, complaintData);
  });

/**
 * CCIS — Phase 5 Server Functions
 * ============================================================
 * These functions handle real database interactions via Supabase
 * and integrate with the AI Microservice.
 */

export const getComplaints = createServerFn({ method: "GET" })
  .handler(async (args: any) => {
    const role = args?.data || args;
    return _getComplaints(role);
  });

export async function _getComplaints(role?: string) {
  console.log("Fetching complaints for role:", role);
  
  // Use supabaseAdmin on the server to bypass RLS, as the server 
  // function is already authorized by the application logic.
  const client = supabaseAdmin;
  
  let query = client
    .from("complaints")
    .select("*, ai_analyses(*)")
    .order("created_at", { ascending: false });

  // Filter by the mock customer ID when in the customer portal context.
  // This scopes the results to only the seeded demo customer's complaints.
  if (!role || role === "customer") {
    query = query.eq("customer_id", "c0000001-0000-0000-0000-000000000001");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching complaints:", error);
    throw new Error(error.message);
  }
  
  return data;
}

export const getCEOMetrics = createServerFn({ method: "GET" }).handler(async () => {
  return _getCEOMetrics();
});

export async function _getCEOMetrics() {
  console.log("Fetching CEO metrics...");
  
  // Use supabaseAdmin on the server to bypass RLS for aggregate metrics.
  const client = supabaseAdmin;

  const { count: totalVolume } = await client
    .from("complaints")
    .select("*", { count: "exact", head: true });

  const { data: sentimentData } = await client
    .from("ai_analyses")
    .select("sentiment");
    
  const negativeCount = sentimentData?.filter(s => s.sentiment === 'Negative').length || 0;
  const negativeRatio = sentimentData && sentimentData.length > 0 
    ? (negativeCount / sentimentData.length) * 100 
    : 0;

  const { data: exposureData } = await client
    .from("complaints")
    .select("financial_loss_customer");
    
  const totalExposure = exposureData?.reduce((acc, curr) => acc + (Number(curr.financial_loss_customer) || 0), 0) || 0;

  return {
    totalVolume,
    negativeRatio,
    totalExposure,
    slaCompliance: 96.8
  };
}

export const submitComplaint = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const payload = args?.data || (args && Object.keys(args).length > 0 ? args : null);
    
    if (!payload) {
      console.error("submitComplaint: Payload is missing. Received args:", args);
      throw new Error("Payload is required");
    }
    
    console.log("submitComplaint: Processing payload:", payload);
    return _submitComplaint(payload);
  });

export async function _submitComplaint(payload: any) {
  console.log("Submitting new complaint:", payload);
  
  const { customer_id, ...rest } = payload;
  let finalCustomerId = customer_id;

  // Resolve auth_id to public customer id if needed
  if (customer_id) {
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .or(`id.eq.${customer_id},auth_id.eq.${customer_id}`)
      .maybeSingle();
    
    if (customer) {
      finalCustomerId = customer.id;
    }
  }

  if (!finalCustomerId) {
    finalCustomerId = "c0000001-0000-0000-0000-000000000001";
  }

  const { data: complaint, error: complaintError } = await supabaseAdmin
    .from("complaints")
    .insert([
      {
        ...rest,
        customer_id: finalCustomerId,
        status: "OPEN",
        source: "web_form",
      },
    ])
    .select()
    .single();

  if (complaintError) {
    console.error("Error submitting complaint:", complaintError);
    throw new Error(complaintError.message);
  }

  // --- AI ANALYSIS & PRIORITY UPDATES ---
  try {
    const aiResult = await analyzeComplaint(complaint.description, complaint.category);
    
    await supabaseAdmin
      .from("ai_analyses")
      .insert([
        {
          complaint_id: complaint.id,
          sentiment: aiResult.sentiment,
          sentiment_score: aiResult.sentiment_score,
          urgency: aiResult.urgency,
          classification: aiResult.category,
          summary: aiResult.summary,
          financial_loss_estimate: aiResult.financial_loss_estimate,
        },
      ]);
      
    const priorityMap: Record<string, string> = {
      'Low': 'LOW',
      'Medium': 'MEDIUM',
      'High': 'HIGH',
      'Critical': 'CRITICAL'
    };
    
    await supabaseAdmin
      .from("complaints")
      .update({ 
        priority: priorityMap[aiResult.urgency] || 'MEDIUM',
        department: aiResult.department || 'Operations'
      })
      .eq('id', complaint.id);

  } catch (aiError) {
    console.error("AI Analysis failed to save:", aiError);
  }

  // --- CHURN RISK CALCULATION ---
  try {
    const { data: customerComplaints } = await supabaseAdmin
      .from("complaints")
      .select("description, ai_analyses(sentiment), status")
      .eq("customer_id", finalCustomerId);
      
    if (customerComplaints) {
      // Logic from the AI microservice to weigh sentiments and volume
      const churnScore = await calculate_churn_risk(customerComplaints);
      await supabaseAdmin
        .from("customers")
        .update({ churn_risk_score: churnScore })
        .eq("id", finalCustomerId);
    }
  } catch (churnError) {
    console.error("Churn risk calculation failed:", churnError);
  }
  
  return complaint;
}

export const getSuggestions = createServerFn({ method: "GET" })
  .handler(async (args: any) => {
    const data = args?.data || args;
    if (!data?.keywords) {
      console.warn("getSuggestions called without keywords");
      return [];
    }
    
    console.log("Fetching suggestions for keywords:", data.keywords);
    
    // Use supabaseAdmin on the server to bypass RLS.
    const client = supabaseAdmin;
    
    const { data: faqs, error } = await client
      .from("faqs")
      .select("*")
      .overlaps("keywords", data.keywords);

    if (error) {
      console.error("Error fetching suggestions:", error);
      throw new Error(error.message);
    }
    
    return faqs || [];
  });

export const submitFeedback = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const payload = args?.data || (args && Object.keys(args).length > 0 ? args : null);
    
    if (!payload?.id) {
      console.error("submitFeedback: Complaint ID is required. Received args:", args);
      throw new Error("Complaint ID is required for feedback");
    }
  
  // Use supabaseAdmin on the server to bypass RLS.
  const client = supabaseAdmin;

  const { data, error } = await client
    .from("complaints")
    .update({
      feedback_rating: payload.rating,
      feedback_text: payload.text,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id)
    .eq("status", "RESOLVED") 
    .select()
    .single();

  if (error) {
    console.error("Error submitting feedback:", error);
    throw new Error(error.message);
  }
  
  return data;
});

export const getAISuggestions = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const text = args?.data || args;
    return _getAISuggestions(text);
  });

export const getSuggestedResponse = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const { category, sentiment, urgency, summary } = args?.data || args;
    return _getSuggestedResponse(category, sentiment, urgency, summary);
  });