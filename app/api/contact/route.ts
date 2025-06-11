import { createClient } from "@/utils/supabase/service-role";
import { NextResponse } from "next/server";
import { contactConfig } from "@/config/contact";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate required fields
    if (!name || !phone || !message) {
      return new NextResponse(
        JSON.stringify({
          error: "Name, phone, and message are required fields",
        }),
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient();

    // Insert submission into database
    const { data, error } = await supabase
      .from("contact_submissions")
      .insert([
        {
          name,
          email,
          phone,
          message,
          status: "New",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting submission:", error);
      return new NextResponse(
        JSON.stringify({ error: "Failed to save submission" }),
        { status: 500 }
      );
    }

    // Generate WhatsApp URL with pre-filled message
    const whatsappNumber = contactConfig.whatsapp.number.replace(/[^0-9]/g, ""); // Remove non-numeric characters
    const whatsappMessage = `*New Contact Form Submission*\n\nName: ${name}\nPhone: ${phone}${
      email ? `\nEmail: ${email}` : ""
    }\n\nMessage:\n${message}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    return NextResponse.json({
      success: true,
      data,
      whatsappUrl,
    });
  } catch (error) {
    console.error("Error in contact API route:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
