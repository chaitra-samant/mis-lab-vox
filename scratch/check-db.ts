
import { supabaseAdmin } from "../src/lib/supabase";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function checkData() {
  try {
    const { data: complaints, error: cError } = await supabaseAdmin.from("complaints").select("id");
    console.log("Complaints count:", complaints?.length || 0);
    if (cError) console.error("Complaints error:", cError);

    const { data: analyses, error: aError } = await supabaseAdmin.from("ai_analyses").select("id");
    console.log("AI Analyses count:", analyses?.length || 0);
    if (aError) console.error("AI Analyses error:", aError);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

checkData();
