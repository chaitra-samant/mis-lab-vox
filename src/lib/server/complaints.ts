import { createServerFn } from "@tanstack/react-start";
import { supabase, supabaseAdmin } from "../supabase";
import { analyzeComplaint, calculate_churn_risk, generateBusinessHealthInsights, getAISuggestions as _getAISuggestions, getSuggestedResponse as _getSuggestedResponse, performSemanticSearch as _performSemanticSearch } from "./ai";

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
    .select("*, ai_analyses(*), employees:assigned_to(name), messages(*)")
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
  
  return data.map((c: any) => ({
    ...c,
    assigned_to_name: c.employees?.name || "Unassigned",
    messages: (c.messages || [])
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((m: any) => ({
        role: m.sender_role,
        content: m.message_text,
        ts: m.created_at
      }))
  }));
}

export const resolveComplaint = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const { id } = args?.data || args;
    const { error } = await supabaseAdmin
      .from("complaints")
      .update({ status: "RESOLVED", resolved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const escalateComplaint = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const { id } = args?.data || args;
    const { error } = await supabaseAdmin
      .from("complaints")
      .update({ status: "ESCALATED", escalated: true, escalated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const getEmployees = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("employees")
      .select("id, name, department")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  });

export const updateComplaint = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const { id, status, assigned_to } = args?.data || args;
    
    const updates: any = {};
    if (status !== undefined) {
      updates.status = status;
      if (status === "RESOLVED" || status === "CLOSED") {
        updates.resolved_at = new Date().toISOString();
      } else if (status === "ESCALATED") {
        updates.escalated = true;
        updates.escalated_at = new Date().toISOString();
      }
    }
    if (assigned_to !== undefined) {
      updates.assigned_to = assigned_to || null;
    }

    const { error } = await supabaseAdmin
      .from("complaints")
      .update(updates)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const { complaintId, role, content } = args?.data || args;
    
    // For the demo, we map roles to the fixed IDs from seed.sql
    // Customer: Rahul Sharma
    // Employee: Vikram Malhotra (CEO/Senior Agent)
    const senderId = role === "customer" 
      ? "c0000001-0000-0000-0000-000000000001" 
      : "e0000001-0000-0000-0000-000000000001";

    const { error } = await supabaseAdmin
      .from("messages")
      .insert({
        complaint_id: complaintId,
        sender_id: senderId,
        sender_role: role,
        message_text: content,
        visible_to_customer: true
      });

    if (error) {
      console.error("Supabase Error:", error);
      throw new Error(error.message);
    }
    
    return { success: true };
  });

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
    .select("sentiment_score");
    
  const totalScore = sentimentData?.reduce((acc, curr) => acc + (Number(curr.sentiment_score) || 0), 0) || 0;
  const avgSentiment = sentimentData && sentimentData.length > 0 
    ? totalScore / sentimentData.length 
    : 0;

  const { data: exposureData } = await client
    .from("complaints")
    .select("financial_loss_customer");
    
  const totalExposure = exposureData?.reduce((acc, curr) => acc + (Number(curr.financial_loss_customer) || 0), 0) || 0;

  return {
    totalVolume,
    avgSentiment,
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
    console.log(`[AI] Starting analysis for new complaint ${complaint.id}...`);
    const aiResult = await analyzeComplaint(complaint.description, complaint.category);
    console.log(`[AI] Analysis result for ${complaint.id}:`, JSON.stringify(aiResult, null, 2));
    
    const { error: aiInsertError } = await supabaseAdmin
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
          signals: {
            blast_radius: aiResult.blast_radius,
            trend_risk: aiResult.trend_risk,
            business_impact_hint: aiResult.business_impact_hint,
            similar_issue_cluster: aiResult.similar_issue_cluster,
            novelty_score: aiResult.novelty_score,
            failure_point_guess: aiResult.failure_point_guess,
            dependency_risk: aiResult.dependency_risk,
            missing_info: aiResult.missing_info,
            next_best_action: aiResult.next_best_action,
            auto_routing_hint: aiResult.auto_routing_hint,
            escalation_reason: aiResult.escalation_reason,
          },
        },
      ]);
      
    if (aiInsertError) {
      console.error("[AI] Failed to insert AI Analysis:", aiInsertError);
    } else {
      console.log(`[AI] Analysis saved successfully for complaint ${complaint.id}`);
    }
      
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

export const reAnalyzeComplaint = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const { id, description, category } = args?.data || args;
    
    console.log(`[AI] Re-analyzing complaint ${id}...`);
    const aiResult = await analyzeComplaint(description, category);
    
    const signals = {
      blast_radius: aiResult.blast_radius,
      trend_risk: aiResult.trend_risk,
      business_impact_hint: aiResult.business_impact_hint,
      similar_issue_cluster: aiResult.similar_issue_cluster,
      novelty_score: aiResult.novelty_score,
      failure_point_guess: aiResult.failure_point_guess,
      dependency_risk: aiResult.dependency_risk,
      missing_info: aiResult.missing_info,
      next_best_action: aiResult.next_best_action,
      auto_routing_hint: aiResult.auto_routing_hint,
      escalation_reason: aiResult.escalation_reason,
    };

    console.log(`[AI] Saving signals for ${id}:`, JSON.stringify(signals, null, 2));

    const { error } = await supabaseAdmin
      .from("ai_analyses")
      .upsert({
        complaint_id: id,
        sentiment: aiResult.sentiment,
        sentiment_score: aiResult.sentiment_score,
        urgency: aiResult.urgency,
        classification: aiResult.category,
        summary: aiResult.summary,
        financial_loss_estimate: aiResult.financial_loss_estimate,
        signals: signals,
      }, { onConflict: 'complaint_id' });

    if (error) {
      console.error("[AI] Upsert error:", error);
      throw new Error(error.message);
    }
    
    console.log(`[AI] Re-analysis complete and saved for ${id}`);
    return { success: true };
  });

export const generateBusinessHealthReport = createServerFn({ method: "POST" })
  .handler(async (args: any) => {
    const { themes } = args?.data || args;
    console.log("[AI] Generating business health report data...");
    
    const metrics = await _getCEOMetrics();
    const insights = await generateBusinessHealthInsights(metrics, themes);
    
    // Get departmental breakdown for the report table
    const { data: complaints } = await supabaseAdmin
      .from("complaints")
      .select("category, financial_loss_customer");
      
    const deptStats: Record<string, { volume: number, exposure: number }> = {};
    complaints?.forEach((c: any) => {
      const cat = c.category || "Uncategorized";
      if (!deptStats[cat]) deptStats[cat] = { volume: 0, exposure: 0 };
      deptStats[cat].volume += 1;
      deptStats[cat].exposure += Number(c.financial_loss_customer) || 0;
    });

    return {
      metrics,
      insights,
      themes,
      departmentData: Object.entries(deptStats).map(([name, stats]) => ({
        name,
        ...stats
      })).sort((a, b) => b.exposure - a.exposure),
      timestamp: new Date().toISOString()
    };
  });