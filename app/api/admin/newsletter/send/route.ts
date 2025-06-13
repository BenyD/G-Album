import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNewsletter } from "@/lib/resend";

type RolePermission = {
  permissions: {
    id: string;
    name: string;
  };
};

export async function POST(request: Request) {
  try {
    // Create Supabase client
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("User error:", userError);
      return NextResponse.json(
        { message: "Failed to get user" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile with roles and permissions
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select(
        `
        id,
        role_id,
        roles!inner (
          id,
          name,
          role_permissions!inner (
            permissions!inner (
              id,
              name
            )
          )
        )
      `
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return NextResponse.json(
        { message: "Failed to fetch user profile" },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { message: "User profile not found" },
        { status: 404 }
      );
    }

    // Check if user has the required permission
    const hasPermission = profile.roles.role_permissions.some(
      (rp: RolePermission) => rp.permissions.name === "send_newsletters"
    );

    if (!hasPermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { subject, content } = await request.json();

    if (!subject || !content) {
      return NextResponse.json(
        { message: "Subject and content are required" },
        { status: 400 }
      );
    }

    // Get all active subscribers
    const { data: subscribers, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("email, name")
      .eq("status", "active");

    if (fetchError) {
      console.error("Error fetching subscribers:", fetchError);
      return NextResponse.json(
        { message: "Failed to fetch subscribers" },
        { status: 500 }
      );
    }

    if (!subscribers?.length) {
      return NextResponse.json(
        { message: "No active subscribers found" },
        { status: 400 }
      );
    }

    // Send newsletter
    await sendNewsletter(subject, content, subscribers);

    // Log the newsletter send
    const { error: logError } = await supabase.from("newsletter_logs").insert([
      {
        subject,
        content,
        sent_at: new Date().toISOString(),
        status: "sent",
        metadata: {
          recipient_count: subscribers.length,
        },
      },
    ]);

    if (logError) {
      console.error("Error logging newsletter:", logError);
    }

    return NextResponse.json(
      {
        message: "Newsletter sent successfully",
        recipientCount: subscribers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return NextResponse.json(
      { message: "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
