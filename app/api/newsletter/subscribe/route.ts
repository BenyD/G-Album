import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate input
    const { email, name } = subscribeSchema.parse(body);

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing subscriber:", checkError);
      return NextResponse.json(
        { message: "Failed to check subscription status" },
        { status: 500 }
      );
    }

    if (existingSubscriber) {
      if (existingSubscriber.status === "deleted") {
        // Reactivate deleted subscriber
        const { error: updateError } = await supabase
          .from("newsletter_subscribers")
          .update({
            status: "active",
            metadata: {
              reactivated_at: new Date().toISOString(),
              source: "website",
            },
          })
          .eq("id", existingSubscriber.id);

        if (updateError) {
          console.error("Error reactivating subscriber:", updateError);
          return NextResponse.json(
            { message: "Failed to reactivate subscription" },
            { status: 500 }
          );
        }

        return NextResponse.json(
          { message: "Successfully reactivated your subscription!" },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { message: "You're already subscribed!" },
        { status: 400 }
      );
    }

    // Add new subscriber
    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert([
        {
          email,
          name: name || null,
          status: "active",
          metadata: {
            subscribed_at: new Date().toISOString(),
            source: "website",
          },
        },
      ]);

    if (insertError) {
      console.error("Error adding subscriber:", insertError);
      return NextResponse.json(
        { message: "Failed to subscribe" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Successfully subscribed to newsletter!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}
