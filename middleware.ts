import { createServerClient, CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AuthCookieManager } from "@/utils/auth-cookie-manager";

// Cache TTL in seconds
const CACHE_TTL = 60;

// Static asset patterns to skip middleware
const STATIC_PATTERNS = [
  "/_next",
  "/static",
  "/favicon.ico",
  ".png",
  ".jpg",
  ".svg",
  ".css",
  ".js",
  "/api/health",
];

function shouldSkipMiddleware(pathname: string): boolean {
  return STATIC_PATTERNS.some((pattern) => pathname.includes(pattern));
}

async function getFromCache(key: string): Promise<Response | undefined> {
  try {
    const cache = await caches.open("auth-cache");
    const response = await cache.match(key);
    if (response) {
      const cachedAt = response.headers.get("x-cached-at");
      if (cachedAt && (Date.now() - Number(cachedAt)) / 1000 < CACHE_TTL) {
        return response;
      }
      // Remove expired cache
      await cache.delete(key);
    }
  } catch (error) {
    console.error("Cache error:", error);
  }
  return undefined;
}

async function setCache(key: string, response: Response): Promise<void> {
  try {
    const cache = await caches.open("auth-cache");
    const clonedResponse = response.clone();
    const headers = new Headers(clonedResponse.headers);
    headers.set("x-cached-at", Date.now().toString());
    const cachedResponse = new Response(clonedResponse.body, {
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers,
    });
    await cache.put(key, cachedResponse);
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and health checks
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next();

  // Create Supabase client with enhanced cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is being set, update the response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          // Apply enhanced security options
          const cookieOptions = {
            ...options,
            httpOnly: true,
            secure: AuthCookieManager.shouldUseSecureCookie(),
            sameSite: "lax" as const,
            path: "/",
            domain: AuthCookieManager.getEffectiveDomain(),
          };

          // Add __Secure- prefix in production
          const cookieName = AuthCookieManager.shouldUseSecureCookie()
            ? `__Secure-${name}`
            : name;

          response.cookies.set({
            name: cookieName,
            value,
            ...cookieOptions,
          });
        },
        remove(name: string, options: CookieOptions) {
          const cookieOptions = {
            ...options,
            httpOnly: true,
            secure: AuthCookieManager.shouldUseSecureCookie(),
            sameSite: "lax" as const,
            path: "/",
            domain: AuthCookieManager.getEffectiveDomain(),
            maxAge: 0,
            expires: new Date(0),
          };

          // Handle secure prefix in production
          const cookieName = AuthCookieManager.shouldUseSecureCookie()
            ? `__Secure-${name}`
            : name;

          response.cookies.set({
            name: cookieName,
            value: "",
            ...cookieOptions,
          });
        },
      },
    }
  );

  try {
    // Handle admin routes
    if (pathname.startsWith("/admin")) {
      return await handleAdminRoutes(request, response, supabase);
    }

    // Handle API routes
    if (pathname.startsWith("/api")) {
      return await handleApiRoutes(request, response, supabase);
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // Return a generic error for security
    return NextResponse.redirect(new URL("/error", request.url));
  }
}

async function handleAdminRoutes(
  request: NextRequest,
  response: NextResponse,
  supabase: any
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Redirect /admin to /admin/dashboard
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Allow access to login page if not authenticated
  if (pathname === "/admin/login") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      console.log(
        "Middleware: User already authenticated, redirecting to dashboard"
      );
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return response;
  }

  // For all other admin routes, verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log(
      "Middleware: No authenticated user found, redirecting to login"
    );
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Add security headers
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

async function handleApiRoutes(
  request: NextRequest,
  response: NextResponse,
  supabase: any
): Promise<NextResponse> {
  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Add rate limiting headers
  response.headers.set("X-RateLimit-Limit", "100");
  response.headers.set("X-RateLimit-Remaining", "99"); // This should be dynamic

  // Verify API authentication if needed
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    // Validate API key
    if (!isValidApiKey(apiKey)) {
      return new NextResponse(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return response;
}

function isValidApiKey(apiKey: string): boolean {
  // Implement your API key validation logic
  return true; // Placeholder
}

export const config = {
  matcher: [
    // Match all admin routes
    "/admin/:path*",
    // Match API routes
    "/api/:path*",
    // Exclude static files and images
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
