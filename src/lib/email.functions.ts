import { createServerFn } from "@tanstack/start";
import { Resend } from "resend";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

export const sendContactEmail = createServerFn({ method: "POST" })
  .validator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { name, email, subject, message } = data;

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
  });
