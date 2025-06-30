import { createClient } from "@/utils/supabase/service-role";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("Missing userId parameter", { status: 400 });
    }

    const serviceClient = await createClient();

    // First get the basic profile
    const { data: profileData, error: profileError } = await serviceClient
      .from("admin_profiles")
      .select("*, role:roles(id, name, description)")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error loading profile with service client:", profileError);
      return new NextResponse(profileError.message, { status: 500 });
    }

    if (!profileData) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    // Only fetch permissions if there's a role_id
    if (profileData.role_id) {
      // Then get the permissions separately
      const { data: permissionsData, error: permissionsError } =
        await serviceClient
          .from("role_permissions")
          .select(
            `
          permission:permissions (
            id,
            name,
            description
          )
        `
          )
          .eq("role_id", profileData.role_id);

      if (permissionsError) {
        console.error("Error loading permissions:", permissionsError);
        return new NextResponse(permissionsError.message, { status: 500 });
      }

      // Combine the data
      const responseData = {
        ...profileData,
        role: {
          ...profileData.role,
          role_permissions:
            permissionsData?.map((p) => ({ permission: p.permission })) || [],
        },
      };

      return NextResponse.json(responseData);
    }

    // If no role_id, return profile without permissions
    return NextResponse.json({
      ...profileData,
      role: {
        ...profileData.role,
        role_permissions: [],
      },
    });
  } catch (error) {
    console.error("Error in profile API route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
