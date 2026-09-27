import { Resend } from "resend";

export async function sendResendEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Planpaste Contact Form <onboarding@resend.dev>",
    to: ["planpaste@gmail.com"],
    replyTo: email,
    subject: `[Planpaste Contact] ${subject}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4f46e5;">New Contact Message</h2>
        <p><strong>From:</strong> ${name} (&lt;${email}&gt;)</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="white-space: pre-wrap; font-size: 15px; line-height: 1.6;">${message}</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
