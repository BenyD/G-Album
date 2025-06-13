"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = async () => {
      const email = searchParams.get("email");
      const token = searchParams.get("token");

      if (!email || !token) {
        setStatus("error");
        setMessage("Invalid unsubscribe link. Please try again.");
        return;
      }

      try {
        const response = await fetch(
          `/api/newsletter/unsubscribe?email=${encodeURIComponent(
            email
          )}&token=${encodeURIComponent(token)}`
        );

        if (!response.ok) {
          throw new Error("Failed to unsubscribe");
        }

        setStatus("success");
        setMessage(
          "You have been successfully unsubscribed from our newsletter."
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          "There was an error processing your request. Please try again later."
        );
      }
    };

    unsubscribe();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Newsletter Unsubscribe
          </CardTitle>
          <CardDescription className="text-center">
            {status === "loading"
              ? "Processing your request..."
              : "Manage your newsletter subscription"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {status === "loading" && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
            <p className="text-center text-gray-600">{message}</p>
            {status !== "loading" && (
              <Button
                onClick={() => (window.location.href = "/")}
                className="mt-4"
              >
                Return to Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
