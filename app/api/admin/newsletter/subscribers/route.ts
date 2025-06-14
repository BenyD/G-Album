import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["active", "inactive", "unsubscribed", "deleted", "all"];

type Permission = {
  id: string;
  name: string;
};

type RolePermission = {
  permission: Permission;
};

type Role = {
  id: string;
  name: string;
  role_permissions: RolePermission[];
};

type AdminProfile = {
  id: string;
  role_id: string;
  role: Role;
};

type UpdateData = {
  status?: string;
  unsubscribed_at?: string;
  deleted_at?: string;
  name?: string;
};

export async function GET(request: Request) {
  try {
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
        role:roles (
          id,
          name,
          role_permissions (
            permission:permissions (
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

    const typedProfile = profile as unknown as AdminProfile;

    if (!typedProfile.role?.role_permissions) {
      console.error("User has no roles or permissions:", typedProfile);
      return NextResponse.json(
        { message: "User has no roles or permissions" },
        { status: 403 }
      );
    }

    // Check if user has the required permission
    const hasPermission = typedProfile.role.role_permissions.some(
      (rp) => rp.permission.name === "manage_subscribers"
    );

    if (!hasPermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    // Validate status parameter
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Build the query
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

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching subscribers:", error);
      return NextResponse.json(
        { message: "Failed to fetch subscribers" },
        { status: 500 }
      );
    }

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
        role_id,
        role:roles (
          id,
          name,
          role_permissions (
            permission:permissions (
              id,
              name
            )
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

    const typedProfile = profile as unknown as AdminProfile;

    if (!typedProfile.role?.role_permissions) {
      console.error("User has no roles or permissions:", typedProfile);
      return NextResponse.json(
        { message: "User has no roles or permissions" },
        { status: 403 }
      );
    }

    // Check if user has the required permission
    const hasPermission = typedProfile.role.role_permissions.some(
      (rp) => rp.permission.name === "manage_subscribers"
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

    let updateData: UpdateData = {};
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
