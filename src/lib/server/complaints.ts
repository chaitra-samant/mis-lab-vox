import { createServerFn } from "@tanstack/react-start";
import { supabase, supabaseAdmin } from "../supabase";
import { analyzeComplaint } from "./ai";

/**
 * CCIS — Phase 5 Server Functions
 * ============================================================
 * These functions handle real database interactions via Supabase
 * and integrate with the AI Microservice.
 */

export const getComplaints = createServerFn({ method: "GET" }).handler(async ({ data: role }: { data?: string }) => {
  return _getComplaints(role);
});

export async function _getComplaints(role?: string) {
  console.log("Fetching complaints for role:", role);
  
  let query = supabase
    .from("complaints")
    .select("*, ai_analyses(*)")
    .order("created_at", { ascending: false });

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
  
  const { count: totalVolume } = await supabase
    .from("complaints")
    .select("*", { count: "exact", head: true });

  const { data: sentimentData } = await supabase
    .from("ai_analyses")
    .select("sentiment");
    
  const negativeCount = sentimentData?.filter(s => s.sentiment === 'Negative').length || 0;
  const negativeRatio = sentimentData && sentimentData.length > 0 
    ? (negativeCount / sentimentData.length) * 100 
    : 0;

  const { data: exposureData } = await supabase
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

export const submitComplaint = createServerFn({ method: "POST" }).handler(async ({ data: payload }: { data: any }) => {
  return _submitComplaint(payload);
});

export async function _submitComplaint(payload: any) {
  console.log("Submitting new complaint:", payload);
  
  const { customer_id, ...rest } = payload;
  const finalCustomerId = customer_id || "c0000001-0000-0000-0000-000000000001";

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
      .update({ priority: priorityMap[aiResult.urgency] || 'MEDIUM' })
      .eq('id', complaint.id);

  } catch (aiError) {
    console.error("AI Analysis failed to save:", aiError);
  }
  
  return complaint;
}

export const getSuggestions = createServerFn({ method: "GET" }).handler(async ({ data: query }: { data: { keywords: string[] } }) => {
  console.log("Fetching suggestions for keywords:", query.keywords);
  
  // keyword matching logic: check if any of the provided keywords match the FAQ keywords array
  // Using 'overlaps' operator (&&) for arrays
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .overlaps("keywords", query.keywords);

  if (error) {
    console.error("Error fetching suggestions:", error);
    throw new Error(error.message);
  }
  
  return data;
});

export const submitFeedback = createServerFn({ method: "POST" }).handler(async ({ data: payload }: { data: { id: string; rating: number; text: string } }) => {
  console.log("Submitting feedback for complaint:", payload.id);
  
  const { data, error } = await supabase
    .from("complaints")
    .update({
      feedback_rating: payload.rating,
      feedback_text: payload.text,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id)
    .eq("status", "RESOLVED") // Safety check: only resolved complaints get feedback
    .select()
    .single();

  if (error) {
    console.error("Error submitting feedback:", error);
    throw new Error(error.message);
  }
  
  return data;
});
