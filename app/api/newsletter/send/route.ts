import { NextResponse } from "next/server";
import { z } from "zod";
import { sendNewsletterToAllSubscribers } from "@/lib/resend";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema
const sendNewsletterSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  from: z.string().email("Invalid from email").optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, content, from } = sendNewsletterSchema.parse(body);

    // Send newsletter to all subscribers
    const result = await sendNewsletterToAllSubscribers({
      subject,
      html: content,
      from,
    });

    // Log the newsletter send in the database
    await supabase.from("newsletter_logs").insert([
      {
        subject,
        content,
        sent_at: new Date().toISOString(),
        status: "sent",
        metadata: {
          from,
          recipient_count: result.data?.to?.length || 0,
        },
      },
    ]);

    return NextResponse.json({
      message: "Newsletter sent successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Failed to send newsletter:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
