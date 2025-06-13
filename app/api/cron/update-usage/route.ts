import { NextResponse } from "next/server";
import {
  updateStorageBreakdown,
  updateUsageHistory,
} from "@/lib/services/storage";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Verify the request is from a valid cron job
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update storage breakdown and usage history
    await Promise.all([updateStorageBreakdown(), updateUsageHistory()]);

    return new NextResponse("Usage statistics updated successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating usage statistics:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
