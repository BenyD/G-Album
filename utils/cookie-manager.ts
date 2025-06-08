import { CookieOptions } from "@supabase/ssr";

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export class CookieManager {
  private static readonly COOKIE_PREFERENCES = "cookie_preferences";
  private static readonly SESSION_COOKIE = "sb-auth-token";
  private static readonly COOKIE_VERSION = "1.0";

  static setPreferences(
    preferences: CookiePreferences,
    maxAge = 365 * 24 * 60 * 60
  ) {
    const value = JSON.stringify({
      ...preferences,
      version: this.COOKIE_VERSION,
      timestamp: new Date().toISOString(),
    });

    document.cookie = `${this.COOKIE_PREFERENCES}=${encodeURIComponent(
      value
    )}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;

    // Apply preferences immediately
    if (!preferences.analytics) this.disableAnalytics();
    if (!preferences.marketing) this.disableMarketing();
    if (!preferences.functional) this.disableFunctional();
  }

  static getPreferences(): CookiePreferences {
    const cookie = this.getCookie(this.COOKIE_PREFERENCES);
    if (!cookie) {
      return {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
      };
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(cookie));
      // Handle version updates if needed
      if (parsed.version !== this.COOKIE_VERSION) {
        // Implement version migration logic here
        return this.getDefaultPreferences();
      }
      return parsed;
    } catch (error) {
      console.error("Error parsing cookie preferences:", error);
      return this.getDefaultPreferences();
    }
  }

  static clearNonEssentialCookies() {
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      if (!this.isEssentialCookie(name)) {
        this.deleteCookie(name);
      }
    });
  }

  private static isEssentialCookie(name: string): boolean {
    const essentialCookies = [
      this.COOKIE_PREFERENCES,
      this.SESSION_COOKIE,
      "sb-access-token",
      "sb-refresh-token",
    ];
    return essentialCookies.includes(name);
  }

  private static getCookie(name: string): string | null {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
      }
      return null;
    } catch (error) {
      console.error("Error getting cookie:", error);
      return null;
    }
  }

  private static deleteCookie(name: string) {
    const domains = [
      window.location.hostname,
      `.${window.location.hostname}`,
      window.location.hostname.split(".").slice(1).join("."),
    ];

    domains.forEach((domain) => {
      document.cookie = `${name}=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
    });
  }

  private static disableAnalytics() {
    // Implement analytics cleanup
    if (typeof window !== "undefined") {
      // Clear Google Analytics cookies
      this.deleteCookie("_ga");
      this.deleteCookie("_gid");
      this.deleteCookie("_gat");

      // Disable analytics data collection
      window["ga-disable-" + process.env.NEXT_PUBLIC_GA_ID] = true;
    }
  }

  private static disableMarketing() {
    // Implement marketing cookies cleanup
    const marketingCookies = ["_fbp", "_gcl_au", "IDE", "VISITOR_INFO1_LIVE"];

    marketingCookies.forEach((cookie) => this.deleteCookie(cookie));
  }

  private static disableFunctional() {
    // Implement functional cookies cleanup
    const functionalCookies = [
      "sidebar_state",
      "theme_preference",
      "language_preference",
    ];

    functionalCookies.forEach((cookie) => this.deleteCookie(cookie));
  }

  private static getDefaultPreferences(): CookiePreferences {
    return {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
  }

  static hasAcceptedCookies(): boolean {
    return !!this.getCookie(this.COOKIE_PREFERENCES);
  }

  static getConsentTimestamp(): string | null {
    const prefs = this.getCookie(this.COOKIE_PREFERENCES);
    if (!prefs) return null;

    try {
      const parsed = JSON.parse(decodeURIComponent(prefs));
      return parsed.timestamp || null;
    } catch {
      return null;
    }
  }
}
