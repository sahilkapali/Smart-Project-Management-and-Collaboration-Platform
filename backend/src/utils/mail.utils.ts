import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetOTP = async (
  email: string,
  otp: string
) => {
  const { data, error } = await resend.emails.send({
    from: "Smart Project Management <onboarding@resend.dev>",
    to: email,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset</h2>

        <p>
          You requested to reset your password.
        </p>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing: 5px;">
          ${otp}
        </h1>

        <p>
          This OTP will expire in 10 minutes.
        </p>

        <p>
          If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error("Failed to send password reset email.");
  }

  console.log("Password reset email sent:", data?.id);
};