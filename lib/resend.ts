import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNewsletter(
  subject: string,
  content: string,
  subscribers: { email: string; name?: string }[]
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "G Album <marketing@galbum.net>",
      to: subscribers.map((sub) => sub.email),
      subject,
      html: content,
    });

    if (error) {
      console.error("Error sending newsletter:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send newsletter:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "G Album <marketing@galbum.net>",
      to: email,
      subject: "Welcome to G Album Newsletter!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Welcome to G Album!</h1>
          <p>Thank you for subscribing to our newsletter. We're excited to share our latest updates, offers, and photography tips with you.</p>
          <p>Stay tuned for:</p>
          <ul>
            <li>Exclusive offers and discounts</li>
            <li>Photography tips and tricks</li>
            <li>Latest album designs and styles</li>
            <li>Customer success stories</li>
          </ul>
          <p>Best regards,<br>The G Album Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
}
