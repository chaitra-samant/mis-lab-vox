import { supabase } from "./supabase";

export type UserRole = "customer" | "employee" | "ceo";

export async function getSession() {
  if (import.meta.env.VITE_USE_MOCK_AUTH === "true") {
    const mockRole = localStorage.getItem("vox_mock_role") as UserRole | null;
    if (mockRole) {
      return { user: { id: "mock-user", user_metadata: { role: mockRole } } };
    }
    return null;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  return data.session;
}

export async function getUserRole(): Promise<UserRole | null> {
  const session = await getSession();
  if (!session?.user) return null;

  // Role should be stored in user_metadata
  const role = session.user.user_metadata?.role as UserRole;
  return role || null;
}

export async function signOut() {
  if (import.meta.env.VITE_USE_MOCK_AUTH === "true") {
    localStorage.removeItem("vox_mock_role");
    return;
  }
  await supabase.auth.signOut();
}

export function getRoleRedirectPath(role: UserRole | null): string {
  switch (role) {
    case "customer":
      return "/customer";
    case "employee":
      return "/agent"; // Lovable generated /agent for Employee
    case "ceo":
      return "/ceo";
    default:
      return "/login";
  }
}
