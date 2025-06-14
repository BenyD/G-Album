import { CookieOptions } from "@supabase/ssr";

interface AuthCookieOptions extends CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  domain?: string;
  maxAge?: number;
}

export class AuthCookieManager {
  private static readonly COOKIE_VERSION = "1";
  private static readonly SESSION_STATE_KEY = "session_state";

  static shouldUseSecureCookie(): boolean {
    return process.env.NODE_ENV === "production";
  }

  static getEffectiveDomain(): string | undefined {
    if (process.env.NODE_ENV === "production") {
      return process.env.NEXT_PUBLIC_DOMAIN;
    }
    return undefined;
  }

  static async generateSessionState(): Promise<string> {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const randomHex = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const data = `${timestamp}:${randomHex}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(data)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `${this.COOKIE_VERSION}:${timestamp}:${hashHex}`;
  }

  static async validateSessionState(state: string): Promise<boolean> {
    try {
      const [version, timestamp] = state.split(":");

      // Validate version
      if (version !== this.COOKIE_VERSION) {
        return false;
      }

      // Check timestamp (within last 24 hours)
      const ts = parseInt(timestamp, 10);
      if (isNaN(ts) || Date.now() - ts > 24 * 60 * 60 * 1000) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  static getDefaultOptions(): AuthCookieOptions {
    return {
      httpOnly: true,
      secure: this.shouldUseSecureCookie(),
      sameSite: "lax",
      path: "/",
      domain: this.getEffectiveDomain(),
    };
  }

  static getCookieName(baseName: string): string {
    return this.shouldUseSecureCookie() ? `__Secure-${baseName}` : baseName;
  }

  static getDeleteOptions(): AuthCookieOptions {
    return {
      ...this.getDefaultOptions(),
      maxAge: 0,
    };
  }

  static setAuthCookies(
    accessToken: string,
    refreshToken: string,
    remember: boolean
  ) {
    const options = {
      ...this.getDefaultOptions(),
      maxAge: remember ? 30 * 24 * 60 * 60 : undefined, // 30 days if remember is true
    };

    document.cookie = `${this.getCookieName("sb-access-token")}=${accessToken}; ${this.serializeOptions(options)}`;
    document.cookie = `${this.getCookieName("sb-refresh-token")}=${refreshToken}; ${this.serializeOptions(options)}`;
  }

  static clearAuthCookies() {
    const options = this.getDeleteOptions();
    document.cookie = `${this.getCookieName("sb-access-token")}=; ${this.serializeOptions(options)}`;
    document.cookie = `${this.getCookieName("sb-refresh-token")}=; ${this.serializeOptions(options)}`;
  }

  static rotateTokens(accessToken: string, refreshToken: string) {
    this.setAuthCookies(accessToken, refreshToken, true);
  }

  static getAuthCookies() {
    return {
      accessToken: this.getCookie(this.getCookieName("sb-access-token")),
      refreshToken: this.getCookie(this.getCookieName("sb-refresh-token")),
      sessionState: this.getCookie(this.SESSION_STATE_KEY),
    };
  }

  private static getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  }

  private static serializeOptions(options: AuthCookieOptions): string {
    return Object.entries(options)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
  }
}
