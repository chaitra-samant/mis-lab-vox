import { createServerFn } from "@tanstack/react-start";
import { supabase } from "../supabase";

/**
 * CCIS — Phase 3 Server Functions (Employee Portal)
 * ============================================================
 * These functions handle real database interactions via Supabase.
 * In production, these would use the real auth session.
 */

// Priya Sharma (Finance Department)
const MOCK_EMPLOYEE_ID = "e0000001-0000-0000-0000-000000000002";
const MOCK_DEPARTMENT = "Finance";
const MOCK_ROLE = "employee";

export const getDepartmentQueue = createServerFn("GET", async () => {
  console.log("Fetching queue for department:", MOCK_DEPARTMENT);
  
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("department", MOCK_DEPARTMENT)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching department queue:", error);
    throw new Error(error.message);
  }
  
  return data;
});

export const getComplaintDetails = createServerFn("GET", async (query: { id: string }) => {
  console.log("Fetching details for complaint:", query.id);
  
  const { data, error } = await supabase
    .from("complaints")
    .select(`
      *,
      customers ( name, email, phone, churn_risk_score ),
      messages (*)
    `)
    .eq("id", query.id)
    .single();

  if (error) {
    console.error("Error fetching complaint details:", error);
    throw new Error(error.message);
  }
  
  return data;
});

export const claimComplaint = createServerFn("POST", async (payload: { id: string }) => {
  console.log("Claiming complaint:", payload.id);
  
  const { data, error } = await supabase
    .from("complaints")
    .update({
      assigned_to: MOCK_EMPLOYEE_ID,
      status: "IN_PROGRESS",
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id)
    .select()
    .single();

  if (error) {
    console.error("Error claiming complaint:", error);
    throw new Error(error.message);
  }
  
  return data;
});

export const updateComplaintStatus = createServerFn("POST", async (payload: { id: string; status: string; resolutionNote?: string }) => {
  console.log("Updating status for:", payload.id, "to", payload.status);
  
  const updateData: any = {
    status: payload.status,
    updated_at: new Date().toISOString(),
  };

  if (payload.status === "RESOLVED") {
    updateData.resolved_at = new Date().toISOString();
  }
  
  if (payload.resolutionNote) {
    updateData.resolution_note = payload.resolutionNote;
  }

  const { data, error } = await supabase
    .from("complaints")
    .update(updateData)
    .eq("id", payload.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating complaint status:", error);
    throw new Error(error.message);
  }
  
  return data;
});

export const addMessage = createServerFn("POST", async (payload: { complaint_id: string; message_text: string; visible_to_customer: boolean }) => {
  console.log("Adding message to complaint:", payload.complaint_id);
  
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        complaint_id: payload.complaint_id,
        sender_id: MOCK_EMPLOYEE_ID,
        sender_role: MOCK_ROLE,
        message_text: payload.message_text,
        visible_to_customer: payload.visible_to_customer,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding message:", error);
    throw new Error(error.message);
  }
  
  return data;
});

export const escalateComplaint = createServerFn("POST", async (payload: { id: string; reason: string }) => {
  console.log("Escalating complaint:", payload.id);
  
  const { data, error } = await supabase
    .from("complaints")
    .update({
      escalated: true,
      escalation_reason: payload.reason,
      escalated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id)
    .select()
    .single();

  if (error) {
    console.error("Error escalating complaint:", error);
    throw new Error(error.message);
  }
  
  // Create audit log for escalation
  await supabase.from("audit_logs").insert([
    {
      actor_id: MOCK_EMPLOYEE_ID,
      actor_role: MOCK_ROLE,
      action: "escalate",
      resource_type: "complaint",
      resource_id: payload.id,
      metadata: { reason: payload.reason },
    }
  ]);
  
  return data;
});
