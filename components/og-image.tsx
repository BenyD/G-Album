import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "G Album";
    const subtitle = searchParams.get("subtitle") || "Dream To Reality";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #fee2e2 0%, #ffffff 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)",
              opacity: 0.5,
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "40px 80px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: "120px",
                fontWeight: "bold",
                color: "#ef4444",
                marginBottom: "40px",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              G
            </div>
            <h1
              style={{
                fontSize: "60px",
                fontWeight: "bold",
                color: "#ef4444",
                marginBottom: "20px",
                lineHeight: 1.2,
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "32px",
                color: "#4b5563",
                lineHeight: 1.5,
                maxWidth: "800px",
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
