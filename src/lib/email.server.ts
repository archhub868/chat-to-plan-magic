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
    // Display name and sender address on your verified domain
    from: "Planpaste <hello@magicplan.world>", 
    // Target inbox where you want to read submitted messages
    to: ["planpaste@gmail.com"], 
    // Clicking "Reply" in Gmail will reply directly to the user who filled out the form
    replyTo: email, 
    subject: subject,
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
