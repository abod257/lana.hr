import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// =====================================================
// Authentication Middleware
// =====================================================
// Handles route protection, RBAC, security headers, i18n
// =====================================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "development-jwt-secret-min-32-characters-long-placeholder"
);

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "hrms_session";

// Public routes (don't require authentication)
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/health",
];

// Routes that start with these prefixes are public
const PUBLIC_PREFIXES = [
  "/_next",
  "/favicon.ico",
  "/images",
  "/icons",
  "/public",
];

// Protected route prefixes and required roles
const ROUTE_PERMISSIONS: { prefix: string; roles?: string[] }[] = [
  { prefix: "/dashboard", roles: [] },
  { prefix: "/employees", roles: ["HR_OFFICER", "HR_MANAGER", "SYSTEM_ADMIN"] },
  { prefix: "/departments", roles: ["HR_MANAGER", "SYSTEM_ADMIN"] },
  { prefix: "/positions", roles: ["HR_MANAGER", "SYSTEM_ADMIN"] },
  { prefix: "/attendance", roles: [] },
  { prefix: "/leave", roles: [] },
  { prefix: "/payroll", roles: ["PAYROLL_OFFICER", "HR_MANAGER", "SYSTEM_ADMIN"] },
  { prefix: "/recruitment", roles: ["HR_OFFICER", "HR_MANAGER", "MANAGER", "SYSTEM_ADMIN"] },
  { prefix: "/documents", roles: [] },
  { prefix: "/reports", roles: ["HR_MANAGER", "HR_OFFICER", "PAYROLL_OFFICER", "SYSTEM_ADMIN"] },
  { prefix: "/settings", roles: ["HR_MANAGER", "SYSTEM_ADMIN"] },
  { prefix: "/audit", roles: ["SYSTEM_ADMIN"] },
];

// API routes and their required roles
const API_PERMISSIONS: { prefix: string; roles?: string[] }[] = [
  { prefix: "/api/employees", roles: ["HR_OFFICER", "HR_MANAGER", "SYSTEM_ADMIN"] },
  { prefix: "/api/payroll", roles: ["PAYROLL_OFFICER", "HR_MANAGER", "SYSTEM_ADMIN"] },
  { prefix: "/api/recruitment", roles: ["HR_OFFICER", "HR_MANAGER", "SYSTEM_ADMIN"] },
  { prefix: "/api/settings", roles: ["HR_MANAGER", "SYSTEM_ADMIN"] },
  { prefix: "/api/audit", roles: ["SYSTEM_ADMIN"] },
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getRoutePermissions(pathname: string) {
  for (const route of ROUTE_PERMISSIONS) {
    if (pathname.startsWith(route.prefix)) {
      return route;
    }
  }
  return null;
}

function getApiPermissions(pathname: string) {
  for (const route of API_PERMISSIONS) {
    if (pathname.startsWith(route.prefix)) {
      return route;
    }
  }
  return null;
}

async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "hrms-portal",
      audience: "hrms-portal-users",
    });
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // No token - redirect to login
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the token
  const payload = await verifyToken(token);
  if (!payload) {
    // Invalid token - clear and redirect
    const response = pathname.startsWith("/api/")
      ? NextResponse.json(
          { success: false, message: "Invalid or expired token" },
          { status: 401 }
        )
      : NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  const userRole = payload.roleName as string;

  // Check route-specific permissions
  if (pathname.startsWith("/api/")) {
    const apiPerms = getApiPermissions(pathname);
    if (apiPerms?.roles && apiPerms.roles.length > 0) {
      if (!apiPerms.roles.includes(userRole) && userRole !== "SYSTEM_ADMIN") {
        return NextResponse.json(
          { success: false, message: "Insufficient permissions" },
          { status: 403 }
        );
      }
    }
  } else {
    const routePerms = getRoutePermissions(pathname);
    if (routePerms?.roles && routePerms.roles.length > 0) {
      if (!routePerms.roles.includes(userRole) && userRole !== "SYSTEM_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard?error=forbidden", request.url));
      }
    }
  }

  // Add user info to request headers for downstream consumption
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.sub as string);
  requestHeaders.set("x-user-role", userRole);
  if (payload.employeeId) {
    requestHeaders.set("x-employee-id", payload.employeeId as string);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
