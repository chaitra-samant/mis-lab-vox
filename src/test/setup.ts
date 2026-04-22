import "@testing-library/jest-dom";

// Silence specific console noise during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = String(args[0]);
    // Suppress known benign React Router / Radix warnings in test env
    if (
      msg.includes("Warning: An update to") ||
      msg.includes("Not implemented") ||
      msg.includes("Error: Could not parse CSS")
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock import.meta.env for all tests
Object.defineProperty(globalThis, "import", {
  value: {
    meta: {
      env: {
        VITE_USE_MOCK_AUTH: "true",
        VITE_SUPABASE_URL: "http://localhost:54321",
        VITE_SUPABASE_ANON_KEY: "mock-anon-key",
        MODE: "test",
        DEV: true,
        PROD: false,
      },
    },
  },
  writable: true,
});
