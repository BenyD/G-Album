import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { AuthCookieManager } from "./auth-cookie-manager";

export interface AuthError extends Error {
  status?: number;
  code?: string;
}

export class AuthManager {
  private static readonly SESSION_KEY = "sb-session";
  private static readonly REMEMBER_KEY = "remember-me";
  private static readonly TOKEN_REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static supabase = createClient();

  static async signIn(
    email: string,
    password: string,
    remember: boolean,
    retryAttempt = 0
  ): Promise<User> {
    try {
      const {
        data: { user, session },
        error,
      } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error)
        throw this.handleAuthError(
          error as { message: string; status: number; code: string }
        );
      if (!user || !session)
        throw new Error("No user or session returned from authentication");

      // Set auth cookies with enhanced security
      AuthCookieManager.setAuthCookies(
        session.access_token,
        session.refresh_token,
        remember
      );

      // Set session persistence
      if (remember) {
        localStorage.setItem(this.REMEMBER_KEY, "true");
        // Set a longer session expiry
        await this.supabase.auth.updateUser({
          data: { session_expiry: "30d" },
        });
      } else {
        sessionStorage.setItem(this.REMEMBER_KEY, "true");
        this.setupSessionCleanup();
      }

      // Start session refresh monitoring
      this.startSessionMonitoring();

      return user;
    } catch (error) {
      if (error instanceof Error && retryAttempt < this.MAX_RETRY_ATTEMPTS) {
        // Retry on network errors
        if (
          error.message.includes("network") ||
          error.message.includes("timeout")
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (retryAttempt + 1))
          );
          return this.signIn(email, password, remember, retryAttempt + 1);
        }
      }
      console.error("Sign in error:", error);
      throw error;
    }
  }

  static async signOut(clearAll = false): Promise<void> {
    try {
      await this.supabase.auth.signOut();
      AuthCookieManager.clearAuthCookies();
      this.clearSession(clearAll);
      this.stopSessionMonitoring();
    } catch (error) {
      console.error("Sign out error:", error);
      // Force clear session on error
      AuthCookieManager.clearAuthCookies();
      this.clearSession(true);
      throw error;
    }
  }

  private static setupSessionCleanup() {
    window.addEventListener("beforeunload", () => {
      if (!localStorage.getItem(this.REMEMBER_KEY)) {
        AuthCookieManager.clearAuthCookies();
        this.clearSession();
      }
    });
  }

  private static clearSession(clearAll = false) {
    if (clearAll) {
      localStorage.clear();
      sessionStorage.clear();
    } else {
      localStorage.removeItem(this.REMEMBER_KEY);
      sessionStorage.removeItem(this.REMEMBER_KEY);
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  private static async refreshSession(): Promise<void> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) {
        AuthCookieManager.clearAuthCookies();
        this.clearSession();
        return;
      }

      // Refresh if token is close to expiration
      if (session.expires_at && this.isTokenExpiringSoon(session.expires_at)) {
        const {
          data: { session: newSession },
          error: refreshError,
        } = await this.supabase.auth.refreshSession();

        if (refreshError) throw refreshError;
        if (newSession) {
          // Update cookies with new tokens
          AuthCookieManager.rotateTokens(
            newSession.access_token,
            newSession.refresh_token
          );
        }
      }
    } catch (error) {
      console.error("Session refresh error:", error);
      // Only clear session on specific errors
      if (this.shouldClearSessionOnError(error as { code: string })) {
        AuthCookieManager.clearAuthCookies();
        this.clearSession();
      }
      throw error;
    }
  }

  private static isTokenExpiringSoon(expiresAt: number): boolean {
    return expiresAt - Date.now() / 1000 < this.TOKEN_REFRESH_THRESHOLD;
  }

  private static handleAuthError(error: {
    message: string;
    status: number;
    code: string;
  }): AuthError {
    const authError = new Error(error.message) as AuthError;
    authError.status = error.status;
    authError.code = error.code;
    return authError;
  }

  private static shouldClearSessionOnError(error: { code: string }): boolean {
    const clearSessionErrors = [
      "invalid_token",
      "token_expired",
      "session_expired",
      "not_authenticated",
    ];
    return clearSessionErrors.includes(error.code);
  }

  // Session monitoring
  private static refreshInterval: NodeJS.Timeout | null = null;

  private static startSessionMonitoring() {
    if (this.refreshInterval) return;

    // Check session every minute
    this.refreshInterval = setInterval(async () => {
      try {
        await this.refreshSession();
      } catch (error) {
        console.error("Session monitoring error:", error);
        if (this.shouldClearSessionOnError(error as { code: string })) {
          this.stopSessionMonitoring();
          toast.error("Your session has expired. Please sign in again.");
        }
      }
    }, 60 * 1000);
  }

  private static stopSessionMonitoring() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Public methods for session management
  static async validateSession(): Promise<boolean> {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      return !!session;
    } catch {
      return false;
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  }

  // CSRF protection
  static getSessionState(): string | null {
    const cookies = AuthCookieManager.getAuthCookies();
    return cookies.sessionState || null;
  }
}
