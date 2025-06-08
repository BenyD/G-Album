"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import PageHero from "@/components/page-hero";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CookiePreferencesPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true and disabled
    functional: false,
    analytics: false,
    marketing: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedPreferences = localStorage.getItem("cookieConsent");
    if (savedPreferences === "all") {
      setPreferences({
        necessary: true,
        functional: true,
        analytics: true,
        marketing: true,
      });
    } else if (savedPreferences === "necessary") {
      setPreferences({
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
      });
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save preferences
      localStorage.setItem(
        "cookieConsent",
        preferences.functional || preferences.analytics || preferences.marketing
          ? "all"
          : "necessary"
      );

      // Show success message
      toast.success("Cookie preferences saved successfully!");

      // Redirect back to homepage after a short delay
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pt-16">
      <PageHero
        title="Cookie Preferences"
        subtitle="Manage your cookie settings and privacy preferences"
        className="py-20"
      />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="space-y-8">
                {/* Necessary Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold text-gray-900">
                      Necessary Cookies
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      These cookies are required for the website to function and
                      cannot be disabled.
                    </p>
                  </div>
                  <Switch checked disabled />
                </div>

                {/* Functional Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold text-gray-900">
                      Functional Cookies
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Enable personalized features and remember your
                      preferences.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.functional}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({
                        ...prev,
                        functional: checked,
                      }))
                    }
                  />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold text-gray-900">
                      Analytics Cookies
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Help us understand how you use our website to improve your
                      experience.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({
                        ...prev,
                        analytics: checked,
                      }))
                    }
                  />
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold text-gray-900">
                      Marketing Cookies
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Used to deliver relevant advertisements and track their
                      effectiveness.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({
                        ...prev,
                        marketing: checked,
                      }))
                    }
                  />
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save Preferences"}
                  </Button>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    You will be redirected to the homepage after saving
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="mt-8 prose prose-red max-w-none">
              <h2 className="text-2xl font-bold text-gray-900">
                About Our Cookies
              </h2>
              <p className="text-gray-600">
                We use cookies and similar technologies to help personalize
                content, tailor and measure ads, and provide a better
                experience. By clicking &apos;Accept All&apos; you agree to our
                use of these tools for advertising, analytics, and support in
                accordance with our Cookie Policy and Privacy Policy.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6">
                Cookie Policy Details
              </h3>
              <ul className="list-disc pl-5 text-gray-600">
                <li>
                  Necessary cookies are essential for the website to function
                  properly.
                </li>
                <li>
                  Functional cookies help perform certain functionalities like
                  sharing content, remembering your preferences.
                </li>
                <li>
                  Analytics cookies help us understand how our visitors use the
                  website.
                </li>
                <li>
                  Marketing cookies are used to provide visitors with relevant
                  ads and marketing campaigns.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
