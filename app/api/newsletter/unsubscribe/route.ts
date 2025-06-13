import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      return NextResponse.json(
        { error: "Missing email or token" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find the subscriber
    const { data: subscriber, error: subscriberError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", email)
      .single();

    if (subscriberError || !subscriber) {
      console.error("Error finding subscriber:", subscriberError);
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      );
    }

    // Verify the token (you should implement proper token verification)
    // For now, we'll just check if the token matches the email
    if (token !== Buffer.from(email).toString("base64")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Update the subscriber status
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
        metadata: {
          ...subscriber.metadata,
          unsubscribed_at: new Date().toISOString(),
        },
      })
      .eq("email", email);

    if (updateError) {
      console.error("Error updating subscriber:", updateError);
      throw new Error("Failed to update subscriber status");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
