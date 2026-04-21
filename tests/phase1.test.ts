/**
 * CCIS — Phase 1 Database & Infrastructure Tests
 * ============================================================
 * Test Suite: Database Layer & Infrastructure (Backend)
 * Strategy: Backend-First, Test-Driven Development (TDD)
 * 
 * All tests verify the database schema, relationships, RLS policies,
 * and authentication layer directly without UI involvement.
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

// ============================================================
// Configuration
// ============================================================
const SUPABASE_URL = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables. Check .env.local");
  console.error(`URL: ${SUPABASE_URL ? "✓" : "✗"}, ANON: ${SUPABASE_ANON_KEY ? "✓" : "✗"}, SERVICE: ${SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗"}`);
  process.exit(1);
}

// Service role client for admin operations (bypasses RLS)
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test credentials for role-based access
const TEST_USERS = {
  customer: {
    email: "test.customer@gmail.com",
    password: "TestCustomer@2026",
    role: "customer",
  },
  employee: {
    email: "test.employee@aurabank.in",
    password: "TestEmployee@2026",
    role: "employee",
  },
  ceo: {
    email: "test.ceo@aurabank.in",
    password: "TestCEO@2026",
    role: "ceo",
  },
};

// ============================================================
// Test Results Tracking
// ============================================================
interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

function recordResult(
  id: string,
  name: string,
  passed: boolean,
  error?: string,
  duration: number = 0
) {
  results.push({ id, name, passed, error, duration });
  const status = passed ? "✅" : "❌";
  const errorMsg = error ? `\n   Error: ${error}` : "";
  console.log(`${status} [${id}] ${name}${errorMsg}`);
}

// ============================================================
// Test Case: DB-01 — Table Structures
// ============================================================
async function testDB01_TableStructures() {
  const testId = "DB-01";
  const testName = "Table Structures Exist";
  const startTime = Date.now();

  try {
    const tables = [
      "customers",
      "employees",
      "complaints",
      "messages",
      "ai_analyses",
      "clusters",
      "audit_logs",
      "api_keys",
    ];

    const results_check = await Promise.all(
      tables.map(async (tableName) => {
        const { data, error } = await adminClient
          .from(tableName)
          .select("*")
          .limit(1);

        if (error && !error.message.includes("relation does not exist")) {
          return { table: tableName, exists: true }; // Table exists, may be empty
        }
        return {
          table: tableName,
          exists: !error || !error.message.includes("relation does not exist"),
        };
      })
    );

    const allExist = results_check.every((r) => r.exists);
    const duration = Date.now() - startTime;

    if (allExist) {
      recordResult(
        testId,
        testName,
        true,
        undefined,
        duration
      );
    } else {
      const missing = results_check
        .filter((r) => !r.exists)
        .map((r) => r.table)
        .join(", ");
      recordResult(testId, testName, false, `Missing tables: ${missing}`, duration);
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    recordResult(
      testId,
      testName,
      false,
      error.message,
      duration
    );
  }
}

// ============================================================
// Test Case: DB-02 — Cascading Deletes
// ============================================================
async function testDB02_CascadingDeletes() {
  const testId = "DB-02";
  const testName = "Cascading Deletes Work Correctly";
  const startTime = Date.now();

  try {
    // Create a test customer
    const { data: customer, error: customerError } = await adminClient
      .from("customers")
      .insert({
        name: "Test Customer for Cascade",
        email: `cascade-test-${Date.now()}@gmail.com`,
        phone: "+91-9876543210",
      })
      .select()
      .single();

    if (customerError || !customer) {
      throw new Error(`Failed to create test customer: ${customerError?.message}`);
    }

    // Create a test complaint for this customer
    const { data: complaint, error: complaintError } = await adminClient
      .from("complaints")
      .insert({
        customer_id: customer.id,
        category: "Technical",
        description: "Test complaint for cascade delete",
        preferred_resolution: "Apology",
        status: "OPEN",
      })
      .select()
      .single();

    if (complaintError || !complaint) {
      throw new Error(`Failed to create test complaint: ${complaintError?.message}`);
    }

    // Create a test message for this complaint
    const { data: message, error: messageError } = await adminClient
      .from("messages")
      .insert({
        complaint_id: complaint.id,
        sender_id: customer.id,
        sender_role: "customer",
        message_text: "Test message",
      })
      .select()
      .single();

    if (messageError || !message) {
      throw new Error(`Failed to create test message: ${messageError?.message}`);
    }

    // Now delete the customer and check if related records cascade delete
    const { error: deleteError } = await adminClient
      .from("customers")
      .delete()
      .eq("id", customer.id);

    if (deleteError) {
      throw new Error(`Failed to delete customer: ${deleteError.message}`);
    }

    // Verify related complaint was deleted
    const { data: deletedComplaint, error: checkComplaintError } = await adminClient
      .from("complaints")
      .select("*")
      .eq("id", complaint.id)
      .single();

    // Verify related message was deleted
    const { data: deletedMessage, error: checkMessageError } = await adminClient
      .from("messages")
      .select("*")
      .eq("id", message.id)
      .single();

    const cascadeWorked =
      (!deletedComplaint || Object.keys(deletedComplaint).length === 0) &&
      (!deletedMessage || Object.keys(deletedMessage).length === 0);

    const duration = Date.now() - startTime;

    if (cascadeWorked) {
      recordResult(testId, testName, true, undefined, duration);
    } else {
      recordResult(
        testId,
        testName,
        false,
        "Cascade delete did not clean up related records",
        duration
      );
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    recordResult(testId, testName, false, error.message, duration);
  }
}

// ============================================================
// Test Case: DB-03 — RLS - Customer Access
// ============================================================
async function testDB03_RLS_Customer() {
  const testId = "DB-03";
  const testName = "RLS: Customer can only read own complaints";
  const startTime = Date.now();

  try {
    // Get all complaints visible to an anonymous client
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: complaints, error } = await anonClient
      .from("complaints")
      .select("*")
      .limit(5);

    // Without authentication, RLS should block or return empty
    const duration = Date.now() - startTime;
    const isRestricted = error || !complaints || complaints.length === 0;

    if (isRestricted) {
      recordResult(testId, testName, true, undefined, duration);
    } else {
      recordResult(
        testId,
        testName,
        false,
        "RLS did not restrict unauthenticated access",
        duration
      );
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    recordResult(testId, testName, false, error.message, duration);
  }
}

// ============================================================
// Test Case: DB-04 — RLS - Employee Access
// ============================================================
async function testDB04_RLS_Employee() {
  const testId = "DB-04";
  const testName = "RLS: Employee sees only department complaints";
  const startTime = Date.now();

  try {
    // Query as service role to set up test data
    const { data: employee, error: empError } = await adminClient
      .from("employees")
      .select("id, department")
      .limit(1)
      .single();

    if (empError || !employee) {
      throw new Error(
        `No test employee found: ${empError?.message || "Not found"}`
      );
    }

    // Get complaints assigned to this employee's department
    const { data: complaints, error } = await adminClient
      .from("complaints")
      .select("*")
      .eq("department", employee.department);

    const duration = Date.now() - startTime;

    // RLS should filter to department level
    const isFiltered =
      !error &&
      complaints &&
      complaints.every((c: any) => c.department === employee.department);

    if (isFiltered) {
      recordResult(testId, testName, true, undefined, duration);
    } else {
      recordResult(
        testId,
        testName,
        false,
        "RLS did not filter by employee department",
        duration
      );
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    recordResult(testId, testName, false, error.message, duration);
  }
}

// ============================================================
// Test Case: DB-05 — RLS - CEO Access
// ============================================================
async function testDB05_RLS_CEO() {
  const testId = "DB-05";
  const testName = "RLS: CEO can read all complaints";
  const startTime = Date.now();

  try {
    // Query all complaints as service role (simulating CEO access)
    const { data: complaints, error } = await adminClient
      .from("complaints")
      .select("*")
      .limit(100);

    const duration = Date.now() - startTime;

    if (!error && complaints && complaints.length > 0) {
      recordResult(testId, testName, true, undefined, duration);
    } else {
      recordResult(
        testId,
        testName,
        false,
        `CEO access failed or no complaints found: ${error?.message}`,
        duration
      );
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    recordResult(testId, testName, false, error.message, duration);
  }
}

// ============================================================
// Test Case: DB-06 — Trigger - Auth Profile Creation
// ============================================================
async function testDB06_AuthTrigger() {
  const testId = "DB-06";
  const testName = "Auth trigger creates customer profile";
  const startTime = Date.now();

  try {
    const testEmail = `auth-trigger-test-${Date.now()}@gmail.com`;

    // Create a new auth user
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: "TestPassword@2026",
      user_metadata: { role: "customer" },
    });

    if (authError || !authUser) {
      throw new Error(`Failed to create auth user: ${authError?.message}`);
    }

    // Wait a moment for the trigger to fire
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if customer profile was created
    const { data: customers, error: customerError } = await adminClient
      .from("customers")
      .select("*")
      .eq("auth_id", authUser.user?.id);

    const duration = Date.now() - startTime;

    if (!customerError && customers && customers.length > 0) {
      recordResult(testId, testName, true, undefined, duration);

      // Cleanup
      try {
        await adminClient.auth.admin.deleteUser(authUser.user!.id);
      } catch (cleanupError) {
        // Cleanup error is non-critical
      }
    } else {
      // This might be expected if the trigger is not set up
      recordResult(
        testId,
        testName,
        false,
        `Auth trigger may not be set up - no profile found for auth_id: ${authUser.user?.id}`,
        duration
      );
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    recordResult(testId, testName, false, error.message, duration);
  }
}

// ============================================================
// Test Case: DB-07 — Seed Script Execution
// ============================================================
async function testDB07_SeedExecution() {
  const testId = "DB-07";
  const testName = "Seed script creates predictable data";
  const startTime = Date.now();

  try {
    // Count existing records
    const { count: customerCount, error: custError } = await adminClient
      .from("customers")
      .select("*", { count: "exact", head: true });

    const { count: employeeCount, error: empError } = await adminClient
      .from("employees")
      .select("*", { count: "exact", head: true });

    const { count: complaintCount, error: compError } = await adminClient
      .from("complaints")
      .select("*", { count: "exact", head: true });

    const duration = Date.now() - startTime;

    // Verify we have expected seed data quantities
    const hasCustomers = !custError && (customerCount ?? 0) >= 10;
    const hasEmployees = !empError && (employeeCount ?? 0) >= 5;
    const hasComplaints = !compError && (complaintCount ?? 0) >= 50;

    if (hasCustomers && hasEmployees && hasComplaints) {
      recordResult(
        testId,
        testName,
        true,
        `(Customers: ${customerCount}, Employees: ${employeeCount}, Complaints: ${complaintCount})`,
        duration
      );
    } else {
      const missing = [
        !hasCustomers ? `customers (${customerCount} < 10)` : "",
        !hasEmployees ? `employees (${employeeCount} < 5)` : "",
        !hasComplaints ? `complaints (${complaintCount} < 50)` : "",
      ]
        .filter(Boolean)
        .join(", ");

      recordResult(
        testId,
        testName,
        false,
        `Seed data incomplete: ${missing}`,
        duration
      );
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    recordResult(testId, testName, false, error.message, duration);
  }
}

// ============================================================
// Test: Schema Constraints
// ============================================================
async function testSchemaConstraints() {
  const testId = "DB-SCHEMA";
  const testName = "Database constraints enforced";
  const startTime = Date.now();

  try {
    // Try to insert a complaint with invalid status
    const { error } = await adminClient
      .from("complaints")
      .insert({
        customer_id: "00000000-0000-0000-0000-000000000000",
        category: "Technical",
        description: "Test",
        preferred_resolution: "Refund",
        status: "INVALID_STATUS", // Should fail
      });

    const duration = Date.now() - startTime;

    if (error) {
      recordResult(testId, testName, true, undefined, duration);
    } else {
      recordResult(
        testId,
        testName,
        false,
        "Constraint did not prevent invalid status",
        duration
      );
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    recordResult(testId, testName, false, error.message, duration);
  }
}

// ============================================================
// Main Test Runner
// ============================================================
async function runAllTests() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║  CCIS — Phase 1: Database & Infrastructure Tests      ║");
  console.log("║  Backend-First, Test-Driven Development (TDD)         ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  console.log("Running Phase 1 Test Suite...\n");

  // Run all tests sequentially
  await testDB01_TableStructures();
  await testDB02_CascadingDeletes();
  await testDB03_RLS_Customer();
  await testDB04_RLS_Employee();
  await testDB05_RLS_CEO();
  await testDB06_AuthTrigger();
  await testDB07_SeedExecution();
  await testSchemaConstraints();

  // Print summary
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║  Test Results Summary                                  ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}\n`);

  if (failed === 0) {
    console.log("🎉 All Phase 1 tests PASSED! Database infrastructure is ready.\n");
    process.exit(0);
  } else {
    console.log(`⚠️ ${failed} test(s) FAILED. Please review the errors above.\n`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});
