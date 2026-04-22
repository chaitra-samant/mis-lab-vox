import { createServerFn } from "@tanstack/react-start";
import { supabase } from "../supabase";

/**
 * CCIS — Phase 2 Server Functions
 * ============================================================
 * These functions handle real database interactions via Supabase.
 * In production, these would be protected by real auth sessions.
 */

const MOCK_CUSTOMER_ID = "c0000001-0000-0000-0000-000000000001"; // Rahul Sharma

export const getComplaints = createServerFn("GET", async () => {
  console.log("Fetching complaints for customer:", MOCK_CUSTOMER_ID);
  
  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("customer_id", MOCK_CUSTOMER_ID)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching complaints:", error);
    throw new Error(error.message);
  }
  
  return data;
});

export const submitComplaint = createServerFn("POST", async (payload: any) => {
  console.log("Submitting new complaint:", payload);
  
  const { data, error } = await supabase
    .from("complaints")
    .insert([
      {
        ...payload,
        customer_id: MOCK_CUSTOMER_ID,
        status: "OPEN",
        source: "web_form",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error submitting complaint:", error);
    throw new Error(error.message);
  }
  
  return data;
});

export const getSuggestions = createServerFn("GET", async (query: { keywords: string[] }) => {
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

export const submitFeedback = createServerFn("POST", async (payload: { id: string; rating: number; text: string }) => {
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
