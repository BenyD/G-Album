import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Email template with proper HTML structure and styling
const createEmailTemplate = (
  content: string,
  unsubscribeLink: string,
  includeUnsubscribeLink: boolean
) => {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>G Album Newsletter</title>
  <style type="text/css">
    /* Reset styles */
    body, p, h1, h2, h3, h4, h5, h6 {
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    /* Container */
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    /* Header */
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #f4f4f4;
    }
    .logo {
      max-width: 150px;
      height: auto;
      border: 0;
      display: inline-block;
    }
    /* Content */
    .content {
      padding: 30px 20px;
      font-size: 16px;
      color: #333333;
    }
    .content p {
      margin-bottom: 20px;
    }
    .content a {
      color: #ff0000;
      text-decoration: none;
    }
    .content a:hover {
      text-decoration: underline;
    }
    /* Footer */
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #666666;
      border-top: 2px solid #f4f4f4;
    }
    .unsubscribe {
      margin-top: 20px;
      padding: 10px;
      font-size: 12px;
      color: #999999;
    }
    .unsubscribe a {
      color: #ff0000;
      text-decoration: underline;
    }
    .unsubscribe a:hover {
      color: #cc0000;
    }
    /* Accent elements */
    .accent-line {
      height: 4px;
      background-color: #ff0000;
      margin: 0 auto;
      width: 60px;
    }
    /* Preheader text */
    .preheader {
      display: none;
      max-height: 0px;
      overflow: hidden;
    }
    /* Legal text */
    .legal {
      font-size: 11px;
      color: #999999;
      line-height: 1.4;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #f4f4f4;
    }
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
      .content {
        padding: 20px 15px;
      }
      .mobile-padding {
        padding-left: 10px !important;
        padding-right: 10px !important;
      }
    }
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1a1a1a !important;
      }
      .container {
        background-color: #2d2d2d !important;
      }
      .content {
        color: #ffffff !important;
      }
      .footer {
        color: #999999 !important;
      }
      .unsubscribe {
        color: #666666 !important;
      }
      .legal {
        color: #666666 !important;
        border-top-color: #444444 !important;
      }
    }
  </style>
</head>
<body>
  <!-- Preheader text for email clients -->
  <div class="preheader" style="display: none; max-height: 0px; overflow: hidden;">
    G Album Newsletter - Stay updated with the latest news and updates from G Album.
  </div>

  <div class="container">
    <div class="header">
      <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="G Album" class="logo" width="150" height="auto">
      <div class="accent-line"></div>
    </div>
    
    <div class="content">
      ${content}
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} G Album. All rights reserved.</p>
      ${
        includeUnsubscribeLink
          ? `
      <div class="unsubscribe">
        <p>
          You're receiving this email because you subscribed to G Album's newsletter.
          <br>
          <a href="${unsubscribeLink}">Unsubscribe</a> if you no longer wish to receive these emails.
        </p>
      </div>
      `
          : ""
      }
      <div class="legal">
        <p>
          This email was sent to you because you subscribed to G Album's newsletter. 
          Your email address is used solely for sending you newsletters and updates about our services. 
          We respect your privacy and will never share your information with third parties.
        </p>
        <p>
          G Album, 123A Triplicane High Road, Chennai, Tamil Nadu, India<br>
          Email: kumaranmadras@gmail.com | Phone: +91 9444639912
        </p>
        <p>
          As per Indian Information Technology Rules, 2011 and Information Technology 
          (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

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

      const emailHtml = createEmailTemplate(
        content,
        unsubscribeLink,
        includeUnsubscribeLink
      );

      try {
        const { data, error } = await resend.emails.send({
          from: "G Album <marketing@galbum.net>",
          to: subscriber.email,
          subject,
          html: emailHtml,
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
