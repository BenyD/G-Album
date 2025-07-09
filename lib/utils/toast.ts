import { toast } from "sonner";

// Custom toast utility with consistent styling
export const showToast = {
  success: (message: string, duration: number = 4000) => {
    toast.success(message, {
      duration,
      style: {
        background: "var(--background)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
    });
  },

  error: (message: string, duration: number = 6000) => {
    toast.error(message, {
      duration,
      style: {
        background: "var(--background)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
    });
  },

  warning: (message: string, duration: number = 5000) => {
    toast.warning(message, {
      duration,
      style: {
        background: "var(--background)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
    });
  },

  info: (message: string, duration: number = 4000) => {
    toast.info(message, {
      duration,
      style: {
        background: "var(--background)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
    });
  },
};

// Legacy support - export the original toast for backward compatibility
export { toast };
