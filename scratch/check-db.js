
import { supabaseAdmin } from "./src/lib/supabase";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function checkData() {
  const { data: complaints, error: cError } = await supabaseAdmin.from("complaints").select("id", { count: "exact" });
  console.log("Complaints count:", complaints?.length || 0);
  if (cError) console.error("Complaints error:", cError);

  const { data: analyses, error: aError } = await supabaseAdmin.from("ai_analyses").select("id", { count: "exact" });
  console.log("AI Analyses count:", analyses?.length || 0);
  if (aError) console.error("AI Analyses error:", aError);
}

checkData();
