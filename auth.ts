import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { User, Role, Permission } from "@prisma/client";

// =====================================================
// JWT Configuration
// =====================================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "development-jwt-secret-min-32-characters-long-placeholder"
);
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "development-refresh-secret-min-32-characters-long-placeholder"
);
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "hrms_session";
const SESSION_REFRESH_COOKIE = "hrms_refresh";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// =====================================================
// Types
// =====================================================

export interface JWTPayload {
  sub: string; // user id
  email: string;
  roleId: string;
  roleName: string;
  employeeId?: string;
  type: "access" | "refresh";
}

export interface AuthUser {
  id: string;
  email: string;
  status: string;
  role: {
    id: string;
    name: string;
    displayNameAr: string;
    displayNameEn: string;
    level: number;
    permissions: string[];
  };
  employee?: {
    id: string;
    employeeCode: string;
    firstNameAr: string;
    lastNameAr: string;
    firstNameEn: string;
    lastNameEn: string;
    departmentId: string;
    positionId: string;
    managerId: string | null;
    status: string;
    profilePicture: string | null;
    basicSalary?: any;
    annualLeaveBalance?: number;
    sickLeaveBalance?: number;
    gender?: string;
  };
}

// =====================================================
// Password Hashing
// =====================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// =====================================================
// JWT Token Management
// =====================================================

export async function generateAccessToken(payload: Omit<JWTPayload, "type">): Promise<string> {
  return new SignJWT({ ...payload, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .setIssuer("hrms-portal")
    .setAudience("hrms-portal-users")
    .sign(JWT_SECRET);
}

export async function generateRefreshToken(payload: Omit<JWTPayload, "type">): Promise<string> {
  return new SignJWT({ ...payload, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_REFRESH_EXPIRES_IN)
    .setIssuer("hrms-portal")
    .setAudience("hrms-portal-users")
    .sign(JWT_REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "hrms-portal",
      audience: "hrms-portal-users",
    });
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET, {
      issuer: "hrms-portal",
      audience: "hrms-portal-users",
    });
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

// =====================================================
// Session Management
// =====================================================

export async function setSessionCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(SESSION_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 15, // 15 minutes
  });

  cookieStore.set(SESSION_REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(SESSION_REFRESH_COOKIE);
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  return getUserWithPermissions(payload.sub);
}

export async function getUserWithPermissions(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
      employee: {
        select: {
          id: true,
          employeeCode: true,
          firstNameAr: true,
          lastNameAr: true,
          firstNameEn: true,
          lastNameEn: true,
          departmentId: true,
          positionId: true,
          managerId: true,
          status: true,
          profilePicture: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    status: user.status,
    role: {
      id: user.role.id,
      name: user.role.name,
      displayNameAr: user.role.displayNameAr,
      displayNameEn: user.role.displayNameEn,
      level: user.role.level,
      permissions: user.role.permissions.map((rp) => rp.permission.code),
    },
    employee: user.employee || undefined,
  };
}

// =====================================================
// Login / Logout
// =====================================================

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  message?: string;
  requiresTwoFactor?: boolean;
}

export async function login(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
      employee: true,
    },
  });

  if (!user) {
    return { success: false, message: "Invalid email or password" };
  }

  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return {
      success: false,
      message: "Account temporarily locked. Try again later.",
    };
  }

  if (user.status !== "ACTIVE") {
    return { success: false, message: "Account is not active" };
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    // Increment failed login attempts
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil,
      },
    });

    return { success: false, message: "Invalid email or password" };
  }

  // Reset failed attempts on successful login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });

  // Generate tokens
  const accessToken = await generateAccessToken({
    sub: user.id,
    email: user.email,
    roleId: user.roleId,
    roleName: user.role.name,
    employeeId: user.employee?.id,
  });

  const refreshToken = await generateRefreshToken({
    sub: user.id,
    email: user.email,
    roleId: user.roleId,
    roleName: user.role.name,
    employeeId: user.employee?.id,
  });

  // Store session in DB
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await prisma.session.create({
    data: {
      userId: user.id,
      token: accessToken.substring(0, 64),
      refreshToken: refreshToken.substring(0, 64),
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  // Set cookies
  await setSessionCookies(accessToken, refreshToken);

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "LOGIN",
      resource: "Authentication",
      description: "User logged in successfully",
      ipAddress,
      userAgent,
      status: "SUCCESS",
    },
  });

  // Build AuthUser
  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    status: user.status,
    role: {
      id: user.role.id,
      name: user.role.name,
      displayNameAr: user.role.displayNameAr,
      displayNameEn: user.role.displayNameEn,
      level: user.role.level,
      permissions: user.role.permissions.map((rp) => rp.permission.code),
    },
        employee: user.employee
      ? {
          id: user.employee.id,
          employeeCode: user.employee.employeeCode,
          firstNameAr: user.employee.firstNameAr,
          lastNameAr: user.employee.lastNameAr,
          firstNameEn: user.employee.firstNameEn,
          lastNameEn: user.employee.lastNameEn,
          departmentId: user.employee.departmentId,
          positionId: user.employee.positionId,
          managerId: user.employee.managerId,
          status: user.employee.status,
          profilePicture: user.employee.profilePicture,
          basicSalary: user.employee.basicSalary,
          annualLeaveBalance: user.employee.annualLeaveBalance,
          sickLeaveBalance: user.employee.sickLeaveBalance,
          gender: user.employee.gender,
        }
      : undefined,
  };

  return { success: true, user: authUser };
}

export async function logout(): Promise<void> {
  const session = await getSession();
  if (session) {
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "LOGOUT",
        resource: "Authentication",
        description: "User logged out",
        status: "SUCCESS",
      },
    });
  }

  // Delete all sessions for this user
  if (session) {
    await prisma.session.deleteMany({
      where: { userId: session.id },
    });
  }

  await clearSessionCookies();
}

// =====================================================
// Middleware Helpers
// =====================================================

export async function authenticateRequest(
  request: NextRequest
): Promise<AuthUser | null> {
  // Try cookie first
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const payload = await verifyAccessToken(token);
    if (payload) {
      return getUserWithPermissions(payload.sub);
    }
  }

  // Try Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7);
    const payload = await verifyAccessToken(bearerToken);
    if (payload) {
      return getUserWithPermissions(payload.sub);
    }
  }

  return null;
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession();
  if (!user) {
    throw new AuthError("Authentication required", 401);
  }
  return user;
}

export async function requirePermission(
  permission: string
): Promise<AuthUser> {
  const user = await requireAuth();
  if (!hasPermission(user, permission)) {
    throw new AuthError("Insufficient permissions", 403);
  }
  return user;
}

export async function requireRole(...roles: string[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role.name)) {
    throw new AuthError("Insufficient role", 403);
  }
  return user;
}

// =====================================================
// Authorization
// =====================================================

export function hasPermission(user: AuthUser, permission: string): boolean {
  if (!user) return false;
  // System admin has all permissions
  if (user.role.name === "SYSTEM_ADMIN") return true;
  return user.role.permissions.includes(permission);
}

export function hasAnyPermission(user: AuthUser, permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(user, p));
}

export function hasAllPermissions(user: AuthUser, permissions: string[]): boolean {
  return permissions.every((p) => hasPermission(user, p));
}

export function hasRole(user: AuthUser, ...roles: string[]): boolean {
  return roles.includes(user.role.name);
}

// =====================================================
// Errors
// =====================================================

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
  }
}
