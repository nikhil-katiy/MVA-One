import {
  AuthServiceError,
  getCurrentUser,
  loginUser,
  logoutUser,
} from './authService';

export type AdminAuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'PROFILE_NOT_FOUND'
  | 'ROLE_NOT_DEFINED'
  | 'ROLE_NOT_ALLOWED';

export class AdminAuthError extends Error {
  code: AdminAuthErrorCode;
  role?: string;

  constructor(
    code: AdminAuthErrorCode,
    message: string,
    role?: string,
  ) {
    super(message);
    this.name = 'AdminAuthError';
    this.code = code;
    this.role = role;
  }
}

/**
 * Admin login wrapper.
 *
 * Common authentication happens inside authService.
 * This function only allows ADMIN.
 */
export async function loginAdmin(
  email: string,
  password: string,
) {
  try {
    const result = await loginUser(email, password);

    if (result.role !== 'ADMIN') {
      await logoutUser();

      throw new AdminAuthError(
        'ROLE_NOT_ALLOWED',
        `Access denied. Your role is ${
          result.profile.role ?? 'undefined'
        }. Admin access is required.`,
        result.profile.role ?? undefined,
      );
    }

    return result;
  } catch (error) {
    if (error instanceof AdminAuthError) {
      throw error;
    }

    if (error instanceof AuthServiceError) {
      throw new AdminAuthError(
        error.code === 'AUTH_ERROR'
          ? 'INVALID_CREDENTIALS'
          : error.code,
        error.message,
        error.role,
      );
    }

    throw error;
  }
}

/**
 * Admin logout.
 */
export async function logoutAdmin() {
  await logoutUser();
}

/**
 * Verify current session belongs to ADMIN.
 */
export async function getAdminSession() {
  const result = await getCurrentUser();

  if (!result) {
    return null;
  }

  if (result.role !== 'ADMIN') {
    await logoutUser();
    return null;
  }

  return result.session;
}