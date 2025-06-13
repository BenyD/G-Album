import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["active", "inactive", "unsubscribed", "deleted", "all"];

export async function GET(request: Request) {
  try {
    console.log("Starting GET /api/admin/newsletter/subscribers");
    const supabase = await createClient();

    // Get the current user
    console.log("Fetching user...");
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
      console.log("No user found");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("User authenticated:", user.id);

    // Get the user's profile with roles and permissions
    console.log("Fetching user profile...");
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
      console.log("No profile found for user:", user.id);
      return NextResponse.json(
        { message: "User profile not found" },
        { status: 404 }
      );
    }

    console.log("User profile found:", profile.id);

    // Check if user has the required permission
    const hasPermission = profile.roles.role_permissions.some(
      (rp: any) => rp.permissions.name === "manage_subscribers"
    );

    if (!hasPermission) {
      console.log("User does not have manage_subscribers permission");
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    console.log("Query parameters:", { status, search });

    // Validate status parameter
    if (!VALID_STATUSES.includes(status)) {
      console.log("Invalid status:", status);
      return NextResponse.json(
        {
          message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Build the query
    console.log("Building query...");
    let query = supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    console.log("Executing query...");
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching subscribers:", error);
      return NextResponse.json(
        { message: "Failed to fetch subscribers" },
        { status: 500 }
      );
    }

    console.log(`Successfully fetched ${data?.length || 0} subscribers`);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error(
      "Unexpected error in GET /api/admin/newsletter/subscribers:",
      error
    );
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    // Get the current user's session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get the user's profile with roles and permissions
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select(
        `
        id,
        roles (
          id,
          name,
          permissions (
            id,
            name
          )
        )
      `
      )
      .eq("id", session.user.id)
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
    const hasPermission = profile.roles.some((role: any) =>
      role.permissions.some((p: any) => p.name === "manage_subscribers")
    );

    if (!hasPermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id, action, name } = await request.json();

    if (!id || !action) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    let updateData: any = {};
    let message = "";

    switch (action) {
      case "unsubscribe":
        updateData = {
          status: "unsubscribed",
          unsubscribed_at: new Date().toISOString(),
        };
        message = "Subscriber unsubscribed successfully";
        break;

      case "delete":
        updateData = {
          status: "deleted",
          deleted_at: new Date().toISOString(),
        };
        message = "Subscriber deleted successfully";
        break;

      case "update_name":
        if (!name) {
          return NextResponse.json(
            { message: "Name is required for update_name action" },
            { status: 400 }
          );
        }
        updateData = { name };
        message = "Subscriber name updated successfully";
        break;

      default:
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        );
    }

    const { error } = await supabase
      .from("newsletter_subscribers")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating subscriber:", error);
      return NextResponse.json(
        { message: "Failed to update subscriber" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error in PATCH /api/admin/newsletter/subscribers:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
