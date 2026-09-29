import { supabase } from '../lib/supabase';

export type AppRole =
  | 'ADMIN'
  | 'PARENT'
  | 'FAMILY'
  | 'STAFF'
  | 'STUDENT'
  | 'UNKNOWN';

export type UserProfile = {
  user_id: string;
  role: string | null;
  family_id: number | null;
  student_id: number | null;
  staff_id: number | null;
};

export type AuthResult = {
  user: NonNullable<
    Awaited<
      ReturnType<typeof supabase.auth.getUser>
    >['data']['user']
  >;
  session: NonNullable<
    Awaited<
      ReturnType<typeof supabase.auth.getSession>
    >['data']['session']
  >;
  profile: UserProfile;
  role: AppRole;
};

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'PROFILE_NOT_FOUND'
  | 'ROLE_NOT_DEFINED'
  | 'ROLE_NOT_ALLOWED'
  | 'AUTH_ERROR';

export class AuthServiceError extends Error {
  code: AuthErrorCode;
  role?: string;

  constructor(
    code: AuthErrorCode,
    message: string,
    role?: string,
  ) {
    super(message);
    this.name = 'AuthServiceError';
    this.code = code;
    this.role = role;
  }
}

/**
 * Convert database role into application role.
 *
 * Current project uses lowercase roles in RLS such as:
 * admin / staff
 *
 * Parent/family accounts are accepted as:
 * family / parent
 */
export function normalizeRole(
  role: string | null | undefined,
): AppRole {
  const normalized = String(role ?? '')
    .trim()
    .toLowerCase();

  switch (normalized) {
    case 'admin':
      return 'ADMIN';

    case 'family':
      return 'FAMILY';

    case 'parent':
      return 'PARENT';

    case 'staff':
      return 'STAFF';

    case 'student':
      return 'STUDENT';

    default:
      return 'UNKNOWN';
  }
}

/**
 * Login with Supabase Auth and load the
 * currently authenticated user's own profile.
 *
 * IMPORTANT:
 * We only read the profile belonging to auth.uid().
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResult> {
  const cleanEmail = email.trim();

  if (!cleanEmail) {
    throw new AuthServiceError(
      'INVALID_CREDENTIALS',
      'Please enter your email.',
    );
  }

  if (!password) {
    throw new AuthServiceError(
      'INVALID_CREDENTIALS',
      'Please enter your password.',
    );
  }

  const {
    data: authData,
    error: authError,
  } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (authError) {
    throw new AuthServiceError(
      'INVALID_CREDENTIALS',
      'Email or password is incorrect.',
    );
  }

  if (!authData.user || !authData.session) {
    throw new AuthServiceError(
      'AUTH_ERROR',
      'Login session could not be created.',
    );
  }

  /*
   * user_profiles has an RLS policy allowing
   * a user to read their own profile:
   *
   * user_id = auth.uid()
   */
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('user_profiles')
    .select(
      `
        user_id,
        role,
        family_id,
        student_id,
        staff_id
      `,
    )
    .eq('user_id', authData.user.id)
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();

    throw new AuthServiceError(
      'PROFILE_NOT_FOUND',
      'User profile could not be loaded. Please contact administrator.',
    );
  }

  if (!profile) {
    await supabase.auth.signOut();

    throw new AuthServiceError(
      'PROFILE_NOT_FOUND',
      'User profile does not exist. Please contact administrator.',
    );
  }

  const role = normalizeRole(profile.role);

  if (role === 'UNKNOWN') {
    await supabase.auth.signOut();

    throw new AuthServiceError(
      'ROLE_NOT_DEFINED',
      'Your role is not defined. Please contact administrator.',
    );
  }

  return {
    user: authData.user,
    session: authData.session,
    profile: {
      user_id: profile.user_id,
      role: profile.role ?? null,
      family_id: profile.family_id ?? null,
      student_id: profile.student_id ?? null,
      staff_id: profile.staff_id ?? null,
    },
    role,
  };
}

/**
 * Get currently logged-in user + profile.
 */
export async function getCurrentUser(): Promise<AuthResult | null> {
  const {
    data: sessionData,
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new AuthServiceError(
      'AUTH_ERROR',
      sessionError.message,
    );
  }

  const session = sessionData.session;

  if (!session?.user) {
    return null;
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('user_profiles')
    .select(
      `
        user_id,
        role,
        family_id,
        student_id,
        staff_id
      `,
    )
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return null;
  }

  const role = normalizeRole(profile.role);

  if (role === 'UNKNOWN') {
    await supabase.auth.signOut();
    return null;
  }

  return {
    user: session.user,
    session,
    profile: {
      user_id: profile.user_id,
      role: profile.role ?? null,
      family_id: profile.family_id ?? null,
      student_id: profile.student_id ?? null,
      staff_id: profile.staff_id ?? null,
    },
    role,
  };
}

/**
 * Logout current user.
 */
export async function logoutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}