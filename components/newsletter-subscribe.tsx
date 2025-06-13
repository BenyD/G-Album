"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NewsletterSubscribeProps {
  variant?: "default" | "footer";
  className?: string;
  showName?: boolean;
}

export function NewsletterSubscribe({
  variant = "default",
  className = "",
  showName = false,
}: NewsletterSubscribeProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name: name || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to subscribe");
      }

      setIsSuccess(true);
      setEmail("");
      setName("");
      toast.success(data.message);

      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to subscribe to newsletter"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "footer") {
    return (
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col sm:flex-row sm:max-w-md gap-3 ${className}`}
      >
        <label htmlFor="email-address" className="sr-only">
          Email address
        </label>
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-200" />
          <Input
            id="email-address"
            name="email-address"
            type="email"
            required
            placeholder="Enter your email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 bg-white/10 border-white/20 text-white placeholder:text-red-200 focus:bg-white/20 focus:border-white/40"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || isSuccess}
          className="w-full sm:w-auto bg-white text-red-900 hover:bg-red-50 font-semibold whitespace-nowrap relative"
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.span
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Subscribed!
              </motion.span>
            ) : (
              <motion.span
                key="subscribe"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </form>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4"
      >
        {showName && (
          <div className="relative flex w-full">
            <Input
              id="name"
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-white/20 text-white placeholder:text-red-200 focus:bg-white/5 focus:border-white/40 h-12"
            />
          </div>
        )}
        <div className="relative flex w-full gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-200" />
            <Input
              id="email"
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 bg-transparent border-white/20 text-white placeholder:text-red-200 focus:bg-white/5 focus:border-white/40 h-12"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || isSuccess}
            className="bg-white text-red-900 hover:bg-red-50 font-semibold h-12 px-6 relative"
          >
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.span
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Subscribed!
                </motion.span>
              ) : (
                <motion.span
                  key="subscribe"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {isLoading ? "Subscribing..." : "Subscribe"}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </form>
    </div>
  );
}
