const fs = require('fs');

let seed = fs.readFileSync('supabase/seed.sql', 'utf8');

// Find all complaint IDs
const idMatches = [...seed.matchAll(/'(11111111-0000-0000-0000-[0-9]{12})'/g)];
const ids = [...new Set(idMatches.map(m => m[1]))];

console.log('Found ' + ids.length + ' complaints');

let analysesValues = ids.map((id, i) => {
  return `  ('${id}', 'Negative', -0.5, 'Medium', 'Customer Complaint', 'Auto-generated summary for complaint ${i + 1}', 'We apologize for the inconvenience and are working on it.', 0.00, '{"blast_radius": "One user", "trend_risk": "Low", "business_impact_hint": "None", "next_best_action": "Investigate", "failure_point_guess": "Unknown", "dependency_risk": "None"}'::JSONB)`;
}).join(',\n');

let newAnalysesSql = `
-- ============================================================
-- AI ANALYSES (pre-seeded for ALL complaints)
-- ============================================================
INSERT INTO public.ai_analyses (complaint_id, sentiment, sentiment_score, urgency, classification, summary, suggested_response, financial_loss_estimate, signals)
VALUES
${analysesValues}
ON CONFLICT (complaint_id) DO NOTHING;
`;

// Replace the existing ai_analyses section
seed = seed.replace(/-- ============================================================\r?\n-- AI ANALYSES \(pre-seeded.*?\r?\n-- ============================================================\r?\nINSERT INTO public\.ai_analyses.*?ON CONFLICT \(complaint_id\) DO NOTHING;/s, newAnalysesSql.trim());

fs.writeFileSync('supabase/seed.sql', seed);
console.log('Updated seed.sql with ' + ids.length + ' AI analyses!');
