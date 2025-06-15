import { NextRequest } from "next/server";
import { GET as generateOGImage } from "@/components/og-image";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  return generateOGImage(req);
}
