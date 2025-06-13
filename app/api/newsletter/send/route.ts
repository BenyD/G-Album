import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { subject, content, includeUnsubscribeLink } = await request.json();
    const supabase = await createClient();

    // Get all active subscribers
    const { data: activeSubscribers, error: subscribersError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("status", "active");

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
      throw new Error("Failed to fetch subscribers");
    }

    if (!activeSubscribers?.length) {
      return NextResponse.json(
        { error: "No active subscribers found" },
        { status: 400 }
      );
    }

    // Create newsletter record
    const { data: newsletter, error: newsletterError } = await supabase
      .from("newsletter_logs")
      .insert([
        {
          subject,
          content,
          sent_at: new Date().toISOString(),
          status: "sent",
          metadata: {
            recipient_count: activeSubscribers.length,
            include_unsubscribe_link: includeUnsubscribeLink,
          },
        },
      ])
      .select()
      .single();

    if (newsletterError) {
      console.error("Error creating newsletter record:", newsletterError);
      throw new Error("Failed to create newsletter record");
    }

    // Send emails to all active subscribers
    const emailPromises = activeSubscribers.map(async (subscriber) => {
      const unsubscribeToken = Buffer.from(subscriber.email).toString("base64");
      const unsubscribeLink = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(
        subscriber.email
      )}&token=${unsubscribeToken}`;

      const emailContent = includeUnsubscribeLink
        ? `${content}\n\n---\n\nTo unsubscribe from our newsletter, click here: ${unsubscribeLink}`
        : content;

      try {
        const { data, error } = await resend.emails.send({
          from: "G Album <marketing@galbum.net>",
          to: subscriber.email,
          subject,
          html: emailContent,
          tags: [
            { name: "newsletter_id", value: newsletter.id },
            { name: "subscriber_id", value: subscriber.id },
          ],
        });

        if (error) {
          console.error(`Error sending email to ${subscriber.email}:`, error);
          throw error;
        }

        console.log(`Email sent successfully to ${subscriber.email}:`, data);
        return data;
      } catch (error) {
        console.error(`Failed to send email to ${subscriber.email}:`, error);
        throw error;
      }
    });

    try {
      const results = await Promise.all(emailPromises);
      console.log("All emails sent successfully:", results);
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Update newsletter status to failed
      await supabase
        .from("newsletter_logs")
        .update({
          status: "failed",
          metadata: {
            ...newsletter.metadata,
            error:
              emailError instanceof Error
                ? emailError.message
                : "Unknown error",
            failed_at: new Date().toISOString(),
          },
        })
        .eq("id", newsletter.id);
      throw new Error("Failed to send emails");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return NextResponse.json(
      { error: "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
