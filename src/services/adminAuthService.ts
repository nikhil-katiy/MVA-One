import { supabase } from "@/lib/supabase";

export type AdminAuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "PROFILE_NOT_FOUND"
  | "ROLE_NOT_DEFINED"
  | "ROLE_NOT_ALLOWED";

export class AdminAuthError extends Error {
  code: AdminAuthErrorCode;
  role?: string;

  constructor(
    code: AdminAuthErrorCode,
    message: string,
    role?: string
  ) {
    super(message);
    this.name = "AdminAuthError";
    this.code = code;
    this.role = role;
  }
}

export async function loginAdmin(
  email: string,
  password: string
) {
  // 1. Login with Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

  if (authError) {
    throw new AdminAuthError(
      "INVALID_CREDENTIALS",
      "Email or password is incorrect."
    );
  }

  if (!authData.user) {
    throw new Error("User not found.");
  }

  // 2. Get role from your existing database
  const { data: profile, error: profileError } =
    await supabase
      .from("user_profiles")
      .select("user_id, role")
      .eq("user_id", authData.user.id)
      .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();

    throw new AdminAuthError(
      profileError ? "PROFILE_NOT_FOUND" : "ROLE_NOT_DEFINED",
      profileError
        ? "User profile could not be loaded. Please contact administrator."
        : "Your role is not defined. Please contact administrator."
    );
  }

  // 3. Normalize role
  const role = String(profile.role)
    .trim()
    .toUpperCase();

  if (!role) {
    await supabase.auth.signOut();

    throw new AdminAuthError(
      "ROLE_NOT_DEFINED",
      "Your role is not defined. Please contact administrator."
    );
  }

  // 4. Only ADMIN can enter Admin Dashboard
  if (role !== "ADMIN") {
    await supabase.auth.signOut();

    throw new AdminAuthError(
      "ROLE_NOT_ALLOWED",
      `Access denied. Your role is ${profile.role}. Admin access is required.`,
      role
    );
  }

  // 5. Admin login successful
  return {
    user: authData.user,
    session: authData.session,
    profile: {
      ...profile,
      role,
    },
  };
}

export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAdminSession() {
  const { data, error } =
    await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session?.user) {
    return null;
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("user_profiles")
      .select("user_id, role")
      .eq("user_id", data.session.user.id)
      .maybeSingle();

  const role = String(profile?.role ?? "")
    .trim()
    .toUpperCase();

  if (profileError || role !== "ADMIN") {
    await supabase.auth.signOut();
    return null;
  }

  return data.session;
}