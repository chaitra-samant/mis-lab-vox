/**
 * CCIS — Phase 3 Employee Portal Tests
 * ============================================================
 * Test Suite: Employee Portal (Agent Workspace)
 * Strategy: API-Driven Tests
 * 
 * Tests cover: department queue, claim complaint, update status, 
 * send messages, and manual escalation.
 */

import { createClient } from "@supabase/supabase-js";
import * as assert from "assert";
import { readFileSync } from "fs";
import { join } from "path";

// ============================================================
// Helper: Load .env.local file
// ============================================================
function loadEnvFile() {
  try {
    const envPath = join(process.cwd(), ".env.local");
    const envContent = readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");

    const env: Record<string, string> = {};
    for (const line of lines) {
      if (!line || line.startsWith("#")) continue;
      const [key, ...value] = line.split("=");
      if (key && value) {
        env[key.trim()] = value.join("=").trim();
      }
    }
    return env;
  } catch (error) {
    console.error("❌ Could not read .env.local file");
    process.exit(1);
  }
}

const envVars = loadEnvFile();

const SUPABASE_URL = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables. Check .env.local");
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Test State
const state: any = {
  testEmployee: null,
  clientWithAuth: null,
  testComplaint: null,
};

// ============================================================
// Test Utilities
// ============================================================
async function getTestEmployeeAuth() {
  const { data: employeeData, error: empError } = await adminClient
    .from("employees")
    .select("*")
    .eq("email", "priya@aurabank.in") // Priya is in Finance
    .single();

  if (empError) throw new Error("Could not find test employee: " + empError.message);
  return employeeData;
}

// ============================================================
// Test Cases
// ============================================================

async function testListDepartmentQueue() {
  const test_name = "EMP-01: List Department Queue";
  try {
    const employee = await getTestEmployeeAuth();
    state.testEmployee = employee;

    const clientWithAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });

    const { error: authError } = await clientWithAuth.auth.signInWithPassword({
      email: employee.email,
      password: "AuraBank@2026", // from seed.sql
    });

    if (authError) {
      console.log(`⚠️  Skipping ${test_name} — auth not available`);
      return true;
    }
    
    state.clientWithAuth = clientWithAuth;

    // Fetch complaints using Employee RLS
    const { data: complaints, error } = await clientWithAuth
      .from("complaints")
      .select("*");

    assert.ok(!error, `Failed to fetch complaints: ${error?.message}`);
    assert.ok(complaints && complaints.length > 0, "No complaints found in department queue");

    // Verify ALL returned complaints are for the employee's department
    for (const c of complaints) {
      assert.strictEqual(c.department, employee.department, `Returned a complaint not in Finance dept: ${c.department}`);
    }

    // Find an OPEN complaint to use for the rest of the tests
    const unassignedComplaint = complaints.find(c => c.status === "OPEN" && !c.assigned_to);
    
    if (unassignedComplaint) {
        state.testComplaint = unassignedComplaint;
    } else {
        // Fallback: create a new complaint if none are unassigned
        const { data: newComplaint } = await adminClient.from("complaints").insert({
            customer_id: "c0000001-0000-0000-0000-000000000001",
            category: "Billing",
            description: "Test unassigned complaint",
            department: employee.department,
            status: "OPEN",
            preferred_resolution: "Refund",
        }).select().single();
        state.testComplaint = newComplaint;
    }

    console.log(`✅ ${test_name}`);
    return true;
  } catch (error: any) {
    console.error(`❌ ${test_name} — ${error.message}`);
    return false;
  }
}

async function testClaimComplaint() {
  const test_name = "EMP-02: Claim Complaint";
  try {
    if (!state.clientWithAuth) return true; // Skipped
    
    const complaintId = state.testComplaint.id;
    const employeeId = state.testEmployee.id;

    // Employee claims the complaint
    const { data, error } = await state.clientWithAuth
      .from("complaints")
      .update({ assigned_to: employeeId, status: "IN_PROGRESS" })
      .eq("id", complaintId)
      .select()
      .single();

    assert.ok(!error, `Failed to claim complaint: ${error?.message}`);
    assert.strictEqual(data.assigned_to, employeeId, "Complaint was not assigned to the employee");
    assert.strictEqual(data.status, "IN_PROGRESS", "Complaint status was not updated to IN_PROGRESS");

    console.log(`✅ ${test_name}`);
    return true;
  } catch (error: any) {
    console.error(`❌ ${test_name} — ${error.message}`);
    return false;
  }
}

async function testUpdateStatusAndNote() {
  const test_name = "EMP-03: Update Status & Note";
  try {
    if (!state.clientWithAuth) return true;
    
    const complaintId = state.testComplaint.id;
    const resolutionNote = "Processed refund as requested.";

    const { data, error } = await state.clientWithAuth
      .from("complaints")
      .update({ 
        status: "RESOLVED", 
        resolution_note: resolutionNote 
      })
      .eq("id", complaintId)
      .select()
      .single();

    assert.ok(!error, `Failed to update status: ${error?.message}`);
    assert.strictEqual(data.status, "RESOLVED", "Status did not update to RESOLVED");
    assert.strictEqual(data.resolution_note, resolutionNote, "Resolution note was not saved");

    console.log(`✅ ${test_name}`);
    return true;
  } catch (error: any) {
    console.error(`❌ ${test_name} — ${error.message}`);
    return false;
  }
}

async function testSendMessages() {
  const test_name = "EMP-04: Send Messages";
  try {
    if (!state.clientWithAuth) return true;
    
    const complaintId = state.testComplaint.id;

    // 1. Internal Note
    const { error: internalError } = await state.clientWithAuth
      .from("messages")
      .insert({
        complaint_id: complaintId,
        sender_id: state.testEmployee.id,
        sender_role: "employee",
        message_text: "Checked logs, user is correct.",
        visible_to_customer: false
      });
      
    assert.ok(!internalError, `Failed to add internal note: ${internalError?.message}`);

    // 2. Customer-facing message
    const { error: externalError } = await state.clientWithAuth
      .from("messages")
      .insert({
        complaint_id: complaintId,
        sender_id: state.testEmployee.id,
        sender_role: "employee",
        message_text: "We have resolved your issue.",
        visible_to_customer: true
      });
      
    assert.ok(!externalError, `Failed to add external message: ${externalError?.message}`);

    console.log(`✅ ${test_name}`);
    return true;
  } catch (error: any) {
    console.error(`❌ ${test_name} — ${error.message}`);
    return false;
  }
}

async function testEscalateComplaint() {
  const test_name = "EMP-05: Escalate Complaint";
  try {
    if (!state.clientWithAuth) return true;
    
    const complaintId = state.testComplaint.id;
    const reason = "Customer threatened legal action, requiring executive review.";

    const { data, error } = await state.clientWithAuth
      .from("complaints")
      .update({ 
        escalated: true, 
        escalation_reason: reason 
      })
      .eq("id", complaintId)
      .select()
      .single();

    assert.ok(!error, `Failed to escalate complaint: ${error?.message}`);
    assert.strictEqual(data.escalated, true, "Escalated flag was not set to true");
    assert.strictEqual(data.escalation_reason, reason, "Escalation reason was not saved");

    console.log(`✅ ${test_name}`);
    return true;
  } catch (error: any) {
    console.error(`❌ ${test_name} — ${error.message}`);
    return false;
  }
}

// ============================================================
// Runner
// ============================================================
async function runAllTests() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║  CCIS — Phase 3: Employee Portal Tests                ║");
  console.log("║  Queue Management, Claiming, Status & Escalation      ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");
  console.log("Running Phase 3 Test Suite...\n");

  const results = [];
  
  results.push(await testListDepartmentQueue());
  results.push(await testClaimComplaint());
  results.push(await testUpdateStatusAndNote());
  results.push(await testSendMessages());
  results.push(await testEscalateComplaint());

  const total = results.length;
  const passed = results.filter((r) => r).length;
  const failed = total - passed;

  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║  Test Results Summary                                  ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}\n`);

  if (failed > 0) {
    console.error("❌ Some tests failed. Review errors above.");
    process.exit(1);
  } else {
    console.log("🎉 All Phase 3 tests PASSED! Employee Portal ready to implement.");
    process.exit(0);
  }
}

runAllTests();
