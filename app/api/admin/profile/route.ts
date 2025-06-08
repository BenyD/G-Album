import { createClient } from "@/utils/supabase/service-role";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("Missing userId parameter", { status: 400 });
    }

    const serviceClient = createClient();

    const { data: profileData, error: profileError } = await serviceClient
      .from("admin_profiles")
      .select(
        `
        *,
        role:roles (
          id,
          name,
          description,
          role_permissions (
            permission:permissions (
              id,
              name,
              description
            )
          )
        )
      `
      )
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error loading profile with service client:", profileError);
      return new NextResponse(profileError.message, { status: 500 });
    }

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error in profile API route:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
