"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnsubscribe = useCallback(async () => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      setError("Invalid unsubscribe link");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to unsubscribe");
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Error unsubscribing:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to unsubscribe. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = async () => {
      if (mounted) {
        await handleUnsubscribe();
      }
    };

    unsubscribe();

    return () => {
      mounted = false;
    };
  }, [handleUnsubscribe]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-red-900">
            {isLoading
              ? "Processing..."
              : isSuccess
                ? "Successfully Unsubscribed"
                : "Unsubscribe Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
              <p className="text-center text-muted-foreground">
                Processing your request...
              </p>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                You have been successfully unsubscribed from our newsletter.
              </p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Return to Homepage
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Return to Homepage
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
